import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';
import {validateForecast,appendObservation} from '../src/prediction-journal.js';
export class ForecastJournal{
 constructor(root){this.file=path.join(root,'prediction-journal.json');this.queue=Promise.resolve()}
 async rows(){try{return JSON.parse(await fs.readFile(this.file,'utf8'))}catch(e){if(e.code==='ENOENT')return [];throw e}}
 hash(value){return crypto.createHash('sha256').update(value).digest('hex')}
 async list(){return (await this.rows()).map(r=>({...JSON.parse(r.payloadJSON),id:r.id,observations:r.observations||[],integrity:r.payloadHash===this.hash(r.payloadJSON)}))}
 mutate(fn){const result=this.queue.then(async()=>{const rows=await this.rows(),updated=await fn(rows);await fs.mkdir(path.dirname(this.file),{recursive:true,mode:0o700});await fs.writeFile(this.file+'.tmp',JSON.stringify(updated),{mode:0o600});await fs.rename(this.file+'.tmp',this.file);return this.list()});this.queue=result.catch(()=>{});return result}
 save(input){const valid=validateForecast(input),snapshot={...valid,createdAt:Date.now()};const payloadJSON=JSON.stringify(snapshot),record={id:crypto.randomUUID(),payloadJSON,payloadHash:this.hash(payloadJSON),observations:[]};return this.mutate(rows=>{if(rows.length>=10000)throw Error('Journal limit reached. Export an archive first.');return [...rows,record]})}
 observe(id,observation){return this.mutate(rows=>{if(!rows.some(r=>r.id===id))throw Error('Forecast not found.');return rows.map(r=>{if(r.id!==id)return r;if(r.payloadHash!==this.hash(r.payloadJSON))throw Error('This forecast snapshot changed outside the app.');const updated=appendObservation({...JSON.parse(r.payloadJSON),observations:r.observations},observation);return {...r,observations:updated.observations}})})}
}
