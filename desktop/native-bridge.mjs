import {advancedAnswer} from './advanced-reader.mjs';
import {consultationInput,consultationRetryPrompt,validateChartClaims,renderConsultation} from '../src/conversation.js';
import {getBooks} from '../src/book-store.js';
import {questionWithContext,validateLocalAnswer,validateTimingAnswer} from '../src/chat-engine.js';
window.jyotishNativePrepare=async(question,time,history=[])=>{
 if(!window.latestBirthChart)throw Error('Create or open a birth profile first.');
 const resolved=questionWithContext(question,history),books=await getBooks(),response=advancedAnswer(window.Astronomy,window.latestBirthChart,resolved,time,books),input=consultationInput(window.Astronomy,window.latestBirthChart,resolved,time,books,response,history);
 return {...input,response};
};
window.jyotishNativeValidate=(text,input)=>validateLocalAnswer(text,input.pack,{requireSources:false})||validateTimingAnswer(text,input.response);
window.jyotishNativeRetry=(input,failure)=>consultationRetryPrompt(input,failure);
window.addEventListener('birth-chart',()=>window.webkit?.messageHandlers.profile.postMessage({name:window.latestBirthChart?.name||'Your chart'}));

window.jyotishNativeRender=(raw,input)=>{const text=renderConsultation(raw,input);return {text,windows:input.generatedWindows}};

import {validateForecast,appendObservation} from '../src/prediction-journal.js';
window.jyotishValidateForecast=validateForecast;window.jyotishAppendObservation=appendObservation;
