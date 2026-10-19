import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { JSDOM } from 'jsdom';
import handler from '../api/products.js';
import { defaultProducts } from '../api/_bulk-data.js';

// Real local HTTP -> existing API handler -> synthetic DB response. No external connections.
test('HTTP feed destinations expose matching initial HTML and preserve checkout selections',async()=>{
 const original=globalThis.fetch;
 const saved={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY};
 Object.assign(process.env,{SUPABASE_URL:'https://mock.invalid',SUPABASE_SERVICE_ROLE_KEY:'mock'});
 globalThis.fetch=async(input,options)=>{
  const url=new URL(String(input));
  if(url.hostname==='mock.invalid')return new Response(JSON.stringify(url.pathname.endsWith('/site_settings')?[{checkout_enabled:true}]:defaultProducts),{status:200});
  if(url.hostname==='127.0.0.1')return original(input,options);
  throw new Error('External connection refused by test');
 };
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');req.query=Object.fromEntries(url.searchParams);
  const feed=/^\/feeds\/google\/([^/]+)(?:\/([^/]+))?$/.exec(url.pathname);
  const page=/^\/merchant\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(url.pathname);
  if(feed){req.query.feed='google';req.query.market=feed[1];if(feed[2])req.query.lang=feed[2];}
  else if(page){req.query.market=page[1];req.query.lang=page[2];req.query.merchantSlug=page[3];}
  else {res.writeHead(404);res.end();return;}
  res.status=function(code){this.statusCode=code;return this;};
  handler(req,res).catch(()=>{res.writeHead(500);res.end();});
 });
 try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
  for(const market of ['SG','JP','HK','TW','TH','MY']) {
  const response=await fetch(`${origin}/feeds/google/${market}/en`);assert.equal(response.status,200);
  const doc=new JSDOM(await response.text(),{contentType:'application/xml'}).window.document;
  for(const node of doc.querySelectorAll('item')){
   const field=name=>node.getElementsByTagNameNS('http://base.google.com/ns/1.0',name)[0]?.textContent;
   const url=new URL(field('link'));const page=await fetch(origin+url.pathname+url.search);
   assert.equal(page.status,200);const html=new JSDOM(await page.text()).window.document;
   const schema=JSON.parse(html.querySelector('script').textContent);
   assert.equal(`${schema.offers.price} ${schema.offers.priceCurrency}`,field('price'));
   assert.equal(schema.name,field('title'));assert.equal(schema.image[0],field('image_link'));
   assert.equal(html.querySelector('.button').href.includes(`quantity=${url.searchParams.get('quantity')}`),true);
   const head=await fetch(origin+url.pathname+url.search,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  }
  }
  assert.equal((await fetch(`${origin}/feeds/google/MO`)).status,404);
  assert.equal((await fetch(`${origin}/feeds/google/SG`,{method:'POST'})).status,405);
 }finally{
  await new Promise(resolve=>server.close(resolve));globalThis.fetch=original;
  for(const[k,v]of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
});
