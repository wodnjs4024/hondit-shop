import test from 'node:test';
import assert from 'node:assert/strict';
import {sgTerms,cleanProductUsage,sgCheckoutNeedsInquiry} from '../shared/page-sales.js';
import {getMarketUnitPrice,getMarketLineTotal,markets} from '../api/_markets.js';
import {toClientProduct} from '../api/_utils.js';
import createOrder from '../api/paypal/create-order.js';
import contact from '../api/contact.js';
import fs from 'node:fs';
test('SG approved prices use integer cents regardless of database or client price',()=>{
 for(const [slug,q,total] of [['foam-oil',30,26700],['foaming-cleanser',30,26700],['cleansing-water',30,26700],['diffuser-350g',20,42000],['diffuser-500g',20,92000]]){
  const p={slug,unitPriceSgd:0.01,marketUnitPrices:{SG:99,JP:2400}};
  assert.equal(sgTerms(p).unitMinor*q,total);assert.equal(getMarketUnitPrice(p,markets.SG)*100,sgTerms(p).unitMinor);assert.equal(getMarketLineTotal(p,q,markets.SG),total/100);
 }
});
test('JP legacy price and other markets remain independent of SG approval',()=>{const p={slug:'diffuser-350g',marketUnitPrices:{JP:2400,HK:128,SG:8.99}};assert.equal(getMarketLineTotal(p,20,markets.JP),48000);assert.equal(getMarketUnitPrice(p,markets.HK),128)});
test('SG mixtures and excess quantities require inquiry; HK mixing unchanged',()=>{const l=[{product:{slug:'foam-oil'},quantity:30}];assert.equal(sgCheckoutNeedsInquiry(l,'SG'),false);assert.equal(sgCheckoutNeedsInquiry([{...l[0],quantity:40}],'SG'),true);assert.equal(sgCheckoutNeedsInquiry([...l,...l],'SG'),true);assert.equal(sgCheckoutNeedsInquiry([...l,...l],'HK'),false)});
test('legacy usage cannot reintroduce shipping, MOQ or packs via API',()=>{const usage=['Place on a level surface.','Singapore EMS included','Minimum order 30 units','10 packs','배송비 포함','日本への配送'];assert.deepEqual(cleanProductUsage(usage),['Place on a level surface.']);assert.deepEqual(toClientProduct({slug:'diffuser-350g',usage}).usage,['Place on a level surface.'])});
test('preview writes stop before any DB or payment call',async()=>{const old=process.env.VERCEL_ENV;const oldFetch=globalThis.fetch;process.env.VERCEL_ENV='preview';globalThis.fetch=()=>{throw Error('unexpected network')};try{for(const handler of [createOrder,contact]){let status;let body;const res={status(n){status=n;return this},json(b){body=b}};await handler({method:'POST',body:{}},res);assert.equal(status,403);assert.match(body.error,/Read-only/);}}finally{globalThis.fetch=oldFetch;if(old===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=old}});
test('page release excludes future database systems',()=>{for(const f of ['api/_utils.js','api/paypal/create-order.js','src/lib/market.tsx','src/components/ProductSalesSummary.tsx'])assert.doesNotMatch(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),/sales_conditions|reserve_checkout|settle_capture|payment_reconciliation|payment_webhook_jobs|\/quotes/)});

