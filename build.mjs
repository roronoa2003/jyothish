import {copyFile,readdir,writeFile,readFile,rm} from 'node:fs/promises';import {createHash} from 'node:crypto';import {build} from 'esbuild';
await rm('dist/chunks',{recursive:true,force:true});
await build({entryPoints:{reading:'src/reading.jsx'},bundle:true,minify:true,format:'esm',splitting:true,outdir:'dist',chunkNames:'chunks/[name]-[hash]',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
await build({entryPoints:['src/local-ai-worker.js'],bundle:true,minify:true,format:'esm',outfile:'dist/local-ai-worker.js',legalComments:'eof'});
for(const file of ['interpretation','vargas'])await copyFile(`src/${file}.js`,`dist/${file}.js`);
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','dist/pdf.worker.min.mjs');
let files=[];async function walk(path,prefix=''){for(const e of await readdir(path,{withFileTypes:true})){if(e.isDirectory())await walk(path+'/'+e.name,prefix+e.name+'/');else if(!['sw.js','offline-assets.json'].includes(e.name))files.push(prefix+e.name)}}await walk('dist');
let hash=createHash('sha256');for(let f of files.sort())hash.update(await readFile('dist/'+f));let version=hash.digest('hex').slice(0,14);await writeFile('dist/offline-assets.json',JSON.stringify({version,files:['./',...files,'cosmos.js?v=observatory-1']},null,2));await writeFile('dist/sw.js',(await readFile('src/sw-template.js','utf8'))+'\n// Asset version: '+version+'\n');
console.log('Bundled React, offline reading library, PDF importer, and optional on-device AI.');
