import test from 'node:test';
import assert from 'node:assert/strict';
import { merchantOffer, merchantSchema } from '../api/_merchant.js';
import { defaultProducts } from '../api/_bulk-data.js';

const offerFor = (slug, market, lang) => {
  const product = defaultProducts.find((p) => p.slug === slug);
  return merchantOffer({ ...product, active: true, purchaseEnabled: true, stock: 240 }, market, lang);
};

test('merchant structured data carries delivery time and a return policy that mirror the published policies', () => {
  for (const [market, lang] of [['SG', 'en'], ['HK', 'zh-HK'], ['JP', 'ja'], ['TW', 'zh-TW'], ['TH', 'th'], ['MY', 'ms']]) {
    const { item, reason } = offerFor('diffuser-350g', market, lang);
    assert.ok(item, `${market}: ${reason}`);
    const offer = merchantSchema(item).offers;
    const transit = offer.shippingDetails.deliveryTime.transitTime;
    assert.deepEqual([transit.minValue, transit.maxValue, transit.unitCode], [3, 5, 'DAY']);
    const policy = offer.hasMerchantReturnPolicy;
    assert.equal(policy.applicableCountry, market);
    assert.equal(policy.returnPolicyCategory, 'https://schema.org/MerchantReturnNotPermitted');
    assert.match(policy.merchantReturnLink, /\/policy\/refund\?market=/);
  }
});

test('diffusers list their real product photos as additional images, never the main image twice', () => {
  for (const slug of ['diffuser-350g', 'diffuser-500g']) {
    const { item } = offerFor(slug, 'SG', 'en');
    assert.ok(item.extraImages.length >= 3, slug);
    assert.ok(!item.extraImages.includes(item.image));
    assert.equal(new Set(item.extraImages).size, item.extraImages.length);
  }
});
