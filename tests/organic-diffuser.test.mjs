import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import handler from '../api/products.js';
import { sitemap } from '../api/_feeds.js';
import { defaultProducts } from '../api/_bulk-data.js';
import { safeLanding } from '../shared/tracking-policy.js';
import { diffuserGuide, diffuserSpecs } from '../shared/diffuser-guide.js';
import { diffuserMarkets, diffuserProductLocale, diffuserSlugs } from '../shared/diffuser-search-routes.js';
import { canonicalSeoLanguage } from '../shared/seo-locales.js';

const site = 'https://hondit-shop.vercel.app';
async function request(query, method = 'GET') {
  const res = { headers: {}, statusCode: 0, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b || ''; } };
  await handler({ method, query, headers: {} }, res);
  return res;
}
const documentOf = (body) => new JSDOM(body, { url: site }).window.document;
const alternateMap = (doc) => Object.fromEntries([...doc.querySelectorAll('link[hreflang]')].map((node) => [node.hreflang, node.href]));

test('regional guides give bots and buyers the same localized answer, maker evidence and correct order links', async () => {
  let alternate;
  for (const option of Object.values(diffuserMarkets)) {
    const query = { seoPage: 'diffuserGuide', seoGuide: option.path.split('/')[2], market: 'MY', utm_source: 'example', lang: 'ko' };
    const response = await request(query);
    assert.equal(response.statusCode, 200);
    const doc = documentOf(response.body);
    const guide = diffuserGuide(option);
    assert.equal(doc.documentElement.lang, option.lang);
    assert.equal(doc.querySelector('link[rel="canonical"]').href, site + option.path);
    assert.equal(doc.querySelector('h1').textContent, guide.title);
    assert.ok(doc.body.textContent.includes(guide.buying));
    assert.equal(alternateMap(doc)[option.hreflang], site + option.path);
    alternate ??= alternateMap(doc);
    assert.deepEqual(alternateMap(doc), alternate);
    for (const product of guide.products) {
      const order = [...doc.querySelectorAll('a')].find((a) => a.getAttribute('href') === product.orderPath);
      assert.ok(order);
      assert.equal(new URL(order.href).searchParams.get('market'), option.market);
      assert.ok(doc.querySelector(`a[href="${diffuserSpecs[product.slug].source}"]`));
      assert.ok(doc.querySelector(`a[href="${product.detailsPath}"]`));
    }
    assert.ok(!response.body.includes('utm_source') && !response.body.includes('"@type":"Offer"'));
    assert.equal(safeLanding(site + option.path), option.path);
    assert.equal((await request(query, 'HEAD')).body, '');
  }
  assert.equal((await request({ seoPage: 'diffuserGuide', seoGuide: 'unsupported' })).statusCode, 404);
});

test('localized product market aliases share the live language canonical and the sitemap advertises it once', async () => {
  const xml = new JSDOM(sitemap(defaultProducts), { contentType: 'application/xml' }).window.document;
  const urls = [...xml.querySelectorAll('loc')].map((loc) => loc.textContent);
  assert.equal(new Set(urls).size, urls.length);
  for (const slug of diffuserSlugs) {
    for (const option of Object.values(diffuserMarkets)) {
      const response = await request({ seoPage: 'product', seoSlug: slug, market: option.market, lang: option.lang, quantity: '20', utm_source: 'example' });
      const doc = documentOf(response.body);
      const lang = canonicalSeoLanguage(option.lang, '/products/' + slug);
      const url = site + '/products/' + slug + (lang === 'en' ? '' : '?lang=' + lang);
      assert.equal(response.statusCode, 200);
      assert.equal(doc.querySelector('link[rel="canonical"]').href, url);
      assert.equal(alternateMap(doc)[lang], url);
      assert.ok(urls.includes(url));
      assert.match(doc.body.textContent, /StoneJeju/);
      assert.doesNotMatch(response.body, /"@type":"Offer"|utm_source/);
    }
  }
  assert.ok(Object.values(diffuserMarkets).every((option) => urls.includes(site + option.path)));
  assert.ok(urls.every(url => !url.includes('market=') && !url.includes('utm_')));
});

test('Thai product canonicals reciprocate with the English page and route visitors to the Thai storefront', async () => {
  for (const slug of diffuserSlugs) {
    const path = '/products/' + slug;
    const thai = documentOf((await request({ seoPage: 'product', seoSlug: slug, lang: 'th' })).body);
    const english = documentOf((await request({ seoPage: 'product', seoSlug: slug })).body);
    assert.equal(thai.documentElement.lang, 'th');
    assert.match(thai.querySelector('h1').textContent, /ดิฟฟิวเซอร์หินภูเขาไฟเชจู/);
    assert.equal(alternateMap(english)['th-TH'], site + path + '?lang=th');
    assert.deepEqual(alternateMap(thai), alternateMap(english));
    assert.ok(thai.querySelector('main a[href="/diffusers/thailand"]'));
    assert.ok(thai.querySelector(`main a[href="/bulk-orders/${slug}?market=TH&lang=th"]`));
    assert.equal(diffuserProductLocale(path, '?lang=th')?.option.market, 'TH');
    assert.equal(diffuserProductLocale(path, '?market=SG&lang=th'), undefined);
  }
  const cleanser = documentOf((await request({ seoPage: 'product', seoSlug: 'foam-oil', lang: 'th' })).body);
  assert.equal(alternateMap(cleanser)['th-TH'], undefined);
  assert.equal(cleanser.querySelector('link[rel="canonical"]').href, site + '/products/foam-oil');
});
