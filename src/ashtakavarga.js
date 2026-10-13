// Favorable contribution tables, BPHS 66. Each row lists contributors at relative places 1–12.
// S=Sun M=Moon A=Mars B=Mercury J=Jupiter V=Venus T=Saturn L=Lagna.
const ALL='SMABJVTL';
export const favorable={
Sun:['TAS','TAS','BML','LS TA'.replaceAll(' ',''),'JB','LVBJM','SATV','TAS','SATBJ','LS TABM'.replaceAll(' ',''),'SMABJTL','LVB'],
Moon:['BMJ','JA','BSMATVL','JVB','ABVT','SMATL','SMJBV','SBJ','VM','SBJVMLA',ALL,''],
Mars:['LTA','A','LBMS','TA','BS','BMJSLV','TA','TAV','T','ASJTL',ALL,'JV'],
Mercury:['LTAVB','LAMVT','VB','LMTVA','BTV','JBSML','AT','ATLMVJ','TASBV','LTABM',ALL,'JBS'],
Jupiter:['LASBJ','JLASBMV','TJS','LASBJ','VMLBT','VLBT','LAJSM','JSA','VSLMB','JBASVL','SMABJVL','T'],
Venus:['LVM','LVM','LVMBTA','LVMTA','LMBJTV','BA','','VSMJLT','MABJVTL','VJT',ALL,'AMS'],
Saturn:['SL','S','LMAT','LS','JTA','MABJVTL','S','SB','B','SALB',ALL,'ABJV']};
const name={S:'Sun',M:'Moon',A:'Mars',B:'Mercury',J:'Jupiter',V:'Venus',T:'Saturn'};
export function ashtakavarga(c){if(c.rising===null)return null;let refs=Object.fromEntries(c.planets.filter(p=>!p.node).map(p=>[p.name,p.sign]));refs.Lagna=Math.floor(c.rising/30);let rows=Object.entries(favorable).map(([planet,places])=>{let values=Array(12).fill(0),contributions=Array.from({length:12},()=>[]);places.forEach((contributors,i)=>{for(let symbol of contributors){let source=symbol==='L'?'Lagna':name[symbol],target=(refs[source]+i)%12;values[target]++;contributions[target].push(source)}});return {planet,values,contributions,total:values.reduce((a,b)=>a+b,0)}});let sarva=Array.from({length:12},(_,s)=>rows.reduce((total,row)=>total+row.values[s],0));return {rows,sarva,total:sarva.reduce((a,b)=>a+b,0),lagnaSign:refs.Lagna}}
