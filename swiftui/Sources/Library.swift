import Foundation
import CryptoKit
import AppKit
import UniformTypeIdentifiers
struct BirthProfile:Identifiable {
 let values:[String:Any]
 var id:String{values["id"] as? String ?? ""}
 var name:String{values["name"] as? String ?? "Untitled chart"}
}
final class LocalLibrary {
 let root:URL
 init(root:URL)throws{self.root=root;try FileManager.default.createDirectory(at:root,withIntermediateDirectories:true,attributes:[.posixPermissions:0o700])}
 func read(_ name:String)->Any?{guard let d=try? Data(contentsOf:root.appendingPathComponent(name)) else{return nil};return try? JSONSerialization.jsonObject(with:d)}
 func write(_ object:Any,_ name:String)throws{let file=root.appendingPathComponent(name);try FileManager.default.createDirectory(at:file.deletingLastPathComponent(),withIntermediateDirectories:true,attributes:[.posixPermissions:0o700]);let d=try JSONSerialization.data(withJSONObject:object,options:[.prettyPrinted,.sortedKeys]);try d.write(to:file,options:.atomic);try FileManager.default.setAttributes([.posixPermissions:0o600],ofItemAtPath:file.path)}
 func profiles()->[[String:Any]]{(read("chart-library.json") as? [String:Any])?["profiles"] as? [[String:Any]] ?? []}
 func validate(_ input:[String:Any])throws->[String:Any]{var p=input
  for key in ["name","localDate","localTime","place","zone"]{guard let s=p[key] as? String,s.count<=200 else{throw LocalFailure(message:"Invalid profile \(key).")}}
  let format=DateFormatter();format.locale=Locale(identifier:"en_US_POSIX");format.timeZone=TimeZone(secondsFromGMT:0);format.dateFormat="yyyy-MM-dd";format.isLenient=false
  guard let ds=p["localDate"] as? String,let date=format.date(from:ds),format.string(from:date)==ds,let ts=p["localTime"] as? String,ts.range(of:"^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$",options:.regularExpression) != nil,let zone=p["zone"] as? String,TimeZone(identifier:zone) != nil else{throw LocalFailure(message:"Invalid birth date, time or timezone.")}
  for (key,limit) in [("latitude",65.0),("longitude",180.0),("offset",14.0)]{if p[key] is NSNull || p[key]==nil{continue};guard let n=p[key] as? Double,n.isFinite,abs(n)<=limit else{throw LocalFailure(message:"Invalid \(key).")}}
  guard (p["latitude"] as? Double == nil)==(p["longitude"] as? Double == nil) else{throw LocalFailure(message:"Supply both latitude and longitude.")}
  if let id=p["id"] as? String,id.range(of:"^[a-zA-Z0-9-]{1,80}$",options:.regularExpression) != nil{}else{p["id"]=UUID().uuidString}
  let year=(p["dashaYearDays"] as? Double) ?? 365.25636;guard [360.0,365.2425,365.25636].contains(year) else{throw LocalFailure(message:"Invalid dasha year convention.")};p["dashaYearDays"]=year
  return p
 }
 func save(_ input:[String:Any])throws->[[String:Any]]{if FileManager.default.fileExists(atPath:root.appendingPathComponent("chart-library.json").path),read("chart-library.json")==nil{throw LocalFailure(message:"Your existing profile library could not be read. It has been preserved.")};let p=try validate(input);var all=profiles();if let index=all.firstIndex(where:{$0["id"] as? String==p["id"] as? String}){all[index]=p}else{guard all.count<500 else{throw LocalFailure(message:"Profile limit reached.")};all.append(p)};try write(["version":1,"profiles":all],"chart-library.json");return all}
 func export(_ object:Any,name:String)throws->Bool{let panel=NSSavePanel();panel.nameFieldStringValue=name;guard panel.runModal() == .OK,let url=panel.url else{return false};try JSONSerialization.data(withJSONObject:object,options:.prettyPrinted).write(to:url,options:.atomic);return true}
 func importProfiles()throws->[[String:Any]]{let panel=NSOpenPanel();panel.allowedContentTypes=[.json];guard panel.runModal() == .OK,let url=panel.url else{return profiles()};guard let input=try JSONSerialization.jsonObject(with:Data(contentsOf:url)) as? [String:Any],input["version"] as? Int==1,let incoming=input["profiles"] as? [[String:Any]],incoming.count<=500 else{throw LocalFailure(message:"Invalid library file.")};let validated=try incoming.map(validate);var merged=profiles();for p in validated{if let index=merged.firstIndex(where:{$0["id"] as? String==p["id"] as? String}){merged[index]=p}else{merged.append(p)}};guard merged.count<=500 else{throw LocalFailure(message:"Profile limit reached.")};try write(["version":1,"profiles":merged],"chart-library.json");return merged}
 func readings()->[[String:Any]]{var all=read("readings/index.json") as? [[String:Any]] ?? [];let folder=root.appendingPathComponent("readings");for url in (try? FileManager.default.contentsOfDirectory(at:folder,includingPropertiesForKeys:nil)) ?? []{guard url.pathExtension=="json",url.lastPathComponent != "index.json",let data=try? Data(contentsOf:url),let object=try? JSONSerialization.jsonObject(with:data) as? [String:Any],!all.contains(where:{$0["id"] as? String==object["id"] as? String}) else{continue};all.append(object)};return all}
 func safeFile(_ dir:String,_ id:String,_ ext:String)throws->URL{guard id.range(of:"^[a-zA-Z0-9-]{1,80}$",options:.regularExpression) != nil else{throw LocalFailure(message:"Invalid local record.")};return root.appendingPathComponent(dir).appendingPathComponent(id+ext)}
 func journalRows()throws->[[String:Any]]{let file=root.appendingPathComponent("prediction-journal.json");guard FileManager.default.fileExists(atPath:file.path) else{return []};guard let rows=try JSONSerialization.jsonObject(with:Data(contentsOf:file)) as? [[String:Any]] else{throw LocalFailure(message:"The forecast journal could not be read. It has been preserved.")};return rows}
 func hash(_ text:String)->String{SHA256.hash(data:Data(text.utf8)).map{String(format:"%02x",$0)}.joined()}
 func forecasts()throws->[[String:Any]]{try journalRows().map{r in guard let text=r["payloadJSON"] as? String,let payload=try JSONSerialization.jsonObject(with:Data(text.utf8)) as? [String:Any] else{throw LocalFailure(message:"Invalid forecast snapshot.")};var entry=payload;entry["id"]=r["id"];entry["observations"]=r["observations"] ?? [];entry["integrity"]=(r["payloadHash"] as? String)==hash(text);return entry}}
 func saveForecast(_ validated:[String:Any])throws->[[String:Any]]{var rows=try journalRows();guard rows.count<10000 else{throw LocalFailure(message:"Journal limit reached.")};var payload=validated;payload["createdAt"]=Date().timeIntervalSince1970*1000;let text=String(data:try JSONSerialization.data(withJSONObject:payload,options:.sortedKeys),encoding:.utf8)!;rows.append(["id":UUID().uuidString,"payloadJSON":text,"payloadHash":hash(text),"observations":[]]);try write(rows,"prediction-journal.json");return try forecasts()}
 func observeForecast(_ id:String,_ observations:[[String:Any]])throws->[[String:Any]]{var rows=try journalRows();guard let i=rows.firstIndex(where:{$0["id"] as? String==id}),let text=rows[i]["payloadJSON"] as? String,rows[i]["payloadHash"] as? String==hash(text) else{throw LocalFailure(message:"Forecast missing or changed outside the app.")};rows[i]["observations"]=observations;try write(rows,"prediction-journal.json");return try forecasts()}

}
