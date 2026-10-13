import {signLords,signs,topics,dignity,ascendant} from '../src/interpretation.js';
import {divisionalChart,vargaSign,vargas} from '../src/vargas.js';
export const synthesisSources=[
 {id:'PVR-VARGA',title:'Vedic Astrology: An Integrated Approach',edition:'P. V. R. Narasimha Rao, 2000; author-hosted edition with 2010 note',chapter:'Section 6.5, PDF page 74 / printed page 62',url:'https://vedicastrologer.org/articles/vedic_astro_textbook.pdf#page=74',text:'Select the divisional chart by subject and trace its relevant houses and rulers.'},
 {id:'PVR-DASHA',title:'Vedic Astrology: An Integrated Approach',chapter:'Sections 16.3 and 16.5.1, PDF pages 224 and 226 / printed pages 212 and 214',url:'https://vedicastrologer.org/articles/vedic_astro_textbook.pdf#page=226',text:'Subdivide the complete initial period, not just its birth balance. Use the major-period lord as an additional reference for the subperiod.'},
 {id:'PVR-TRANSIT',title:'Vedic Astrology: An Integrated Approach',chapter:'Section 25.3, PDF page 332 / printed page 320',url:'https://vedicastrologer.org/articles/vedic_astro_textbook.pdf#page=332',text:'Relate occupied and aspected transit signs to natal houses and planets. A contact is not an event guarantee.'},
 {id:'PVR-TIME',title:'Vedic Astrology: An Integrated Approach',chapter:'Chapter 32, PDF pages 432–434 / printed pages 420–422',url:'https://vedicastrologer.org/articles/vedic_astro_textbook.pdf#page=432',text:'Birth-time uncertainty can alter divisional ascendants and timing. The app runs a declared sensitivity experiment, not rectification.'}
];
export function signEvidence(comparisons){
 const supporting=comparisons.filter(q=>[q.natal.dignity,q.varga.dignity].some(d=>['Own sign','Exaltation sign'].includes(d)));
 const challenging=comparisons.filter(q=>[q.natal.dignity,q.varga.dignity].includes('Debilitation sign'));
 return {supporting,challenging,label:supporting.length&&challenging.length?'Mixed chart support':challenging.length?'Challenging sign conditions':supporting.length?'Supporting sign conditions':'Strength remains unresolved'};
}
export function dashaReference(c,major,minor,division=1){
 const dc=division===1?c:divisionalChart(c,division),a=dc.planets.find(p=>p.name===major),b=dc.planets.find(p=>p.name===minor);
 if(!a||!b)throw Error('Unknown period lord.');
 const relative=(b.sign-a.sign+12)%12+1;
 const owned=signLords.flatMap((n,s)=>n===minor?[(s-a.sign+12)%12+1]:[]);
 const modifier=[6,8,12].includes(relative)?'The relative position adds a process or adjustment theme; it does not cancel the natal indications.':[1,4,7,10].includes(relative)?'The relative angular position connects the subperiod to implementation and engagement.':[5,9].includes(relative)?'The relative trinal position supplies a learning or continuity theme.':'The relative position adds its house theme to the main natal reading.';
 return {division,major,minor,relative,owned,sourceId:'PVR-DASHA',text:`In D${division}, taking ${major} as the temporary reference places ${minor} in relative H${relative} (${topics[relative-1]}), ${owned.length?'ruling relative H'+owned.join('/'): 'with no sign ownership assigned to this node'}. ${major===minor?'The same lord repeats; this is one recurring influence, not two independent confirmations.':modifier}`};
}
// Houses are explicit editorial domain filters. Ownership is recalculated within each varga.
export function divisionalLinks(c,area,activeNames=[]){return area.divisions.map(division=>{
 const dc=divisionalChart(c,division),unstable=c.precision?.changedDivisions.includes(division)||false;
 const links=area.houses.map(house=>{const lord=signLords[(dc.base+house-1)%12],p=dc.planets.find(p=>p.name===lord);return {house,lord,placement:p.house,sign:signs[p.sign],dignity:dignity(lord,p.sign),active:activeNames.includes(lord)};});
 const active=[...new Set(activeNames)].flatMap(name=>{const p=dc.planets.find(p=>p.name===name);return p&&(area.houses.includes(p.house)||links.some(r=>r.lord===name))?[name]:[]});
 return {division,basis:c.basis,unstable,links,active,sourceId:'PVR-VARGA',text:`D${division} ${c.basis==='Ascendant'?'house-ruler':'Moon-reference'} chain: ${links.map(r=>'H'+r.house+' → '+r.lord+' → H'+r.placement+' ('+r.dignity+')').join('; ')}. ${active.length?'Active lords connected within this division: '+active.join(', ')+'.':'No direct active-lord occupation or ownership connection in this division.'} ${unstable?'Its ascendant changes in the ±5-minute sensitivity experiment, so this house chain is provisional.':'This is supporting domain context, not an independent promise.'}`};
 });}
export function birthSensitivity(A,data){
 const changedDivisions=[],samples=[];
 for(let seconds=-300;seconds<=300;seconds+=30){const time=data.birth+seconds*1000,ay=data.ayanamsa+seconds/86400/365.25636*50.29/3600;const rising=ascendant(A,time,data.latitude,data.longitude,ay);if(rising===null)return {available:false,changedDivisions:[],text:'Ascendant-based sensitivity is unavailable. House readings use the Moon reference and cannot establish Lagna-based conclusions.'};samples.push(rising);}
 for(const v of vargas)if(new Set(samples.map(r=>vargaSign(r,v.d))).size>1)changedDivisions.push(v.d);
 return {available:true,minutes:5,stepSeconds:30,changedDivisions,text:`A hypothetical ±5-minute birth-time experiment, sampled every 30 seconds, changes the ascendant sign in ${changedDivisions.length?changedDivisions.map(d=>'D'+d).join(', '):'none of the supported divisions'}. ${changedDivisions.includes(1)?'Natal house ownership and all house-based conclusions are provisional in this experiment.':'Changed divisional house chains are marked provisional.'} This checks ascendants only; it does not establish the actual birth-time error, planetary stability or dasha accuracy.`};
}
