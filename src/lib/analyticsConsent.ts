export type ConsentState='unset'|'granted'|'denied'|'withdrawn';
import {CONSENT_VERSION,CONSENT_MAX_AGE_MS,consentDecision} from '../../shared/analytics-consent-policy.js';
export {CONSENT_VERSION};
const KEY='hondit_analytics_consent_v1';const CHANGE='hondit-analytics-consent';
type ConsentRecord={state:ConsentState;version:string;at:number};
const memory=new WeakMap<Window,ConsentRecord>();
export function getAnalyticsConsentRecord():ConsentRecord|null{
 if(typeof window==='undefined')return null;
 let s=memory.get(window);
 if(!s)try{s=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
 if(s?.state==='granted')return consentDecision({state:s.state,version:s.version,grantedAt:s.at}).allowed?s:null;
 if(s?.version===CONSENT_VERSION&&typeof s.at==='number'&&Date.now()-s.at>=0&&Date.now()-s.at<CONSENT_MAX_AGE_MS&&['denied','withdrawn'].includes(s.state))return s;
 return null;
}
export function getAnalyticsConsent():ConsentState{
 if(typeof window==='undefined')return 'unset';
 return getAnalyticsConsentRecord()?.state||'unset';
}
export function setAnalyticsConsent(state:Exclude<ConsentState,'unset'>){
 const record={state,version:CONSENT_VERSION,at:Date.now()};memory.set(window,record);try{localStorage.setItem(KEY,JSON.stringify(record));}catch{}
 window.dispatchEvent(new window.Event(CHANGE));
}
export function subscribeAnalyticsConsent(fn:()=>void){
 const storage=(e:StorageEvent)=>{if(e.key===KEY){memory.delete(window);fn();}};
 window.addEventListener(CHANGE,fn);window.addEventListener('storage',storage);
 return()=>{window.removeEventListener(CHANGE,fn);window.removeEventListener('storage',storage);};
}