test('server checkout uses approved SG totals and ignores submitted prices (all services mocked)',async()=>{
 const keys=['VERCEL_ENV','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET'];const before=Object.fromEntries(keys.map(k=>[k,process.env[k]]));const original=globalThis.fetch;
 Object.assign(process.env,{VERCEL_ENV:'production',SUPABASE_URL:'https://db.invalid',SUPABASE_SERVICE_ROLE_KEY:'mock-only',PAYPAL_CLIENT_ID:'mock-only',PAYPAL_CLIENT_SECRET:'mock-only'});
 const {defaultProducts}=await import('../api/_bulk-data.js');const {toDbProduct}=await import('../api/_utils.js');
 try{for(const [slug,q,expected] of [['foam-oil',30,'267.00'],['diffuser-350g',20,'420.00'],['diffuser-500g',20,'920.00']]){
  let paid;let stored;let request;globalThis.fetch=async(url,opts={})=>{const u=String(url);let reply=[];
   if(u.includes('/products'))reply=defaultProducts.map(toDbProduct);
   else if(u.includes('/site_settings'))reply=[{checkout_enabled:true}];
   else if(u.includes('/v1/oauth2/token'))reply={access_token:'mock-only'};
   else if(u.includes('/v2/checkout/orders')){request=JSON.parse(opts.body);paid=request.purchase_units[0].amount;reply={id:'mock-paypal-order'}}
   else if(u.includes('/orders')&&opts.method==='POST'){stored=JSON.parse(opts.body);reply=[{...stored,id:'mock-order'}]}
   else if(!u.startsWith('https://db.invalid/'))throw Error('Unmocked request');
   return new Response(JSON.stringify(reply),{status:200});};
  let status;let result;const res={status(n){status=n;return this},setHeader(){return this},end(v){result=JSON.parse(v)}};
  await createOrder({method:'POST',headers:{},body:{market:'SG',countryCode:'SG',orderType:'bulk',customerName:'Synthetic',customerEmail:'test@example.invalid',customerPhone:'test',addressLine1:'Synthetic',city:'Synthetic',postalCode:'000000',price:0.01,total:0.01,cart:[{slug,packCount:q,unitPrice:0.01}]}},res);
  assert.equal(status,200,JSON.stringify(result));assert.equal(paid.value,expected);assert.equal(paid.currency_code,'SGD');assert.equal(stored.total_sgd,Number(expected));assert.deepEqual(request.purchase_units[0].shipping,{name:{full_name:stored.customer_name},address:{address_line_1:stored.address_line_1,admin_area_2:stored.city,postal_code:stored.postal_code,country_code:stored.country_code}});assert.equal(request.payment_source.paypal.experience_context.shipping_preference,'SET_PROVIDED_ADDRESS');
 }}finally{globalThis.fetch=original;for(const k of keys)if(before[k]===undefined)delete process.env[k];else process.env[k]=before[k]}
});


test('contact form is disabled and quantity enquiry preserves email draft context',()=>{
 const contact=fs.readFileSync(new URL('../src/pages/ContactPage.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(contact,/<form|fetch\(/);const actions=fs.readFileSync(new URL("../src/components/RequestActions.tsx",import.meta.url),"utf8");assert.match(actions,/copy\(EMAIL\)/);assert.match(actions,/does not confirm an order/);
 const bulk=fs.readFileSync(new URL('../src/pages/BulkProductPage.tsx',import.meta.url),'utf8');assert.match(bulk,/market:`\$\{countryName\} \(\$\{market.code\}\)`/);assert.match(bulk,/orderLines.map/);assert.match(bulk,/href=\{manualPaymentHref\}/);
});

test('Production config keeps real client ID and settings; Preview stays read-only',async()=>{
 const {default:handler}=await import('../api/paypal/config.js');const keys=['VERCEL_ENV','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','PAYPAL_CLIENT_ID','VITE_PAYPAL_CLIENT_ID'];const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));const fetch=globalThis.fetch;
 try{Object.assign(process.env,{SUPABASE_URL:'https://db.invalid',SUPABASE_SERVICE_ROLE_KEY:'mock-only',PAYPAL_CLIENT_ID:'public-test-id',VITE_PAYPAL_CLIENT_ID:''});
 for(const [env,enabled] of [['production',true],['production',false],['preview',true]]){process.env.VERCEL_ENV=env;globalThis.fetch=async()=>new Response(JSON.stringify([{checkout_enabled:enabled}]),{status:200});let result;await handler({method:'GET'},{status(){return this},setHeader(){},end(s){result=JSON.parse(s)}});assert.equal(result.checkoutEnabled,env==='production'&&enabled);assert.equal(Boolean(result.clientId),env==='production');}
 }finally{globalThis.fetch=fetch;for(const k of keys)if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k]}
});
