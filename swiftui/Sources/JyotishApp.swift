import SwiftUI
import WebKit

@main struct JyotishApp:App{
 @StateObject private var workspace=Workspace()
 var body:some Scene{WindowGroup{Observatory(workspace:workspace).preferredColorScheme(.dark).frame(minWidth:1000,minHeight:720)}.windowStyle(.hiddenTitleBar).commands{CommandGroup(replacing:.newItem){Button("New birth profile"){workspace.command("birth")}.keyboardShortcut("n");Button("Save birth profile"){workspace.command("kundli");Task{_ = try? await workspace.js("return await window.jyotishWorkspace.saveChart()")}}.keyboardShortcut("s")}}}
}
struct ChartWorkspace:NSViewRepresentable{
 let web:WKWebView
 func makeNSView(context:Context)->WKWebView{web}
 func updateNSView(_ nsView:WKWebView,context:Context){}
}
struct Observatory:View{
 @ObservedObject var workspace:Workspace
 private let gold=Color(red:0.85,green:0.74,blue:0.53)
 var body:some View{NavigationSplitView{
  VStack(alignment:.leading,spacing:26){
   HStack(spacing:12){if let image=NSImage(contentsOf:Bundle.main.resourceURL!.appendingPathComponent("icon.png")){Image(nsImage:image).renderingMode(.original).resizable().frame(width:44,height:44)};VStack(alignment:.leading,spacing:3){Text("Jyotish").font(.system(size:26,weight:.semibold,design:.serif));Text("YOUR PRIVATE OBSERVATORY").font(.system(size:8,weight:.medium)).tracking(1.6).foregroundStyle(gold)}}.padding(.top,18)
   VStack(spacing:6){nav("Chart atlas","sparkles","kundli");nav("Dasha timeline","clock","dashas");nav("Ask your astrologer","bubble.left.and.bubble.right","chat");nav("Life reports","book.closed","reports");nav("Source library","books.vertical","sources");Button{workspace.command("timing")}label:{Label("Timing studio",systemImage:"calendar").frame(maxWidth:.infinity,alignment:.leading)}.buttonStyle(.plain).padding(12)}
   Button("Prediction journal"){workspace.selection="reports";Task{_ = try? await workspace.js("return await window.jyotishWorkspace.predictionJournal()")}}.buttonStyle(.plain).padding(12)
   Divider()
   HStack{Text("YOUR PROFILES").font(.system(size:10,weight:.medium)).tracking(1.5).foregroundStyle(.secondary);Spacer();Button{workspace.command("birth")}label:{Image(systemName:"plus")}.buttonStyle(.plain)}
   ScrollView{VStack(alignment:.leading,spacing:8){ForEach(workspace.profiles){p in Button{workspace.open(p)}label:{HStack{Image(systemName:"person.crop.circle").foregroundStyle(gold);VStack(alignment:.leading){Text(p.name).font(.system(size:13,weight:.medium));Text(p.values["place"] as? String ?? "").font(.system(size:10)).foregroundStyle(.secondary)};Spacer()}.padding(10).background(workspace.profileID==p.id ? Color.white.opacity(0.09):Color.clear).clipShape(RoundedRectangle(cornerRadius:10))}.buttonStyle(.plain)}}}
   Spacer()
   Text("Profiles, conversations and reports stay on this Mac.").font(.system(size:11)).foregroundStyle(.secondary).lineSpacing(4)
   Button("Manage local library"){workspace.command("library")}.buttonStyle(.plain).foregroundStyle(gold)
  }.padding(22).frame(minWidth:235).background(Color(red:0.065,green:0.055,blue:0.09))
 }detail:{ZStack{
  ChartWorkspace(web:workspace.web).opacity(workspace.selection=="chat" ? 0:1).allowsHitTesting(workspace.selection != "chat")
  if workspace.selection=="chat"{chat}
 }.toolbar{ToolbarItemGroup(placement:.automatic){Text(workspace.profileName).foregroundStyle(gold);Button("Save profile"){Task{_ = try? await workspace.js("return await window.jyotishWorkspace.saveChart()")}};Button("Life book"){workspace.selection="reports";Task{_ = try? await workspace.js("return await window.jyotishWorkspace.lifeReport()")}};Button("New profile"){workspace.command("birth")}}}.navigationSplitViewStyle(.balanced).tint(gold)} }
 func nav(_ label:String,_ icon:String,_ view:String)->some View{Button{workspace.command(view)}label:{Label(label,systemImage:icon).font(.system(size:13,weight:.medium)).frame(maxWidth:.infinity,alignment:.leading).padding(12).background(workspace.selection==view ? gold.opacity(0.12):Color.clear).clipShape(RoundedRectangle(cornerRadius:10))}.buttonStyle(.plain)}
 var chat:some View{VStack(alignment:.leading,spacing:0){
  VStack(alignment:.leading,spacing:10){Text("A conversation with your chart").font(.system(size:35,weight:.regular,design:.serif));Text("Ask about a decision, a time period or the patterns behind an event.").foregroundStyle(.secondary);HStack{Label(workspace.status,systemImage:"cpu").font(.system(size:11));Spacer();DatePicker("Reading date",selection:$workspace.readingDate,displayedComponents:.date).labelsHidden().frame(width:130)}}.padding(32)
  Divider().opacity(0.3)
  ScrollViewReader{proxy in ScrollView{VStack(alignment:.leading,spacing:24){if workspace.messages.isEmpty{VStack(alignment:.leading,spacing:16){Text("What would you like to understand?").font(.system(size:24,design:.serif));ForEach(["Will I get selected for my research project by 18 October?","When will I get into a relationship?","How does next month look for my career?"],id:\.self){q in Button(q){workspace.question=q}.buttonStyle(.plain).padding(14).frame(maxWidth:.infinity,alignment:.leading).background(Color.white.opacity(0.04)).clipShape(RoundedRectangle(cornerRadius:12))};Text("The model downloads once (5.68 GB), then answers offline. Readings use calculated chart evidence; future outcomes are interpretations.").font(.system(size:11)).foregroundStyle(.secondary)}.padding(28)}
   ForEach(workspace.messages){m in VStack(alignment:.leading,spacing:14){Text(m.question).font(.system(size:16,weight:.semibold)).foregroundStyle(gold);Text((try? AttributedString(markdown:m.answer,options:.init(interpretedSyntax:.inlineOnlyPreservingWhitespace))) ?? AttributedString(m.answer)).font(.system(size:15)).lineSpacing(7).textSelection(.enabled);if let windows=m.forecastWindows{Button("Track forecast"){workspace.selection="reports";Task{_ = try? await workspace.js("return window.jyotishWorkspace.reviewForecast(record)",["record":["question":m.question,"answer":m.answer,"forecastWindows":windows]])}}}}.padding(26).frame(maxWidth:.infinity,alignment:.leading).background(Color.white.opacity(0.035)).clipShape(RoundedRectangle(cornerRadius:18)).id(m.id)}
   if workspace.busy{HStack(spacing:12){ProgressView().controlSize(.small);TimelineView(.periodic(from:.now,by:1)){_ in Text(workspace.status+" · "+String(Int(Date().timeIntervalSince(workspace.startedAt)))+"s").font(.system(size:13)).foregroundStyle(.secondary)}}.padding(24);if workspace.progress>0{ProgressView(value:workspace.progress).tint(gold)};Button("Stop generation"){workspace.stop()}}
   if !workspace.error.isEmpty{Text(workspace.error).font(.system(size:13)).foregroundStyle(.orange).padding(20).background(Color.orange.opacity(0.08)).clipShape(RoundedRectangle(cornerRadius:12))}
  }.padding(30)}.onChange(of:workspace.messages.count){_ in if let last=workspace.messages.last{proxy.scrollTo(last.id,anchor:.bottom)}}}
  HStack(alignment:.bottom,spacing:14){TextField("Ask a specific question…",text:$workspace.question,axis:.vertical).lineLimit(2...5).textFieldStyle(.plain).padding(16).background(Color.white.opacity(0.05)).clipShape(RoundedRectangle(cornerRadius:14));Button{workspace.submit()}label:{Image(systemName:"arrow.up").font(.system(size:17,weight:.bold)).frame(width:46,height:46).background(gold).foregroundStyle(.black).clipShape(RoundedRectangle(cornerRadius:14))}.buttonStyle(.plain).disabled(workspace.busy)}.padding(26)
 }.background(LinearGradient(colors:[Color(red:0.095,green:0.075,blue:0.14),Color(red:0.04,green:0.04,blue:0.065)],startPoint:.topLeading,endPoint:.bottomTrailing))}
}
