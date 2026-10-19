// XML and HTML use the same live, approved merchant offer. No fallback to guessed market data.
import { SITE, merchantMarket, merchantOffer, escapeMarkup as esc } from './_merchant.js';
export { SITE } from './_merchant.js';
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
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>
<title>HONDIT ${market}</title><link>${SITE}/?market=${market}</link><description>Approved minimum-quantity offers</description>
${body}
</channel></rss>\n`;
}

const STATIC_PAGES = ["/", "/products", "/bulk-orders", "/jeju", "/partners", "/shipping", "/contact", "/policy/refund", "/policy/shipping", "/policy/privacy", "/policy/terms"];

export function sitemap(products, today = new Date().toISOString().slice(0, 10)) {
  const live = products.filter((p) => !["draft", "hidden"].includes(p.status));
  const urls = [
    ...STATIC_PAGES,
    ...live.map((p) => `/products/${p.slug}`),
    ...live.filter((p) => ["foam-oil", "foaming-cleanser", "cleansing-water", "diffuser-350g", "diffuser-500g"].includes(p.slug)).map((p) => `/bulk-orders/${p.slug}`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(urls)].map((url) => `  <url><loc>${esc(SITE + url)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;
}
