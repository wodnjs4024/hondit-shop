import test from 'node:test';import assert from 'node:assert/strict';
import path from 'node:path';import Module from 'node:module';
import {buildSync} from 'esbuild';import {JSDOM} from 'jsdom';
import React,{act} from 'react';import {createRoot} from 'react-dom/client';
import {MemoryRouter,useNavigate,useLocation,Routes,Route} from 'react-router-dom';
import {defaultProducts} from '../api/_bulk-data.js';import {toClientProduct} from '../api/_utils.js';
const rootPath=path.resolve(import.meta.dirname,'..');
function runtime(env={}){
 const result=buildSync({stdin:{contents:`export * from './src/lib/analytics';export * from './src/lib/analyticsConsent';export {MarketProvider,useMarket} from './src/lib/market';export {PickupRequestPanel} from './src/components/PickupRequestPanel';export {ContactPage} from './src/pages/ContactPage';export {QuantityReview} from './src/components/QuantityReview';export {BulkOrdersPage} from './src/pages/BulkOrdersPage';export {ProductTile} from './src/components/home/ProductTile';export {PartnersPage} from './src/pages/PartnersPage';export {ProductDetailPage} from './src/pages/ProductDetailPage';export {v23Products} from './src/data/v23SiteData';export {RequestActions} from './src/components/RequestActions';export {V23Page} from './src/components/v23/SiteChrome';`,resolveDir:rootPath},bundle:true,write:false,platform:'node',format:'cjs',external:['react','react-dom/client','react-router-dom'],define:{'import.meta.env':JSON.stringify(env)}});
 const m=new Module(rootPath+'/tracking-ui-runtime.cjs');m.paths=Module._nodeModulePaths(rootPath);m._compile(result.outputFiles[0].text,rootPath+"/tracking-ui-runtime.cjs");return m.exports;
}
async function fixture(fn,{blocked=false}={}){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://hondit-shop.vercel.app/contact?utm_source=hotel&utm_medium=qr&utm_campaign=jeju_pickup_202610&utm_content=l0002'});
 const names=['window','document','navigator','HTMLElement','HTMLMetaElement','HTMLLinkElement','sessionStorage','localStorage','IS_REACT_ACT_ENVIRONMENT','fetch'];const before=Object.fromEntries(names.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 for(const k of names.filter(k=>!['IS_REACT_ACT_ENVIRONMENT','fetch'].includes(k)))Object.defineProperty(globalThis,k,{configurable:true,writable:true,value:dom.window[k]});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;dom.window.scrollTo=()=>{};dom.window.matchMedia=()=>({matches:false});
 if(blocked)Object.defineProperty(dom.window,'localStorage',{get(){throw Error('denied')}});
 const copied=[];Object.defineProperty(dom.window.navigator,'clipboard',{value:{writeText:async text=>copied.push(text)},configurable:true});
 globalThis.fetch=async url=>{if(url==='/api/products')return new Response(JSON.stringify({products:defaultProducts.map(toClientProduct)}));throw Error('Unexpected request: '+url);};
 const root=createRoot(document.getElementById('root'));let location,navigate;
 function Probe(){location=useLocation();navigate=useNavigate();return null;}
 try{await fn({root,copied,dom,get location(){return location;},async move(to){await act(async()=>{navigate(to);});},async render(Component,props={},url='/'){
  await act(async()=>{root.render(React.createElement(MemoryRouter,{initialEntries:[url]},React.createElement(Component,props,React.createElement(Probe))));});
 },async mount(ui,url){await act(async()=>root.render(React.createElement(MemoryRouter,{initialEntries:[url]},React.createElement(React.Fragment,null,ui,React.createElement(Probe)))));}});
 }finally{await act(async()=>root.unmount());dom.window.close();for(const k of names){if(before[k])Object.defineProperty(globalThis,k,before[k]);else delete globalThis[k];}}
}
test('500g two-unit pickup and copied request agree at KRW 80,000; contact changes update URL',async()=>fixture(async f=>{
 const r=runtime();await f.mount(React.createElement(r.MarketProvider,null,React.createElement(r.ContactPage)),'/contact?product=diffuser-500g&quantity=2&fulfillment=jeju_pickup&market=SG&lang=en');
 assert.equal(document.querySelector('input[value="500g"]').checked,true);assert.equal(document.querySelector('output').textContent,'80,000 KRW');
 const copy=[...document.querySelectorAll('button')].find(b=>b.textContent==='Copy purchase request');await act(async()=>copy.click());
 assert.match(f.copied[0],/500g/);assert.match(f.copied[0],/80,000 KRW/);assert.doesNotMatch(f.copied[0],/350g/);
 const select=document.querySelector('.pickup-quantity select');await act(async()=>{select.value='3';select.dispatchEvent(new window.Event('change',{bubbles:true}));});assert.equal(document.querySelector('output').textContent,'120,000 KRW');assert.match(f.location.search,/product=diffuser-500g/);assert.match(f.location.search,/quantity=3/);
}));
test('explicit URL locale overrides storage and history restores quantity/product/locale',async()=>fixture(async f=>{
 const r=runtime();window.localStorage.setItem('hondit-market','HK');window.localStorage.setItem('hondit-language','ko');
 const states=[];function View(){const m=r.useMarket();states.push([m.market.code,m.language]);return React.createElement(r.QuantityReview,{product:r.v23Products.find(p=>p.slug==='diffuser-350g')});}
 await f.mount(React.createElement(r.MarketProvider,null,React.createElement(View)),'/products/diffuser-350g?market=JP&lang=ja&product=diffuser-350g&quantity=35');assert.deepEqual(states.at(-1),['JP','ja']);assert.equal(document.querySelector('.diffuser-quantity input[type="text"]').value,'35');
 await f.move('/products/diffuser-350g?market=SG&lang=en&product=diffuser-350g&quantity=21');assert.deepEqual(states.at(-1),['SG','en']);assert.equal(document.querySelector('.diffuser-quantity input[type="text"]').value,'21');
 await f.move(-1);assert.deepEqual(states.at(-1),['JP','ja']);assert.equal(document.querySelector('.diffuser-quantity input[type="text"]').value,'35');await f.move(1);assert.equal(document.querySelector('.diffuser-quantity input[type="text"]').value,'21');
}));
test('bulk product switch resets incompatible quantity without restoring old product; purpose and partner links persist',async()=>fixture(async f=>{
 const r=runtime();await f.mount(React.createElement(r.MarketProvider,null,React.createElement(r.BulkOrdersPage)),'/bulk-orders?product=diffuser-500g&quantity=35&purpose=resale&market=SG&lang=en');
 const selects=document.querySelectorAll('.bundle-entry__selectors select');assert.equal(selects[1].value,'diffuser-500g');assert.equal(selects[2].value,'resale');
 await act(async()=>{selects[1].value='foam-oil';selects[1].dispatchEvent(new window.Event('change',{bubbles:true}));});assert.match(f.location.search,/product=foam-oil/);assert.doesNotMatch(f.location.search,/quantity=35/);assert.equal(document.querySelector('.order-qty-field input').value,'30');
 await f.move('/partners?product=diffuser-500g&quantity=35&purpose=resale&market=JP&lang=ja');
 // Switch the rendered page while keeping the same router and explicit URL.
 await act(async()=>f.root.render(React.createElement(MemoryRouter,null,React.createElement(r.MarketProvider,null,React.createElement(r.PartnersPage)))));
 const links=[...document.querySelectorAll('.discovery-hero-actions a')].map(a=>a.getAttribute('href'));
 assert.ok(links[0].includes('product=diffuser-500g')&&links[0].includes('quantity=35')&&links[0].includes('purpose=resale'));assert.ok(links[1].includes('market=JP'));
}));
test('blocked local storage does not break pickup and copying',async()=>fixture(async f=>{
 const r=runtime();await f.mount(React.createElement(r.MarketProvider,null,React.createElement(r.PickupRequestPanel)),'/jeju/pickup?product=diffuser-500g&quantity=2&lang=en');assert.equal(document.querySelector('output').textContent,'80,000 KRW');
},{blocked:true}));
test('tracking ignores query/hash page repeats, emits one campaign entry, and deduplicates browser purchase calls',async()=>fixture(async f=>{
 const r=runtime({PROD:true,VITE_VERCEL_ENV:'production'});r.setAnalyticsConsent('granted');r.initAnalytics();
 const events=()=>window.dataLayer.filter(x=>x[0]==='event');
 r.trackPageView('/products/diffuser-350g?quantity=20');r.trackPageView('/products/diffuser-350g?quantity=21#shipping');r.trackCampaignLanding();r.trackCampaignLanding();
 assert.equal(events().filter(e=>e[1]==='page_view').length,1);assert.equal(events().filter(e=>e[1]==='campaign_landing').length,1);assert.equal(events().filter(e=>e[1].startsWith('landing_')).length,0);
 r.trackPurchaseOnce('HD-20261016-MOCK',{transaction_id:'HD-20261016-MOCK',value:420,currency:'SGD'});r.trackPurchaseOnce('HD-20261016-MOCK',{transaction_id:'HD-20261016-MOCK'});assert.equal(events().filter(e=>e[1]==='purchase').length,1);
 assert.doesNotMatch(JSON.stringify(events()),/customer_email|error_message|paypal_order_id/);
}));
test('contact and copy events are distinct, include public reference, and contain no request body or accounts',async()=>fixture(async f=>{
 const r=runtime({PROD:true,VITE_VERCEL_ENV:'production'});r.setAnalyticsConsent('granted');r.initAnalytics();
 await f.mount(React.createElement(r.MarketProvider,null,React.createElement(r.V23Page,null,React.createElement(r.RequestActions,{body:'Private test request',channels:true}))),'/contact');
 const link=document.querySelector('a[href*="wa.me"]');link.addEventListener('click',e=>e.preventDefault());await act(async()=>link.click());
 const copy=[...document.querySelectorAll('button')].find(b=>b.textContent==='Copy request text');await act(async()=>copy.click());
 const events=window.dataLayer.filter(e=>e[0]==='event');assert.equal(events.filter(e=>e[1]==='contact_click').length,1);assert.equal(events.filter(e=>e[1]==='request_copy').length,1);assert.match(f.copied[0],/Reference: l0002/);assert.doesNotMatch(JSON.stringify(events),/Private test request|3338|2694|hondit_jeju/);
}));

test('product view waits for product loading and is not repeated by quantity or hash navigation',async()=>fixture(async f=>{
 const r=runtime({PROD:true,VITE_VERCEL_ENV:'production'});r.setAnalyticsConsent('granted');r.initAnalytics();
 let finish;globalThis.fetch=()=>new Promise(resolve=>{finish=resolve;});
 await f.mount(React.createElement(r.MarketProvider,null,React.createElement(Routes,null,React.createElement(Route,{path:'/products/:productId',element:React.createElement(r.ProductDetailPage)}))),'/products/diffuser-350g?market=SG&lang=en');
 const views=()=>window.dataLayer.filter(e=>e[0]==='event'&&e[1]==='view_item');assert.equal(views().length,0);
 await act(async()=>finish(new Response(JSON.stringify({products:defaultProducts.map(toClientProduct)}))));assert.equal(views().length,1);
 await f.move('/products/diffuser-350g?market=SG&lang=en&quantity=21#shipping');assert.equal(views().length,1);
}));
test('default local runtime loads no GA script or event queue',async()=>fixture(async()=>{
 const r=runtime({PROD:true,VITE_VERCEL_ENV:'local'});r.initAnalytics();r.trackEvent('contact_click',{channel:'email'});
 assert.equal(document.querySelector('script[src*=googletagmanager]'),null);assert.equal(window.gtag,undefined);
}));

test('queued Google tag commands use the official Arguments contract rather than arrays',async()=>fixture(async()=>{
 const r=runtime({PROD:true,VITE_VERCEL_ENV:'production'});r.setAnalyticsConsent('granted');r.initAnalytics();r.trackPageView('/contact');r.trackEvent('contact_click',{channel:'email'});
 const commands=window.dataLayer;assert.ok(commands.length>=4);for(const command of commands)assert.equal(Object.prototype.toString.call(command),'[object Arguments]');
 assert.ok(commands.some(c=>c[0]==='config'&&c[2].send_page_view===false));assert.ok(commands.some(c=>c[0]==='event'&&c[1]==='contact_click'));
}));
