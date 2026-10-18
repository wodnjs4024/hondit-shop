import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCheckoutTerms,checkoutConditions} from '../shared/checkout-terms.js';
import {diffuserQuantity,proposedTrialPrices} from '../shared/diffuser-quantity.js';
import {approvedResaleTerms,resaleEconomics} from '../shared/resale-economics.js';
import {defaultProducts} from '../api/_bulk-data.js';
import {calculateCart} from '../api/_utils.js';
import {customerConditionLabel} from '../shared/customer-conditions.js';
import {diffuserCopy} from '../shared/diffuser-copy.js';
const product=slug=>defaultProducts.find(p=>p.slug===slug);
test('approved SG trial and arbitrary general quantities use exact minor amounts',()=>{
 for(const [sku,q,total] of [['diffuser-350g',10,23000],['diffuser-500g',10,50000],['diffuser-350g',20,42000],['diffuser-500g',20,92000],['diffuser-350g',21,44100],['diffuser-350g',35,73500],['diffuser-500g',23,105800],['diffuser-500g',50,230000]]) {
  const d=resolveCheckoutTerms(product(sku),'SG',q);
  assert.equal(d.referenceTotalMinor,total);assert.equal(d.priceApproval,'approved');
  assert.equal(calculateCart([{slug:sku,packCount:q}],defaultProducts).totalSgd,total/100);
  assert.equal(customerConditionLabel(product(sku),'SG',q),'Order the listed MOQ bundle');
  assert.equal(d.status,'direct');
  assert.equal(d.totalMinor,total);assert.equal(d.shippingIncluded,true);assert.equal(d.shippingMinor,0);assert.equal(d.billingCurrency,'SGD');
  const terms=approvedResaleTerms(product(sku),'SG',q);
  assert.equal(terms.totalMinor,total);assert.equal(resaleEconomics(terms,{price:'80'}).purchase,total);
 }
});
test('invalid raw entries are never silently rounded, clamped or billed',()=>{
 for(const q of ['',0,' ','1e2','20.0',20.5,'abc',11,15,19,10000,-20]) {
  assert.equal(diffuserQuantity(q).valid,false,String(q));
  const d=resolveCheckoutTerms(product('diffuser-350g'),'SG',q);
  assert.equal(d.status,'unavailable',String(q));assert.equal(d.referenceTotalMinor,null);assert.equal(approvedResaleTerms(product('diffuser-350g'),'SG',q),null);
 }
 for(const q of [10,20,21,27,35,50,100])assert.equal(diffuserQuantity(q).valid,true);
});
test('other market trial models remain proposed with original display currency; legacy JP is separate',()=>{
 for(const [market,units] of Object.entries(proposedTrialPrices))for(const [index,sku] of ['diffuser-350g','diffuser-500g'].entries()) {
  const d=resolveCheckoutTerms(product(sku),market,10);
  assert.equal(d.priceApproval,'proposed');assert.equal(d.status,'request');
  assert.equal(d.referenceUnitMinor/10**d.referenceDigits,units[index]);assert.equal(d.totalMinor,null);assert.equal(approvedResaleTerms(product(sku),market,10),null);
 }
 assert.equal(resolveCheckoutTerms(product('diffuser-350g'),'MO',10).displayCurrency,'MOP');
 assert.equal(resolveCheckoutTerms(product('diffuser-350g'),'BN',10).displayCurrency,'BND');
 assert.equal(resolveCheckoutTerms(product('diffuser-350g'),'JP',20).referenceTotalMinor,48000);
 assert.equal(resolveCheckoutTerms(product('diffuser-350g'),'JP',10).referenceTotalMinor,32000);
 assert.equal(resolveCheckoutTerms(product('foam-oil'),'JP',30).status,'unavailable');
 assert.equal(resolveCheckoutTerms(product('diffuser-350g'),'CN',20).status,'unavailable');
 for(const sku of ['foam-oil','foaming-cleanser','cleansing-water'])assert.equal(resolveCheckoutTerms(product(sku),'SG',30).totalMinor,26700);
});
test('duplicate condition scope, stock limits and unknown approval fail closed',()=>{
 const p=product('diffuser-350g');const duplicate=[...checkoutConditions,checkoutConditions.find(c=>c.market==='SG'&&c.sku===p.slug&&c.minimum===10)];
 assert.equal(resolveCheckoutTerms(p,'SG',10,duplicate).reason,'duplicate_conditions');
 assert.equal(resolveCheckoutTerms({...p,inventoryPacks:1},'SG',21).reason,'stock_limit');
 assert.equal(Object.isFrozen(checkoutConditions),true);
 for(const translations of Object.values(diffuserCopy))for(const lang of ['ko','zh-HK','ja','ms','th'])assert.ok(translations[lang]);
});
test('server rejects pending/invalid conditions before any DB write or PayPal call; ignores forged amount',async()=>{
 const {default:handler}=await import('../api/paypal/create-order.js');
 const keys=['VERCEL_ENV','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));const originalFetch=globalThis.fetch;
 Object.assign(process.env,{VERCEL_ENV:'production',SUPABASE_URL:'https://mock.invalid',SUPABASE_SERVICE_ROLE_KEY:'mock-only'});
 let writes=0;globalThis.fetch=async(url,options={})=>{
  assert.ok(String(url).startsWith('https://mock.invalid/'),'no external PayPal call');
  if(options.method&&options.method!=='GET'){writes++;throw Error('Unexpected DB write')}
  return new Response(JSON.stringify(String(url).includes('site_settings')?[{checkout_enabled:true}]:defaultProducts),{status:200});
 };
 try {for(const [market,sku,q,countryCode] of [['SG','diffuser-350g',15,'SG'],['MY','diffuser-350g',20,'MY'],['JP','diffuser-350g',10,'JP'],['JP','foam-oil',30,'JP']]) {
  let status;let response;await handler({method:'POST',headers:{},body:{orderType:'Direct bulk order',market,countryCode,customerName:'Synthetic Test',customerEmail:'synthetic@example.invalid',customerPhone:'00000000',addressLine1:'1 Test Street',city:'Test',postalCode:countryCode==='SG'?'123456':'1234567',cart:[{slug:sku,packCount:q}],price:1,totalMinor:1,priceApproval:'approved'}},{status(n){status=n;return this},setHeader(){},end(s){response=JSON.parse(s)}});
  assert.equal(status,409,JSON.stringify(response));assert.equal(response.code,'PAYMENT_CONDITIONS_REQUIRED');
 }assert.equal(writes,0)}finally{globalThis.fetch=originalFetch;for(const k of keys)if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k]}
});
test('markets opened on 2026-10-18 charge the approved delivered price in their own currency (mocked DB and PayPal)',async()=>{
 const {default:handler}=await import('../api/paypal/create-order.js');
 const keys=['VERCEL_ENV','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET'];const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));const originalFetch=globalThis.fetch;
 Object.assign(process.env,{VERCEL_ENV:'production',SUPABASE_URL:'https://mock.invalid',SUPABASE_SERVICE_ROLE_KEY:'mock-only',PAYPAL_CLIENT_ID:'mock-only',PAYPAL_CLIENT_SECRET:'mock-only'});
 const cases=[['HK','diffuser-350g',20,'HKD','2560.00',''],['MO','diffuser-500g',21,'HKD','5880.00',''],['HK','foam-oil',30,'HKD','1650.00',''],['TW','diffuser-500g',20,'TWD','21000','100'],['JP','diffuser-350g',21,'JPY','50400','100-0001'],['TH','diffuser-350g',100,'THB','55000.00','10110'],['BN','diffuser-500g',20,'SGD','920.00','BS8811']];
 try{for(const [market,slug,quantity,currency,value,postal] of cases){
  let orderPayload;let paypalPayload;
  globalThis.fetch=async(url,options={})=>{
   const u=String(url);let data;
   if(u.startsWith('https://mock.invalid/rest/v1/site_settings'))data=[{checkout_enabled:true}];
   else if(u.startsWith('https://mock.invalid/rest/v1/products'))data=defaultProducts;
   else if(u==='https://mock.invalid/rest/v1/orders'&&options.method==='POST'){orderPayload=JSON.parse(options.body);data=[{...orderPayload,id:'synthetic-order-id'}]}
   else if(u==='https://mock.invalid/rest/v1/order_items'&&options.method==='POST')data=[];
   else if(u.startsWith('https://mock.invalid/rest/v1/orders?')&&options.method==='PATCH')data=[];
   else if(u.endsWith('/v1/oauth2/token'))data={access_token:'mock-only'};
   else if(u.endsWith('/v2/checkout/orders')){paypalPayload=JSON.parse(options.body);data={id:'synthetic-paypal-id'}}
   else throw Error('Unexpected request in isolated test');
   return new Response(JSON.stringify(data),{status:200});
  };
  let status,response;await handler({method:'POST',headers:{},body:{orderType:'Direct bulk order',market,countryCode:market,customerName:'Synthetic Test',customerEmail:'synthetic@example.invalid',customerPhone:'00000000',addressLine1:'1 Test Street',city:'Test City',...(postal?{postalCode:postal}:{}),cart:[{slug,packCount:quantity}],total:1,unitPrice:1,priceApproval:'approved'}},{status(n){status=n;return this},setHeader(){},end(t){response=t}});
  assert.equal(status,200,`${market} ${slug} ${quantity}: ${response}`);
  assert.equal(paypalPayload.purchase_units[0].amount.currency_code,currency);
  assert.equal(paypalPayload.purchase_units[0].amount.value,value);
  assert.equal(orderPayload.currency,currency);
  assert.match(orderPayload.internal_note,new RegExp(`\\[condition:${market.toLowerCase()}-(general|moq)-delivered-2026-10-18\\]`));
 }}finally{globalThis.fetch=originalFetch;for(const k of keys)if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k]}
});
test('approved SG trial and 20+ server creates only the authoritative amount using mocked DB and PayPal',async()=>{
 const {default:handler}=await import('../api/paypal/create-order.js');
 const keys=['VERCEL_ENV','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET'];const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));const originalFetch=globalThis.fetch;
 Object.assign(process.env,{VERCEL_ENV:'production',SUPABASE_URL:'https://mock.invalid',SUPABASE_SERVICE_ROLE_KEY:'mock-only',PAYPAL_CLIENT_ID:'mock-only',PAYPAL_CLIENT_SECRET:'mock-only'});
 try{for(const [slug,quantity,total] of [['diffuser-350g',10,230],['diffuser-500g',10,500],...['diffuser-350g','diffuser-500g'].flatMap(s=>[20,21,35,100].map(q=>[s,q,(s==='diffuser-350g'?21:46)*q])),['foam-oil',30,267]]){
  let orderPayload;let items;let paypalPayload;
  globalThis.fetch=async(url,options={})=>{
   const u=String(url);let data;
   if(u.startsWith('https://mock.invalid/rest/v1/site_settings'))data=[{checkout_enabled:true}];
   else if(u.startsWith('https://mock.invalid/rest/v1/products'))data=defaultProducts;
   else if(u==='https://mock.invalid/rest/v1/orders'&&options.method==='POST'){orderPayload=JSON.parse(options.body);data=[{...orderPayload,id:'synthetic-order-id'}]}
   else if(u==='https://mock.invalid/rest/v1/order_items'&&options.method==='POST'){items=JSON.parse(options.body);data=[]}
   else if(u.startsWith('https://mock.invalid/rest/v1/orders?')&&options.method==='PATCH')data=[];
   else if(u.endsWith('/v1/oauth2/token'))data={access_token:'mock-only'};
   else if(u.endsWith('/v2/checkout/orders')){paypalPayload=JSON.parse(options.body);data={id:'synthetic-paypal-id'}}
   else throw Error('Unexpected request in isolated test');
   return new Response(JSON.stringify(data),{status:200});
  };
  let status;await handler({method:'POST',headers:{},body:{orderType:'Direct bulk order',market:'SG',countryCode:'SG',customerName:'Synthetic Test',customerEmail:'synthetic@example.invalid',customerPhone:'00000000',addressLine1:'1 Test Street',city:'Singapore',postalCode:'123456',cart:[{slug,packCount:quantity}],total:1,unitPrice:1,priceApproval:'approved'}},{status(n){status=n;return this},setHeader(){},end(){}});
  assert.equal(status,200);assert.equal(orderPayload.total_sgd,total);assert.equal(items[0].line_total_sgd,total);
  assert.equal(paypalPayload.purchase_units[0].amount.value,total.toFixed(2));assert.equal(paypalPayload.purchase_units[0].amount.currency_code,'SGD');
  assert.equal(paypalPayload.purchase_units[0].shipping.address.postal_code,'123456');
 }}finally{globalThis.fetch=originalFetch;for(const k of keys)if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k]}
});
