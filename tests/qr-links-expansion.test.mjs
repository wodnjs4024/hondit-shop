import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {redirectsFor,mergeQrConfig} from '../scripts/sync-qr-redirects.mjs';
import {localRedirect} from './qr-consent-config.test.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const links=read('config/qr-links.json'),config=read('vercel.json');
const original=read('tests/fixtures/qr-original-links.json');
const expected=[
  [
    "l0007",
    "/",
    "SG",
    "en",
    "instagram",
    "social",
    "sg_online_202610",
    "story_v1"
  ],
  [
    "l0008",
    "/",
    "SG",
    "en",
    "instagram",
    "dm",
    "sg_online_202610",
    "sales_dm_v1"
  ],
  [
    "l0009",
    "/",
    "SG",
    "en",
    "telegram",
    "community",
    "sg_community_202610",
    "student_council_post_v1"
  ],
  [
    "l0010",
    "/partners",
    "JP",
    "ja",
    "outreach",
    "email",
    "jp_b2b_202610",
    "first_email_v1"
  ],
  [
    "l0011",
    "/partners",
    "JP",
    "ja",
    "outreach",
    "email",
    "jp_b2b_202610",
    "followup_email_v1"
  ],
  [
    "l0012",
    "/partners",
    "JP",
    "ja",
    "catalog",
    "pdf",
    "jp_b2b_202610",
    "catalog_ja_v1"
  ],
  [
    "l0013",
    "/partners",
    "TW",
    "en",
    "outreach",
    "email",
    "tw_b2b_202610",
    "first_email_v1"
  ],
  [
    "l0014",
    "/partners",
    "HK",
    "zh-HK",
    "whatsapp",
    "dm",
    "hk_groupbuy_202610",
    "groupbuy_dm_v1"
  ],
  [
    "l0015",
    "/jeju/pickup",
    null,
    "en",
    "instagram",
    "dm",
    "jeju_pickup_202610",
    "pickup_dm_v1"
  ],
  [
    "l0016",
    "/jeju/pickup",
    null,
    "en",
    "airport",
    "qr",
    "jeju_pickup_202610",
    "airport_pickup_qr_v1"
  ]
];
test('original six campaign meanings and complete redirect rules are unchanged',()=>{
 assert.deepEqual(links.slice(0,6),original.links);
 assert.deepEqual(config.redirects.filter(r=>original.links.some(x=>r.source==='/q/'+x.id)),original.redirects);
});
test('ten requested additions have exact campaign, placement, country, language and UTM',()=>{
 assert.equal(links.length,16);assert.equal(expected.length,10);
 for(const [id,path,market,language,source,medium,campaign,placement]of expected){
  const x=links.find(x=>x.id===id);assert.ok(x,id);
  assert.deepEqual([x.path,x.market||null,x.language,x.source,x.medium,x.campaign,x.placement],[path,market,language,source,medium,campaign,placement]);
  const r=localRedirect('/q/'+id);assert.equal(r.status,307);assert.equal(r.url.pathname,path);
  for(const [key,value]of Object.entries({market,lang:language,utm_source:source,utm_medium:medium,utm_campaign:campaign,utm_content:id,link_id:id}))assert.equal(r.url.searchParams.get(key),value,id+':'+key);
  assert.equal(x.status,'DRAFT');assert.equal(new Set(r.url.searchParams.keys()).size,r.url.searchParams.size);
 }
});
test('Taiwan uses English because zh-TW is not a storefront selectable language',()=>{
 const market=fs.readFileSync(new URL('../src/lib/market.tsx',import.meta.url),'utf8');
 const selectable=market.match(/export const displayLanguages: LanguageOption\[\] = \[([\s\S]*?)\];/)[1];
 assert.doesNotMatch(selectable,/code: "zh-TW"/);assert.match(selectable,/code: "en"/);
 assert.equal(localRedirect('/q/l0013').url.searchParams.get('lang'),'en');
 assert.equal(localRedirect('/q/l0013?lang=zh-TW').url.searchParams.get('lang'),'en');
 assert.equal(localRedirect('/q/l0014').url.searchParams.get('lang'),'zh-HK');
});
test('all registered links retain valid language and functional selection but reject attribution/market overwrite',()=>{
 for(const x of links)for(const lang of ['en','ko','ja','zh-HK','ms','th']){
  const r=localRedirect('/q/'+x.id+'?lang='+lang+'&market=MO&product=diffuser-500g&quantity=35&purpose=resale&utm_source=wrong&utm_medium=wrong&utm_campaign=wrong&utm_content=wrong&link_id=l9999');
  assert.equal(r.url.searchParams.get('lang'),lang);assert.equal(r.url.searchParams.get('market'),x.market||'MO');
  assert.equal(r.url.searchParams.get('product'),'diffuser-500g');assert.equal(r.url.searchParams.get('quantity'),'35');assert.equal(r.url.searchParams.get('purpose'),'resale');
  for(const [k,v]of Object.entries({utm_source:x.source,utm_medium:x.medium,utm_campaign:x.campaign,utm_content:x.id,link_id:x.id}))assert.equal(r.url.searchParams.get(k),v);
 }
 for(const id of ['l0000','l0017','l9999','L0007','l0007/extra'])assert.equal(localRedirect('/q/'+id),null);
});
test('generator rejects duplicate IDs, unsupported market/language and unsafe destinations',()=>{
 assert.throws(()=>redirectsFor([...links,links[0]]),/unique/);
 for(const patch of [{id:'bad'},{market:'CN'},{language:'zh-TW'},{path:'https://example.invalid'},{placement:'person@example.invalid'},{campaign:''}]){
  assert.throws(()=>redirectsFor(links.map((x,i)=>i?x:{...x,...patch})),/Unreviewed/);
 }
 const nonQr={...config,redirects:[...config.redirects,{source:'/legacy-link',destination:'/products',permanent:false}]};
 assert.deepEqual(mergeQrConfig(nonQr,links),nonQr);
});
