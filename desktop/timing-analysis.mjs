import {aspects,signs,topics} from '../src/interpretation.js';
import {currentSky} from '../src/report-engine.js';
import {deepActive} from './deep-dasha.mjs';
import {signEvidence,dashaReference} from './synthesis-context.mjs';
// Coverage is duration within a requested interval, never an event probability.
export function timingCoverage(rows){const result=new Map();for(const row of rows){if(!(row.end>row.start))continue;for(const level of row.levels){const key=level.level+'/'+level.lord;const prior=result.get(key)||{level:level.level,lord:level.lord,durationMs:0};prior.durationMs+=row.end-row.start;result.set(key,prior)}}const total=rows.reduce((n,r)=>n+Math.max(0,r.end-r.start),0);return [...result.values()].map(r=>({...r,intervalFraction:total?r.durationMs/total:0}));}
export function sampleTransits(A,data,c,start,end){
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||end-start>32*86400000)throw Error('Transit sampling requires an interval of up to 32 days.');
 const times=[];for(let t=start;t<end;t+=21600000)times.push(t);if(times.at(-1)!==end-1)times.push(end-1);
 return times.map(time=>{const ay=data.ayanamsa+(time-data.birth)/86400000/365.25636*50.29/3600;return {time,activeNames:deepActive(data.periods,time).slice(0,3).map(p=>p.lord),sky:currentSky(A,time,ay).filter(p=>['Jupiter','Saturn'].includes(p.name)).map(p=>({...p,sign:signs[p.sign],natalHouse:(p.sign-c.base+12)%12+1}))};});
}
export function transitAreaEvidence(c,area,sky,activeNames){
 const natal=c.planets.filter(p=>activeNames.includes(p.name)),out=[];
 for(const t of sky.filter(t=>['Jupiter','Saturn'].includes(t.name))){
 const mover={...t,sign:typeof t.sign==='string'?signs.indexOf(t.sign):t.sign};
 const contacts=natal.filter(p=>p.sign===mover.sign||aspects(mover,p)).filter(p=>area.houses.includes(p.house)||area.karakas.includes(p.name)||p.owns.some(h=>area.houses.includes(h))).map(p=>({planet:p.name,kind:p.sign===mover.sign?'same sign':'full sign aspect',natalHouse:p.house}));
 const occupied=area.houses.includes(t.natalHouse),aspectedHouses=area.houses.filter(h=>aspects(mover,{sign:(c.base+h-1)%12}));
 if(occupied||contacts.length||aspectedHouses.length)out.push({planet:t.name,sign:typeof t.sign==='string'?t.sign:signs[t.sign],house:t.natalHouse,occupied,aspectedHouses,contacts,text:`${t.name} at natal H${t.natalHouse}: ${occupied?'occupies a selected domain house; ':''}${aspectedHouses.length?'aspects domain H'+aspectedHouses.join('/')+'; ':''}${contacts.map(p=>p.kind+' to active '+p.planet).join('; ')||'no contact to the selected active natal planets'}.`});
 }return out;
}
export function aggregateTransits(c,area,samples){
 const grouped=new Map();for(const sample of samples)for(const contact of transitAreaEvidence(c,area,sample.sky,sample.activeNames)){
 const key=JSON.stringify([contact.planet,contact.sign,contact.aspectedHouses,contact.contacts.map(p=>p.planet)]);
 const row=grouped.get(key)||{...contact,observedAt:[],sampleCount:0};row.observedAt.push(sample.time);row.sampleCount++;grouped.set(key,row);
 }return [...grouped.values()].map(row=>({...row,totalSamples:samples.length,text:row.text+` Observed in ${row.sampleCount}/${samples.length} samples, first ${new Date(row.observedAt[0]).toISOString()} and last ${new Date(row.observedAt.at(-1)).toISOString()}. These are sampled observations, not exact ingress or contact boundaries.`}));
}
export function dispositorChain(c,name){const path=[],seen=new Set();let p=c.planets.find(p=>p.name===name);while(p&&!seen.has(p.name)){seen.add(p.name);path.push({planet:p.name,sign:signs[p.sign],house:p.house,dignity:p.dignity,dispositor:p.dispositor});if(p.name===p.dispositor)return {path,terminal:p.name,type:'self-dispositor'};p=c.planets.find(q=>q.name===p.dispositor)}return {path,terminal:p?.name||null,type:'cycle'};}

