import test from 'node:test';
import assert from 'node:assert/strict';
import {orderRetry,publicRetryContext} from '../shared/order-retry.js';
import {resolveCheckoutTerms} from '../shared/checkout-terms.js';
import {defaultProducts} from '../api/_bulk-data.js';
import {buildSync} from 'esbuild';
import Module from 'node:module';
import path from 'node:path';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {JSDOM} from 'jsdom';

function original(){
 const d=resolveCheckoutTerms(defaultProducts.find(p=>p.slug==='diffuser-500g'),'SG',35);
 const condition={version:d.version,shippingVersion:d.shippingVersion,billingCurrency:d.billingCurrency,quantity:35,totalMinor:d.totalMinor,productTotalMinor:d.productTotalMinor,shippingIncluded:d.shippingIncluded};
 return {order_number:'HD-20261016-SUPPORT',payment_status:'payment_failed',country_code:'SG',currency:'SGD',total_sgd:1610,total_units:35,retry_context:{language:'ja',purpose:'resale',fulfillment:'international_bundle',condition},items:[{product_slug:'diffuser-500g',product_name_snapshot:'QA 500g',total_units:35,line_total_sgd:1610}]};
}
test('retry restores only original verified selections including locale and purpose',()=>{
 const r=orderRetry(original(),defaultProducts);assert.ok(r.href);const u=new URL(r.href,'https://example.invalid');
 assert.equal(u.pathname,'/bulk-orders/diffuser-500g');assert.deepEqual(Object.fromEntries(u.searchParams),{market:'SG',lang:'ja',purpose:'resale',fulfillment:'international_bundle',product:'diffuser-500g',quantity:'35'});
 const old=original();delete old.retry_context.language;delete old.retry_context.purpose;
 const q=new URL(orderRetry(old,defaultProducts).href,'https://example.invalid').searchParams;assert.equal(q.has('lang'),false);assert.equal(q.has('purpose'),false);
});
test('mixtures, missing historical facts and absent current catalogue never become a single checkout',()=>{
 for(const alter of [o=>o.items.push({...o.items[0],product_slug:'diffuser-350g'}),o=>delete o.country_code,o=>delete o.retry_context.condition,o=>o.retry_context.fulfillment='jeju_pickup',o=>o.items[0].total_units=15,o=>o.payment_status='completed']){const o=original();alter(o);assert.equal(orderRetry(o,defaultProducts).href,null);}
 assert.equal(orderRetry(original(),null).href,null);assert.equal(orderRetry(original(),[]).href,null);
});
test('changed amount, currency, condition or shipping version blocks retry without repricing history',()=>{
 for(const alter of [o=>o.total_sgd=1609,o=>o.items[0].line_total_sgd=1600,o=>o.currency='JPY',o=>o.currency=undefined,o=>o.retry_context.condition.version='changed',o=>o.retry_context.condition.shippingVersion='changed',o=>o.retry_context.condition.shippingIncluded=false,o=>o.retry_context.condition.totalMinor--]){const o=original();alter(o);const before=structuredClone(o);assert.equal(orderRetry(o,defaultProducts).href,null);assert.deepEqual(o,before);}
 const inactive=defaultProducts.map(p=>p.slug==='diffuser-500g'?{...p,active:false}:p);assert.equal(orderRetry(original(),inactive).href,null);
});
test('public retry context projects server-written fields without private note or fabricated language',()=>{
 const c=original().retry_context.condition,note='private approval memo [checkout:v2 '+JSON.stringify(c)+'] [sales:v1 fulfillment=international_bundle purpose=resale language=ja]';
 assert.deepEqual(publicRetryContext(note),original().retry_context);assert.doesNotMatch(JSON.stringify(publicRetryContext(note)),/private|approval memo/);
 assert.equal(publicRetryContext('[sales:v1 fulfillment=international_bundle purpose=resale]').language,undefined);
 assert.deepEqual(publicRetryContext('old private note'),{});
});

