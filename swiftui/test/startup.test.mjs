import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,symlink,rm} from 'node:fs/promises';
import {execFile,spawn} from 'node:child_process';
import {promisify} from 'node:util';
import {createServer} from 'node:net';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const execute=promisify(execFile),repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
test('Mac startup serves translocated path aliases and rejects traversal or external symlinks',{skip:process.platform!=='darwin'},async()=>{
 const folder=await mkdtemp('/private/tmp/jyotish-startup-');let processHandle;
 try{
  const root=path.join(folder,'Jyotish 2.app/Contents/Resources/www');await mkdir(root,{recursive:true});
  await writeFile(path.join(root,'index.html'),'<main>Atlas startup fixture</main>');await writeFile(path.join(root,'style.css'),'body{color:gold}');
  await writeFile(path.join(folder,'outside.txt'),'outside fixture');await symlink(path.join(folder,'outside.txt'),path.join(root,'escape.txt'));
  const socket=createServer();await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
  const harness=path.join(folder,'Harness.swift');await writeFile(harness,`import Foundation\n@main struct Harness{static func main() throws{let server=try AssetServer(root:URL(fileURLWithPath:CommandLine.arguments[1]),port:UInt16(CommandLine.arguments[2])!,onReady:{print("READY");fflush(stdout)},onFailure:{print("FAILED: \\($0)");fflush(stdout)});withExtendedLifetime(server){RunLoop.main.run()}}}`);
  const binary=path.join(folder,'server');await execute('swiftc',[path.join(repo,'swiftui/Sources/AssetServer.swift'),harness,'-o',binary]);
  processHandle=spawn(binary,[root,String(port)]);await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Server readiness timeout')),10000);processHandle.stdout.on('data',chunk=>{if(String(chunk).includes('READY')){clearTimeout(timeout);resolve()}});processHandle.on('error',reject);processHandle.on('exit',code=>{clearTimeout(timeout);reject(Error('Server exited '+code))})});
  const origin='http://127.0.0.1:'+port;
  assert.equal(await (await fetch(origin+'/')).text(),'<main>Atlas startup fixture</main>');
  assert.equal((await fetch(origin+'/style.css')).status,200);
  assert.equal((await fetch(origin+'/missing.js')).status,404);
  assert.equal((await fetch(origin+'/%2e%2e%2f%2e%2e%2foutside.txt')).status,403);
  assert.equal((await fetch(origin+'/escape.txt')).status,403);
  assert.equal((await fetch(origin+'/',{method:'HEAD'})).status,200);
 }finally{if(processHandle){processHandle.kill();await new Promise(resolve=>processHandle.once('exit',resolve))}await rm(folder,{recursive:true,force:true})}
});
