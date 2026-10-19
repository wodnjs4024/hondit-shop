// Synthetic catalogs and mocked DB only. No PayPal, GA or Merchant Center calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { googleFeed, sitemap, feedItem } from '../api/_feeds.js';
import { merchantOffer, merchantSchema, merchantHtml, merchantConfig, publicImage } from '../api/_merchant.js';
import { defaultProducts } from '../api/_bulk-data.js';
import { toClientProduct } from '../api/_utils.js';
import { storefrontCatalog } from '../shared/storefront-catalog.js';
import { termsFor } from '../shared/market-overrides.js';

const products = defaultProducts.map(toClientProduct);
const diffuser = products.find(p => p.slug === 'diffuser-350g');
const parse = xml => new JSDOM(xml,{contentType:'application/xml'}).window.document;
const field = (node,name) => node.getElementsByTagNameNS('http://base.google.com/ns/1.0',name)[0]?.textContent;

test('merchant uses existing storefront default names and photos, not a separate copy',()=>{
 for(const p of products){const base=storefrontCatalog.find(b=>b.slug===p.slug), item=feedItem(p,'SG');assert.ok(item.title.startsWith(base.name));assert.equal(item.image,new URL(base.image,'https://hondit-shop.vercel.app').href);assert.equal(item.description,base.description);}
});

test('SG minimum payable quantity, price, brand, identifiers and XML validity',()=>{
 const doc=parse(googleFeed(products,'SG'));
 const nodes=[...doc.querySelectorAll('item')]; assert.equal(nodes.length,5);
 for(const node of nodes){
  const source=products.find(p=>field(node,'id').startsWith(p.slug+'-q'));
  const item=feedItem(source,'SG');
  const q=Number(new URL(field(node,'link')).searchParams.get('quantity'));
  const decision=termsFor({...source,stockQuantity:source.stockUnits},'SG',q);
  assert.equal(decision.status,'direct');
  assert.equal(field(node,'price'),`${(decision.productTotalMinor/100).toFixed(2)} SGD`);
  assert.equal(item.totalAmount, (decision.totalMinor/100).toFixed(2));
  assert.equal(field(node,'identifier_exists'),undefined,'unknown identifiers never asserted absent');
  assert.equal(field(node,'multipack'),undefined,'MOQ does not claim a retailer-defined multipack');
  assert.notEqual(field(node,'brand'),'HONDIT');
 }
 assert.equal(feedItem(diffuser,'SG').quantity,10);
 assert.equal(feedItem(diffuser,'SG').price,'230.00 SGD');
 assert.equal(feedItem(products.find(p=>p.slug==='diffuser-500g'),'SG').price,'500.00 SGD');
 assert.equal(feedItem(products[0],'SG').price,'267.00 SGD');
});

test('only reviewed market/language is active; no silent SG fallback',()=>{
 for(const m of ['MO','BN','XX']){
  assert.throws(()=>googleFeed(products,m),RangeError);
  assert.equal(feedItem(diffuser,m),null);
 }
 assert.throws(()=>googleFeed(products,'SG','ja'),RangeError);
});

test('future market remains behind configuration AND actual checkout terms',()=>{
 const previous={...merchantConfig.markets.JP};
 try {
  assert.equal(feedItem(diffuser,'JP','ja').price,'48000 JPY');
  assert.equal(feedItem(diffuser,'JP','ja').quantity,20);
  assert.equal(feedItem(products[0],'JP','ja'),null,'JP cleanser is not payable');
  assert.equal(feedItem({...diffuser,markets:{JP:'quote'}},'JP','ja'),null);
 } finally {Object.assign(merchantConfig.markets.JP,previous);}
});

test('HTML price, schema, image, name, quantity and checkout destination share the exact feed offer',()=>{
 for(const source of products){
  const item=feedItem(source,'SG'); const doc=new JSDOM(merchantHtml(item)).window.document;
  const schema=JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent);
  assert.deepEqual(schema,merchantSchema(item));
  assert.equal(doc.querySelector('h1').textContent,item.title);
  assert.equal(doc.querySelector('img').src,item.image);
  assert.equal(schema.offers.price,item.priceAmount);
  assert.equal(schema.offers.priceCurrency,'SGD');
  assert.equal(schema.offers.url,item.link);
  assert.equal(schema.offers.shippingDetails.shippingRate.value,item.shippingAmount);
  assert.equal(doc.querySelector('link[rel=canonical]').href,item.link);
  const checkout=new URL(doc.querySelector('.button').href);
  assert.equal(checkout.pathname,`/bulk-orders/${source.slug}`);
  assert.equal(checkout.searchParams.get('quantity'),String(item.quantity));
  assert.equal(checkout.searchParams.get('market'),'SG');
  assert.equal(checkout.searchParams.get('lang'),'en');
  assert.equal(doc.querySelectorAll('script').length,1,'no analytics, payment or SPA rewrite on merchant HTML');
 }
});

