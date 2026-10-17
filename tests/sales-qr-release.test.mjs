import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import createOrder from '../api/paypal/create-order.js';
import captureOrder from '../api/paypal/capture-order.js';
import webhook from '../api/paypal/webhook.js';
import lookup from '../api/orders/public/[orderNumber].js';
import {verifyOrderAccess} from '../api/_order-access.js';
import {defaultProducts} from '../api/_bulk-data.js';
const response=()=>({code:200,setHeader(){return this},status(n){this.code=n;return this},end(s){this.data=JSON.parse(s)},json(o){this.data=o}});
const request=(slug,q)=>({orderType:'personal',customerName:'Synthetic QA',customerEmail:'qa@example.invalid',customerPhone:'+820000000000',addressLine1:'Synthetic QA address',city:'Singapore',postalCode:'123456',countryCode:'SG',market:'SG',language:'ja',purpose:'resale',fulfillment:'international_bundle',cart:[{slug,packCount:q}],attribution:{utm_source:'qa',utm_medium:'qr',utm_campaign:'synthetic',utm_content:'l0003',utm_term:'synthetic',link_id:'l0003',landing_page:'/?market=SG&utm_content=l0003'},total:1,price:1,analyticsContext:{consent:'granted'}});

test('no new-schema code or browser server-sync remains, regardless of obsolete flags',async()=>{
 for(const name of ['api/_server-analytics.js','api/_analytics-target.js','api/analytics','src/lib/purchaseAnalyticsContext.ts','supabase/migrations/008_server_analytics.sql','supabase/migrations/009_analytics_consent.sql','supabase/migrations/010_analytics_consent_validity.sql'])await assert.rejects(fs.access(new URL('../'+name,import.meta.url)));
 async function scan(dir){for(const entry of await fs.readdir(new URL('../'+dir,import.meta.url),{withFileTypes:true})){const p=dir+'/'+entry.name;if(entry.isDirectory())await scan(p);else if(/\.(js|ts|tsx)$/.test(p)){const source=await fs.readFile(new URL('../'+p,import.meta.url),'utf8');assert.doesNotMatch(source,/_server-analytics|_analytics-target|purchaseAnalyticsContext|\/api\/analytics|order_analytics_context|analytics_outbox|revoke_order_analytics|record_verified_analytics_refund/,p)}}}
 await scan('api');await scan('src');
});

