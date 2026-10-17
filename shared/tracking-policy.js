// Public campaign metadata only. Never retain free text, contact details, or receipt URLs.
export const campaignKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
export const productIds = ['diffuser-350g','diffuser-500g','foam-oil','foaming-cleanser','cleansing-water','cleansing-mix'];
export const marketIds = ['SG','HK','JP','TW','TH','MY','BN','MO'];
export const languageIds = ['en','ko','ja','zh','zh-HK','zh-TW','ms','th'];
export function publicToken(value, max = 100) {
  return typeof value === 'string' && value.length <= max && /^[a-z0-9][a-z0-9_-]*$/i.test(value) ? value : '';
}
export function safePath(path = '/') {
  if (/^\/(order-complete|payment-failed)\//.test(path)) return '/' + path.split('/')[1] + '/receipt';
  if (/^\/admin(?:\/|$)/.test(path)) return '/admin';
  if (/^\/(products|guide|bulk-orders)\//.test(path)) {
    const [section, slug] = path.slice(1).split('/');
    return productIds.includes(slug) ? `/${section}/${slug}` : '/not-found';
  }
  return /^\/(?:|products|bulk-orders|partners|jeju|jeju\/pickup|shipping|contact|policy\/(?:terms|privacy|refund)|(?:sg|hk|jp|tw)\/(?:ig|fb|c01))$/.test(path) ? path : '/not-found';
}
export function functionalParams(input = '') {
  const source = new URLSearchParams(input), out = new URLSearchParams();
  const choices = {product:productIds,market:marketIds,lang:languageIds,purpose:['unspecified','personal_gift','resale','business_use','group_purchase'],fulfillment:['international_bundle','jeju_pickup'],reason:['partner','quantity','combination','product','payment_request']};
  for (const [key, values] of Object.entries(choices)) if (values.includes(source.get(key))) out.set(key,source.get(key));
  const q=source.get('quantity');
  if (/^[1-9]\d{0,3}$/.test(q || '')) out.set('quantity',q);
  return out;
}
export function safeLanding(input) {
  try {
    const url = new URL(input, 'https://hondit-shop.vercel.app');
    const params = functionalParams(url.search);
    for (const key of campaignKeys) { const v=publicToken(url.searchParams.get(key)); if(v)params.set(key,v); }
    return safePath(url.pathname)+(params.size?'?'+params:'');
  } catch { return '/'; }
}
export function safeReferrer(input, origin = '') {
  try { const u=new URL(input); return /^https?:$/.test(u.protocol) && u.origin!==origin ? u.origin : ''; } catch { return ''; }
}
const enumValues = {
  fulfillment:['international_bundle','jeju_pickup'], purchase_purpose:['unspecified','personal_gift','resale','business_use','group_purchase'],
  channel:['whatsapp','telegram','wechat','instagram','email'], copy_type:['request','account','email'],
  interaction_source:['arrow','thumbnail','keyboard'], interaction_context:['product_detail'], interaction_target:['product_detail'],
  navigation_area:['header','footer','mobile_sticky','main_content'], outbound_platform:['whatsapp','telegram','wechat','instagram','shopee','external_site','email'],
  market_code:marketIds,market:marketIds,selected_market:marketIds,previous_market:marketIds,
  display_language:languageIds,selected_language:languageIds,previous_language:languageIds,
  currency:['SGD','HKD','JPY','TWD','THB','MYR','KRW','BND','MOP','USD'],
};
const tokenKeys = new Set(['traffic_source','traffic_medium','traffic_campaign','traffic_content','traffic_term','campaign_source','campaign_medium','campaign_name','campaign_content','campaign_term','campaign_channel','community_id','page_type','action_name','action_group','checkout_stage','checkout_step','reason_code','failure_reason','payment_status','order_status','item_list_name','filter_name','filter_value','placement_id']);
export function safeEventParams(input = {}) {
  const out = {};
  for (const [key, value] of Object.entries(input)) {
    if (enumValues[key]?.includes(value)) out[key]=value;
    else if (tokenKeys.has(key) && publicToken(value)) out[key]=value;
    else if (['item_id','product_id'].includes(key) && productIds.includes(value)) out[key]=value;
    else if (key==='link_id' && /^l\d{4,}$/.test(value)) out[key]=value;
    else if (['quantity','image_number','value','price'].includes(key) && typeof value==='number' && Number.isFinite(value) && value>=0) out[key]=value;
    else if (key==='destination_path' && typeof value==='string') out[key]=safePath(value);
    else if (key==='transaction_id' && /^HD-[A-Z0-9-]{5,50}$/.test(value)) out[key]=value;
    else if (key==='items' && Array.isArray(value)) out.items=value.slice(0,20).map(item=>safeEventParams(Object.fromEntries(Object.entries(item).filter(([k])=>['item_id','quantity','price','currency'].includes(k))))).filter(item=>item.item_id);
  }
  return out;
}
export function analyticsTarget(env, hostname) {
  const productionId='G-FKMMTFM45C';
  if (env.VITE_VERCEL_ENV==='production' && env.PROD && hostname==='hondit-shop.vercel.app') return /^G-[A-Z0-9]+$/.test(env.VITE_GA_MEASUREMENT_ID || '') && env.VITE_GA_MEASUREMENT_ID!=='G-XXXXXXXXXX' ? env.VITE_GA_MEASUREMENT_ID : productionId;
  const test=env.VITE_GA_TEST_MEASUREMENT_ID;
  return env.VITE_ANALYTICS_TEST_ENABLED==='1' && /^G-[A-Z0-9]+$/.test(test || '') && test!==productionId && test!==env.VITE_GA_MEASUREMENT_ID ? test : '';
}
