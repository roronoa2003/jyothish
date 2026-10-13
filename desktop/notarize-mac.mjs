// Developer ID distribution only. Does not change or publish existing preview downloads.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {cp,mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sign} from '@electron/osx-sign';
const exec=promisify(execFile),root=path.dirname(fileURLToPath(import.meta.url));
async function run(file,args){return (await exec(file,args,{maxBuffer:8*1024*1024})).stdout;}
async function main(){
 if(process.platform!=='darwin')throw Error('Mac signing requires macOS.');
 await run('xcrun',['--find','notarytool']);await run('xcrun',['--find','stapler']);
 const identities=await run('security',['find-identity','-v','-p','codesigning']);
 const names=[...identities.matchAll(/"(Developer ID Application:[^"]+)"/g)].map(m=>m[1]);
 const identity=process.env.JYOTISH_SIGN_IDENTITY;
 if(!names.length)throw Error('No valid Developer ID Application identity. Enroll in the Apple Developer Program, then install the certificate with its private key in Keychain.');
 if(!identity||!names.includes(identity))throw Error('Set JYOTISH_SIGN_IDENTITY to the exact valid Developer ID Application identity in Keychain.');
 const profile=process.env.JYOTISH_NOTARY_PROFILE;
 if(!profile)throw Error('Set JYOTISH_NOTARY_PROFILE to a notarization credential profile stored securely in Keychain. Do not put passwords in this script.');
 await run('xcrun',['notarytool','history','--keychain-profile',profile,'--output-format','json']);
 console.log('Developer ID and notarization credential preflight passed.');
 if(process.argv.includes('--check'))return;
 const version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
 const stage=await mkdtemp(path.join(root,'stage-notarized-'));
 const output=path.resolve(process.env.JYOTISH_SIGNED_OUTPUT||path.join(root,'../artifacts/notarized'));
 await mkdir(output,{recursive:true});
 for(const [arch,label] of [['arm64','Apple-Silicon'],['x64','Intel']]){
  const folder=path.join(stage,arch);await mkdir(folder);
  const app=path.join(folder,'Jyotish.app');
  await cp(path.join(root,'release',`Jyotish-darwin-${arch}`,'Jyotish.app'),app,{recursive:true,verbatimSymlinks:true});
  await sign({app,platform:'darwin',type:'distribution',identity,preAutoEntitlements:false,strictVerify:true,optionsForFile:file=>({hardenedRuntime:true,entitlements:file.includes('/python-runtime/')?[]:['com.apple.security.cs.allow-jit']})});
  const submission=path.join(folder,'submission.zip');
  await run('ditto',['-c','-k','--sequesterRsrc','--keepParent',app,submission]);
  console.log(`Submitting ${label} to Apple; awaiting its decision.`);
  const result=JSON.parse(await run('xcrun',['notarytool','submit',submission,'--keychain-profile',profile,'--wait','--output-format','json']));
  await writeFile(path.join(folder,'notary-result.json'),JSON.stringify(result,null,2));
  if(result.status!=='Accepted')throw Error(`Apple did not accept ${label}. Review submission ${result.id}; no verified download was produced for it.`);
  await run('xcrun',['stapler','staple',app]);await run('xcrun',['stapler','validate',app]);
  await run('codesign',['--verify','--deep','--strict',app]);
  await run('spctl',['--assess','--type','execute','--verbose=2',app]);
  const zip=path.join(output,`Jyotish-${version}-macOS-${label}-notarized.zip`);
  await run('ditto',['-c','-k','--sequesterRsrc','--keepParent',app,zip]);
  console.log('Apple accepted, ticket attached and Gatekeeper assessment passed: '+zip);
 }
 console.log('Before publication, launch both builds and verify charts, local PDF generation and optional Qwen on target hardware. Existing releases have not been replaced.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
