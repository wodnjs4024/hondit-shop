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
const languages={SG:'en',JP:'ja',HK:'zh-HK',TW:'zh-TW',TH:'th',MY:'ms'};
for(const [market,[currency,count,quantity,small,large]] of Object.entries(cases)) {
 test(`${market}: approved minimum total, currency, language, stock and initial HTML agree`,()=>{
  const language=languages[market];
  const xml=new JSDOM(googleFeed(products,market,language),{contentType:'application/xml'}).window.document;
  assert.equal(xml.querySelectorAll('item').length,count);
  for(const p of products){
   const {item}=merchantOffer(p,market,language);
   if(!item){assert.equal(['JP','TW','TH','MY'].includes(market),true);assert.ok(!p.slug.startsWith('diffuser'));continue;}
   const decision=termsFor({...p,stockQuantity:p.stockUnits},market,item.quantity);
   assert.equal(decision.status,'direct');assert.equal(item.currency,currency);assert.equal(item.shippingIncluded,true);assert.equal(Number(item.shippingAmount),0);
   assert.equal(Number(item.totalAmount),decision.totalMinor/(currency==='JPY'||currency==='TWD'?1:100));
   if(p.slug.startsWith('diffuser')) {assert.equal(item.quantity,quantity);assert.equal(item.priceAmount,p.slug==='diffuser-350g'?small:large);}
   else {assert.equal(item.quantity,30);assert.equal(item.priceAmount,market==='HK'?'1650.00':'267.00');}
   const doc=new JSDOM(merchantHtml(item)).window.document;
   assert.equal(doc.documentElement.lang,language);
   const schema=JSON.parse(doc.querySelector('script').textContent);
   assert.equal(schema.offers.price,item.priceAmount);assert.equal(schema.offers.shippingDetails.shippingDestination.addressCountry,market);
   const checkout=new URL(doc.querySelector('.button').href);
   assert.equal(checkout.searchParams.get('market'),market);assert.equal(checkout.searchParams.get('lang'),language);assert.equal(checkout.searchParams.get('quantity'),String(item.quantity));
   assert.equal(merchantOffer({...p,stockUnits:item.quantity-1},market).item.availability,'out_of_stock');
   assert.equal(merchantOffer(p,market,language,item.quantity+1).item,undefined);
   assert.equal(merchantOffer({...p,markets:{[market]:'quote'}},market).item,undefined);
  }
  assert.equal(merchantMarket(market,'ko'),null,'unsupported language mismatch is not silently accepted');
  if(language!=='en') assert.equal(merchantMarket(market,'en').language,'en','legacy English route remains available during feed migration');
 });
}
test('unsupported Google target countries stay excluded even when a flag is accidentally enabled',()=>{
 for(const market of ['MO','BN']) {const previous=merchantConfig.markets[market].enabled;try{merchantConfig.markets[market].enabled=true;assert.equal(merchantMarket(market),null);assert.throws(()=>googleFeed(products,market),RangeError);}finally{merchantConfig.markets[market].enabled=previous;}}
});
test('localized markets expose localized product titles, descriptions and landing labels',()=>{
 const expected={JP:['ja','ボルカニック','注文数量'],HK:['zh-HK','火山石擴香','訂購數量'],TW:['zh-TW','火山石擴香','訂購數量'],TH:['th','ดิฟฟิวเซอร์','จำนวนสั่งซื้อ'],MY:['ms','Penyebar aroma','Kuantiti pesanan']};
 const product=products.find(item=>item.slug==='diffuser-350g');
 for(const [market,[language,titleText,labelText]] of Object.entries(expected)){
  const {item}=merchantOffer(product,market,language);
  assert.match(item.title,new RegExp(titleText));
  assert.notEqual(item.description,product.description);
  const doc=new JSDOM(merchantHtml(item)).window.document;
  assert.match(doc.body.textContent,new RegExp(labelText));
  assert.equal(new URL(doc.querySelector('.button').href).searchParams.get('lang'),language);
 }
});
