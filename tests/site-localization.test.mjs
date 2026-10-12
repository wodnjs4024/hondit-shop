import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const root=path.resolve(import.meta.dirname,'..');
const bundle=buildSync({stdin:{contents:'export * from "./src/lib/market"; export {v23Products} from "./src/data/v23SiteData"; export {ourJejuPlaces} from "./src/data/v23JejuData";',resolveDir:root},bundle:true,platform:'node',format:'cjs',write:false,external:['react'],define:{'import.meta.env':'{}'}});
const runtime=new Module(path.join(root,'localization-runtime.cjs'));runtime.paths=Module._nodeModulePaths(root);runtime._compile(bundle.outputFiles[0].text,path.join(root,'localization-runtime.cjs'));
const {marketText,marketProductText,markets,v23Products,ourJejuPlaces}=runtime.exports;
const languages=['ko','zh-HK','ja','ms','th'];
const pages=['HomePage','ContactPage','JejuPage','NotFoundPage','OrderCompletePage','PaymentFailedPage','ProductsPage','ProductDetailPage','BulkOrdersPage','BulkProductPage','ShippingPage','PartnersPage','PartnerGuidePage'];
const files=[...pages.map(p=>`src/pages/${p}.tsx`),'src/components/v23/SiteChrome.tsx','src/components/v23/GeoJourney.tsx','src/components/ProductSalesSummary.tsx','src/components/ProductReviews.tsx','src/components/ConsultationPanel.tsx'];
const unchangedWords=new Set(['Menu','Minimum','minimum','Asia','Seoul','pH 5.5','Shopee ->','Instagram ->']);
function source(file){return ts.createSourceFile(file,fs.readFileSync(path.join(root,file),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)}
function each(node,fn){fn(node);ts.forEachChild(node,n=>each(n,fn))}
test('public UI literal messages resolve in every selectable non-English language',()=>{
 const missing=[];for(const file of files){const src=source(file);each(src,n=>{if(!ts.isCallExpression(n))return;const name=n.expression.getText(src);if(!['marketText','t'].includes(name))return;const index=name==='t'?0:1;const arg=n.arguments[index];if(!arg||!ts.isStringLiteral(arg))return;const en=arg.text;if(!/[A-Za-z]{3}/.test(en)||unchangedWords.has(en))return;const fallback=n.arguments[index+1];for(const lang of languages){const out=marketText(lang,en,fallback&&ts.isStringLiteral(fallback)?fallback.text:undefined);if(out===en)missing.push(`${file}: ${lang}: ${en}`)}})}assert.deepEqual(missing,[]);
});
test('storefront product descriptions, guidance and comparison data resolve in all languages',()=>{
 const missing=[];for(const product of v23Products)for(const key of ['name','detail','description','goodFor','highlights','howTo'])for(const text of [product[key]].flat()){if(text==='pH 5.5')continue;for(const lang of languages)if(marketProductText(lang,text)===text)missing.push(`${product.slug}: ${lang}: ${text}`)}assert.deepEqual(missing,[]);
});
test('dynamic country and currency copy does not fall back to English or Chinese for Malay/Thai',()=>{
 for(const market of Object.values(markets))for(const lang of ['ms','th'])for(const en of [market.announcement,market.footerLine,`${market.currency} BULK UNIT PRICE`,`PayPal ${market.currency} checkout`,`SHIPPING TO ${market.label.toUpperCase()}`,`Review the minimum order, then pay securely through PayPal in ${market.currency}.`,`Choose the minimum order quantity and create a tracked ${market.currency} order. ->`]){const out=marketText(lang,en);assert.notEqual(out,en,`${lang}: ${en}`);assert.doesNotMatch(out,/[\u3400-\u9fff]/,`${lang}: ${en}`);}
});
test('public page JSX does not bypass translation for English prose',()=>{
 const raw=[];for(const file of files){const src=source(file);each(src,n=>{if(!ts.isJsxText(n))return;const text=n.text.trim().replace(/\s+/g,' ');if(!/[A-Za-z]{3}\s+[A-Za-z]{3}/.test(text))return;if(/^(?:Hidden Live PayPal verification|102 Jejudaehak|FROM JEJU|Shopee Singapore)/.test(text))return;raw.push(`${file}: ${text}`)})}assert.deepEqual(raw,[]);
});
