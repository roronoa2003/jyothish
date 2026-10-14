export const periodLords=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
export const periodYears=[7,20,6,10,7,18,16,19,17];
export const yearConventions=[360,365.2425,365.25636];
export function periodsForMoon(birth,moon,yearDays=365.25636){
 if(!Number.isFinite(birth)||!Number.isFinite(moon)||moon<0||moon>=360||!yearConventions.includes(yearDays))throw Error('Invalid Vimshottari inputs or year convention.');
 const unit=yearDays*86400000,n=Math.floor(moon/(40/3)),i=n%9,f=moon/(40/3)-n;let t=birth-f*periodYears[i]*unit;const periods=[];
 for(let k=0;k<19;k++){const j=(i+k)%9,end=t+periodYears[j]*unit;periods.push({i:j,start:t,end});t=end}
 return {periods,balance:(1-f)*periodYears[i],yearDays,n};
}
