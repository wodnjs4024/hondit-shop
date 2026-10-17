import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {pickupConfig,pickupAmount,transitionPickup} from '../shared/pickup.js';
import {purchaseRoute,purchaseContext} from '../shared/purchase-context.js';
import {structureCopy} from '../shared/structure-copy.js';
import {consultationContext} from '../shared/consultation.js';
import {validateCapturedPayment} from '../api/_markets.js';
const source=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const p={slug:'diffuser-350g',packQuantity:20,active:true,purchaseEnabled:true,inventoryPacks:10,category:'diffuser'};
test('capture validation rejects a one-cent difference and non-finite paid amounts',()=>{for(const value of ['267.01','266.99','NaN','Infinity'])assert.throws(()=>validateCapturedPayment({status:'COMPLETED',amount:{value,currency_code:'SGD'}},267,'SGD'));});
test('verified webhook checks linked order, currency and amount before marking paid',async()=>{
 const {default:handler}=await import('../api/paypal/webhook.js');const oldFetch=globalThis.fetch;const keys=['VERCEL_ENV','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','PAYPAL_WEBHOOK_ID','TELEGRAM_BOT_TOKEN'];const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));Object.assign(process.env,{VERCEL_ENV:'production',SUPABASE_URL:'https://mock.invalid',SUPABASE_SERVICE_ROLE_KEY:'synthetic',PAYPAL_CLIENT_ID:'synthetic',PAYPAL_CLIENT_SECRET:'synthetic',PAYPAL_WEBHOOK_ID:'synthetic'});delete process.env.TELEGRAM_BOT_TOKEN;
 try{for(const mode of ['valid','amount','currency','order','completed']){let patches=0;const row={id:'synthetic-order',paypal_order_id:'synthetic-paypal',payment_status:mode==='completed'?'completed':'pending',order_status:'pending_payment',total_sgd:267,currency:'SGD'};
 globalThis.fetch=async(url,opts={})=>{const u=String(url);let result=[];if(u.includes('/rest/v1/orders')&&opts.method==='PATCH'){patches++;result=[row]}else if(u.includes('/rest/v1/orders'))result=[row];else if(u.includes('/v1/oauth2/token'))result={access_token:'synthetic'};else if(u.includes('/verify-webhook-signature'))result={verification_status:'SUCCESS'};else if(!u.startsWith('https://mock.invalid'))throw Error('Unexpected external access');return new Response(JSON.stringify(result),{status:200})};let code;await handler({method:'POST',headers:{},body:{id:'synthetic-event',event_type:'PAYMENT.CAPTURE.COMPLETED',resource:{id:'synthetic-capture',status:'COMPLETED',supplementary_data:{related_ids:{order_id:mode==='order'?'wrong':'synthetic-paypal'}},amount:{value:mode==='amount'?'267.01':'267.00',currency_code:mode==='currency'?'HKD':'SGD'}}}},{status(n){code=n;return this},end(){},setHeader(){}});assert.equal(code,mode==='order'?409:['amount','currency'].includes(mode)?400:200);assert.equal(patches,mode==='valid'?1:0);}}
 finally{globalThis.fetch=oldFetch;for(const k of keys)if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k]}
});
test('eligibility applies SG general included prices and preserves legacy Japan and HK/MO mixing without expanding supply',()=>{
 assert.equal(purchaseRoute([{product:p,quantity:20}],'SG'),'direct');assert.equal(purchaseRoute([{product:p,quantity:30}],'SG'),'direct');assert.equal(purchaseRoute([{product:p,quantity:20}],'JP'),'direct');
 assert.equal(purchaseRoute([{product:p,quantity:300}],'JP'),'confirmation');assert.equal(purchaseRoute([{product:p,quantity:20.1}],'JP'),'confirmation');
 const lines=['foam-oil','cleansing-water'].map((slug,i)=>({product:{...p,slug,category:'cleansing',packQuantity:30},quantity:i?20:10}));
 for(const market of ['HK','MO'])assert.equal(purchaseRoute(lines,market),'direct');assert.equal(purchaseRoute(lines,'SG'),'consultation');assert.equal(purchaseRoute([{product:p,quantity:20},{product:{...p,slug:'diffuser-500g'},quantity:20}],'SG'),'consultation');
 assert.equal(purchaseRoute([{product:{...p,purchaseEnabled:false},quantity:20}],'JP'),'confirmation');
});
test('fulfillment and purpose are independent, allowlisted and preserved to consultation',()=>{
 assert.deepEqual(purchaseContext({purpose:'resale'}),{purpose:'resale',fulfillment:'international_bundle'});assert.throws(()=>purchaseContext({fulfillment:'free_delivery'}));assert.throws(()=>purchaseContext({purpose:'hack'}));
 const c=consultationContext(new URLSearchParams('product=diffuser-350g&quantity=2&purpose=personal_gift&fulfillment=jeju_pickup'),[p]);assert.equal(c.purpose,'personal_gift');assert.equal(c.fulfillment,'jeju_pickup');assert.equal(c.quantity,2);
});
test('pickup reference quantity and closed operations cannot imply billing or availability',()=>{
 for(const q of [1,2,3])assert.equal(pickupAmount(q),18000*q);for(const q of [0,4,1.5,NaN])assert.throws(()=>pickupAmount(q));
 for(const field of ['operationsApproved','reservationsEnabled','paymentEnabled'])assert.equal(pickupConfig[field],false);assert.equal(pickupConfig.billingCurrency,null);assert.deepEqual(pickupConfig.locations,[]);
});
test('pickup state machine requires staff, operations and verified payment; preserves immutable audit',()=>{
 const initial={status:'requested',history:[]};assert.throws(()=>transitionPickup(initial,'approve'));
 const ctx={operationsApproved:true,staffApproved:true,verified:true,location:'SYNTHETIC LOCAL TEST',time:'2030-01-01T10:00',now:'2030-01-01T00:00:00Z',billingCurrency:'SGD',billingAmount:1};
 let r=transitionPickup(initial,'approve',ctx);assert.equal(initial.status,'requested');assert.equal(initial.history.length,0);assert.throws(()=>transitionPickup(r,'confirm_payment',ctx));assert.throws(()=>transitionPickup(r,'request_payment',{}));
 for(const action of ['request_payment','confirm_payment','schedule','reschedule','reconfirm','schedule','no_show','reconfirm','schedule','deliver'])r=transitionPickup(r,action,ctx);assert.equal(r.status,'delivered');assert.equal(r.deliveredAt,ctx.now);assert.equal(r.history.length,11);assert.throws(()=>transitionPickup(r,'cancel',ctx));
 let paid=transitionPickup(transitionPickup(transitionPickup(initial,'approve',ctx),'request_payment',ctx),'confirm_payment',ctx);paid=transitionPickup(paid,'reschedule',ctx);paid=transitionPickup(paid,'cancel',ctx);assert.equal(paid.status,'refund_pending');assert.throws(()=>transitionPickup(paid,'cancel',ctx));assert.throws(()=>transitionPickup(paid,'refund',{}));assert.equal(transitionPickup(paid,'refund',ctx).status,'refunded');assert.equal(transitionPickup(initial,'cancel',ctx).status,'cancelled');
});
test('forged pickup approval is rejected at both server entry points before external access',async()=>{
 const old=globalThis.fetch;globalThis.fetch=()=>{throw Error('Unexpected external access')};
 try{for(const endpoint of ['_pickup','paypal/create-order']){const {default:handler}=await import('../api/'+endpoint+'.js');let status;await handler({method:'POST',body:{fulfillment:'jeju_pickup',operationsApproved:true,paymentEnabled:true,quantity:1}}, {status(n){status=n;return this},json(){},end(){},setHeader(){}});assert.equal(status,403)}}finally{globalThis.fetch=old}
});
test('new UI messages cover all five non-English languages; official email only in live UI',()=>{
 for(const [en,copy] of Object.entries(structureCopy))for(const lang of ['ko','zh-HK','ja','ms','th'])assert.ok(copy[lang]&&copy[lang]!==en,en+' '+lang);
 assert.match(source('src/data/v23SiteData.ts'),/hondit.office@gmail.com/);assert.doesNotMatch(source('src/data/v23SiteData.ts'),/hondit.official@gmail.com/);
});
test('capture uncertainty and post-capture DB failure never become a failed payment; retries preserve completed',async()=>{
 const {default:handler}=await import('../api/paypal/capture-order.js');const oldFetch=globalThis.fetch;const keys=['VERCEL_ENV','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID'];const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 Object.assign(process.env,{VERCEL_ENV:'production',SUPABASE_URL:'https://mock.invalid',SUPABASE_SERVICE_ROLE_KEY:'synthetic',PAYPAL_CLIENT_ID:'synthetic',PAYPAL_CLIENT_SECRET:'synthetic'});delete process.env.TELEGRAM_BOT_TOKEN;
 try{for(const mode of ['db_failure','lost_capture_response','notification_failure','completed']){let captures=0,patches=[];process.env.TELEGRAM_BOT_TOKEN=mode==='notification_failure'?'synthetic':'';process.env.TELEGRAM_CHAT_ID='synthetic';const row={id:'synthetic-order',order_number:'synthetic-number',paypal_order_id:'synthetic-paypal',payment_status:mode==='completed'?'completed':'pending',order_status:'pending_payment',total_sgd:267,currency:'SGD'};
 globalThis.fetch=async(url,opts={})=>{const u=String(url);let result=[];if(u.includes('/rest/v1/orders')&&opts.method==='PATCH'){const body=JSON.parse(opts.body);patches.push(body);if(mode==='db_failure')return new Response(JSON.stringify({message:'Synthetic DB failure'}),{status:500});result=[{...row,...body}];}else if(u.includes('/rest/v1/orders'))result=[row];else if(u.includes('/v1/oauth2/token'))result={access_token:'synthetic'};else if(u.endsWith('/capture')){captures++;if(mode==='lost_capture_response')throw Error('Synthetic timeout');result={purchase_units:[{payments:{captures:[{id:'synthetic-capture',status:'COMPLETED',amount:{currency_code:'SGD',value:'267.00'}}]}}]};}else if(!u.startsWith('https://mock.invalid'))throw Error('Unexpected external request');return new Response(JSON.stringify(result),{status:200})};let code;const res={status(n){code=n;return this},setHeader(){},end(){}};
 await handler({method:'POST',body:{paypalOrderId:row.paypal_order_id,orderNumber:row.order_number}},res);assert.equal(code,['db_failure','lost_capture_response'].includes(mode)?409:200);assert.equal(captures,mode==='completed'?0:1);assert.ok(patches.every(p=>p.payment_status!=='payment_failed'));}}
 finally{globalThis.fetch=oldFetch;for(const k of keys)if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k]}
});
test('result screens require server payment status and pickup draft is not in migration discovery',()=>{
 assert.match(source('src/pages/OrderCompletePage.tsx'),/order.payment_status === "completed"/);assert.match(source('src/pages/PaymentFailedPage.tsx'),/if\(!\['payment_failed','payment_cancelled'\]/);assert.match(source('src/pages/BulkProductPage.tsx'),/readOnlyPreview \? "" : payPalConfig.clientId/);assert.match(source('supabase/drafts/jeju_pickup_NOT_FOR_PRODUCTION.sql'),/rollback;/);
});


