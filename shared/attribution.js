import {campaignKeys, publicToken, safeLanding, safeReferrer} from './tracking-policy.js';
export function cleanCheckoutAttribution(input={}) {
  if(!input||typeof input!=='object')return {};
  const aliases={utm_source:'traffic_source',utm_medium:'traffic_medium',utm_campaign:'traffic_campaign',utm_content:'traffic_content',utm_term:'traffic_term'};
  const out={};
  for(const key of campaignKeys)out[key]=publicToken(input[key]||input[aliases[key]]);
  out.landing_page=safeLanding(typeof input.landing_page==='string'?input.landing_page:'/');
  out.referrer=safeReferrer(input.referrer,'https://hondit-shop.vercel.app');
  out.community_id=publicToken(input.community_id);
  return out;
}
const DAY=86400000;
export const ATTRIBUTION_KEY='hondit_attribution_v2';
export function createAttributionStore({storage, now=()=>Date.now()} = {}) {
  let memory=null, entered=false, entry=null;
  const access=(fn)=>{try{return fn(storage?.());}catch{return null;}};
  function read() {
    if(!memory) { const raw=access(s=>s?.getItem(ATTRIBUTION_KEY)); try{memory=JSON.parse(raw || 'null');}catch{} }
    if(!memory || memory.version!==2) memory={version:2,first:null,last:null,legacy:null};
    for(const [key,days] of [['first',90],['last',30],['legacy',30]]) {
      const t=memory[key];
      if(t && (!Number.isFinite(t.captured_at) || t.captured_at>now() || now()-t.captured_at>=days*DAY))memory[key]=null;
    }
    return memory;
  }
  function write() {access(s=>s?.setItem(ATTRIBUTION_KEY,JSON.stringify(memory)));}
  function snapshot(url,referrer,short) {
    const touch={landing_page:safeLanding(url.href),referrer:safeReferrer(referrer,url.origin),captured_at:now()};
    const aliases={utm_source:'source',utm_medium:'medium',utm_campaign:'campaign',utm_content:'content'};
    for(const k of campaignKeys)touch[k]=publicToken(short?.[aliases[k]] || url.searchParams.get(k));
    touch.utm_source ||= touch.referrer?'referral':'direct';
    touch.utm_medium ||= touch.referrer?'referral':'none';
    touch.community_id=publicToken(url.searchParams.get('community'));
    touch.link_id=/^l\d{4,}$/.test(touch.utm_content)?touch.utm_content:'';
    return touch;
  }
  function capture({url,referrer='',short=null}) {
    if(entered)return entry;
    entered=true;
    const u=new URL(url), data=read();
    // Legacy provenance is uncertain. Preserve a labelled fallback, never fabricate first touch.
    if(!data.first && !data.last && !data.legacy) {
      const raw=access(s=>s?.getItem('hondit_attribution'));
      try {const old=JSON.parse(raw || 'null');if(old && now()-Date.parse(old.captured_at)>=0 && now()-Date.parse(old.captured_at)<30*DAY){
        const legacy=snapshot(new URL(old.landing_page || '/',u.origin),old.referrer || '',null);
        for(const k of campaignKeys)legacy[k]=publicToken(old[k]);
        legacy.captured_at=Date.parse(old.captured_at);legacy.link_id=/^l\d{4,}$/.test(legacy.utm_content)?legacy.utm_content:'';data.legacy=legacy;
      }}catch{}
    }
    entry=snapshot(u,referrer,short);
    if(!data.first)data.first=entry;
    const tagged=!!short || campaignKeys.some(k=>publicToken(u.searchParams.get(k)));
    if(tagged || entry.referrer)data.last=entry;
    write();return entry;
  }
  function current(){const d=read();return d.last || entry || d.first || d.legacy || null;}
  function checkout(){const t=current();if(!t)return {};return cleanCheckoutAttribution(t);}
  return {persist:write,clear(){memory=null;entry=null;entered=false;access(s=>{s?.removeItem(ATTRIBUTION_KEY);s?.removeItem('hondit_attribution');s?.removeItem('hondit_attribution_v1');});},capture,current,checkout,snapshot:()=>structuredClone(read()),entry:()=>entry};
}
