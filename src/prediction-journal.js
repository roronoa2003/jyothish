// Local forecast snapshots are separate from subsequently recorded observations.
export function validateForecast(input){
 if(!input||typeof input!=='object'||typeof input.profileId!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(input.profileId))throw Error('A saved profile is required.');
 if(typeof input.event!=='string'||input.event.trim().length<8||input.event.length>500)throw Error('Define a concrete event to check.');
 if(!['favors','against','unresolved'].includes(input.direction))throw Error('Choose a forecast direction.');
 const windows=input.windows;if(!Array.isArray(windows)||!windows.length||windows.length>3||windows.some(w=>!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.end<=w.start))throw Error('Supply one to three valid date windows.');
 if(typeof input.answer!=='string'||input.answer.length>15000)throw Error('Invalid forecast answer.');
 return {...input,event:input.event.trim(),windows:windows.map(w=>({start:w.start,end:w.end})),schema:1};
}
export function appendObservation(record,observation,now=Date.now()){
 if(!['occurred','did_not_occur','unclear'].includes(observation.result))throw Error('Choose an observed result.');const close=Math.max(...record.windows.map(w=>w.end));
 if(observation.result==='did_not_occur'&&now<close)throw Error('Wait until the forecast horizon has ended before recording a non-event.');
 if(observation.result==='occurred'&&(!Number.isFinite(observation.occurredAt)||observation.occurredAt>now))throw Error('Use an actual occurrence date, not a future event.');
 return {...record,observations:[...(record.observations||[]),{result:observation.result,occurredAt:observation.result==='occurred'?observation.occurredAt:null,recordedAt:now,note:String(observation.note||'').slice(0,1000)}]};
}
export function journalMetrics(records,now=Date.now()){
 let scored=0,correct=0,abstentions=0,pending=0,unreported=0,retrospective=0,positiveObserved=0,observed=0;
 for(const r of records){if(r.integrity===false)continue;if(r.createdAt>=Math.max(...r.windows.map(w=>w.end))){retrospective++;continue}const latest=r.observations?.at(-1);if(latest?.result==='occurred'&&latest.occurredAt<=r.createdAt){retrospective++;continue}if(now<Math.max(...r.windows.map(w=>w.end))){pending++;continue}if(!latest||latest.result==='unclear'){unreported++;continue}observed++;if(latest.result==='occurred')positiveObserved+=Number(r.windows.some(w=>latest.occurredAt>=Math.max(w.start,r.createdAt)&&latest.occurredAt<w.end));if(r.direction==='unresolved'){abstentions++;continue}scored++;const hit=latest.result==='occurred'&&r.windows.some(w=>latest.occurredAt>=Math.max(w.start,r.createdAt)&&latest.occurredAt<w.end);if(r.direction==='favors'?hit:!hit)correct++;
 }
 return {scored,correct,incorrect:scored-correct,abstentions,pending,unreported,retrospective,accuracy:scored?correct/scored:null,observedEventRate:observed?positiveObserved/observed:null,limitations:['Local self-reported observations, not independently verified outcomes.','Retrospective entries are excluded from prospective scoring.','Correlated events, broad windows and selective reporting can inflate apparent performance.']};
}
