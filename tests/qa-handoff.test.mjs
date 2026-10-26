import test from 'node:test';import assert from 'node:assert/strict';import Module from 'node:module';import {buildSync} from 'esbuild';
import {readMixSelection,writeMixSelection} from '../shared/mix-selection.js';
import {pickupRequestMessage} from '../shared/contact-copy.js';
const root=process.cwd();
const result=buildSync({stdin:{contents:'export {getPolicyContent} from "./src/pages/PolicyPage";export {policyTranslation} from "./src/data/policyTranslations";export {marketText,markets} from "./src/lib/market";',resolveDir:root},bundle:true,write:false,platform:'node',format:'cjs',external:['react','react-router-dom'],define:{'import.meta.env':'{}'}});
const runtime=new Module(root+'/qa-handoff-check.cjs');runtime.paths=Module._nodeModulePaths(root);runtime._compile(result.outputFiles[0].text,root+'/qa-handoff-check.cjs');
const {getPolicyContent,policyTranslation,marketText,markets}=runtime.exports;
test('all existing policy headings and full clauses have JA and Traditional Chinese translations',()=>{
 for(const market of Object.values(markets))for(const policy of ['terms','refund','shipping','privacy'])for(const lang of ['ja','zh-HK']){
  const p=getPolicyContent(policy,market.countryName,market.currency,market.hasShopee);
  for(const source of [p.title,p.intro,...p.sections.flatMap(s=>[s.heading,...s.items])]){
   const translated=policyTranslation(source,lang,market.countryName,market.currency);
   assert.notEqual(translated,source,`${lang}: ${source}`);
  }
 }
 const damage='Report damaged, incorrect or missing items within 7 days after receiving the parcel.';
 const refund='After a refund is approved, the payment provider may take 5-10 business days to reflect the refund.';
 assert.match(policyTranslation(damage,'ja','日本','JPY'),/7日/);
 assert.match(policyTranslation(refund,'zh-HK','日本','JPY'),/5至10個工作天/);
});
test('Traditional Chinese conversion covers reported simplified UI and customer terminology',()=>{
 for(const source of ['THE HONDIT EDIT','Care shaped by water. Scent grounded in stone.','View details','Minimum quantity','Product composition','GOOD FOR','Resale economics review']){
  assert.doesNotMatch(marketText('zh-HK',source),/[选护载气详数适组]/,source);
 }
 assert.equal(marketText('zh-HK','Resale economics review'),'轉售收益試算');
 assert.doesNotMatch(marketText('en','Proposed or legacy reference price — confirmation required'),/legacy|Proposed/);
});
test('mix URL roundtrip preserves only known SKUs and whole ten-unit selections',()=>{
 const mix={'foam-oil':10,'foaming-cleanser':10,'cleansing-water':10};
 assert.deepEqual(readMixSelection(writeMixSelection(mix)),mix);
 assert.deepEqual(readMixSelection('unknown:10,foam-oil:11,foaming-cleanser:abc,cleansing-water:10'),{'cleansing-water':10});
});
test('SDK loader deduplicates concurrent and repeated configurations; invalid API rejects without rebootstrap',async()=>{
 const built=buildSync({entryPoints:['src/lib/paypalSdk.ts'],bundle:true,write:false,platform:'node',format:'cjs'});
 const module=new Module(root+'/sdk-unit.cjs');module._compile(built.outputFiles[0].text,root+'/sdk-unit.cjs');
 const oldWindow=globalThis.window,oldDocument=globalThis.document;let bootstraps=0;
 globalThis.window={setTimeout,clearTimeout};
 globalThis.document={createElement(){const attributes={};return {setAttribute(k,v){attributes[k]=v},attributes}},body:{appendChild(script){
  bootstraps++;queueMicrotask(()=>{window[script.attributes['data-namespace']]=script.src.includes('invalid-only')?{}:{Buttons(){return {render:async()=>{},close:async()=>{}}}};script.onload()});
 }}};
 try{
  const first=module.exports.loadPayPalSdk('mock-only','SGD'),second=module.exports.loadPayPalSdk('mock-only','SGD');
  assert.equal(first,second);assert.equal(typeof (await first).Buttons,'function');
  assert.equal(module.exports.loadPayPalSdk('mock-only','SGD'),first);assert.equal(bootstraps,1);
  await module.exports.loadPayPalSdk('mock-only','JPY');assert.equal(bootstraps,2);
  const invalid=module.exports.loadPayPalSdk('invalid-only','SGD');await assert.rejects(invalid,/buttons unavailable/);
  assert.equal(module.exports.loadPayPalSdk('invalid-only','SGD'),invalid);assert.equal(bootstraps,3);
 }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument}
});
test('English Jeju quantity one is singular; confirmed prices and pickup amount are unchanged',()=>{
 assert.match(pickupRequestMessage(1,'en'),/Quantity: 1 unit\n/);assert.match(pickupRequestMessage(2,'en'),/Quantity: 2 units\n/);
 assert.match(pickupRequestMessage(1,'en'),/18,000 KRW/);
});
