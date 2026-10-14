import Foundation
import CryptoKit

struct LocalFailure: LocalizedError { let message: String; var errorDescription: String? { message } }

final class LocalModel: NSObject, URLSessionDownloadDelegate {
    static let filename = "Qwen3.5-9B-Q4_K_M.gguf"
    static let checksum = "03b74727a860a56338e042c4420bb3f04b2fec5734175f4cb9fa853daf52b7e8"
    static let remote = URL(string: "https://huggingface.co/unsloth/Qwen3.5-9B-GGUF/resolve/3885219b6810b007914f3a7950a8d1b469d598a5/Qwen3.5-9B-Q4_K_M.gguf")!
    let folder: URL
    let executable: URL
    private var process: Process?
    private var session: URLSession?
    private var download: URLSessionDownloadTask?
    private var continuation: CheckedContinuation<URL, Error>?
    private var progress: ((String, Double) -> Void)?
    private var endpoint: URL?
    private var token = UUID().uuidString + UUID().uuidString
    private var requestTask: Task<String, Error>?
    init(folder: URL, executable: URL) { self.folder = folder; self.executable = executable }
    func prepare(progress: @escaping (String, Double) -> Void) async throws {
        self.progress = progress
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        let file = folder.appendingPathComponent(Self.filename)
        if !FileManager.default.fileExists(atPath: file.path) {
            progress("Downloading Qwen3.5 9B · 5.68 GB, once per device", 0)
            let downloaded: URL = try await withCheckedThrowingContinuation { c in
                continuation = c
                let configuration = URLSessionConfiguration.default
                configuration.timeoutIntervalForResource = 3600
                session = URLSession(configuration: configuration, delegate: self, delegateQueue: nil)
                download = session!.downloadTask(with: Self.remote)
                download!.resume()
            }
            progress("Verifying model integrity…", 1)
            let digest = try await Task.detached { try Self.hash(downloaded) }.value
            guard digest == Self.checksum else { try? FileManager.default.removeItem(at: downloaded); throw LocalFailure(message: "Model checksum mismatch. Retry the download.") }
            try FileManager.default.moveItem(at: downloaded, to: file)
            try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
        }
        guard process?.isRunning != true else { return }
        progress("Verifying cached model integrity…", 1)
        let existingDigest = try await Task.detached { try Self.hash(file) }.value
        guard existingDigest == Self.checksum else { throw LocalFailure(message: "Cached model integrity failed. Remove only the model file and retry.") }
        try Task.checkCancellation()
        progress("Loading native model…", 1)
        let port = Int.random(in: 52000...59000)
        let p = Process(); p.executableURL = executable
        p.arguments = ["-m", file.path, "--host", "127.0.0.1", "--port", String(port), "-c", "8192", "-ngl", "auto", "--parallel", "1", "--reasoning-budget", "512", "--no-webui", "--log-disable"]
        var environment = ProcessInfo.processInfo.environment; environment["LLAMA_API_KEY"] = token; p.environment = environment
        p.standardOutput = FileHandle.nullDevice; p.standardError = FileHandle.nullDevice
        try p.run(); process = p
        let base = URL(string: "http://127.0.0.1:\(port)")!
        for _ in 0..<240 {
            try Task.checkCancellation()
            guard p.isRunning else { throw LocalFailure(message: "The native model engine stopped during startup.") }
            var request = URLRequest(url: base.appendingPathComponent("health")); request.timeoutInterval = 2; request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            if let (_, response) = try? await URLSession.shared.data(for: request), (response as? HTTPURLResponse)?.statusCode == 200 { endpoint = base; progress("Qwen3.5 9B ready · native inference", 1); return }
            try await Task.sleep(nanoseconds: 500_000_000)
        }
        unload(); throw LocalFailure(message: "Model startup timed out. Free some device memory and retry.")
    }
    func answer(prompt: String, schema: [String:Any]) async throws -> String {
        guard let endpoint else { throw LocalFailure(message: "Load the local model first.") }
        let task = Task<String, Error> {
            var request = URLRequest(url: endpoint.appendingPathComponent("v1/chat/completions")); request.httpMethod = "POST"; request.timeoutInterval = 300
            request.setValue("application/json", forHTTPHeaderField: "Content-Type"); request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            request.httpBody = try JSONSerialization.data(withJSONObject: ["messages": [["role":"user", "content":prompt]], "temperature":0.2, "max_tokens":1600, "stream":false, "response_format":["type":"json_schema","json_schema":["name":"jyotish_consultation","strict":true,"schema":schema]], "chat_template_kwargs":["enable_thinking":false]])
            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200, let object = try JSONSerialization.jsonObject(with: data) as? [String:Any], let choices = object["choices"] as? [[String:Any]], let message = choices.first?["message"] as? [String:Any], let content = message["content"] as? String else { throw LocalFailure(message: "The local model could not complete this answer.") }
            return Self.finalText(content)
        }
        requestTask = task
        defer { requestTask = nil }
        return try await task.value
    }
    func cancel() { download?.cancel(); requestTask?.cancel(); unload() }
    func unload() { process?.terminate(); process = nil; endpoint = nil }
    static func finalText(_ value: String) -> String {
        if let range = value.range(of: "</think>", options: .backwards) { return String(value[range.upperBound...]).trimmingCharacters(in: .whitespacesAndNewlines) }
        if value.contains("<think>") { return "" }
        return value.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    static func hash(_ url: URL) throws -> String { let file = try FileHandle(forReadingFrom: url); defer { try? file.close() }; var hash = SHA256(); while let block = try file.read(upToCount: 4*1024*1024), !block.isEmpty { hash.update(data: block) }; return hash.finalize().map { String(format: "%02x", $0) }.joined() }
    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didWriteData bytesWritten: Int64, totalBytesWritten: Int64, totalBytesExpectedToWrite: Int64) { let total = totalBytesExpectedToWrite > 0 ? totalBytesExpectedToWrite : 5680522464; progress?("Downloading model · \(Int(Double(totalBytesWritten)/Double(total)*100))%", Double(totalBytesWritten)/Double(total)) }
    func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
        do { guard (downloadTask.response as? HTTPURLResponse)?.statusCode == 200 else { throw LocalFailure(message: "Model download failed. Check your connection and retry.") }; let tmp = folder.appendingPathComponent(UUID().uuidString + ".download"); try FileManager.default.moveItem(at: location, to: tmp); continuation?.resume(returning: tmp); continuation = nil }
        catch { continuation?.resume(throwing: error); continuation = nil }
    }
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) { if let error { continuation?.resume(throwing: error); continuation = nil }; session.finishTasksAndInvalidate() }
    deinit { process?.terminate() }
}
