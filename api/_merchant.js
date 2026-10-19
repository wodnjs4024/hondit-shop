// Feed and its HTML destination share this one offer projection. No payment writes.
import config from '../config/merchant-center.json' with { type: 'json' };
import { storefrontCatalog } from '../shared/storefront-catalog.js';
import { conditionsFor } from '../shared/price-versions.js';
import { termsFor } from '../shared/market-overrides.js';
import { paypalCurrencyDigits } from '../shared/checkout-terms.js';
import { storefrontCopy } from '../shared/storefront-copy.js';

export const SITE = 'https://hondit-shop.vercel.app';
export const merchantConfig = config;
export const escapeMarkup = value => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[<>&'\"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]));
const text = value => typeof value === 'string' ? value.trim() : '';
export function merchantMarket(market, language) {
  const found = config.markets[market];
  // Application checkout coverage is broader than Google's reviewed target-country coverage.
  const supported = ['SG', 'JP', 'HK', 'TW', 'TH', 'MY'];
  if (!supported.includes(market) || !found?.enabled) return null;
  const requestedLanguage = language || found.language;
  const languages = [found.language, ...(found.legacyLanguages || [])];
  return languages.includes(requestedLanguage) ? { ...found, language: requestedLanguage } : null;
}
const dictionaryLanguage = language => language === 'zh-TW' ? 'zh-HK' : language;
const localized = (value, language) => text(storefrontCopy[value]?.[dictionaryLanguage(language)]) || text(value);
const merchantProductCopy = {
  'diffuser-350g': {
    ja: { name:'ボルカニックディフューザー 350g', description:'済州島の多孔質な火山スコリア、ガラス容器、10mLのシトラスフレグランスオイルを組み合わせた、コンパクトなディフューザーです。' },
    'zh-HK': { name:'火山石擴香 350g', description:'小巧的濟州火山岩擴香器，配有玻璃容器及 10mL 柑橘香氛油。' },
    'zh-TW': { name:'火山石擴香 350g', description:'小巧的濟州火山岩擴香器，附玻璃容器與 10mL 柑橘香氛油。' },
    th: { name:'ดิฟฟิวเซอร์หินภูเขาไฟ 350 กรัม', description:'ดิฟฟิวเซอร์หินภูเขาไฟเชจูขนาดกะทัดรัด พร้อมภาชนะแก้วและน้ำมันหอมกลิ่นซิตรัส 10 มล.' },
    ms: { name:'Penyebar aroma batu gunung berapi 350g', description:'Penyebar aroma skoria gunung berapi Jeju yang kompak, lengkap dengan bekas kaca dan minyak wangian sitrus 10mL.' },
  },
  'diffuser-500g': {
    ja: { name:'ボルカニックディフューザー 500g', description:'済州島の火山スコリア、済州オンギの器、10mLのシトラスフレグランスオイルを組み合わせたディフューザーです。' },
    'zh-HK': { name:'火山石擴香 500g', description:'濟州火山岩擴香器，配有濟州甕器容器及 10mL 柑橘香氛油。' },
    'zh-TW': { name:'火山石擴香 500g', description:'濟州火山岩擴香器，附濟州甕器容器與 10mL 柑橘香氛油。' },
    th: { name:'ดิฟฟิวเซอร์หินภูเขาไฟ 500 กรัม', description:'ดิฟฟิวเซอร์หินภูเขาไฟเชจู พร้อมภาชนะเครื่องปั้นดินเผาองกีจากเชจูและน้ำมันหอมกลิ่นซิตรัส 10 มล.' },
    ms: { name:'Penyebar aroma batu gunung berapi 500g', description:'Penyebar aroma skoria gunung berapi Jeju dengan bekas tembikar onggi Jeju dan minyak wangian sitrus 10mL.' },
  },
  'foam-oil': { 'zh-HK': { name:'純素泡沫油 150ml', description:'專為防曬、底妝及完整晚間潔面而設的 pH 5.5 純素泡沫油潔面產品。無香料，適合簡單溫和的日常護理。' } },
  'foaming-cleanser': { 'zh-HK': { name:'純素泡沫潔面 200ml', description:'無香料 pH 5.5 純素泡沫潔面，適合每日溫和清潔。按壓即可使用柔滑泡沫，方便早晚快速護理。' } },
  'cleansing-water': { 'zh-HK': { name:'純素卸妝水 300ml', description:'適合淡妝及快速清潔的無香料純素卸妝水。pH 5.5 配方可作為低負擔的第一步潔面。' } },
};
const localizedProduct = (product, language) => merchantProductCopy[product.slug]?.[language] || {
  name: localized(product.name, language),
  description: localized(product.description, language),
};
const merchantUi = {
  en: { units:'units', quantity:'Order quantity', included:'Delivery included. No additional shipping charge.', shipping:'Shipping', total:'Total payable', inStock:'In stock', outOfStock:'Out of stock', destination:'Delivery destination', checkout:'Continue to checkout', unavailable:'Checkout is unavailable for this offer.', details:'Product details and usage', review:'Review delivery, import charges and return terms before payment.', shippingPolicy:'Shipping policy', refunds:'Returns and refunds', terms:'Terms and seller information', contact:'Contact HONDIT' },
  ja: { units:'個', quantity:'注文数量', included:'配送料込み。追加の配送料はありません。', shipping:'配送料', total:'お支払い合計', inStock:'在庫あり', outOfStock:'在庫切れ', destination:'配送先', checkout:'購入手続きへ進む', unavailable:'この商品は現在購入できません。', details:'商品詳細と使用方法', review:'お支払い前に配送、関税・輸入費用、返品条件をご確認ください。', shippingPolicy:'配送ポリシー', refunds:'返品・返金ポリシー', terms:'利用規約・販売者情報', contact:'HONDITへのお問い合わせ' },
  'zh-HK': { units:'件', quantity:'訂購數量', included:'已包括運費，毋須另付運費。', shipping:'運費', total:'應付總額', inStock:'有現貨', outOfStock:'缺貨', destination:'送貨地區', checkout:'繼續結帳', unavailable:'此商品目前無法結帳。', details:'商品詳情及使用方法', review:'付款前請確認配送、關稅及進口費用與退貨條款。', shippingPolicy:'運送政策', refunds:'退貨及退款政策', terms:'條款及賣家資料', contact:'聯絡 HONDIT' },
  'zh-TW': { units:'件', quantity:'訂購數量', included:'已含運費，無需另付運費。', shipping:'運費', total:'應付總額', inStock:'有庫存', outOfStock:'缺貨', destination:'配送地區', checkout:'繼續結帳', unavailable:'此商品目前無法結帳。', details:'商品詳情與使用方式', review:'付款前請確認配送、關稅與進口費用及退貨條款。', shippingPolicy:'配送政策', refunds:'退貨與退款政策', terms:'條款與賣家資訊', contact:'聯絡 HONDIT' },
  th: { units:'ชิ้น', quantity:'จำนวนสั่งซื้อ', included:'รวมค่าจัดส่งแล้ว ไม่มีค่าจัดส่งเพิ่มเติม', shipping:'ค่าจัดส่ง', total:'ยอดชำระทั้งหมด', inStock:'มีสินค้า', outOfStock:'สินค้าหมด', destination:'ปลายทางจัดส่ง', checkout:'ดำเนินการชำระเงิน', unavailable:'ข้อเสนอนี้ยังไม่พร้อมชำระเงิน', details:'รายละเอียดและวิธีใช้สินค้า', review:'โปรดตรวจสอบการจัดส่ง ภาษีและค่าใช้จ่ายนำเข้า รวมถึงเงื่อนไขการคืนสินค้าก่อนชำระเงิน', shippingPolicy:'นโยบายการจัดส่ง', refunds:'การคืนสินค้าและคืนเงิน', terms:'ข้อกำหนดและข้อมูลผู้ขาย', contact:'ติดต่อ HONDIT' },
  ms: { units:'unit', quantity:'Kuantiti pesanan', included:'Penghantaran termasuk. Tiada caj penghantaran tambahan.', shipping:'Penghantaran', total:'Jumlah perlu dibayar', inStock:'Ada stok', outOfStock:'Kehabisan stok', destination:'Destinasi penghantaran', checkout:'Teruskan ke pembayaran', unavailable:'Pembayaran tidak tersedia untuk tawaran ini.', details:'Butiran dan cara penggunaan produk', review:'Semak penghantaran, caj import dan syarat pemulangan sebelum pembayaran.', shippingPolicy:'Polisi penghantaran', refunds:'Pemulangan dan bayaran balik', terms:'Terma dan maklumat penjual', contact:'Hubungi HONDIT' }
};
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
  const own = product.contents?.[channel.language.startsWith('zh') ? 'zh' : channel.language];
  const baseName = text(own?.name) || text(builtIn?.name) || text(product.name);
  const baseDescription = text(own?.description) || text(builtIn?.description) || text(product.description) || text(product.shortDescription);
  const productCopy = localizedProduct({ slug: product.slug, name: baseName, description: baseDescription }, channel.language);
  const name = productCopy.name;
  const description = productCopy.description;
  const rawMain = product.media?.find(m => m.role === 'main')?.url || builtIn?.image || product.imageUrl || product.image;
  const image = publicImage(rawMain);
  if (!name || !description || !image) return { reason: 'required_content_missing' };
  const digits = paypalCurrencyDigits(decision.billingCurrency);
  const amount = minor => (minor / 10 ** digits).toFixed(digits);
  const query = new URLSearchParams({ quantity: String(quantity) });
  const link = `${SITE}/merchant/${market}/${channel.language}/${product.slug}?${query}`;
  const checkoutQuery = new URLSearchParams({ market, lang: channel.language, product: product.slug, quantity: String(quantity) });
  const available = product.status !== 'soldout' && stock >= quantity && termsFor(normalized, market, quantity).status === 'direct';
  const ui = merchantUi[channel.language] || merchantUi.en;
  const title = `${name}${product.volumeLabel && !name.includes(product.volumeLabel) ? ` ${product.volumeLabel}` : ''} — ${quantity}${ui.units}`;
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
  const ui = merchantUi[item.language] || merchantUi.en;
  const policyQuery = new URLSearchParams({ market:item.market, lang:item.language });
  const schema = JSON.stringify(merchantSchema(item)).replace(/</g, '\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return `<!doctype html><html lang="${e(item.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(item.title)} | HONDIT</title><meta name="description" content="${e(item.description)}"><link rel="canonical" href="${e(item.link)}"><meta property="og:title" content="${e(item.title)}"><meta property="og:image" content="${e(item.image)}"><meta property="og:url" content="${e(item.link)}"><script type="application/ld+json">${schema}</script><style>body{margin:0;background:#f8f5ef;color:#242823;font:17px/1.6 system-ui,sans-serif}header,main,footer{max-width:1040px;margin:auto;padding:24px}a{color:inherit}header a{font-weight:700;letter-spacing:.15em;text-decoration:none}.product{display:grid;grid-template-columns:1fr 1fr;gap:36px}img{width:100%;height:auto;object-fit:contain}h1{font-size:clamp(26px,4vw,40px);line-height:1.2}.price{font-size:30px;font-weight:700}.button{display:inline-block;background:#243b32;color:#fff;padding:14px 22px;margin:10px 0;text-decoration:none}footer{border-top:1px solid #d7d5cf}footer a{display:inline-block;margin:8px 18px 8px 0}@media(max-width:650px){.product{grid-template-columns:1fr;gap:12px}header,main,footer{padding:18px}}</style></head><body><header><a href="/?${e(policyQuery)}">HONDIT</a></header><main><article class="product"><img src="${e(item.image)}" alt="${e(item.title)}"><section><p>${e(item.brand)}</p><h1>${e(item.title)}</h1><p>${e(item.description)}</p><p>${e(ui.quantity)}: <strong>${item.quantity} ${e(ui.units)}</strong></p><p class="price">${e(item.currency)} ${e(item.priceAmount)}</p><p>${item.shippingIncluded ? e(ui.included) : `${e(ui.shipping)}: ${e(item.currency)} ${e(item.shippingAmount)}`}</p><p>${e(ui.total)}: <strong>${e(item.currency)} ${e(item.totalAmount)}</strong></p><p>${e(item.availability === 'in_stock' ? ui.inStock : ui.outOfStock)}</p><p>${e(ui.destination)}: ${e(item.market)}</p>${item.availability === 'in_stock' ? `<a class="button" href="${e(item.checkoutLink)}">${e(ui.checkout)}</a>` : `<p>${e(ui.unavailable)}</p>`}<p><a href="${e(item.detailsLink)}">${e(ui.details)}</a></p><p>${e(ui.review)}</p></section></article></main><footer><a href="/policy/shipping?${e(policyQuery)}">${e(ui.shippingPolicy)}</a><a href="/policy/refund?${e(policyQuery)}">${e(ui.refunds)}</a><a href="/policy/terms?${e(policyQuery)}">${e(ui.terms)}</a><a href="/contact?${e(policyQuery)}">${e(ui.contact)}</a></footer></body></html>`;
}
