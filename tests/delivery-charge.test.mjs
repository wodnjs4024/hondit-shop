import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveDeliveryCharge} from '../shared/delivery-charge.js';
import {resolveCheckoutTerms,checkoutConditions,paypalCurrencyDigits} from '../shared/checkout-terms.js';
import {defaultProducts} from '../api/_bulk-data.js';
const p=defaultProducts.find(p=>p.slug==='diffuser-350g');
const condition=checkoutConditions.find(c=>c.market==='SG'&&c.sku===p.slug&&c.minimum===20);
const rule={minimum:20,maximum:50,approval:'confirmed',currency:'SGD',mode:'per-unit',includedQuantity:20,chargeMinor:0,incrementMinor:123,version:'synthetic-fixture-only'};
test('included approved bundles never add freight, including two SG trial prices',()=>{
 for(const [sku,q,total] of [['diffuser-350g',10,23000],['diffuser-500g',10,50000],['diffuser-350g',20,42000],['diffuser-500g',20,92000]]){
 const d=resolveCheckoutTerms(defaultProducts.find(p=>p.slug===sku),'SG',q);
 assert.equal(d.status,'direct');assert.equal(d.totalMinor,total);assert.equal(d.shippingMinor,0);assert.equal(d.productTotalMinor,total);assert.equal(d.shippingIncluded,true);
 }
});
test('synthetic approved delivery calculation combines exact integer charges server-side',()=>{
 const c={...condition,deliveryRules:[rule]};const d=resolveCheckoutTerms(p,'SG',23,[c]);
 assert.equal(d.status,'direct');assert.equal(d.productTotalMinor,48300);assert.equal(d.shippingMinor,369);assert.equal(d.totalMinor,48669);assert.equal(d.classification,'shipping_calculation_required');
 assert.equal(resolveCheckoutTerms(p,'SG',51,[c]).status,'request');
});
test('seller absorbs freight differences for SG 20+ and overlapping rules are rejected',()=>{
 for(const q of [21,23,35,50,100]){const d=resolveCheckoutTerms({...p,stockQuantity:1000},'SG',q);assert.equal(d.status,'direct');assert.equal(d.totalMinor,2100*q);assert.equal(d.shippingMinor,0)};
 assert.equal(resolveDeliveryCharge({...condition,deliveryRules:[rule,rule]},21).reason,'duplicate_delivery_rules');
});
test('invalid, unapproved or mismatched-currency delivery charges cannot be billed',()=>{
 for(const overrides of [{chargeMinor:-1},{incrementMinor:1.5},{approval:'pending'},{currency:'MYR'},{incrementMinor:Number.MAX_SAFE_INTEGER}])assert.equal(resolveDeliveryCharge({...condition,deliveryRules:[{...rule,...overrides}]},23).confirmed,false);
 assert.equal(resolveDeliveryCharge(condition,NaN).confirmed,false);
 assert.equal(resolveCheckoutTerms(p,'SG',23,[{...condition,priceApproval:'proposed',deliveryRules:[rule]}]).status,'request');
});
test('currency minor units are not globally cents',()=>{
 assert.equal(paypalCurrencyDigits('JPY'),0);assert.equal(paypalCurrencyDigits('TWD'),0);assert.equal(paypalCurrencyDigits('SGD'),2);
});

test('SG included general price covers every integer 20..9999 subject to inventory',()=>{
 for(const sku of ['diffuser-350g','diffuser-500g']) {
  const product={...defaultProducts.find(p=>p.slug===sku),stockQuantity:9999};
  for(let q=20;q<=9999;q++){
   const d=resolveCheckoutTerms(product,'SG',q);
   assert.equal(d.status,'direct');assert.equal(d.totalMinor,(sku==='diffuser-350g'?2100:4600)*q);assert.equal(d.shippingMinor,0);assert.equal(d.shippingIncluded,true);
  }
  assert.equal(resolveCheckoutTerms({...product,stockQuantity:99},'SG',100).reason,'stock_limit');
  for(const q of [15,19,10000,'20.1','1e2','',-1])assert.equal(resolveCheckoutTerms(product,'SG',q).status,'unavailable');
 }
});
