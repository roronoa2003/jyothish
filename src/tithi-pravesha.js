import {norm,angularDistance,chart} from './interpretation.js';
const DAY=86400000,YEAR=365.25636*DAY;
export const annualReferences={solar:{id:'SR-PVR-TP-SOLAR',title:'Tithi Pravesha',url:'https://srath.com/jyoti%E1%B9%A3a/tithi-pravesa/tithi-pravesha/',text:'Return to the natal Sun–Moon angle while the Sun occupies its natal sidereal sign. Cast at birthplace coordinates.'},return:{id:'PVR-TP-DEFINITION',title:'Re-defining Tithi Pravesha Chart',url:'https://vedicastrologer.org/articles/pp_tp.pdf',pages:[1,2,3,4],text:'Return to the natal Sun–Moon angle within the natal conjunction-month. The 2014 proposal defines that month by the tropical solar sign; the earlier method uses a sidereal sign.'},hora:{id:'PVR-LESSONS-HORA',title:'Lessons on Vedic Astrology, Volume I',lesson:[5,13,26],text:'The sunrise weekday starts the planetary-hour sequence; the hour lord is used as the annual ruler. Sunrise and hour-length conventions must be specified.'}};
export const approximateLahiri=time=>23.8531+(time-Date.UTC(2000,0,1,12))/YEAR*50.29/3600;
const solarSign=(A,time,mode,ayanamsaAt)=>Math.floor(norm(A.Ecliptic(A.GeoVector('Sun',new Date(time),true)).elon-(mode!=='tropical-month'?ayanamsaAt(time):0))/30);
export function tithiPraveshaReturns(A,birth,anniversaryYear,{monthConvention='natal-solar-sign',ayanamsaAt=approximateLahiri}={}){
 if(!Number.isFinite(birth)||!Number.isInteger(anniversaryYear)||!['natal-solar-sign','sidereal-month','tropical-month'].includes(monthConvention))throw Error('Invalid annual-return input or month convention.');
 const birthday=new Date(birth);birthday.setUTCFullYear(anniversaryYear);const center=birthday.getTime();if(!Number.isFinite(center))throw Error('Invalid annual-return year.');
 const phase=A.MoonPhase(new Date(birth)),natalConjunction=A.SearchMoonPhase(0,new Date(birth),-35);if(!natalConjunction)throw Error('Natal conjunction could not be calculated.');
 const natalMonthSign=solarSign(A,monthConvention==='natal-solar-sign'?birth:natalConjunction.date.getTime(),monthConvention,ayanamsaAt),start=center-70*DAY,end=center+70*DAY,candidates=[];
 let cursor=start;
 for(let i=0;i<8;i++){
  const conjunction=A.SearchMoonPhase(0,new Date(cursor),35);if(!conjunction||conjunction.date.getTime()>end)break;
  const monthStart=conjunction.date.getTime(),next=A.SearchMoonPhase(0,new Date(monthStart+DAY),35);if(!next)throw Error('Annual conjunction interval could not be calculated.');
  const returnTime=phase<1e-6?monthStart:A.SearchMoonPhase(phase,new Date(monthStart-1000),35)?.date.getTime();
  if(returnTime!==undefined&&returnTime<next.date.getTime()&&solarSign(A,monthConvention==='natal-solar-sign'?returnTime:monthStart,monthConvention,ayanamsaAt)===natalMonthSign)candidates.push({time:returnTime,monthStart,monthEnd:next.date.getTime(),phaseErrorDegrees:angularDistance(A.MoonPhase(new Date(returnTime)),phase)});
  cursor=monthStart+DAY;
 }
 return {anniversaryYear,monthConvention,natalPhase:phase,natalMonthSign,natalConjunction:natalConjunction.date.getTime(),candidates,ambiguous:candidates.length>1,source:monthConvention==='natal-solar-sign'?annualReferences.solar:annualReferences.return,limitations:['Approximate Lahiri for sidereal sign conventions.','Repeated matching lunar months are returned separately; no outcome-based selection.','Return calculation does not supply compressed annual dashas or prove an event.']};
}
const horaOrder=['Saturn','Jupiter','Mars','Sun','Venus','Mercury','Moon'],weekLords=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
export function planetaryHora(A,time,latitude,longitude,{sunriseConvention='geometric-center',hourConvention='clock-60',zone=null}={}){
 if(!Number.isFinite(time)||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>65||Math.abs(longitude)>180) return {resolved:false,reason:'Valid coordinates within the supported latitude range are required.'};
 if(!['geometric-center','visible-limb'].includes(sunriseConvention)||!['clock-60','day-night-12'].includes(hourConvention))throw Error('Unknown planetary-hour convention.');
 const observer=new A.Observer(latitude,longitude,0),cross=(direction,start,days)=>sunriseConvention==='geometric-center'?A.SearchAltitude('Sun',observer,direction,new Date(start),days,0):A.SearchRiseSet('Sun',observer,direction,new Date(start),days);
 const rise=cross(1,time,-3);if(!rise)return {resolved:false,reason:'No preceding sunrise in the supported search interval.'};
 const sunrise=rise.date.getTime(),next=cross(1,sunrise+DAY/2,3);if(!next)return {resolved:false,reason:'Next sunrise unavailable.'};
 const nextSunrise=next.date.getTime();
 const weekday=zone?weekLords.indexOf({Sun:'Sun',Mon:'Moon',Tue:'Mars',Wed:'Mercury',Thu:'Jupiter',Fri:'Venus',Sat:'Saturn'}[new Intl.DateTimeFormat('en-US',{timeZone:zone,weekday:'short'}).format(rise.date)]):new Date(sunrise+longitude*240000).getUTCDay();
 let index,start,end;
 if(hourConvention==='clock-60'){index=Math.floor((time-sunrise)/3600000);if(index>=24)return {resolved:false,reason:'The fixed 24-hour sequence ended before the next sunrise; the hour-boundary convention is ambiguous.',sunrise,nextSunrise,sunriseConvention,hourConvention};start=sunrise+index*3600000;end=Math.min(start+3600000,nextSunrise)}else{
  const set=cross(-1,sunrise,2);if(!set)return {resolved:false,reason:'Sunset unavailable for seasonal hours.'};const sunset=set.date.getTime(),daytime=time<sunset,span=(daytime?sunset-sunrise:nextSunrise-sunset)/12,origin=daytime?sunrise:sunset,k=Math.min(11,Math.floor((time-origin)/span));index=k+(daytime?0:12);start=origin+k*span;end=origin+(k+1)*span;
 }
 return {resolved:true,lord:horaOrder[(horaOrder.indexOf(weekLords[weekday])+index)%7],index:index+1,start,end,sunrise,nextSunrise,sunriseConvention,hourConvention,weekdayReference:zone||'local mean solar date',source:annualReferences.hora};
}
export function annualReturnChart(A,data,candidate,{ayanamsaAt=time=>data.ayanamsa+(time-data.birth)/YEAR*50.29/3600,horaOptions={}}={}){
 const time=candidate.time,ayanamsa=ayanamsaAt(time),moon=norm(A.EclipticGeoMoon(new Date(time)).lon-ayanamsa),c=chart(A,{...data,birth:time,ayanamsa,moon});
 return {time,chart:c,hora:planetaryHora(A,time,data.latitude,data.longitude,{zone:data.zone,...horaOptions}),ayanamsa,source:annualReferences.return};
}
