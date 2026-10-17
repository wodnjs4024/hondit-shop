import {getAnalyticsConsent,subscribeAnalyticsConsent} from './analyticsConsent';
import {createAttributionStore} from '../../shared/attribution.js';
import {getShortCampaign} from './shortCampaign';
export const attributionStore=createAttributionStore({storage:()=>getAnalyticsConsent()==='granted'?window.localStorage:undefined});
export function captureEntry(){
 if(typeof window==='undefined')return null;
 return attributionStore.capture({url:window.location.href,referrer:document.referrer,short:getShortCampaign(window.location.pathname)});
}
export const readCheckoutAttribution=()=>getAnalyticsConsent()==='granted'?attributionStore.checkout():{};
if(typeof window!=='undefined')subscribeAnalyticsConsent(()=>{if(getAnalyticsConsent()==='granted')attributionStore.persist();else{try{for(const k of ['hondit_attribution_v2','hondit_attribution_v1','hondit_attribution'])localStorage.removeItem(k);}catch{}attributionStore.clear();}});
export function currentLinkId(){return attributionStore.current()?.link_id || '';}
