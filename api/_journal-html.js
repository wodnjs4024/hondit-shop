// Server-rendered Journal pages: the built SPA shell (dist/index.html) with the article's own title, description,
// canonical, hreflang, Open Graph, Article JSON-LD and the full article markup inside #root, so search engines and
// AI answer engines read the text without running JavaScript. React then mounts on top with the same data.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { JOURNAL_COPY, PRODUCT_IMAGES, PRODUCT_NAMES, copyFor } from '../shared/journal-copy.js';
import { JOURNAL_LANGUAGES, SITE, articlePath, formatDate, inlineSegments, languageByCode, marketLink, parseBody } from '../shared/journal.js';

export { JOURNAL_COPY, copyFor };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const abs = (url) => (!url ? '' : /^https?:\/\//.test(url) ? url : SITE + url);


function inline(text, language) {
  return inlineSegments(text).map((s) => (s.href ? `<a href="${esc(language ? marketLink(s.href, language) : s.href)}">${esc(s.text)}</a>` : esc(s.text))).join('');
}
export function bodyHtml(md, language) {
  return parseBody(md).map((b) => {
    if (b.type === 'h2') return `<h2>${esc(b.text)}</h2>`;
    if (b.type === 'h3') return `<h3>${esc(b.text)}</h3>`;
    if (b.type === 'quote') return `<blockquote>${inline(b.text, language)}</blockquote>`;
    if (b.type === 'list') return `<ul>${b.items.map((i) => `<li>${inline(i, language)}</li>`).join('')}</ul>`;
    if (b.type === 'image') return `<figure><img src="${esc(b.src)}" alt="${esc(b.alt)}" loading="lazy" decoding="async" width="1200" height="900">${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
    return `<p>${inline(b.text, language)}</p>`;
  }).join('\n');
}

export function articleJsonLd(article, translations = []) {
  const url = SITE + articlePath(article);
  return [{
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seo_description || article.dek,
    inLanguage: article.language,
    image: [abs(article.hero_image_url)],
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: { '@type': 'Organization', name: 'HONDIT', url: SITE },
    publisher: { '@type': 'Organization', name: 'HONDIT', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/images/hondit-logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'Blog', name: 'HONDIT Journal', url: `${SITE}/journal` },
    about: (article.related_products || []).map((slug) => ({ '@type': 'Product', name: PRODUCT_NAMES[slug] || slug, url: `${SITE}/products/${slug}`, brand: { '@type': 'Brand', name: 'StoneJeju' } })),
    citation: (article.sources || []).map((s) => s.url),
    ...(translations.length ? { workTranslation: translations.map((t) => ({ '@type': 'Article', inLanguage: t.language, url: SITE + articlePath(t) })) } : {}),
  }, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HONDIT', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE}/journal` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  }];
}

export function articleMarkup(article, translations = [], { preview = false } = {}) {
  const c = copyFor(article.language);
  const updated = article.updated_at && article.published_at && new Date(article.updated_at) - new Date(article.published_at) > 3600 * 1000;
  const products = (article.related_products || []).map((slug) => `<li><a class="journal-product" href="${esc(marketLink(`/products/${slug}`, article.language))}"><img src="${PRODUCT_IMAGES[slug] || ''}" alt="" width="160" height="160" loading="lazy"><span>${esc(PRODUCT_NAMES[slug] || slug)}</span><b>${esc(c.shop)}</b></a></li>`).join('');
  const cta = article.cta_type === 'partners' ? ['/partners', c.partners] : ['/contact', c.contact];
  return `<main class="journal-article" lang="${esc(article.language)}">
${preview ? `<p class="journal-preview-flag">${esc(c.preview)}</p>` : ''}
<nav class="journal-crumbs"><a href="/journal/${esc(languageByCode(article.language)?.segment || 'en')}">${esc(c.kicker)}</a></nav>
<header class="journal-article-head">
<h1>${esc(article.title)}</h1>
<p class="journal-dek">${esc(article.dek)}</p>
<p class="journal-byline"><span>${esc(c.by)} ${esc(c.authorTypes[article.author_type] || article.author_name || 'HONDIT')}</span>${article.published_at ? ` · <time datetime="${esc(article.published_at)}">${esc(c.published)} ${esc(formatDate(article.published_at, article.language))}</time>` : ''}${updated ? ` · <time datetime="${esc(article.updated_at)}">${esc(c.updated)} ${esc(formatDate(article.updated_at, article.language))}</time>` : ''}</p>
</header>
${article.hero_image_url ? `<figure class="journal-hero"><img src="${esc(article.hero_image_url)}" alt="${esc(article.hero_image_alt)}" width="1600" height="1100" fetchpriority="high">${article.hero_image_caption || article.hero_image_credit ? `<figcaption>${esc(article.hero_image_caption || '')}${article.hero_image_credit ? ` <small>${esc(article.hero_image_credit)}</small>` : ''}</figcaption>` : ''}</figure>` : ''}
<div class="journal-body">
${bodyHtml(article.body_md, article.language)}
</div>
${products ? `<aside class="journal-related"><h2>${esc(c.related)}</h2><ul>${products}</ul><a class="journal-cta" href="${esc(marketLink(cta[0], article.language))}">${esc(cta[1])}</a></aside>` : ''}
${(article.sources || []).length ? `<section class="journal-sources"><h2>${esc(c.sources)}</h2><ol>${article.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ol></section>` : ''}
${translations.length ? `<nav class="journal-translations"><span>${esc(c.other)}</span>${translations.map((t) => `<a href="${esc(articlePath(t))}" hreflang="${esc(t.language)}" lang="${esc(t.language)}">${esc(languageByCode(t.language)?.label)}</a>`).join('')}</nav>` : ''}
</main>`;
}

export function listMarkup(articles, language, { preview = false } = {}) {
  const c = copyFor(language || 'en');
  const tabs = `<nav class="journal-tabs"><a href="/journal"${!language ? ' aria-current="page"' : ''}>All</a>${JOURNAL_LANGUAGES.map((l) => `<a href="/journal/${l.segment}" lang="${l.code}"${language === l.code ? ' aria-current="page"' : ''}>${esc(l.label)}</a>`).join('')}</nav>`;
  const cards = articles.map((a) => `<li class="journal-card"><a href="${esc(articlePath(a))}" lang="${esc(a.language)}"><img src="${esc(a.hero_image_url || '/images/hondit-collection-hero.webp')}" alt="${esc(a.hero_image_alt || '')}" width="800" height="600" loading="lazy"><span class="journal-card-lang">${esc(languageByCode(a.language)?.label)}</span><h2>${esc(a.title)}</h2><p>${esc(a.dek)}</p></a></li>`).join('');
  return `<main class="journal-index">
${preview ? `<p class="journal-preview-flag">${esc(c.preview)}</p>` : ''}
<header class="journal-index-head"><p class="v23-eyebrow"><span></span> ${esc(c.kicker)}</p><h1>${esc(c.listTitle)}</h1><p>${esc(c.listDek)}</p></header>
${tabs}
${cards ? `<ul class="journal-grid">${cards}</ul>` : `<p class="journal-empty">${esc(c.empty)}</p>`}
</main>`;
}

let shellCache = null;
export async function shell() {
  if (shellCache) return shellCache;
  // On Vercel the build renames index.html to app.html so that "/" reaches the server-rendered home page (scripts/vercel-shell.mjs).
  try { shellCache = await readFile(join(process.cwd(), 'dist', 'app.html'), 'utf8').catch(() => readFile(join(process.cwd(), 'dist', 'index.html'), 'utf8')); }
  catch { shellCache = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>HONDIT</title></head><body><div id="root"></div></body></html>'; }
  return shellCache;
}

export function setHead(html, { title, description, canonical, robots, image, type, locale, alternates = [], jsonLd = [], lang }) {
  const tag = (attr, key, value) => `<meta ${attr}="${key}" content="${esc(value)}" />`;
  let out = html
    .replace(/<html lang="[^"]*"/, `<html lang="${esc(lang)}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, tag('name', 'description', description))
    .replace(/<meta\s+property="og:type"[\s\S]*?\/>/, tag('property', 'og:type', type))
    .replace(/<meta\s+property="og:url"[\s\S]*?\/>/, canonical ? tag('property', 'og:url', canonical) : (m) => m)
    .replace(/<meta\s+property="og:title"[\s\S]*?\/>/, tag('property', 'og:title', title))
    .replace(/<meta\s+property="og:description"[\s\S]*?\/>/, tag('property', 'og:description', description))
    .replace(/<meta\s+property="og:image"[\s\S]*?\/>/, tag('property', 'og:image', image))
    .replace(/<meta\s+name="twitter:title"[\s\S]*?\/>/, tag('name', 'twitter:title', title))
    .replace(/<meta\s+name="twitter:description"[\s\S]*?\/>/, tag('name', 'twitter:description', description))
    .replace(/<meta\s+name="twitter:image"[\s\S]*?\/>/, tag('name', 'twitter:image', image));
  const extra = [
    ...(canonical ? [`<link rel="canonical" href="${esc(canonical)}" />`] : []),
    tag('name', 'robots', robots),
    tag('property', 'og:locale', locale),
    ...alternates.map((a) => `<link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(a.href)}" />`),
    ...jsonLd.map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');
  return out.replace('</head>', `    ${extra}\n  </head>`);
}

const embed = (data) => `<script id="journal-ssr" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const withRoot = (html, markup, data) => html.replace('<div id="root"></div>', `<div id="root">${markup}</div>${embed(data)}`);

export async function renderArticlePage({ article, translations = [], preview = false }) {
  const lang = languageByCode(article.language);
  const canonical = SITE + articlePath(article);
  const alternates = preview ? [] : [{ hreflang: lang.hreflang, href: canonical }, ...translations.map((t) => ({ hreflang: languageByCode(t.language)?.hreflang, href: SITE + articlePath(t) }))];
  if (alternates.length > 1) alternates.push({ hreflang: 'x-default', href: SITE + articlePath(translations.find((t) => t.language === 'en') || article) });
  const html = setHead(await shell(), {
    title: article.seo_title || `${article.title} | HONDIT Journal`,
    description: article.seo_description || article.dek,
    canonical,
    robots: preview ? 'noindex,nofollow' : 'index,follow,max-image-preview:large',
    image: abs(article.hero_image_url) || `${SITE}/images/hondit-collection-hero.webp`,
    type: 'article',
    locale: lang.ogLocale,
    alternates,
    jsonLd: preview ? [] : articleJsonLd(article, translations),
    lang: article.language,
  });
  return withRoot(html, articleMarkup(article, translations, { preview }), { kind: 'article', article, translations, preview });
}

export async function renderListPage({ articles, language, preview = false }) {
  const lang = language ? languageByCode(language) : null;
  const c = copyFor(language || 'en');
  const canonical = `${SITE}/journal${lang ? `/${lang.segment}` : ''}`;
  const empty = !articles.length;
  const html = setHead(await shell(), {
    title: `${c.listTitle} | HONDIT Journal`,
    description: c.listDek,
    canonical,
    // An empty list (or a preview of drafts) is not worth indexing; it becomes indexable with the first published story.
    robots: preview || empty ? 'noindex,follow' : 'index,follow',
    image: abs(articles[0]?.hero_image_url) || `${SITE}/images/hondit-collection-hero.webp`,
    type: 'website',
    locale: lang?.ogLocale || 'en_SG',
    alternates: preview || empty ? [] : [...JOURNAL_LANGUAGES.map((l) => ({ hreflang: l.hreflang, href: `${SITE}/journal/${l.segment}` })), { hreflang: 'x-default', href: `${SITE}/journal` }],
    jsonLd: preview || empty ? [] : [{ '@context': 'https://schema.org', '@type': 'Blog', name: 'HONDIT Journal', url: canonical, inLanguage: language || undefined, blogPost: articles.slice(0, 20).map((a) => ({ '@type': 'BlogPosting', headline: a.title, url: SITE + articlePath(a), datePublished: a.published_at, inLanguage: a.language })) }],
    lang: language || 'en',
  });
  return withRoot(html, listMarkup(articles, language, { preview }), { kind: 'list', language: language || null, articles, preview });
}

export async function renderNotFound() {
  const html = setHead(await shell(), { title: 'Page Not Found | HONDIT Journal', description: 'This HONDIT Journal page could not be found.', canonical: `${SITE}/journal`, robots: 'noindex,follow', image: `${SITE}/images/hondit-collection-hero.webp`, type: 'website', locale: 'en_SG', lang: 'en' });
  return html;
}
