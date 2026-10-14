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
 var body:some View{ChartWorkspace(web:workspace.web).background(Color(red:0.04,green:0.04,blue:0.065)).overlay{if !workspace.workspaceReady{ZStack{Color(red:0.04,green:0.04,blue:0.065);VStack(spacing:18){Text("✳ jyotish").font(.system(size:34,weight:.regular,design:.serif)).foregroundStyle(Color(red:0.85,green:0.76,blue:0.60));if workspace.startupError.isEmpty{ProgressView();Text("Opening your private atlas…").foregroundStyle(.secondary)}else{Text(workspace.startupError).multilineTextAlignment(.center).foregroundStyle(.secondary).frame(maxWidth:480);Button("Retry opening"){workspace.retryStartup()}.buttonStyle(.borderedProminent)}}.padding(40)}}}.overlay(alignment:.bottom){if !workspace.error.isEmpty{Text(workspace.error).font(.system(size:12)).foregroundStyle(.orange).padding(12).background(Color.black.opacity(0.8))}}}
}
