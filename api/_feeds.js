// Search and shopping feeds, generated from the live catalog and checkout rules on every request:
// - Google Merchant Center product feed per market (only items a customer can pay for directly there)
// - sitemap.xml (published products included automatically)
import { paypalCurrencyDigits } from "../shared/checkout-terms.js";
import { termsFor } from "../shared/market-overrides.js";

export const SITE = "https://hondit-shop.vercel.app";
const MARKETS = ["SG", "HK", "MO", "TW", "JP", "TH", "MY", "BN"];
const esc = (value) => String(value ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
const abs = (url) => (!url ? "" : /^https:\/\//.test(url) ? url : `${SITE}${url.startsWith("/") ? "" : "/"}${url}`);

function images(product) {
  const media = (product.media || []).map((m) => ({ url: m.url, role: m.role }));
  const main = media.find((m) => m.role === "main")?.url || product.imageUrl || product.galleryImages?.[0];
  const rest = [...media.filter((m) => m.role !== "main").map((m) => m.url), ...(product.galleryImages || [])].filter((url) => url && url !== main);
  return { main: abs(main), extra: [...new Set(rest)].slice(0, 5).map(abs) };
}

/* One purchasable offer: the minimum order, sold as a multipack, delivery included. */
export function feedItem(product, market) {
  if (["draft", "hidden"].includes(product.status)) return null;
  const minimum = product.category === "diffuser" ? 20 : 30;
  const d = termsFor(product, market, minimum);
  if (d.status !== "direct" || !d.billingCurrency || d.totalMinor === null) return null;
  const digits = paypalCurrencyDigits(d.billingCurrency);
  const en = product.contents?.en;
  const name = en?.name || product.name;
  const description = en?.description || product.description || product.shortDescription || name;
  const { main, extra } = images(product);
  if (!main) return null;
  const soldOut = product.status === "soldout" || (product.stockUnits !== null && product.stockUnits !== undefined && product.stockUnits < minimum);
  return {
    id: `${product.slug}-${market.toLowerCase()}`,
    title: `HONDIT ${name} ${product.volumeLabel || ""} - ${minimum}-unit pack`.replace(/\s+/g, " ").trim(),
    description: `${description} Pack of ${minimum} units. EMS delivery from Korea included; import tax and duties, if any, are paid by the recipient.`,
    link: `${SITE}/products/${product.slug}?market=${market}&lang=en`,
    image: main,
    extraImages: extra,
    availability: soldOut ? "out_of_stock" : "in_stock",
    price: `${(d.totalMinor / 10 ** digits).toFixed(digits)} ${d.billingCurrency}`,
    shippingPrice: `0 ${d.billingCurrency}`,
    multipack: minimum,
    productType: product.category === "diffuser" ? "Home Fragrance > Stone Diffusers" : "Skin Care > Face Cleansers",
  };
}

export function googleFeed(products, market) {
  const code = MARKETS.includes(market) ? market : "SG";
  const items = products.map((product) => feedItem(product, code)).filter(Boolean);
  const body = items.map((item) => `    <item>
      <g:id>${esc(item.id)}</g:id>
      <g:title>${esc(item.title)}</g:title>
      <g:description>${esc(item.description)}</g:description>
      <g:link>${esc(item.link)}</g:link>
      <g:image_link>${esc(item.image)}</g:image_link>
${item.extraImages.map((url) => `      <g:additional_image_link>${esc(url)}</g:additional_image_link>`).join("\n")}
      <g:availability>${item.availability}</g:availability>
      <g:price>${esc(item.price)}</g:price>
      <g:multipack>${item.multipack}</g:multipack>
      <g:brand>HONDIT</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(item.productType)}</g:product_type>
      <g:shipping><g:country>${code}</g:country><g:price>${esc(item.shippingPrice)}</g:price></g:shipping>
    </item>`.replace(/\n\n/g, "\n")).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>HONDIT ${code}</title>
    <link>${SITE}/?market=${code}</link>
    <description>HONDIT products payable directly in ${code}</description>
${body}
  </channel>
</rss>
`;
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
