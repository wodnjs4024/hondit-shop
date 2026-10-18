import {marketIds,productIds,publicToken} from '../shared/tracking-policy.js';
import fs from 'node:fs';
// Match the storefront's selectable languages; translation-only zh-TW is not selectable.
const qrLanguages=['en','ko','ja','zh-HK','ms','th'];
export function redirectsFor(links){
 if(!links.length||new Set(links.map(x=>x.id)).size!==links.length)throw Error('Expected unique QR links');
 return links.flatMap(x=>{
 if(!/^l[0-9]{4,}$/.test(x.id)||!['/','/jeju/pickup','/partners',...productIds.map(id=>'/products/'+id)].includes(x.path)||x.status!=='DRAFT'||!qrLanguages.includes(x.language)||(x.market&&!marketIds.includes(x.market))||!['source','medium','campaign','placement'].every(k=>Boolean(x[k])&&publicToken(x[k])===x[k]))throw Error('Unreviewed QR configuration');
 const destination=language=>{
 const q=new URLSearchParams();if(x.market)q.set('market',x.market);q.set('lang',language);for(const [k,v]of Object.entries({utm_source:x.source,utm_medium:x.medium,utm_campaign:x.campaign,utm_content:x.id,link_id:x.id}))q.set(k,v);
 return x.path+'?'+q.toString().replace('%3AqrLanguage',':qrLanguage');};
 return [{source:'/q/'+x.id,has:[{type:'query',key:'lang',value:'(?<qrLanguage>en|ko|ja|zh-HK|ms|th)'}],destination:destination(':qrLanguage'),permanent:false},{source:'/q/'+x.id,destination:destination(x.language),permanent:false}];
 });
}
export function mergeQrConfig(config,links){
 const managed=new Set(links.map(x=>'/q/'+x.id));
 const redirects=(config.redirects||[]).filter(x=>!managed.has(x.source));
 const rewrites=(config.rewrites||[]).filter(x=>x.source!=='/q/(.*)');
 return {...config,redirects:[...redirectsFor(links),...redirects],rewrites:[{source:'/q/(.*)',destination:'/api/products?qrNotFound=1'},...rewrites]};
}
if(process.argv[1]&&import.meta.url===new URL('file:///'+process.argv[1].replaceAll('\\','/')).href){
 const config=JSON.parse(fs.readFileSync('vercel.json','utf8').replace(/^\uFEFF/,'')),links=JSON.parse(fs.readFileSync('config/qr-links.json','utf8').replace(/^\uFEFF/,''));
 fs.writeFileSync('vercel.json',JSON.stringify(mergeQrConfig(config,links),null,2)+'\n');
}
