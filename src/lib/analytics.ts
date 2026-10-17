import {getAnalyticsConsent,subscribeAnalyticsConsent} from './analyticsConsent';
import {getShortCampaign} from './shortCampaign';
import {analyticsTarget,safeEventParams,safeLanding,safePath,functionalParams} from '../../shared/tracking-policy.js';
import {attributionStore,captureEntry} from './attribution';
type AnalyticsContext={market_code:string;market_country:string;currency:string;display_language:string};
declare global {interface Window {dataLayer?:unknown[];gtag?:(command:'js'|'config'|'event',name:string|Date,params?:Record<string,unknown>)=>void;}}
const measurementId=analyticsTarget(import.meta.env,typeof window==='undefined'?'':window.location.hostname);
let consentBound=false;
let initialized=false, campaignSent=false, lastPage='';
let analyticsContext:AnalyticsContext={market_code:'SG',market_country:'Singapore',currency:'SGD',display_language:'en'};
export function getCurrentAttribution(){return attributionStore.current();}
export function captureAttribution(){return captureEntry();}
// Kept only for the existing admin preview; no dynamic landing event is emitted.
export function getCampaignLandingEventName(_source:string,_medium:string){return 'campaign_landing';}
export function setAnalyticsContext(context:AnalyticsContext){analyticsContext=context;}
export function getPageType(pathname=typeof window==='undefined'?'/':window.location.pathname){
 if(getShortCampaign(pathname))return 'product_list';
 if(pathname==='/')return 'home';
 if(pathname==='/products')return 'product_list';
 if(pathname.startsWith('/products/'))return 'product_detail';
 if(pathname==='/bulk-orders')return 'bulk_product_list';
 if(pathname.startsWith('/bulk-orders/'))return 'checkout';
 if(pathname==='/jeju/pickup')return 'jeju_pickup';
 if(pathname==='/jeju')return 'brand_story';
 if(pathname==='/partners'||pathname.startsWith('/partners/'))return 'partners';
 if(pathname.startsWith('/guide/'))return 'product_guide';
 if(pathname==='/shipping')return 'shipping_info';
 if(pathname==='/contact')return new URLSearchParams(window.location.search).get('reason')==='payment_request'?'payment_request':'contact';
 if(pathname.startsWith('/order-complete/'))return 'order_complete';
 if(pathname.startsWith('/payment-failed/'))return 'payment_failed';
 if(pathname.startsWith('/policy/'))return 'policy';
 return 'other';
}
function clearAnalyticsCookies(){
 try{for(const cookie of document.cookie.split(';')){const name=cookie.trim().split('=')[0];if(!/^(_ga|_gid|_gat)(_|$)/.test(name))continue;for(const domain of ['',window.location.hostname,'.'+window.location.hostname])document.cookie=`${name}=; Max-Age=0; Path=/; SameSite=Lax${domain?'; Domain='+domain:''}`;}}catch{}
}
function safeLocation(){return window.location.origin+safeLanding(window.location.href);}
export function initAnalytics(){
 captureEntry();
 if(!consentBound&&typeof window!=='undefined'){
 consentBound=true;subscribeAnalyticsConsent(()=>{
 if(measurementId)(window as unknown as Record<string,unknown>)[`ga-disable-${measurementId}`]=getAnalyticsConsent()!=='granted';
 if(getAnalyticsConsent()==='granted'){initAnalytics();lastPage='';trackPageView(window.location.pathname);trackCampaignLanding();}else clearAnalyticsCookies();
 });}
 if(getAnalyticsConsent()!=='granted')return;
 if(measurementId)(window as unknown as Record<string,unknown>)[`ga-disable-${measurementId}`]=false;
 if(!measurementId||initialized||typeof window==='undefined')return;
 window.dataLayer=window.dataLayer||[];
 // gtag.js consumes the standard arguments-object command queue.
 window.gtag=function(){window.dataLayer?.push(arguments);};
 window.gtag('js',new Date());
 window.gtag('config',measurementId,{send_page_view:false,page_location:safeLocation(),page_referrer:attributionStore.entry()?.referrer||'',allow_google_signals:false});
 const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${measurementId}`;document.head.appendChild(script);initialized=true;
}
export function trackEvent(eventName:string,params:Record<string,unknown>={}){
 if(getAnalyticsConsent()!=='granted'||!measurementId||!window.gtag||window.location.pathname.startsWith('/admin')||eventName.startsWith('landing_'))return;
 const t=attributionStore.current();const selection=functionalParams(window.location.search);
 const fulfillment=window.location.pathname==='/jeju/pickup'?'jeju_pickup':selection.get('fulfillment');
 const context={item_id:selection.get('product'),quantity:selection.has('quantity')?Number(selection.get('quantity')):undefined,purchase_purpose:selection.get('purpose'),fulfillment};
 const payload=safeEventParams({traffic_source:t?.utm_source,traffic_medium:t?.utm_medium,traffic_campaign:t?.utm_campaign,traffic_content:t?.utm_content,traffic_term:t?.utm_term,link_id:t?.link_id,...analyticsContext,...context,...(fulfillment==='jeju_pickup'?{currency:'KRW'}:{}),page_type:getPageType(),...params});
 window.gtag('event',eventName,{...payload,page_location:safeLocation(),page_referrer:attributionStore.entry()?.referrer||'',...(measurementId===import.meta.env.VITE_GA_TEST_MEASUREMENT_ID?{debug_mode:true}:{})});
}
export function trackPageView(path:string){
 const screen=safePath(path.split(/[?#]/)[0]);
 if(screen===lastPage)return;
 lastPage=screen;
 trackEvent('page_view',{});
}
export function trackCampaignLanding(){
 if(getAnalyticsConsent()!=='granted'||campaignSent)return;campaignSent=true;
 const t=attributionStore.entry();if(!t||(!t.utm_campaign&&!t.utm_content&&['direct','referral'].includes(t.utm_source)))return;
 trackEvent('campaign_landing',{campaign_source:t.utm_source,campaign_medium:t.utm_medium,campaign_name:t.utm_campaign,campaign_content:t.utm_content,campaign_term:t.utm_term});
}
export function trackNavigationClick(params: { destination: string; label: string; area: string }) {
  const url=new URL(params.destination,window.location.origin);
  trackEvent('navigation_click',{destination_path:safePath(url.pathname),navigation_area:params.area});
  if(url.pathname.startsWith('/bulk-orders/'))trackEvent('checkout_entry',{destination_path:safePath(url.pathname),navigation_area:params.area});
}

export function trackOutboundClick(params: { destination: string; label: string; area: string; platform: string }) {
  trackEvent("outbound_click", {
    destination_url: params.destination,
    link_text: params.label.slice(0, 100),
    navigation_area: params.area,
    outbound_platform: params.platform,
  });
}

export function trackProductClick(params: {
  eventName: string;
  productName: string;
  destinationUrl: string;
  buttonLocation: string;
  clickTarget: "image" | "button";
}) {
  trackEvent(params.eventName, {
    product_name: params.productName,
    destination_url: params.destinationUrl,
    button_location: params.buttonLocation,
    click_target: params.clickTarget,
  });
}

export function trackStoreClick(buttonLocation: string) {
  trackEvent("shopee_shop_all_click", {
    destination_url: "https://shopee.sg/hondit.office.sg",
    button_location: buttonLocation,
    click_target: "button",
  });
}

export function trackJejuClick(source: string) {
  trackEvent("nav_jeju_click", {
    section_name: source,
    destination_url: "/jeju",
  });
}

export function trackJejuPreview(source: string) {
  trackEvent("jeju_preview_click", {
    section_name: source,
    destination_url: "/jeju",
  });
}

export function trackRitualSelect(selectionName: string) {
  trackEvent("find_ritual_select", {
    section_name: "find_your_ritual",
    selection_name: selectionName,
  });
}

export function trackFaqOpen(question: string) {
  trackEvent("faq_open", {
    section_name: "faq",
    selection_name: question,
  });
}

export function trackInstagramClick(buttonLocation: string) {
  trackEvent("instagram_profile_click", {
    destination_url: "https://www.instagram.com/hondit.office/",
    button_location: buttonLocation,
    click_target: "button",
  });
}

export function trackSectionNav(sectionId: string, sectionLabel: string) {
  trackEvent("section_nav_click", {
    section_id: sectionId,
    section_label: sectionLabel,
    button_location: "right_section_rail",
  });
}

const purchases=new Set<string>();
export function trackPurchaseOnce(order:string,params:Record<string,unknown>){
 if(getAnalyticsConsent()!=='granted'||!measurementId||purchases.has(order))return;
 try{if(sessionStorage.getItem('hondit_purchase_queued:'+order))return;}catch{}
 trackEvent('purchase',params);purchases.add(order);
 try{sessionStorage.setItem('hondit_purchase_queued:'+order,'1');}catch{}
}