test('legacy schema without UTM columns or 008/009/010: create, capture, repeated webhook and signed receipt',async()=>{
 const before={...process.env},original=globalThis.fetch;
 Object.assign(process.env,{VERCEL_ENV:'development',SUPABASE_URL:'https://mock.invalid',SUPABASE_SERVICE_ROLE_KEY:'synthetic',PAYPAL_CLIENT_ID:'synthetic',PAYPAL_CLIENT_SECRET:'synthetic',PAYPAL_MODE:'sandbox',PAYPAL_WEBHOOK_ID:'synthetic',ORDER_LOOKUP_SECRET:'synthetic-release-secret',TELEGRAM_BOT_TOKEN:'',SERVER_ANALYTICS_RECORDING:'true',SERVER_ANALYTICS_NEW_ORDER_OWNER:'server',SERVER_ANALYTICS_SEND_ENABLED:'true'});
 let row,items=[],pp,attempts=0,captures=0;const calls=[],accepted=[];
 globalThis.fetch=async(url,options={})=>{
  const u=new URL(url),body=String(options.body||'').startsWith('{')||String(options.body||'').startsWith('[')?JSON.parse(options.body):null;let data;
  calls.push(u.pathname);
  if(u.origin==='https://mock.invalid'){
   const table=u.pathname.split('/').at(-1);assert.ok(['orders','order_items','products','site_settings','payment_events','order_status_history'].includes(table),'Schema not available: '+u.pathname);
   if(table==='site_settings')data=[{checkout_enabled:true}];
   else if(table==='products')data=defaultProducts;
   else if(table==='orders'){
    if(options.method==='POST'){attempts++;if('utm_content'in body||'utm_term'in body)return new Response(JSON.stringify({message:"Could not find the 'utm_content' column of 'orders' in the schema cache"}),{status:400});row={id:'synthetic-id',...body};accepted.push({...body});data=[row];}
    else{if(options.method==='PATCH')Object.assign(row,body);data=[row];}
   }else if(table==='order_items'){if(options.method==='POST')items=body;data=items;}
   else data=[];
  }else if(u.origin==='https://api-m.sandbox.paypal.com'){
   if(u.pathname.endsWith('/token'))data={access_token:'synthetic'};
   else if(u.pathname.endsWith('/verify-webhook-signature'))data={verification_status:'SUCCESS'};
   else if(u.pathname==='/v2/checkout/orders'&&options.method==='POST'){pp={id:'PP-SYNTHETIC',...body};data=pp;}
   else if(u.pathname.endsWith('/capture')){captures++;data={...pp,purchase_units:pp.purchase_units.map(x=>({...x,payments:{captures:[{id:'CAP-SYNTHETIC',status:'COMPLETED',amount:x.amount}]}}))};}
   else data=pp;
  }else throw Error('External request forbidden');
  return new Response(JSON.stringify(data),{status:200});
 };
 try{
  for(const [slug,q,amount]of [['diffuser-350g',10,'230.00'],['diffuser-350g',20,'420.00'],['diffuser-350g',21,'441.00'],['diffuser-350g',35,'735.00'],['diffuser-350g',100,'2100.00'],['diffuser-500g',10,'500.00'],['diffuser-500g',20,'920.00'],['diffuser-500g',23,'1058.00'],['foam-oil',30,'267.00'],['foaming-cleanser',30,'267.00'],['cleansing-water',30,'267.00']]){
   const created=response();await createOrder({method:'POST',body:request(slug,q)},created);assert.equal(created.code,200,JSON.stringify(created.data));assert.equal(pp.purchase_units[0].amount.value,amount);assert.equal(row.total_sgd,Number(amount));assert.equal(row.currency,'SGD');assert.equal(row.shipping_included,true);assert.equal(row.utm_source,'qa');assert.equal(row.utm_campaign,'synthetic');assert.equal('utm_content'in row,false);assert.equal('link_id'in row,false);assert.doesNotMatch(row.internal_note,/\[analytics:/);assert.ok(verifyOrderAccess(created.data.orderAccessToken,row.order_number));
   const capture=response();await captureOrder({method:'POST',body:{orderNumber:row.order_number,paypalOrderId:pp.id}},capture);assert.equal(capture.code,200);assert.equal(row.payment_status,'completed');const count=captures;
   const repeat=response();await captureOrder({method:'POST',body:{orderNumber:row.order_number,paypalOrderId:pp.id}},repeat);assert.equal(repeat.code,200);assert.equal(captures,count);
   const event={id:'WH-SYNTHETIC',event_type:'PAYMENT.CAPTURE.COMPLETED',resource:{id:'CAP-SYNTHETIC',status:'COMPLETED',amount:pp.purchase_units[0].amount,supplementary_data:{related_ids:{order_id:pp.id}}}};
   for(let i=0;i<2;i++){const r=response();await webhook({method:'POST',headers:{},body:event},r);assert.equal(r.code,200);assert.equal(row.payment_status,'completed')}
   const receipt=response();await lookup({method:'GET',headers:{'x-order-access-token':created.data.orderAccessToken},query:{orderNumber:row.order_number}},receipt);assert.equal(receipt.code,200);assert.equal(receipt.data.order.total_sgd,Number(amount));assert.doesNotMatch(JSON.stringify(receipt.data),/qa@example.invalid|Synthetic QA address|customer_email|internal_note/);
  }
  const count=accepted.length;for(const quantity of [15,19,0,-1,20.5,'', 'bad']){const r=response();await createOrder({method:'POST',body:request('diffuser-350g',quantity)},r);assert.notEqual(r.code,200);assert.equal(accepted.length,count)}
  assert.equal(attempts,accepted.length*2);assert.equal(calls.some(p=>/analytics|\/rpc\//.test(p)),false);
 }finally{globalThis.fetch=original;for(const k of Object.keys(process.env))if(!(k in before))delete process.env[k];Object.assign(process.env,before)}
});
