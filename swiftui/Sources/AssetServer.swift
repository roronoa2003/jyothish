import Foundation
import Network
final class AssetServer {
 private let listener:NWListener
 private let root:URL
 let port:UInt16
 init(root:URL,port:UInt16,onReady:@escaping()->Void,onFailure:@escaping(String)->Void)throws {
  // App Translocation may expose the same directory through /private/var and /var.
  // Canonicalize both sides of the containment check, including symlinks.
  self.root=root.standardizedFileURL.resolvingSymlinksInPath();self.port=port
  let parameters=NWParameters.tcp
  parameters.requiredLocalEndpoint = .hostPort(host:"127.0.0.1",port:NWEndpoint.Port(rawValue:port)!)
  listener=try NWListener(using:parameters)
  listener.newConnectionHandler={ [weak self] connection in self?.accept(connection) }
  listener.stateUpdateHandler={state in switch state{case .ready:DispatchQueue.main.async{onReady()};case .failed(let error):DispatchQueue.main.async{onFailure(error.localizedDescription)};default:break}}
  listener.start(queue:DispatchQueue(label:"jyotish.assets"))
 }
 private func accept(_ c:NWConnection){c.start(queue:DispatchQueue.global());c.receive(minimumIncompleteLength:1,maximumLength:16384){[weak self] data,_,_,error in
  guard let self,let data,error==nil,let request=String(data:data,encoding:.utf8),let line=request.components(separatedBy:"\r\n").first else{c.cancel();return}
  let parts=line.split(separator:" ");guard parts.count>=2,["GET","HEAD"].contains(String(parts[0])) else{c.cancel();return}
  let raw=String(parts[1]).components(separatedBy:"?")[0].removingPercentEncoding ?? ""
  let relative=raw=="/" ? "index.html":String(raw.dropFirst())
  let url=self.root.appendingPathComponent(relative).standardizedFileURL.resolvingSymlinksInPath()
  guard url.path.hasPrefix(self.root.path+"/"),!relative.contains("\0") else{let denied=Data("HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\nConnection: close\r\n\r\n".utf8);c.send(content:denied,completion:.contentProcessed{_ in c.cancel()});return}
  let body=(try? Data(contentsOf:url)) ?? Data();let ok=FileManager.default.fileExists(atPath:url.path)
  let types=["html":"text/html","js":"text/javascript","mjs":"text/javascript","css":"text/css","json":"application/json","png":"image/png","svg":"image/svg+xml","woff2":"font/woff2","wasm":"application/wasm"]
  let header="HTTP/1.1 \(ok ? "200 OK":"404 Not Found")\r\nContent-Type: \(types[url.pathExtension] ?? "application/octet-stream")\r\nContent-Length: \(body.count)\r\nCache-Control: no-cache\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n"
  var result=Data(header.utf8);if parts[0]=="GET"{result.append(body)}
  c.send(content:result,completion:.contentProcessed{_ in c.cancel()})
 }}
 deinit{listener.cancel()}
}