test('live content overrides and price versions propagate together; no raw SKU as MPN',()=>{
 const source={...diffuser,sku:'INTERNAL-NOT-MPN',contents:{en:{name:'Updated live name',description:'Updated description'}},media:[{role:'main',url:'/images/new.webp'}],prices:{SG:{trial:{amount:24,currency:'SGD',version:'qa-price'}}}};
 const item=feedItem(source,'SG');
 assert.match(item.title,/Updated live name/); assert.equal(item.description,'Updated description');
 assert.equal(item.image,'https://hondit-shop.vercel.app/images/new.webp');
 assert.equal(item.price,'240.00 SGD'); assert.equal(merchantSchema(item).offers.price,'240.00');
 assert.equal(item.mpn,undefined);
});

test('explicit stock overrides packs, zero/low stock disables checkout and unknown stock is excluded',()=>{
 for(const stock of [0,5,9]){
  const item=feedItem({...diffuser,stockUnits:stock,inventoryPacks:100},'SG');
  assert.equal(item.quantity,10); assert.equal(item.availability,'out_of_stock');
  const doc=new JSDOM(merchantHtml(item)).window.document;
  assert.equal(doc.querySelector('.button'),null);
  assert.equal(merchantSchema(item).offers.availability,'https://schema.org/OutOfStock');
 }
 assert.equal(feedItem({...diffuser,stockUnits:10},'SG').availability,'in_stock');
 assert.equal(feedItem({...diffuser,status:'soldout'},'SG').availability,'out_of_stock');
 for(const stockUnits of [null,-1,NaN,1.5,'10']) assert.equal(feedItem({...diffuser,stockUnits},'SG'),null);
});

test('non-public, quote-only, missing metadata/content and mismatched quantities fail closed',()=>{
 for(const patch of [{status:'draft'},{status:'hidden'},{active:false},{purchaseEnabled:false},{quoteOnly:true},{markets:{SG:'quote'}},{markets:{SG:'hidden'}},{slug:'new-product'},{media:[{role:'main',url:'javascript:alert(1)'}]}]){
  assert.equal(feedItem({...diffuser,...patch},'SG'),null,JSON.stringify(patch));
 }
 for(const q of ['20','10.0','010','10<script>', ['10','20']]) assert.equal(merchantOffer(diffuser,'SG','en',q).item,undefined);
 assert.ok(merchantOffer(diffuser,'SG','en','10').item);
});

test('hostile XML, HTML, script terminators and image schemes cannot inject content',()=>{
 const source={...diffuser,contents:{en:{name:'A & <B> "x"',description:'</script><script>alert(1)</script> & details'}}};
 const item=feedItem(source,'SG');
 const xml=parse(googleFeed([source],'SG')); assert.equal(field(xml.querySelector('item'),'description'),source.contents.en.description);
 const doc=new JSDOM(merchantHtml(item)).window.document;
 assert.equal(doc.querySelectorAll('script').length,1);
 assert.equal(JSON.parse(doc.querySelector('script').textContent).description,source.contents.en.description);
 assert.equal(doc.querySelector('h1').textContent,item.title);
 for(const url of ['javascript:alert(1)','data:image/png,a','http://x.example/a.png','https://u:p@example.com/a.png']) assert.equal(publicImage(url),null);
});

