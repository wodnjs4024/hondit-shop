// Magazine layout of Journal articles: full-bleed cover, "How to use" card quoted from the article, materials photos.
// The SEO output (one h1, canonical, Article JSON-LD with the article's own hero image) must stay as it was.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { renderArticlePage } from '../api/_journal-html.js';
import { JOURNAL_FEATURE_IMAGES, coverFor } from '../shared/journal-copy.js';
import { SITE, articlePath, parseBody, usageNote } from '../shared/journal.js';
import { seedArticles } from '../shared/journal-seed.js';

const onDisk = (src) => existsSync(new URL(`../public${src}`, import.meta.url));
const published = (a) => ({ ...a, status: 'published', published_at: '2026-10-25T08:14:00Z', updated_at: '2026-10-25T08:14:00Z' });

test('usageNote quotes the first two sentences of the article’s own usage section', () => {
  assert.equal(usageNote('Intro.\n\n## How it is used\n\nAdd 10–12 drops. Wait. Add more later.\n\n## Care\n\nRinse.'), 'Add 10–12 drops. Wait.');
  assert.equal(usageNote('## 使い方\n\n石を器に入れます。数滴足すだけ。香りを楽しむ。'), '石を器に入れます。数滴足すだけ。');
  assert.equal(usageNote('## 怎麼使用\n\n滴 10 到 12 滴[香氛油](/products/diffuser-350g)。補幾滴即可。'), '滴 10 到 12 滴香氛油。補幾滴即可。');
  assert.equal(usageNote('## What it is\n\nNo usage section here.'), '');
});

test('the four country articles render as a magazine page without losing their SEO structure', async () => {
  const group = seedArticles.filter((a) => a.group_key === 'jeju-volcanic-stone-home-2026-10').map(published);
  assert.equal(group.length, 4);
  for (const article of group) {
    const html = await renderArticlePage({ article, translations: group.filter((t) => t !== article) });
    const doc = new JSDOM(html).window.document;
    const main = doc.querySelector('main.journal-article');
    assert.equal(doc.querySelectorAll('h1').length, 1, article.slug);
    assert.equal(doc.querySelector('link[rel=canonical]').href, SITE + articlePath(article));
    const ld = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent);
    assert.deepEqual(ld.image, [SITE + article.hero_image_url], 'JSON-LD keeps the article’s own hero');
    assert.equal(doc.querySelector('meta[property="og:image"]').content, SITE + article.hero_image_url);

    const cover = coverFor(article);
    assert.ok(cover && onDisk(cover.src));
    assert.equal(main.querySelector('.journal-hero.is-cover img').getAttribute('src'), cover.src);
    assert.ok(main.querySelector('.journal-hero.is-cover img').getAttribute('alt'));
    // The article's own hero and caption are still on the page, as the first picture of the story.
    const own = main.querySelector('.journal-lead-figure img');
    assert.equal(own.getAttribute('src'), article.hero_image_url);
    assert.ok(onDisk(article.hero_image_url));

    const card = main.querySelector('.journal-howto');
    const quoted = card.querySelector('p').textContent;
    assert.ok(quoted.length > 20);
    const bodyText = parseBody(article.body_md).map((b) => b.text || '').join(' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    assert.ok(bodyText.includes(quoted), `${article.slug}: the card only repeats reviewed article text`);
    assert.ok(onDisk(card.querySelector('img').getAttribute('src')));

    const materials = [...main.querySelectorAll('.journal-material img')];
    assert.equal(materials.length, JOURNAL_FEATURE_IMAGES.materials.length);
    for (const img of materials) { assert.ok(onDisk(img.getAttribute('src'))); assert.ok(img.getAttribute('alt')); }
    assert.ok(main.querySelector('.journal-materials-credit').textContent.includes('StoneJeju'));
    assert.ok(main.querySelector('.journal-body h2'));
  }
});

test('an article outside the group keeps its own hero full-bleed and shows no diffuser extras', async () => {
  const article = published({ ...seedArticles[0], group_key: 'other-story', related_products: ['foam-oil'], body_md: 'Plain text.\n\n## Notes\n\nNothing to use.' });
  const doc = new JSDOM(await renderArticlePage({ article })).window.document;
  assert.equal(doc.querySelector('.journal-hero img').getAttribute('src'), article.hero_image_url);
  assert.equal(doc.querySelector('.journal-hero.is-cover'), null);
  assert.equal(doc.querySelector('.journal-lead-figure'), null);
  assert.equal(doc.querySelector('.journal-howto'), null);
  assert.equal(doc.querySelector('.journal-materials'), null);
  assert.equal(doc.querySelector('.journal-hero-tag'), null);
});
