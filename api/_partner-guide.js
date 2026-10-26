import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {approvedPartners} from '../shared/partners.js';
// HTML-only route: no database, messaging or payment access.
export default async function handler(req,res){
 if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.end();return;}
 const slug=typeof req.query?.slug==='string'?req.query.slug:'';
 const found=approvedPartners.some(p=>p.slug===slug)||(process.env.VERCEL_ENV==='preview'&&process.env.PARTNER_DEMO==='1'&&slug==='demo');
 res.statusCode=found?200:404;res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');
 try {const html=await readFile(join(process.cwd(),'dist','app.html'),'utf8').catch(()=>readFile(join(process.cwd(),'dist','index.html'),'utf8'));res.end(req.method==='HEAD'?'':html);}
 catch {res.statusCode=found?503:404;res.end('<!doctype html><html><body><h1>404</h1><a href="/products">HONDIT</a></body></html>');}
}
