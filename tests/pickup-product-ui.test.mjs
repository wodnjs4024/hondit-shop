import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildSync} from 'esbuild';
const source=fs.readFileSync('src/components/PickupRequestPanel.tsx','utf8');
function bundle(dev){return buildSync({entryPoints:['src/components/PickupRequestPanel.tsx'],bundle:true,write:false,platform:'browser',minify:true,define:{'import.meta.env.DEV':String(dev)}}).outputFiles[0].text}
test('unapproved pickup price is removed from public code and present only in local development',()=>{assert.match(bundle(true),/4e4|40000/);const prod=bundle(false);assert.doesNotMatch(prod,/4e4|40000/);assert.match(source,/disabled=\{size==='500g'&&proposedUnitPrice===null\}/);assert.match(source,/proposed\?<p role="status"/)});
test('comparison uses exact multiplication and distinct existing product assets',()=>{assert.match(source,/q\*proposedUnitPrice/);assert.match(source,/quantity\*proposedUnitPrice/);assert.match(source,/pickupRequestTotal\(q\)/);for(const size of ['350g','500g'])assert.ok(fs.existsSync(`public/images/diffuser-${size}.webp`));assert.doesNotMatch(source,/pickupConfig|fetch\(|paypal|discountRate/)});
