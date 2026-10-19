// Feed and its HTML destination share this one offer projection. No payment writes.
import config from '../config/merchant-center.json' with { type: 'json' };
import { storefrontCatalog } from '../shared/storefront-catalog.js';
import { conditionsFor } from '../shared/price-versions.js';
import { termsFor } from '../shared/market-overrides.js';
import { paypalCurrencyDigits } from '../shared/checkout-terms.js';

export const SITE = 'https://hondit-shop.vercel.app';
export const merchantConfig = config;
export const escapeMarkup = value => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[<>&'\"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]));
const text = value => typeof value === 'string' ? value.trim() : '';
export function merchantMarket(market, language) {
  const found = config.markets[market];
  // Application checkout coverage is broader than Google's reviewed target-country coverage.
  const supported = ['SG', 'JP', 'HK', 'TW', 'TH', 'MY'];
  return supported.includes(market) && found?.enabled && found.language === 'en' && (!language || found.language === language) ? found : null;
}
export function publicImage(value) {
  const input = text(value);
  if (!input) return null;
  try {
    const url = new URL(input, SITE);
    if (url.protocol !== 'https:' || url.username || url.password || (url.hostname !== new URL(SITE).hostname && !/^https:\/\//i.test(input))) return null;
    return url.href;
  } catch { return null; }
}
function stockFor(product) {
  // Same precedence as storefrontApi.mergeProduct; explicit zero must not fall through to packs.
  if (Object.hasOwn(product, 'stockUnits')) return product.stockUnits;
  if (Object.hasOwn(product, 'stockQuantity')) return product.stockQuantity;
  const packs = Number(product.inventoryPacks), units = Number(product.packQuantity);
  return Number.isSafeInteger(packs) && packs > 0 && Number.isSafeInteger(units) && units > 0 ? packs * units : null;
}
function identifiers(metadata) {
  // Unknown identifiers are omitted, never asserted absent. SKU is not an MPN/GTIN.
  const result = {};
  if (metadata.gtin) result.gtin = metadata.gtin;
  if (metadata.mpn) result.mpn = metadata.mpn;
  if (metadata.identifierExists === false && !result.gtin && !result.mpn) result.identifierExists = false;
  return result;
}
export function merchantOffer(product, market = 'SG', language, requestedQuantity) {
  const channel = merchantMarket(market, language);
  if (!channel) return { reason: 'market_not_enabled' };
  if (!product || product.active !== true || product.purchaseEnabled !== true || ['draft','hidden'].includes(product.status) || product.quoteOnly) return { reason: 'not_publicly_purchasable' };
  const sku = product.apiSlug || product.slug, metadata = config.products[sku];
  if (!metadata || !/^[a-z0-9-]+$/.test(product.slug)) return { reason: 'product_not_reviewed' };
  const stock = stockFor(product);
  if (!Number.isSafeInteger(stock) || stock < 0) return { reason: 'stock_unconfirmed' };
  const normalized = { ...product, stockQuantity: stock, inventoryPacks: 0 };
  const conditions = conditionsFor(normalized, market);
  const candidates = [...new Set(conditions.filter(c => c.market === market && c.sku === sku && c.channel === 'international_bundle').map(c => c.minimum))].sort((a,b) => a-b);
  // Determine the minimum APPROVED offer independent of stock. Low stock does not silently switch a 10-unit offer to 20.
  const pricing = { ...normalized, stockQuantity: undefined, inventoryPacks: 0 };
  let decision;
  for (const quantity of candidates) {
    const candidate = termsFor(pricing, market, quantity);
    if (candidate.status === 'direct') { decision = candidate; break; }
  }
  if (!decision || decision.billingCurrency !== channel.currency || !Number.isSafeInteger(decision.totalMinor) || decision.totalMinor <= 0 || !Number.isSafeInteger(decision.productTotalMinor) || decision.productTotalMinor <= 0 || !Number.isSafeInteger(decision.shippingMinor) || decision.shippingMinor < 0 || decision.totalMinor !== decision.productTotalMinor + decision.shippingMinor) return { reason: 'no_approved_direct_offer' };
  const quantity = decision.quantity;
  if (requestedQuantity !== undefined && String(requestedQuantity) !== String(quantity)) return { reason: 'offer_quantity_mismatch' };
  const builtIn = storefrontCatalog.find(p => p.apiSlug === sku);
  const own = product.contents?.[channel.language === 'zh-HK' ? 'zh' : channel.language];
  const name = text(own?.name) || text(builtIn?.name) || text(product.name);
  const description = text(own?.description) || text(builtIn?.description) || text(product.description) || text(product.shortDescription);
  const rawMain = product.media?.find(m => m.role === 'main')?.url || builtIn?.image || product.imageUrl || product.image;
  const image = publicImage(rawMain);
  if (!name || !description || !image) return { reason: 'required_content_missing' };
  const digits = paypalCurrencyDigits(decision.billingCurrency);
  const amount = minor => (minor / 10 ** digits).toFixed(digits);
  const query = new URLSearchParams({ quantity: String(quantity) });
  const link = `${SITE}/merchant/${market}/${channel.language}/${product.slug}?${query}`;
  const checkoutQuery = new URLSearchParams({ market, lang: channel.language, product: product.slug, quantity: String(quantity) });
  const available = product.status !== 'soldout' && stock >= quantity && termsFor(normalized, market, quantity).status === 'direct';
  const title = `${name}${product.volumeLabel && !name.includes(product.volumeLabel) ? ` ${product.volumeLabel}` : ''} — ${quantity} units`;
  if (title.length > 150 || description.length > 5000) return { reason: 'content_length_exceeded' };
  return { item: {
    id: `${sku}-q${quantity}`, slug: product.slug, title, description, brand: metadata.brand,
    market, language: channel.language, quantity, link,
    checkoutLink: `${SITE}/bulk-orders/${product.slug}?${checkoutQuery}`,
    detailsLink: `${SITE}/products/${product.slug}?${checkoutQuery}`,
    image, extraImages: [...new Set([...(product.media || []).filter(m => m.role === 'gallery').map(m => publicImage(m.url)), ...(product.galleryImages || []).map(publicImage)])].filter(url => url && url !== image).slice(0,10),
    availability: available ? 'in_stock' : 'out_of_stock', currency: decision.billingCurrency,
    // The existing delivered price has no separately charged freight; never invent a cost allocation.
    priceAmount: amount(decision.productTotalMinor), price: `${amount(decision.productTotalMinor)} ${decision.billingCurrency}`,
    totalAmount: amount(decision.totalMinor), shippingAmount: amount(decision.shippingMinor), shippingPrice: `${amount(decision.shippingMinor)} ${decision.billingCurrency}`,
    shippingIncluded: decision.shippingIncluded, stock, version: decision.version,
    ...identifiers(metadata),
  }};
}
export function merchantSchema(item) {
  return {
    '@context':'https://schema.org', '@type':'Product', name:item.title,
    description:item.description, image:[item.image,...item.extraImages], sku:item.id,
    brand:{'@type':'Brand',name:item.brand}, ...(item.gtin ? {gtin:item.gtin} : {}), ...(item.mpn ? {mpn:item.mpn} : {}),
    offers:{'@type':'Offer',url:item.link,price:item.priceAmount,priceCurrency:item.currency,
      availability:`https://schema.org/${item.availability === 'in_stock' ? 'InStock' : 'OutOfStock'}`,
      itemCondition:'https://schema.org/NewCondition',seller:{'@type':'Organization',name:'HONDIT'},
      shippingDetails:{'@type':'OfferShippingDetails',shippingRate:{'@type':'MonetaryAmount',value:item.shippingAmount,currency:item.currency},shippingDestination:{'@type':'DefinedRegion',addressCountry:item.market}}}
  };
}
export function merchantHtml(item) {
  const e = escapeMarkup;
  const schema = JSON.stringify(merchantSchema(item)).replace(/</g, '\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return `<!doctype html><html lang="${e(item.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(item.title)} | HONDIT</title><meta name="description" content="${e(item.description)}"><link rel="canonical" href="${e(item.link)}"><meta property="og:title" content="${e(item.title)}"><meta property="og:image" content="${e(item.image)}"><meta property="og:url" content="${e(item.link)}"><script type="application/ld+json">${schema}</script><style>body{margin:0;background:#f8f5ef;color:#242823;font:17px/1.6 system-ui,sans-serif}header,main,footer{max-width:1040px;margin:auto;padding:24px}a{color:inherit}header a{font-weight:700;letter-spacing:.15em;text-decoration:none}.product{display:grid;grid-template-columns:1fr 1fr;gap:36px}img{width:100%;height:auto;object-fit:contain}h1{font-size:clamp(26px,4vw,40px);line-height:1.2}.price{font-size:30px;font-weight:700}.button{display:inline-block;background:#243b32;color:#fff;padding:14px 22px;margin:10px 0;text-decoration:none}footer{border-top:1px solid #d7d5cf}footer a{display:inline-block;margin:8px 18px 8px 0}@media(max-width:650px){.product{grid-template-columns:1fr;gap:12px}header,main,footer{padding:18px}}</style></head><body><header><a href="/">HONDIT</a></header><main><article class="product"><img src="${e(item.image)}" alt="${e(item.title)}"><section><p>${e(item.brand)}</p><h1>${e(item.title)}</h1><p>${e(item.description)}</p><p>Order quantity: <strong>${item.quantity} units</strong></p><p class="price">${e(item.currency)} ${e(item.priceAmount)}</p><p>${item.shippingIncluded ? 'Delivery included. No additional shipping charge.' : `Shipping: ${e(item.currency)} ${e(item.shippingAmount)}`}</p><p>Total payable: <strong>${e(item.currency)} ${e(item.totalAmount)}</strong></p><p>${item.availability === 'in_stock' ? 'In stock' : 'Out of stock'}</p><p>Delivery destination: ${e(item.market)}</p>${item.availability === 'in_stock' ? `<a class="button" href="${e(item.checkoutLink)}">Continue to checkout</a>` : '<p>Checkout is unavailable for this offer.</p>'}<p><a href="${e(item.detailsLink)}">Product details and usage</a></p><p>Review delivery, import charges and return terms before payment.</p></section></article></main><footer><a href="/policy/shipping">Shipping policy</a><a href="/policy/refund">Returns and refunds</a><a href="/policy/terms">Terms and seller information</a><a href="/contact">Contact HONDIT</a></footer></body></html>`;
}
