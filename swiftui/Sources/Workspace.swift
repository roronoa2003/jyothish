import SwiftUI
@preconcurrency import WebKit
import AppKit

struct Consultation:Identifiable,Codable {var id=UUID();let question:String;let answer:String;let date:Date;var forecastWindows:[[String:Double]]?=nil}
@MainActor final class Workspace:NSObject,ObservableObject,WKScriptMessageHandlerWithReply,WKScriptMessageHandler,WKNavigationDelegate,WKUIDelegate {
 @Published var selection="kundli"
 @Published var profiles:[BirthProfile]=[]
 @Published var profileName="No chart selected"
 @Published var profileID:String?
 @Published var messages:[Consultation]=[]
 @Published var busy=false
 @Published var startedAt=Date()
 @Published var status="Local reasoning · Qwen3.5 9B"
 @Published var progress:Double=0
 @Published var error=""
 @Published var workspaceReady=false
 @Published var startupError=""
 @Published var question=""
 @Published var readingDate=Date()
 let web:WKWebView
 let library:LocalLibrary
 let online:OnlineServices
 let model:LocalModel
 private var server:AssetServer?
 private var generation:Task<Void,Never>?
 private var commandCallback=""
 private var reportRunning=false
 private var startupTimeout:Task<Void,Never>?
 private let port:UInt16
 override init(){
  let env=ProcessInfo.processInfo.environment
  let resources=Bundle.main.resourceURL!
  let root=env["JYOTISH_TEST_DATA"].map{URL(fileURLWithPath:$0)} ?? FileManager.default.urls(for:.applicationSupportDirectory,in:.userDomainMask)[0].appendingPathComponent("Jyotish")
  library=try! LocalLibrary(root:root)
  online=OnlineServices(library:library)
  model=LocalModel(folder:root.appendingPathComponent("models"),executable:resources.appendingPathComponent("llama/llama-server"))
  port=env["JYOTISH_TEST_DATA"] == nil ? 49713:49714
  let config=WKWebViewConfiguration();config.websiteDataStore = .default();config.mediaTypesRequiringUserActionForPlayback=[];config.preferences.setValue(true,forKey:"developerExtrasEnabled")
  web=WKWebView(frame:.zero,configuration:config)
  web.underPageBackgroundColor=NSColor(red:0.04,green:0.04,blue:0.065,alpha:1)
  super.init()
  config.userContentController.addScriptMessageHandler(self,contentWorld:.page,name:"native")
  config.userContentController.add(self,name:"profile")
  let script="""
  window.jyothishDesktop={};
  for(const key of ['info','listProfiles','saveProfile','exportLibrary','importLibrary','saveReading','listReadings','exportReading','listReports','generateLifeReport','openReport','exportReport','savePDF','listForecasts','saveForecast','aiLoad','aiAnswer','aiUnload','loadConversation','saveConversation','onlineConfig','saveOnlineConfig','onlineAnswer','cancelOnline','elevenVoices','elevenToken','elevenSpeak'])window.jyothishDesktop[key]=data=>window.webkit.messageHandlers.native.postMessage({method:key,data});
  window.jyothishDesktop.nativeAI=true;
  window.jyotishAIProgressListeners=new Set();window.jyothishDesktop.onAIProgress=fn=>{window.jyotishAIProgressListeners.add(fn);return()=>window.jyotishAIProgressListeners.delete(fn)};
  window.jyothishDesktop.observeForecast=(id,observation)=>window.webkit.messageHandlers.native.postMessage({method:"observeForecast",data:{id,observation}});
  window.jyothishDesktop.onCommand=fn=>{window.jyotishNativeCommand=fn;return()=>{window.jyotishNativeCommand=null}};
  """
  config.userContentController.addUserScript(WKUserScript(source:script,injectionTime:.atDocumentStart,forMainFrameOnly:true))
  web.navigationDelegate=self;web.uiDelegate=self
  profiles=library.profiles().map{BirthProfile(values:$0)}
  do{server=try AssetServer(root:resources.appendingPathComponent("www"),port:port,onReady:{[weak self] in self?.retryStartup()},onFailure:{[weak self] message in self?.startupFailed("Could not start the local workspace. Quit any older Jyotish app and reopen this version. "+message)})}catch{startupFailed("Could not start the local workspace: \(error.localizedDescription)")}
 }
 func retryStartup(){startupTimeout?.cancel();startupError="";workspaceReady=false;web.load(URLRequest(url:URL(string:"http://127.0.0.1:\(port)/")!,cachePolicy:.reloadIgnoringLocalCacheData));startupTimeout=Task{try? await Task.sleep(nanoseconds:20_000_000_000);guard !Task.isCancelled,!workspaceReady else{return};startupFailed("The workspace did not finish loading. Retry, or quit any older Jyotish app and reopen this version.")}}
 private func startupFailed(_ message:String){startupTimeout?.cancel();startupError=message;workspaceReady=false}
 func webView(_ webView:WKWebView,didFinish navigation:WKNavigation!){Task{do{let ready=try await js("return await new Promise(resolve=>{const deadline=Date.now()+10000;const check=()=>{if(document.querySelector('main') && document.querySelector('.studio-rail') && window.jyotishWorkspace)resolve(true);else if(Date.now()>=deadline)resolve(false);else setTimeout(check,50)};check()})");guard ready as? Bool==true else{throw LocalFailure(message:"The app interface could not be loaded. Retry to reload its local files.")};startupTimeout?.cancel();startupError="";workspaceReady=true}catch{startupFailed(error.localizedDescription)}}}
 func webView(_ webView:WKWebView,didFailProvisionalNavigation navigation:WKNavigation!,withError error:Error){startupFailed("Could not load the local workspace: "+error.localizedDescription)}
 func webView(_ webView:WKWebView,didFail navigation:WKNavigation!,withError error:Error){startupFailed("Workspace loading failed: "+error.localizedDescription)}
 func webViewWebContentProcessDidTerminate(_ webView:WKWebView){startupFailed("The chart display stopped. Retry to reopen it; saved profiles remain on this device.")}
 func trusted(_ message:WKScriptMessage)->Bool{message.frameInfo.isMainFrame&&message.frameInfo.securityOrigin.host=="127.0.0.1"&&message.frameInfo.securityOrigin.port==Int(port)}
 func userContentController(_ userContentController:WKUserContentController,didReceive message:WKScriptMessage){guard trusted(message) else{return};if message.name=="profile",let data=message.body as? [String:Any]{stop();profileName=data["name"] as? String ?? "Your chart";messages=[];if let id=profileID,let d=try? Data(contentsOf:library.root.appendingPathComponent("conversations/\(id).json")),let saved=try? JSONDecoder().decode([Consultation].self,from:d){messages=saved}}}
 func userContentController(_ userContentController:WKUserContentController,didReceive message:WKScriptMessage,replyHandler:@escaping(Any?,String?)->Void){
  guard trusted(message),let request=message.body as? [String:Any],let method=request["method"] as? String else{replyHandler(nil,"Untrusted workspace request.");return}
  Task{do{let result=try await handle(method,request["data"]);replyHandler(result,nil)}catch{replyHandler(nil,error.localizedDescription)}}
 }
 func js(_ script:String,_ arguments:[String:Any]=[:])async throws->Any?{try await web.callAsyncJavaScript(script,arguments:arguments,in:nil,contentWorld:.page)}
 func command(_ name:String){if name=="birth"{profileID=nil;profileName="No chart selected";messages=[]};selection=name;Task{_ = try? await js("document.body.classList.toggle('native-sources',sources); window.jyotishNativeCommand?.(command); if(sources)document.querySelector('.library-button')?.click()",["command":name=="sources" ? "chat":name,"sources":name=="sources"])}}
 func open(_ p:BirthProfile){stop();profileID=p.id;selection="kundli";Task{do{_ = try await js("window.jyotishWorkspace.restore(profile)",["profile":p.values]);profileName=p.name}catch{self.error=error.localizedDescription}}}
 func stop(){generation?.cancel();generation=nil;model.cancel();busy=false;status="Stopped · model cache retained"}
 func selectedReadingUTC()->Date{let pieces=Calendar.current.dateComponents([.year,.month,.day],from:readingDate);var utc=Calendar(identifier:.gregorian);utc.timeZone=TimeZone(secondsFromGMT:0)!;var chosen=pieces;chosen.hour=12;return utc.date(from:chosen)!}
 func submit(){let q=question.trimmingCharacters(in:.whitespacesAndNewlines);guard !q.isEmpty,!busy else{return};question="";busy=true;startedAt=Date();error="";progress=0
  let identity=profileID;let history=messages.suffix(2).map{["question":$0.question,"answer":$0.answer]}
  generation=Task{defer{busy=false};do{
   guard let input=try await js("return await window.jyotishNativePrepare(question,time,history)",["question":q,"time":selectedReadingUTC().timeIntervalSince1970*1000,"history":history]) as? [String:Any],let prompt=input["prompt"] as? String,let schema=input["schema"] as? [String:Any] else{throw LocalFailure(message:"Could not read the current chart.")}
   try await model.prepare{[weak self] label,value in Task{@MainActor in self?.status=label;self?.progress=value}}
   try Task.checkCancellation();status="Reading your question and chart combinations…"
   var answer="";var windows:[[String:Double]]?;var failure="";var succeeded=false
   for attempt in 0..<2 {
    do {
     let correction=attempt==0 ? "":((try? await js("return window.jyotishNativeRetry(input,failure)",["input":input,"failure":failure])) as? String ?? "\nThe last draft failed validation: \(failure). Correct the format and use only supplied evidence IDs.")
     let raw=try await model.answer(prompt:prompt+correction,schema:schema,reasoning:attempt>0)
     guard let rendered=try await js("return window.jyotishNativeRender(raw,input)",["raw":raw,"input":input]) as? [String:Any],let text=rendered["text"] as? String,!text.isEmpty else{throw LocalFailure(message:"The chart reader returned no usable answer.")}
     answer=text;windows=rendered["windows"] as? [[String:Double]]
     if let issue=try await js("return window.jyotishNativeValidate(answer,input)",["answer":answer,"input":input]) as? String{throw LocalFailure(message:issue)}
     succeeded=true;break
    }catch {try Task.checkCancellation();failure=(error as NSError).userInfo["WKJavaScriptExceptionMessage"] as? String ?? error.localizedDescription;status="Checking and correcting the evidence-linked draft…"}
   }
   guard succeeded else{throw LocalFailure(message:failure+" No generic substitute was shown.")}
   try Task.checkCancellation();guard identity==profileID else{return}
   messages.append(Consultation(question:q,answer:answer,date:Date(),forecastWindows:windows));status="Completed locally · Qwen3.5 9B"
   if let id=profileID{let dir=library.root.appendingPathComponent("conversations");try FileManager.default.createDirectory(at:dir,withIntermediateDirectories:true,attributes:[.posixPermissions:0o700]);let file=dir.appendingPathComponent(id+".json");try JSONEncoder().encode(messages).write(to:file,options:.atomic);try FileManager.default.setAttributes([.posixPermissions:0o600],ofItemAtPath:file.path)}
  }catch{if !Task.isCancelled{self.error=error.localizedDescription;status="Answer needs another attempt"}}}
 }
 private func handle(_ method:String,_ data:Any?)async throws->Any {
  switch method{
  case "onlineConfig":return online.config()
  case "saveOnlineConfig":guard let input=data as? [String:Any] else{throw LocalFailure(message:"Invalid online settings.")};return try online.save(input)
  case "onlineAnswer":guard let input=data as? [String:Any] else{throw LocalFailure(message:"Invalid online reading.")};return try await online.answer(input)
  case "cancelOnline":online.cancel();return ["stopped":true]
  case "elevenVoices":return try await online.voices()
  case "elevenToken":return try await online.token()
  case "elevenSpeak":guard let input=data as? [String:Any] else{throw LocalFailure(message:"Invalid voice reading.")};return try await online.speak(input)

  case "aiLoad":try await model.prepare{[weak self] label,value in Task{@MainActor in _ = try? await self?.js("for(const fn of window.jyotishAIProgressListeners)fn(progress)",["progress":["text":label,"progress":value]])}};return ["ready":true]
  case "aiAnswer":guard let input=data as? [String:Any],let prompt=input["prompt"] as? String,prompt.count<=80000,let schema=input["schema"] as? [String:Any] else{throw LocalFailure(message:"Invalid local model request.")};return try await model.answer(prompt:prompt,systemPrompt:input["systemPrompt"] as? String ?? "",schema:schema,reasoning:input["reasoning"] as? Bool ?? false)
  case "aiUnload":model.cancel();return ["unloaded":true]
  case "loadConversation":guard let id=data as? String else{return []};let file=try library.safeFile("conversations",id,".json");guard FileManager.default.fileExists(atPath:file.path) else{return []};return try JSONSerialization.jsonObject(with:Data(contentsOf:file))
  case "saveConversation":guard let input=data as? [String:Any],let id=input["profileId"] as? String,library.profiles().contains(where:{$0["id"] as? String==id}),let messages=input["messages"] as? [[String:Any]],messages.count<=200,messages.allSatisfy({(($0["question"] as? String)?.count ?? 999999) <= 2000 && (($0["answer"] as? String)?.count ?? 999999) <= 20000}) else{throw LocalFailure(message:"Invalid local conversation.")};_ = try library.safeFile("conversations",id,".json");try library.write(messages,"conversations/"+id+".json");return ["saved":true]
  case "listForecasts":return try library.forecasts()
  case "saveForecast":guard let input=data as? [String:Any],let id=input["profileId"] as? String,library.profiles().contains(where:{$0["id"] as? String==id}),let valid=try await js("return window.jyotishValidateForecast(input)",["input":input]) as? [String:Any] else{throw LocalFailure(message:"A saved profile is required.")};return try library.saveForecast(valid)
  case "observeForecast":guard let input=data as? [String:Any],let id=input["id"] as? String,let observation=input["observation"] as? [String:Any],let record=try library.forecasts().first(where:{$0["id"] as? String==id}),record["integrity"] as? Bool==true,let updated=try await js("return window.jyotishAppendObservation(record,observation)",["record":record,"observation":observation]) as? [String:Any],let observations=updated["observations"] as? [[String:Any]] else{throw LocalFailure(message:"Invalid forecast observation.")};return try library.observeForecast(id,observations)
  case "info":return ["version":Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "development","platform":"darwin","arch":ProcessInfo.processInfo.machineArchitecture,"native":true]
  case "listProfiles":return library.profiles()
  case "saveProfile":guard let input=data as? [String:Any] else{throw LocalFailure(message:"Invalid profile.")};let all=try library.save(input);profiles=all.map{BirthProfile(values:$0)};profileID=all.first(where:{$0["id"] as? String==input["id"] as? String})?["id"] as? String ?? all.last?["id"] as? String;return all
  case "exportLibrary":return ["saved":try library.export(["version":1,"profiles":library.profiles()],name:"Jyotish-library.json")]
  case "importLibrary":let all=try library.importProfiles();profiles=all.map{BirthProfile(values:$0)};return all
  case "listReports":return library.read("reports/index.json") ?? []
  case "listReadings":return library.readings().filter{$0["profileId"] as? String==data as? String}
  case "saveReading":guard var reading=data as? [String:Any],let id=reading["profileId"] as? String,library.profiles().contains(where:{$0["id"] as? String==id}) else{throw LocalFailure(message:"Save this profile first.")};reading["id"]=UUID().uuidString;var all=library.readings();all.append(reading);try library.write(all,"readings/index.json");return reading
  case "exportReading":guard let item=library.readings().first(where:{$0["id"] as? String==data as? String}) else{throw LocalFailure(message:"Reading not found.")};return ["saved":try library.export(item,name:"Jyotish-reading.json")]
  case "generateLifeReport":return try await report(data)
  case "openReport","exportReport":guard let id=data as? String else{throw LocalFailure(message:"Invalid report.")};let file=try library.safeFile("reports",id,".pdf");guard FileManager.default.fileExists(atPath:file.path) else{throw LocalFailure(message:"Report not found.")};if method=="openReport"{NSWorkspace.shared.open(file);return ["opened":true]};let panel=NSSavePanel();panel.nameFieldStringValue="Jyotish-life-report.pdf";if panel.runModal() == .OK,let dest=panel.url{try Data(contentsOf:file).write(to:dest,options:.atomic);return ["saved":true]};return ["saved":false]
  case "savePDF":let pdf=try await web.pdf(configuration:WKPDFConfiguration());let panel=NSSavePanel();panel.nameFieldStringValue="Jyotish-chart.pdf";if panel.runModal() == .OK,let url=panel.url{try pdf.write(to:url);return ["saved":true]};return ["saved":false]
  default:throw LocalFailure(message:"Unknown desktop action.")
  }
 }
 private func report(_ data:Any?)async throws->[String:Any]{guard !reportRunning,let payload=data as? [String:Any],payload["schema"] as? Int==1,(payload["divisions"] as? [Any])?.count==16,let profile=payload["profile"] as? [String:Any],let pid=profile["id"] as? String,library.profiles().contains(where:{$0["id"] as? String==pid}) else{throw LocalFailure(message:"Save a valid profile before generating a report.")};reportRunning=true;defer{reportRunning=false};let id=UUID().uuidString;try library.write(payload,"reports/\(id).json");let input=try library.safeFile("reports",id,".json"),output=try library.safeFile("reports",id,".pdf"),resources=Bundle.main.resourceURL!
  try await Task.detached{let p=Process();p.executableURL=resources.appendingPathComponent("python-runtime/python/bin/python3");p.arguments=["-I",resources.appendingPathComponent("report-engine/generate_life_report.py").path,input.path,output.path,resources.appendingPathComponent("python-runtime/pdf-libs").path];p.standardOutput=FileHandle.nullDevice;p.standardError=FileHandle.nullDevice;try p.run();let deadline=Date().addingTimeInterval(180);while p.isRunning&&Date()<deadline{try await Task.sleep(nanoseconds:200_000_000)};if p.isRunning{p.terminate();throw LocalFailure(message:"PDF generation timed out.")};guard p.terminationStatus==0 else{throw LocalFailure(message:"Python could not generate this report.")}}.value
  try FileManager.default.setAttributes([.posixPermissions:0o600],ofItemAtPath:output.path);let record:[String:Any]=["id":id,"profileId":pid,"name":profile["name"] as? String ?? "Your chart","createdAt":ISO8601DateFormatter().string(from:Date())];var all=library.read("reports/index.json") as? [[String:Any]] ?? [];all.append(record);try library.write(all,"reports/index.json");return record
 }
 func webView(_ webView:WKWebView,decidePolicyFor action:WKNavigationAction,decisionHandler:@escaping(WKNavigationActionPolicy)->Void){if let url=action.request.url,url.host=="127.0.0.1",url.port==Int(port){decisionHandler(.allow)}else{if let url=action.request.url,["https","http"].contains(url.scheme ?? ""){NSWorkspace.shared.open(url)};decisionHandler(.cancel)}}
 func webView(_ webView:WKWebView,requestMediaCapturePermissionFor origin:WKSecurityOrigin,initiatedByFrame frame:WKFrameInfo,type:WKMediaCaptureType,decisionHandler:@escaping(WKPermissionDecision)->Void){decisionHandler(origin.host=="127.0.0.1" && origin.port==Int(port) && frame.isMainFrame && type == .microphone ? .prompt:.deny)}
 func webView(_ webView:WKWebView,runOpenPanelWith parameters:WKOpenPanelParameters,initiatedByFrame frame:WKFrameInfo,completionHandler:@escaping([URL]?)->Void){let panel=NSOpenPanel();panel.allowsMultipleSelection=parameters.allowsMultipleSelection;completionHandler(panel.runModal() == .OK ? panel.urls:nil)}
}
extension ProcessInfo{var machineArchitecture:String{
 #if arch(arm64)
 return "arm64"
 #else
 return "x64"
 #endif
}}