const rootPath=path.resolve(import.meta.dirname,'..');
function runtime(env={}){const output=buildSync({stdin:{contents:`export {MarketProvider} from './src/lib/market';export {OrderCompletePage} from './src/pages/OrderCompletePage';export {PaymentFailedPage} from './src/pages/PaymentFailedPage';export {rememberOrderAccess} from './src/lib/orderAccess';export {setAnalyticsConsent} from './src/lib/analyticsConsent';export {orderSupportCopy} from './src/data/orderSupportCopy';`,resolveDir:rootPath},bundle:true,write:false,platform:'node',format:'cjs',external:['react','react-dom/client','react-router-dom'],define:{'import.meta.env':JSON.stringify(env)}}).outputFiles[0].text;const m=new Module(rootPath+'/order-support-runtime.cjs');m.paths=Module._nodeModulePaths(rootPath);m._compile(output,rootPath+'/order-support-runtime.cjs');return m.exports;}
async function view({page='complete',lang='ko',order=null,access=true,productsFail=false,tracking=false,consent='granted'},check){
 const dom=new JSDOM('<div id="root"></div>',{url:tracking?'https://hondit-shop.vercel.app/':'http://localhost/'}),names=['window','document','navigator','HTMLElement','sessionStorage','localStorage','fetch','IS_REACT_ACT_ENVIRONMENT'];const before=Object.fromEntries(names.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 for(const k of names.filter(k=>!['fetch','IS_REACT_ACT_ENVIRONMENT'].includes(k)))Object.defineProperty(globalThis,k,{configurable:true,writable:true,value:dom.window[k]});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;dom.window.matchMedia=()=>({matches:false});dom.window.scrollTo=()=>{};
 const events=[],r=runtime(tracking?{PROD:true,VITE_VERCEL_ENV:'production'}:{});if(tracking){r.setAnalyticsConsent(consent);window.gtag=(...args)=>events.push(args)}if(access)r.rememberOrderAccess('HD-20261016-SUPPORT','test-only');
 globalThis.fetch=async url=>String(url)==='/api/products'?new Response(JSON.stringify(productsFail?{error:'Unavailable'}:{products:defaultProducts}),{status:productsFail?503:200}):new Response(JSON.stringify(order?{order}:{error:'Denied'}),{status:order?200:403});
 const root=createRoot(document.getElementById('root')),Component=page==='complete'?r.OrderCompletePage:r.PaymentFailedPage;
 try{await act(async()=>root.render(React.createElement(MemoryRouter,{initialEntries:[`/${page==='complete'?'order-complete':'payment-failed'}/HD-20261016-SUPPORT?market=HK&lang=${lang}&purpose=personal_gift`]},React.createElement(r.MarketProvider,null,React.createElement(Routes,null,React.createElement(Route,{path:`/${page==='complete'?'order-complete':'payment-failed'}/:orderNumber`,element:React.createElement(Component)}))))));await check({dom,r,events});}
 finally{await act(async()=>root.unmount());dom.window.close();for(const k of names)if(before[k])Object.defineProperty(globalThis,k,before[k]);else delete globalThis[k];}
}
test('missing and rejected access show unavailable, never inferred pending, in all supported languages',async()=>{
 for(const lang of ['ko','en','ja','zh-HK','ms','th'])for(const page of ['complete','failed'])for(const access of [false,true])await view({page,lang,access},({r})=>{
  const c=r.orderSupportCopy(lang);assert.equal(document.querySelector('h1').textContent,c.unavailable);assert.ok(document.querySelector('main').textContent.includes(c.access));assert.ok(document.querySelector('main a').href.includes('HD-20261016-SUPPORT'));assert.equal(document.querySelector('.order-record-card'),null);
 });
});
test('actual pending order remains distinguishable from lookup rejection',async()=>view({page:'failed',order:{...original(),payment_status:'pending_payment'}},()=>{
 assert.equal(document.querySelector('h1').textContent,'결제 확인 대기');assert.equal(document.querySelector('.bulk-card__actions'),null);
}));
test('failed screen retry uses original SG ja resale data rather than current HK browser defaults',async()=>view({page:'failed',order:original()},()=>{
 const a=document.querySelector('.bulk-card__actions a.button--primary');assert.ok(a);const q=new URL(a.href).searchParams;assert.equal(q.get('market'),'SG');assert.equal(q.get('lang'),'ja');assert.equal(q.get('purpose'),'resale');assert.equal(q.get('quantity'),'35');
}));
test('failed screen keeps all mixture items in support draft and offers no direct retry',async()=>{
 const o=original();o.items.push({product_slug:'diffuser-350g',product_name_snapshot:'QA 350g',total_units:20,line_total_sgd:420});
 await view({page:'failed',order:o},()=>{assert.equal(document.querySelector('.bulk-card__actions a.button--primary'),null);const href=document.querySelector('.bulk-card__actions a').href;const body=new URL(href).searchParams.get('body');assert.match(body,/QA 500g/);assert.match(body,/QA 350g/);assert.match(body,/SG/);assert.doesNotMatch(body,/Hong Kong/);});
});
test('catalogue failure blocks retry and missing original locale is not invented',async()=>{
 const o=original();delete o.retry_context.language;delete o.retry_context.purpose;
 await view({page:'failed',order:o,productsFail:true},({r})=>{assert.equal(document.querySelector('.bulk-card__actions a.button--primary'),null);assert.ok(document.querySelector('main').textContent.includes(r.orderSupportCopy('ko').missing));});
});

test('browser purchase comes only from an accessible completed receipt and stays consent-gated',async()=>{
 const paid={...original(),payment_status:'completed',order_status:'paid'};
 for(const [options,expected] of [[{order:paid},1],[{order:paid,access:false},0],[{order:paid,consent:'denied'},0],[{order:paid,consent:'withdrawn'},0],[{order:{...paid,payment_status:'pending_payment'}},0],[{order:original()},0]])await view({tracking:true,...options},({events})=>{
  const purchases=events.filter(e=>e[0]==='event'&&e[1]==='purchase');assert.equal(purchases.length,expected);if(expected){assert.equal(purchases[0][2].value,1610);assert.equal(purchases[0][2].currency,'SGD');assert.equal(purchases[0][2].transaction_id,paid.order_number)}
 });
});
