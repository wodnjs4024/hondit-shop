import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {getTransformedRoutes,normalizeRoutes} from '../.qa-tools/route-runtime/node_modules/@vercel/routing-utils/dist/index.js';
import {defaultProducts} from '../api/_bulk-data.js';import {toClientProduct} from '../api/_utils.js';import {pickupConfig} from '../shared/pickup.js';
const dir=path.resolve('.qa-tools/isolated-preview'),out=path.join(dir,'.vercel/output'),pub=path.join(out,'static');
await fs.mkdir(pub,{recursive:true});await fs.cp('dist',pub,{recursive:true});await fs.mkdir(path.join(pub,'__preview'),{recursive:true});
const config=JSON.parse(await fs.readFile('vercel.json','utf8'));
const redirects=getTransformedRoutes({redirects:config.redirects});assert.equal(redirects.error,null);
const spa=getTransformedRoutes({rewrites:config.rewrites.filter(x=>x.destination==='/app.html')});assert.equal(spa.error,null);
const csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; media-src 'self'; connect-src 'self'; frame-src 'none'; form-action 'none'; base-uri 'self'; frame-ancestors 'none'";
const routes=[{src:'/(.*)',headers:{'Content-Security-Policy':csp,'X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'},continue:true},...redirects.routes,
 {src:'^/q/(.*)$',dest:'/__preview/qr-not-found.json',status:404},
 {src:'^/api/paypal/config$',methods:['GET'],dest:'/__preview/paypal-config.json'},
 {src:'^/api/products$',methods:['GET'],dest:'/__preview/products.json'},
 {src:'^/api/pickup$',methods:['GET'],dest:'/__preview/pickup.json'},
 {src:'^/api(?:/.*)?$',dest:'/__preview/blocked.json',status:403},
 {handle:'filesystem'},...spa.routes.filter(route=>!route.handle),{src:'/(.*)',dest:'/index.html'}];
const normalized=normalizeRoutes(routes);assert.equal(normalized.error,null,JSON.stringify(normalized.error));
await fs.writeFile(path.join(out,'config.json'),JSON.stringify({version:3,routes:normalized.routes},null,2));
for(const [name,data]of Object.entries({'qr-not-found':{error:'QR link not registered',home:'/'},'paypal-config':{checkoutEnabled:false,clientId:'',mode:'sandbox'},products:{products:defaultProducts.map(toClientProduct)},pickup:pickupConfig,blocked:{error:'Read-only preview: payments and data changes are disabled.'}}))await fs.writeFile(path.join(pub,'__preview',name+'.json'),JSON.stringify(data));
const projectFile=process.env.HONDIT_VERCEL_PROJECT_FILE||path.resolve('../../.vercel/project.json');
const project=JSON.parse(await fs.readFile(projectFile,'utf8'));
assert.equal(project.projectId,'prj_vrdIEoaMB15T9kDx0sdWXQ6Mkf6t','Existing HONDIT project required');
await fs.mkdir(path.join(dir,'.vercel'),{recursive:true});await fs.writeFile(path.join(dir,'.vercel/project.json'),JSON.stringify(project));await fs.writeFile(path.join(dir,'vercel.json'),'{}');
const files=[];async function scan(p){for(const f of await fs.readdir(p,{withFileTypes:true})){const full=path.join(p,f.name);if(f.isDirectory())await scan(full);else files.push({path:path.relative(out,full).replaceAll('\\','/'),bytes:(await fs.stat(full)).size,sha256:createHash('sha256').update(await fs.readFile(full)).digest('hex')});}}await scan(out);
assert.equal(files.some(f=>/\.env|\.func\//.test(f.path)),false);assert.equal(files.some(f=>f.path.startsWith('functions/')),false);
const manifest={projectName:project.projectName,projectId:project.projectId,orgId:project.orgId,target:'preview',functions:0,productionDBCredentialsIncluded:false,externalConnectionsBlockedByCSP:true,gaEnabled:false,paypalEnabled:false,files:files.length,totalBytes:files.reduce((a,f)=>a+f.bytes,0),routesHash:createHash('sha256').update(JSON.stringify(normalized.routes)).digest('hex'),staticFileHashes:files};
await fs.writeFile('.qa-tools/isolated-preview-manifest.json',JSON.stringify(manifest,null,2));console.log(JSON.stringify({...manifest,staticFileHashes:undefined}));
