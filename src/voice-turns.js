export const normalized=t=>String(t||'').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
const backchannels=new Set(['yes','yeah','okay','ok','hmm','mm','uh huh','right','haan','han','ji']);
export function interruption(text,spoken='',{confirmed=false}={}){const words=normalized(text),playing=normalized(spoken);if(!words||backchannels.has(words))return false;if(words.split(' ').length>=2&&playing.includes(words))return false;if(/^(stop|pause|wait|ruk|ruko|bas)$/.test(words))return true;return words.split(' ').length>=2&&(confirmed||words.length>=8)}
export function spokenChunks(text){const clean=String(text).replace(/\*\*[^*]+\*\*/g,'').replace(/[#*_↗]/g,'').trim();const sentences=clean.match(/[^.!?]+[.!?]?/g)||[];let chunks=[],buffer='';for(let sentence of sentences){for(const part of sentence.trim().match(/.{1,240}(?:\s|$)|.{1,240}/g)||[]){if(buffer.length+part.length>280){if(buffer)chunks.push(buffer.trim());buffer=''}buffer+=part+' '}}if(buffer.trim())chunks.push(buffer.trim());return chunks}
export class VoiceTurns{
 constructor({onInterrupt,onQuestion,onState}){Object.assign(this,{onInterrupt,onQuestion,onState});this.state='listening';this.revision=0;this.spoken='';this.partial='';this.started=0}
 setState(state){this.state=state;this.onState?.(state)}
 beginAnswer(text){this.revision++;this.spoken=text;this.setState('speaking');return this.revision}
 current(revision){return revision===this.revision}
 interrupt(){this.revision++;this.spoken='';this.onInterrupt?.();this.setState('listening')}
 transcript(text,{final=false,now=Date.now()}={}){const t=normalized(text);if(!t)return;if(['speaking','thinking'].includes(this.state)){if(!interruption(t,this.spoken,{confirmed:final}))return;if(!this.partial||!t.startsWith(this.partial)){this.started=now}this.partial=t;if(final||now-this.started>=250||/^(stop|pause|wait|ruko|bas)$/.test(t))this.interrupt();else return}if(final){this.partial='';if(/^(stop|pause|wait|ruko|bas)$/.test(t))return;this.setState('thinking');this.onQuestion?.(text)}}
 close(){this.revision++;this.setState('ended')}
}
