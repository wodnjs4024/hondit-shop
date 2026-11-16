// Answer engines could not tell whether one piece ships to HK/SG/TW, what it costs there, or whether HONDIT is HEJDIN (2026-11-16).
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSeoPage, buildLocalizedSeoPage, catalogProducts } from '../api/_seo-pages.js';
import { termsFor } from '../shared/market-overrides.js';
import { formatMoney, marketBuyingQA, productBuyingTerms } from '../shared/market-buying.js';

const products = catalogProducts([]);
const text = (page) => page.html.replace(/<[^>]+>/g, ' ');
const faqQuestions = (page) => page.jsonLd.filter((d) => d['@type'] === 'FAQPage').flatMap((d) => d.mainEntity.map((q) => q.name));

test('Hong Kong and Taiwan get a plain no-single-piece answer and the delivered price from checkout terms', () => {
  const page = buildLocalizedSeoPage('product', 'zh-HK', { slug: 'diffuser-500g', products, showOrderTerms: true });
  const body = text(page);
  const p = products.find((x) => x.slug === 'diffuser-500g');
  const hk = termsFor(p, 'HK', 5); const tw = termsFor(p, 'TW', 5);
  assert.match(body, /不提供單件寄香港/);
  assert.match(body, /沒有提供單件寄送台灣/);
  assert.ok(body.includes(formatMoney(hk.totalMinor, 'HKD')) && body.includes(formatMoney(tw.totalMinor, 'TWD')));
  const answers = page.html.match(/<section id="buying">[\s\S]*?<\/section>/g).join('');
  assert.ok(!/JPY|¥/.test(answers), 'no yen in the Hong Kong and Taiwan answers');
  assert.ok(faqQuestions(page).includes('可以單件寄到香港嗎？'));
});

test('English product page and FAQ answer single piece, price per currency, shipping, returns and oil', () => {
  for (const page of [buildSeoPage('product', { slug: 'diffuser-350g', products, showOrderTerms: true }), buildSeoPage('faq', { products, showOrderTerms: true })]) {
    const body = text(page);
    for (const needle of ['Shopee Singapore', 'does not ship a single piece', 'SGD', 'HKD', 'TWD', 'no separate shipping charge', '3-5 business days', 'within 7 days', 'refill oil']) assert.ok(body.includes(needle), needle);
  }
  assert.ok(text(buildSeoPage('faq', { products })).includes('HEJDIN (헤이딘)'));
});

test('without live checkout terms no price is invented', () => {
  const page = buildSeoPage('diffuserGuide', { guidePath: '/diffusers/taiwan', products, showOrderTerms: false });
  assert.ok(!/TWD \d/.test(text(page)));
  assert.match(text(page), /訂購頁面/);
});

test('brand disambiguation is in the Organization schema', () => {
  const org = buildSeoPage('about', { products }).jsonLd.find((d) => d['@type'] === 'Organization');
  assert.match(org.disambiguatingDescription, /not HEJDIN/);
});

test('React product page helper uses the same tiers', () => {
  const p = products.find((x) => x.slug === 'diffuser-350g');
  const qa = marketBuyingQA('SG', 'en', productBuyingTerms(p, 'SG'), [p.slug]);
  assert.ok(qa.items[1].a.includes(formatMoney(termsFor(p, 'SG', 5).totalMinor, 'SGD')));
  assert.equal(marketBuyingQA('HK', 'ko', productBuyingTerms(p, 'HK'), [p.slug]), null);
});
