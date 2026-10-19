import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { defaultProducts } from '../api/_bulk-data.js';
import { toClientProduct } from '../api/_utils.js';
import { merchantOffer, merchantHtml, merchantConfig, merchantMarket } from '../api/_merchant.js';
import { googleFeed } from '../api/_feeds.js';
import { termsFor } from '../shared/market-overrides.js';
const products=defaultProducts.map(toClientProduct);
const cases={SG:['SGD',5,10,'230.00','500.00'],JP:['JPY',2,20,'48000','104000'],HK:['HKD',5,20,'2560.00','5600.00'],TW:['TWD',2,20,'9600','21000'],TH:['THB',2,20,'11000.00','24000.00'],MY:['SGD',2,20,'420.00','920.00']};
for(const [market,[currency,count,quantity,small,large]] of Object.entries(cases)) {
 test(`${market}: approved minimum total, currency, language, stock and initial HTML agree`,()=>{
  const xml=new JSDOM(googleFeed(products,market,'en'),{contentType:'application/xml'}).window.document;
  assert.equal(xml.querySelectorAll('item').length,count);
  for(const p of products){
   const {item}=merchantOffer(p,market,'en');
   if(!item){assert.equal(['JP','TW','TH','MY'].includes(market),true);assert.ok(!p.slug.startsWith('diffuser'));continue;}
   const decision=termsFor({...p,stockQuantity:p.stockUnits},market,item.quantity);
   assert.equal(decision.status,'direct');assert.equal(item.currency,currency);assert.equal(item.shippingIncluded,true);assert.equal(Number(item.shippingAmount),0);
   assert.equal(Number(item.totalAmount),decision.totalMinor/(currency==='JPY'||currency==='TWD'?1:100));
   if(p.slug.startsWith('diffuser')) {assert.equal(item.quantity,quantity);assert.equal(item.priceAmount,p.slug==='diffuser-350g'?small:large);}
   else {assert.equal(item.quantity,30);assert.equal(item.priceAmount,market==='HK'?'1650.00':'267.00');}
   const doc=new JSDOM(merchantHtml(item)).window.document;
   assert.equal(doc.documentElement.lang,'en');
   const schema=JSON.parse(doc.querySelector('script').textContent);
   assert.equal(schema.offers.price,item.priceAmount);assert.equal(schema.offers.shippingDetails.shippingDestination.addressCountry,market);
   const checkout=new URL(doc.querySelector('.button').href);
   assert.equal(checkout.searchParams.get('market'),market);assert.equal(checkout.searchParams.get('lang'),'en');assert.equal(checkout.searchParams.get('quantity'),String(item.quantity));
   assert.equal(merchantOffer({...p,stockUnits:item.quantity-1},market).item.availability,'out_of_stock');
   assert.equal(merchantOffer(p,market,'en',item.quantity+1).item,undefined);
   assert.equal(merchantOffer({...p,markets:{[market]:'quote'}},market).item,undefined);
  }
  assert.equal(merchantMarket(market,'ja'),null,'no language mismatch silently accepted');
 });
}
test('unsupported Google target countries stay excluded even when a flag is accidentally enabled',()=>{
 for(const market of ['MO','BN']) {const previous=merchantConfig.markets[market].enabled;try{merchantConfig.markets[market].enabled=true;assert.equal(merchantMarket(market),null);assert.throws(()=>googleFeed(products,market),RangeError);}finally{merchantConfig.markets[market].enabled=previous;}}
});
