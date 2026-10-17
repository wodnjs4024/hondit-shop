import test from 'node:test';
import assert from 'node:assert/strict';
import {createAttributionStore,cleanCheckoutAttribution} from '../shared/attribution.js';
import {analyticsTarget,safeEventParams,safeLanding,functionalParams} from '../shared/tracking-policy.js';
import {selectionUrl} from '../shared/sales-tools.js';
import {checkoutAnalytics} from '../shared/checkout-analytics.js';
import {defaultProducts} from '../api/_bulk-data.js';
import {issueOrderAccess,verifyOrderAccess} from '../api/_order-access.js';
import publicOrder from '../api/orders/public/[orderNumber].js';
const DAY=86400000;
function store(){const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
const entry=(id='l0001')=>'https://hondit-shop.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=sg_online_202610&utm_content='+id;
test('first and recent external touches are whole snapshots; internal and direct visits do not overwrite recent',()=>{
 const storage=store();let now=DAY;const make=()=>createAttributionStore({storage:()=>storage,now:()=>now});
 let s=make();s.capture({url:entry()});const first=s.snapshot().first;
 s.capture({url:'https://hondit-shop.vercel.app/products/diffuser-350g'});assert.equal(s.current().utm_content,'l0001');
 now+=DAY;s=make();s.capture({url:'https://hondit-shop.vercel.app/',referrer:'https://hondit-shop.vercel.app/products'});assert.equal(s.current().utm_content,'l0001');
 now+=DAY;s=make();s.capture({url:entry('l0002').replace('instagram','outreach').replace('social','email')});
 assert.deepEqual(s.snapshot().first,first);assert.equal(s.checkout().utm_source,'outreach');assert.equal(s.checkout().utm_content,'l0002');
});
test('30-day recent TTL expires without reviving an older campaign as recent; 90-day first TTL renews',()=>{
 const storage=store();let now=DAY;let s=createAttributionStore({storage:()=>storage,now:()=>now});s.capture({url:entry()});
 now+=31*DAY;s=createAttributionStore({storage:()=>storage,now:()=>now});s.capture({url:'https://hondit-shop.vercel.app/'});assert.equal(s.snapshot().last,null);assert.equal(s.snapshot().first.utm_content,'l0001');assert.equal(s.checkout().utm_source,'direct');
 now+=60*DAY;s=createAttributionStore({storage:()=>storage,now:()=>now});s.capture({url:entry('l0003')});assert.equal(s.snapshot().first.utm_content,'l0003');
});
test('blocked and corrupt storage leave attribution and checkout usable in memory',()=>{
 for(const storage of [()=>{throw Error('denied')},()=>({getItem:()=>'{bad',setItem:()=>{throw Error('quota')}})]){
  const s=createAttributionStore({storage});assert.doesNotThrow(()=>s.capture({url:entry()}));assert.equal(s.checkout().utm_content,'l0001');
 }
});
test('legacy input is labelled uncertain, not promoted to first touch',()=>{
 const storage=store();storage.setItem('hondit_attribution',JSON.stringify({utm_source:'email',captured_at:new Date(DAY).toISOString(),landing_page:'/'}));
 const s=createAttributionStore({storage:()=>storage,now:()=>2*DAY});s.capture({url:'https://hondit-shop.vercel.app/'});
 assert.equal(s.snapshot().first.utm_source,'direct');assert.equal(s.snapshot().legacy.utm_source,'email');assert.equal(s.snapshot().legacy.captured_at,DAY);
});
test('untagged users have no fabricated link ID and referrer is origin only',()=>{
 const s=createAttributionStore();s.capture({url:'https://hondit-shop.vercel.app/',referrer:'https://example.com/person/private?email=private@example.com'});
 assert.equal(s.current().link_id,'');assert.equal(s.checkout().referrer,'https://example.com');
});
test('functional links preserve selection and never copy UTM or free text',()=>{
 const p=functionalParams('product=diffuser-500g&quantity=2&market=JP&lang=ja&purpose=resale&fulfillment=jeju_pickup&utm_content=l0002&email=private@example.com');
 const url=selectionUrl('/contact',{slug:p.get('product'),quantity:p.get('quantity'),market:p.get('market'),language:p.get('lang'),purpose:p.get('purpose'),fulfillment:p.get('fulfillment')});
 const q=new URL(url,'https://test.invalid').searchParams;
 assert.equal(q.get('product'),'diffuser-500g');assert.equal(q.get('quantity'),'2');assert.equal(q.get('fulfillment'),'jeju_pickup');assert.equal(q.get('market'),'JP');assert.equal(q.get('utm_content'),null);assert.equal(q.get('email'),null);
});
test('analytics strips PII, receipt IDs, arbitrary parameters and invalid item metadata',()=>{
 const data=safeEventParams({email:'a@example.com',message:'secret',error_message:'name phone',destination_url:'mailto:a@example.com',link_text:'private',paypal_order_id:'secret',channel:'whatsapp',quantity:2,items:[{item_id:'diffuser-500g',item_name:'private name',quantity:2,price:46},{item_id:'private'}]});
 assert.deepEqual(data,{channel:'whatsapp',quantity:2,items:[{item_id:'diffuser-500g',quantity:2,price:46}]});
 const url=safeLanding('https://hondit-shop.vercel.app/order-complete/HD-PRIVATE?token=secret&email=a@example.com&utm_content=l0001');
 assert.equal(url,'/order-complete/receipt?utm_content=l0001');
});
test('production analytics is impossible in default local, Preview, and a foreign hostname; tests require separate ID',()=>{
 assert.equal(analyticsTarget({PROD:true},'localhost'),'');assert.equal(analyticsTarget({PROD:true,VITE_VERCEL_ENV:'preview'},'hondit-shop.vercel.app'),'');
 assert.equal(analyticsTarget({PROD:true,VITE_VERCEL_ENV:'production'},'preview.vercel.app'),'');
 assert.equal(analyticsTarget({PROD:true,VITE_VERCEL_ENV:'production'},'hondit-shop.vercel.app'),'G-FKMMTFM45C');
 assert.equal(analyticsTarget({VITE_ANALYTICS_TEST_ENABLED:'1',VITE_GA_TEST_MEASUREMENT_ID:'G-FKMMTFM45C'},'localhost'),'');
 assert.equal(analyticsTarget({VITE_ANALYTICS_TEST_ENABLED:'1',VITE_GA_TEST_MEASUREMENT_ID:'G-TESTONLY'},'localhost'),'G-TESTONLY');
});
test('checkout analytics uses approved quantity-specific prices and exact total without changing sales rules',()=>{
 for(const [slug,unit10,unit20] of [['diffuser-350g',23,21],['diffuser-500g',50,46]])for(const quantity of [10,20,21,35,100]){
  const product=defaultProducts.find(p=>p.slug===slug),payload=checkoutAnalytics([{product,quantity}],'SG');
  assert.equal(payload.items[0].price,quantity===10?unit10:unit20);assert.equal(payload.value,quantity*(quantity===10?unit10:unit20));assert.equal(payload.currency,'SGD');
 }
 assert.equal(checkoutAnalytics([{product:defaultProducts.find(p=>p.slug==='diffuser-350g'),quantity:15}],'SG'),null);
});
test('receipt capability is order-bound, signed, expiring, and fails closed without a secret',()=>{
 const before=process.env.ORDER_LOOKUP_SECRET,oldPayPal=process.env.PAYPAL_CLIENT_SECRET;
 try{process.env.ORDER_LOOKUP_SECRET='mock-secret-only';const t=issueOrderAccess('HD-20261016-MOCK',DAY);
 assert.ok(verifyOrderAccess(t,'HD-20261016-MOCK',DAY));assert.equal(verifyOrderAccess(t,'HD-20261016-OTHER',DAY),false);assert.equal(verifyOrderAccess(t+'x','HD-20261016-MOCK',DAY),false);assert.equal(verifyOrderAccess(t,'HD-20261016-MOCK',32*DAY),false);
 delete process.env.ORDER_LOOKUP_SECRET;delete process.env.PAYPAL_CLIENT_SECRET;assert.equal(verifyOrderAccess(t,'HD-20261016-MOCK',DAY),false);
 }finally{if(before===undefined)delete process.env.ORDER_LOOKUP_SECRET;else process.env.ORDER_LOOKUP_SECRET=before;if(oldPayPal===undefined)delete process.env.PAYPAL_CLIENT_SECRET;else process.env.PAYPAL_CLIENT_SECRET=oldPayPal;}
});
test('public order rejects missing and forged capabilities before network; valid response projects private fields away',async()=>{
 const before=process.env.ORDER_LOOKUP_SECRET,oldFetch=globalThis.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 try{
 process.env.ORDER_LOOKUP_SECRET='mock-secret-only';process.env.SUPABASE_URL='https://mock.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='mock-only';
 let requests=0;globalThis.fetch=async(url)=>{requests++;assert.ok(String(url).startsWith('https://mock.invalid/'));const row=String(url).includes('/order_items?')?{product_slug:'diffuser-350g',total_units:20,line_total_sgd:420,customer_email:'private@example.com'}:{id:'mock',order_number:'HD-20261016-MOCK',payment_status:'completed',total_sgd:420,currency:'SGD',customer_name:'Private Name',customer_email:'private@example.com',address_line_1:'private address',paypal_order_id:'private-id'};return new Response(JSON.stringify([row]),{status:200});};
 for(const token of [undefined,'forged',issueOrderAccess('HD-20261016-OTHER')]){
  let status;await publicOrder({method:'GET',query:{orderNumber:'HD-20261016-MOCK'},headers:{'x-order-access-token':token}},{status(n){status=n;return this;},setHeader(){return this;},end(){}});assert.equal(status,403);
 }assert.equal(requests,0);
 let result,status;const headers={};await publicOrder({method:'GET',query:{orderNumber:'HD-20261016-MOCK'},headers:{'x-order-access-token':issueOrderAccess('HD-20261016-MOCK')}},{status(n){status=n;return this;},setHeader(k,v){headers[k]=v;return this;},end(v){result=JSON.parse(v);}});
 assert.equal(status,200);assert.equal(result.order.payment_status,'completed');assert.equal(headers['Cache-Control'],'private, no-store');assert.doesNotMatch(JSON.stringify(result),/Private Name|private@example|private address|private-id|customer_email/);
 }finally{globalThis.fetch=oldFetch;for(const [key,value] of Object.entries({ORDER_LOOKUP_SECRET:before,SUPABASE_URL:oldUrl,SUPABASE_SERVICE_ROLE_KEY:oldKey}))if(value===undefined)delete process.env[key];else process.env[key]=value;}
});

test('server-compatible attribution allows only public campaign fields and strips raw referrer queries',()=>{
 const a=cleanCheckoutAttribution({utm_source:'outreach',utm_content:'l0004',utm_term:'person@example.com',landing_page:'/partners?market=SG&email=private@example.com',referrer:'https://example.com/private/person?phone=123',customer_email:'private@example.com'});
 assert.equal(a.utm_source,'outreach');assert.equal(a.utm_content,'l0004');assert.equal(a.utm_term,'');assert.equal(a.landing_page,'/partners?market=SG');assert.equal(a.referrer,'https://example.com');assert.equal(a.customer_email,undefined);
});
