// Read an explicitly supplied PUBLIC catalog snapshot. Never loads credentials or customer/order data.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { merchantOffer, merchantHtml, merchantConfig, merchantMarket } from '../api/_merchant.js';
import { googleFeed } from '../api/_feeds.js';
import { termsFor } from '../shared/market-overrides.js';
import { conditionsFor } from '../shared/price-versions.js';
const input = process.argv[2], output = process.argv[3];
if (!input || !output) throw new Error('Usage: node scripts/audit-merchant-catalog.mjs PUBLIC_SNAPSHOT_JSON OUTPUT_DIRECTORY');
const catalog = JSON.parse(await readFile(input,'utf8'));
if (!Array.isArray(catalog.products)) throw new Error('Expected public {products: [...]}');
await mkdir(output,{recursive:true});
const markets=['SG','JP','HK','TW','MO','TH','MY','BN'];
const products=catalog.products.map(p=>{
 const rows=markets.map(market=>{
  const quantities=[...new Set(conditionsFor(p,market).filter(c=>c.market===market&&c.sku===p.slug).map(c=>c.minimum))].sort((a,b)=>a-b);
  return {market,quantities:quantities.map(quantity=>{
   const d=termsFor({...p,stockQuantity:p.stockUnits},market,quantity);
   return {quantity,status:d.status,reason:d.reason,currency:d.billingCurrency,totalMinor:d.totalMinor,shippingIncluded:d.shippingIncluded,version:d.version};
  })};
 });
 const result=merchantOffer(p,'SG');
 return {slug:p.slug,name:p.name,stockUnits:p.stockUnits,active:p.active,purchaseEnabled:p.purchaseEnabled,status:p.status,rows,merchant:result.item?{...result.item,extraImages:undefined}:result};
});
const report={generatedAt:new Date().toISOString(),source:'Read-only public API snapshot supplied by file path; inventory is an application record, not a physical stock count.',products};
await writeFile(`${output}/catalog-audit.json`,JSON.stringify(report,null,2)+'\n');
await writeFile(`${output}/sg-preview.xml`,googleFeed(catalog.products,'SG'));
for(const p of catalog.products){const {item}=merchantOffer(p,'SG');if(item)await writeFile(`${output}/${p.slug}.html`,merchantHtml(item));}
const channels=[];
for(const market of Object.keys(merchantConfig.markets)){
 const channel=merchantMarket(market);
 if(!channel)continue;
 await mkdir(`${output}/${market}`,{recursive:true});
 await writeFile(`${output}/${market}/feed.xml`,googleFeed(catalog.products,market,channel.language));
 const offers=[];
 for(const product of catalog.products){
  const result=merchantOffer(product,market,channel.language);
  if(result.item){offers.push(result.item);await writeFile(`${output}/${market}/${product.slug}.html`,merchantHtml(result.item));}
 }
 channels.push({market,language:channel.language,currency:channel.currency,offers});
}
await writeFile(`${output}/country-offers.json`,JSON.stringify(channels,null,2)+'\n');
console.log(JSON.stringify({products:products.length,sgOffers:products.filter(p=>p.merchant.id).length,output}));