test('sitemap preserves published products and routes preserve existing QR configuration',()=>{
 const xml=sitemap([...products,{...products[0],slug:'new-live',status:'published'},{...products[0],slug:'secret',status:'draft'}],'2026-10-19');
 assert.match(xml,/\/products\/new-live/); assert.doesNotMatch(xml,/secret/);
 const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
 assert.ok(config.rewrites.some(r=>r.source==='/merchant/:market/:lang/:merchantSlug'));
 assert.ok(config.rewrites.some(r=>r.source==='/feeds/google/:market'));
 assert.match(fs.readFileSync('public/robots.txt','utf8'),/Allow: \//);
});

async function withMockCatalog(callback){
 const saved={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY};
 const original=globalThis.fetch; let mode='ok',calls=0;
 Object.assign(process.env,{SUPABASE_URL:'https://mock.invalid',SUPABASE_SERVICE_ROLE_KEY:'mock'});
 globalThis.fetch=async url=>{calls++;if(mode==='fail')throw new Error('synthetic');const rows=String(url).includes('/site_settings?')?[{checkout_enabled:mode!=='closed'}]:defaultProducts;return new Response(JSON.stringify(rows),{status:200});};
 try {await callback({setMode:v=>mode=v,calls:()=>calls});} finally {globalThis.fetch=original;for(const[k,v]of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;}
}
async function request(query,method='GET'){
 const {default:handler}=await import('../api/products.js'); const headers={};let body='';
 const res={statusCode:0,status(c){this.statusCode=c;return this;},setHeader(k,v){headers[k]=v;return this;},end(value){body=value||'';}};
 await handler({method,query,headers:{}},res);return {status:res.statusCode,headers,body};
}
test('API GET/HEAD XML and initial HTML, method restrictions, missing source and unavailable offers',async()=>{
 await withMockCatalog(async mock=>{
  const feed=await request({feed:'google',market:'SG'});assert.equal(feed.status,200);assert.match(feed.headers['Content-Type'],/xml/);
  const items=[...parse(feed.body).querySelectorAll('item')];
  for(const node of items){
   const url=new URL(field(node,'link'));const html=await request({merchantSlug:url.pathname.split('/').at(-1),market:'SG',lang:'en',quantity:url.searchParams.get('quantity')});
   assert.equal(html.status,200);assert.match(html.headers['Content-Type'],/html/);assert.equal(html.headers['Cache-Control'],'no-store');
   const schema=JSON.parse(new JSDOM(html.body).window.document.querySelector('script').textContent);
   assert.equal(`${schema.offers.price} ${schema.offers.priceCurrency}`,field(node,'price'));
  }
  assert.equal((await request({merchantSlug:'diffuser-350g',market:'SG',lang:'en',quantity:'20'})).status,404);
  assert.equal((await request({merchantSlug:'missing',market:'SG',lang:'en'})).status,404);
  assert.equal((await request({feed:'google',market:'MO'})).status,404);
  assert.equal((await request({feed:'google',market:'INVALID'})).status,404);
  assert.equal((await request({feed:'google',market:['SG','JP']})).status,400);
  const head=await request({feed:'google',market:'SG'},'HEAD');assert.equal(head.status,200);assert.equal(head.body,'');
  const post=await request({feed:'google',market:'SG'},'POST');assert.equal(post.status,405);
  mock.setMode('closed');assert.equal((await request({feed:'google',market:'SG'})).status,503);mock.setMode('ok');
  delete process.env.SUPABASE_URL;
  const before=mock.calls();const missing=await request({feed:'google',market:'SG'});assert.equal(missing.status,503);assert.equal(mock.calls(),before,'never static fallback');
  process.env.SUPABASE_URL='https://mock.invalid';mock.setMode('fail');assert.equal((await request({feed:'google',market:'SG'})).status,503);
 });
});

test('read-only Preview and production without live payment prerequisites never advertise purchasable offers',async()=>{
 const names=['VERCEL_ENV','PAYPAL_MODE','PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET'];const saved=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 try{await withMockCatalog(async()=>{
  process.env.VERCEL_ENV='preview';assert.equal((await request({feed:'google',market:'SG'})).status,503);
  process.env.VERCEL_ENV='production';delete process.env.PAYPAL_CLIENT_SECRET;assert.equal((await request({feed:'google',market:'SG'})).status,503);
  process.env.PAYPAL_CLIENT_ID='mock';process.env.PAYPAL_CLIENT_SECRET='mock';process.env.PAYPAL_MODE='sandbox';assert.equal((await request({feed:'google',market:'SG'})).status,503);
  process.env.PAYPAL_MODE='live';assert.equal((await request({feed:'google',market:'SG'})).status,200);
 });}finally{for(const[k,v]of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