export function synthesizeTiming(c,area,analysis,sky,rows,samples=[]){
 const coverage=timingCoverage(rows),names=[...new Set(coverage.map(p=>p.lord))];
 const activations=coverage.flatMap(p=>{const n=c.planets.find(q=>q.name===p.lord);if(!n)return [];const reasons=[];if(area.houses.includes(n.house))reasons.push('natal occupation');if(n.owns.some(h=>area.houses.includes(h)))reasons.push('natal ownership');if(area.karakas.includes(p.lord))reasons.push('general significator');return reasons.length?[{...p,reasons,direct:reasons.some(r=>r.startsWith('natal'))}]:[]});
 const transits=samples.length?aggregateTransits(c,area,samples):transitAreaEvidence(c,area,sky,names),broad=activations.filter(p=>['Mahadasha','Antardasha','Pratyantardasha'].includes(p.level)),fine=activations.filter(p=>['Sukshma','Prana'].includes(p.level)),direct=broad.filter(p=>p.direct);
 const uniqueBroad=[...new Set(broad.map(p=>p.lord))],verdict=signEvidence(analysis.comparisons).label;
 const pairs=new Map();for(const row of rows){const major=row.levels.find(p=>p.level==='Mahadasha')?.lord,minor=row.levels.find(p=>p.level==='Antardasha')?.lord;if(major&&minor){const key=major+'/'+minor;const item=pairs.get(key)||{...dashaReference(c,major,minor),durationMs:0};item.durationMs+=row.end-row.start;pairs.set(key,item);}}
 let conclusion=verdict+'. ';
 conclusion+=broad.length?`Broader-period links: ${broad.map(p=>`${p.lord} at ${p.level}, ${p.reasons.join(' and ')} (${Math.round(p.intervalFraction*100)}% of the interval)`).join('; ')}. `:'No broader-period ownership, occupation or significator link is present. ';
 if(uniqueBroad.length<broad.length)conclusion+='Repeated lords are one recurring influence; the engine does not count them as independent confirmations. ';
 if(fine.length)conclusion+=`Shorter-layer emphasis: ${[...new Set(fine.map(p=>p.lord))].join(', ')}. This does not replace the broader period. `;
 conclusion+=[...pairs.values()].map(p=>p.text).join(' ')+' ';
 conclusion+=transits.length?`The ${samples.length?'six-hour transit samples':'dated snapshot'} connect this domain through ${[...new Set(transits.map(t=>t.planet+' in '+t.sign+' at H'+t.house+(t.aspectedHouses.length?', aspecting H'+t.aspectedHouses.join('/'):'')+(t.contacts.length?', contacting '+t.contacts.map(p=>p.planet).join('/') :'')))].join('; ')}. `:'No selected Jupiter/Saturn domain contact was found in the samples. ';
 const vargaActive=(analysis.vargaLinks||[]).filter(v=>v.active.length&&!v.unstable);
 const focus=direct.length&&transits.length&&vargaActive.length?'Natal, divisional and timing links present':direct.length?'Natal timing links present':broad.length?'General significator emphasis':fine.length?'Short-layer emphasis only':'Limited timing evidence';
 conclusion+=focus+'. '+(direct.length&&transits.length?'These are related symbolic lenses, not independent statistical evidence or a promised event. ':'A generic significator or microperiod alone is insufficient for a strong event-specific statement. ');
 if(c.precision?.changedDivisions.includes(1)||c.basis!=='Ascendant')conclusion+='The natal house reference is uncertain, so the house-based synthesis is provisional. ';
 if((analysis.vargaLinks||[]).some(v=>v.unstable))conclusion+='Birth-time-sensitive divisional house chains are excluded from the stable-divisional-support label. ';
 conclusion+='The direction of expression retains all supporting and challenging sign conditions; overall planetary strength is not calculated.';
 return {verdict,focus,activations,transits,uniqueBroadLords:uniqueBroad,periodReferences:[...pairs.values()],conclusion,snapshotOnly:!samples.length,sampling:samples.length?{count:samples.length,stepHours:6,start:samples[0].time,end:samples.at(-1).time}:null};
}
