import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {termsFor} from '../shared/market-overrides.js';
import {resolveCheckoutTerms} from '../shared/checkout-terms.js';
import {diffuserQuantity} from '../shared/diffuser-quantity.js';
const original=execFileSync('git',['show','caba579:shared/checkout-terms.js'],{encoding:'utf8'}).replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL('../shared/'+path.slice(2),import.meta.url).href}'`);
const before=await import('data:text/javascript;base64,'+Buffer.from(original).toString('base64'));
const totals={SG:[12900,26900],JP:[17800,34400],HK:[86000,168000],TW:[3650,7150],TH:[355000,715000],MY:[13781,28031],BN:[15000,29500],MO:[89321,175243]};
for(const [market,prices] of Object.entries(totals))for(const [i,slug] of ['diffuser-350g','diffuser-500g'].entries()){
 const p={slug,active:true,purchaseEnabled:true,stockQuantity:100,packQuantity:20};
 test(`${market} ${slug}: five exact approved total and no extra shipping`,()=>{const d=termsFor(p,market,5);assert.equal(d.status,'direct');assert.equal(d.totalMinor,prices[i]);assert.equal(d.shippingMinor,0);assert.equal(d.shippingIncluded,true);});
 test(`${market} ${slug}: existing 10/20/custom decisions unchanged`,()=>{for(const q of [10,20,21,26,35,40])assert.deepEqual(resolveCheckoutTerms(p,market,q),before.resolveCheckoutTerms(p,market,q));});
}
test('stock, hidden market, quote-only and inactive gates remain enforced',()=>{
 assert.equal(termsFor({slug:'diffuser-350g',stockQuantity:4},'SG',5).status,'unavailable');
 assert.equal(termsFor({slug:'diffuser-350g',markets:{SG:'hidden'}},'SG',5).status,'unavailable');
 assert.equal(termsFor({slug:'diffuser-350g',markets:{SG:'quote'}},'SG',5).status,'request');
 assert.equal(termsFor({slug:'diffuser-350g',active:false},'SG',5).status,'unavailable');
 for(const q of [1,4,6,9,11,19,'5.5','-5','5x'])assert.equal(diffuserQuantity(q).valid,false);
});
