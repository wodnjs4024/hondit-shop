// XML and HTML use the same live, approved merchant offer. No fallback to guessed market data.
import { SITE, merchantMarket, merchantOffer, escapeMarkup as esc } from './_merchant.js';
export { SITE } from './_merchant.js';
import { articlePath, isPublic, languageByCode } from '../shared/journal.js';
import { SEO_LANGUAGES, HREFLANGS, LOCALES } from '../shared/seo-locales.js';
import { storefrontCatalog } from '../shared/storefront-catalog.js';
export function feedItem(product, market = 'SG', language) { return merchantOffer(product, market, language).item || null; }
export function googleFeed(products, market = 'SG', language) {
  const channel = merchantMarket(market, language);
  if (!channel) throw new RangeError('Merchant market/language not enabled');
  const items = products.map(p => feedItem(p, market, channel.language)).filter(Boolean);
  const tag = (name, value) => `      <g:${name}>${esc(value)}</g:${name}>`;
  const body = items.map(item => `    <item>\n${[
    tag('id',item.id),tag('title',item.title),tag('description',item.description),tag('link',item.link),tag('image_link',item.image),
    ...item.extraImages.map(url => tag('additional_image_link',url)),tag('availability',item.availability),tag('price',item.price),
    tag('brand',item.brand),tag('condition','new'),
    ...(item.gtin ? [tag('gtin',item.gtin)] : []),...(item.mpn ? [tag('mpn',item.mpn)] : []),
    ...(item.identifierExists === false ? [tag('identifier_exists','no')] : []),
    `      <g:shipping><g:country>${market}</g:country><g:price>${esc(item.shippingPrice)}</g:price></g:shipping>`
  ].join('\n')}\n    </item>`).join('\n');
  const feedCopy = {
    en:['Approved minimum-quantity offers'], ja:['承認済みの最小注文数商品'],
    'zh-HK':['已核准的最低訂購量商品'], 'zh-TW':['已核准的最低訂購量商品'],
    th:['ข้อเสนอขั้นต่ำที่ได้รับอนุมัติ'], ms:['Tawaran kuantiti minimum yang diluluskan']
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>
<title>HONDIT ${market}</title><link>${SITE}/?market=${market}&amp;lang=${channel.language}</link><description>${esc(feedCopy[channel.language]?.[0] || feedCopy.en[0])}</description>
${body}
</channel></rss>\n`;
}

const STATIC_PAGES = ["/", "/products", "/bulk-orders", "/jeju", "/about", "/faq", "/partners", "/shipping", "/contact", "/policy/refund", "/policy/shipping", "/policy/privacy", "/policy/terms"];

// Pages with language versions (?lang=ko|ja|zh-HK). Each version is listed with hreflang links to all of them.
const isLocalized = (url) => ["/", "/products", "/bulk-orders", "/jeju", "/about", "/faq"].includes(url) || (url.startsWith("/products/") && Boolean(LOCALES.ja.products[url.slice(10)]));
const langUrl = (url, lang) => SITE + url + (lang === "en" ? "" : `?lang=${lang}`);
const languageLinks = (url) => [
  ...SEO_LANGUAGES.flatMap((lang) => HREFLANGS[lang].map((h) => `\n    <xhtml:link rel="alternate" hreflang="${h}" href="${esc(langUrl(url, lang))}"/>`)),
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(langUrl(url, "en"))}"/>`,
].join("");
const imageFor = (url) => {
  const slug = url.startsWith("/products/") ? url.slice(10) : "";
  const image = storefrontCatalog.find((p) => p.slug === slug)?.image;
  return image ? `\n    <image:image><image:loc>${esc(SITE + image)}</image:loc></image:image>` : "";
};

export function sitemap(products, today = new Date().toISOString().slice(0, 10), journal = []) {
  const live = products.filter((p) => !["draft", "hidden"].includes(p.status));
  const urls = [
    ...STATIC_PAGES,
    ...live.map((p) => `/products/${p.slug}`),
    ...live.filter((p) => ["foam-oil", "foaming-cleanser", "cleansing-water", "diffuser-350g", "diffuser-500g"].includes(p.slug)).map((p) => `/bulk-orders/${p.slug}`),
  ];
  // Published Journal articles only (the caller passes nothing else). Translations of one story point at each other.
  const articles = journal.filter(isPublic);
  const articleEntries = articles.map((a) => {
    const group = a.group_key ? articles.filter((t) => t.group_key === a.group_key) : [a];
    const alternates = group.length > 1 ? group.map((t) => `\n    <xhtml:link rel="alternate" hreflang="${esc(languageByCode(t.language)?.hreflang || t.language)}" href="${esc(SITE + articlePath(t))}"/>`).join("") : "";
    return `  <url><loc>${esc(SITE + articlePath(a))}</loc><lastmod>${String(a.updated_at || a.published_at).slice(0, 10)}</lastmod>${alternates}</url>`;
  });
  const journalIndex = articles.length ? [...new Set(["/journal", ...articles.map((a) => `/journal/${languageByCode(a.language)?.segment}`)])] : [];
  const pageEntries = [...new Set([...urls, ...journalIndex])].flatMap((url) => (isLocalized(url)
    ? SEO_LANGUAGES.map((lang) => `  <url><loc>${esc(langUrl(url, lang))}</loc><lastmod>${today}</lastmod>${languageLinks(url)}${imageFor(url)}</url>`)
    : [`  <url><loc>${esc(SITE + url)}</loc><lastmod>${today}</lastmod>${imageFor(url)}</url>`]));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pageEntries.concat(articleEntries).join("\n")}
</urlset>
`;
}
