// Server-rendered text for the storefront pages that are otherwise an empty React shell: home, product list and detail,
// bulk-order guide, OUR JEJU, shipping, contact and the policies. Built only from the sources the storefront itself uses
// (storefront catalog, approved checkout terms, product facts, policy text), so crawlers that do not run JavaScript read
// the same facts a browser does. The same HTML goes to every visitor and every bot; React replaces it once it loads.
import { storefrontCatalog } from '../shared/storefront-catalog.js';
import { termsFor } from '../shared/market-overrides.js'; // the same function the product page and checkout use (admin price versions and market modes included)
import { getPolicyContent, EMAIL } from '../shared/policy-content.js';
import { INFO_PAGES, SITE_FACTS } from '../shared/info-content.js';
import { pickupRequestTotal } from '../shared/contact-copy.js';
import { salesPresentationCopy } from '../shared/sales-presentation-copy.js';
import { PICKUP_IMAGE, pickupAlternates, pickupSearchLanguage, pickupSearchMeta, pickupSearchPath } from '../shared/pickup-search.js';
import { paypalCurrencyDigits as currencyDigits } from '../shared/checkout-terms.js';
import { markets } from './_markets.js';
import { escapeMarkup as esc } from './_merchant.js';

export const SITE = 'https://hondit-shop.vercel.app';
const INSTAGRAM = 'https://www.instagram.com/hondit.office/';
const PHONE = '+82 10-3338-2694'; // WhatsApp and Telegram (src/components/ContactQrs.tsx)
const MARKET_ORDER = ['SG', 'HK', 'JP', 'TW', 'TH', 'MY', 'BN', 'MO'];

// Verified against the StoneJeju product pages on 2026-10-13 (mirrors src/data/productFacts.ts; a test keeps them equal).
export const diffuserFacts = {
  'diffuser-350g': { content: '350g ±', dimensions: '75 × 100 × 75 mm', container: 'Glass vessel', oil: '10mL', source: 'https://stonejeju.com/product/detail.html?product_no=42' },
  'diffuser-500g': { content: '500g ±', dimensions: '100 × 105 × 100 mm', container: 'Jeju onggi pottery', oil: '10mL', source: 'https://stonejeju.com/product/detail.html?product_no=41' },
};
const CARE = [
  'Natural stone varies in size and colour and may shed fine powder.',
  'Avoid prolonged contact with sensitive or damaged skin. Follow the product label.',
  'Rinse the stone in warm water and dry completely before changing the fragrance.',
];
const BRAND_LINE = 'HONDIT is the selling and curation brand of a student team in the GTEP programme at Jeju National University. StoneJeju is the maker and product brand of the volcanic-stone diffusers.';
const WHO_LINE = 'HONDIT does not manufacture the diffusers. It introduces them to overseas customers and answers order questions.';

const abs = (url) => (!url ? '' : /^https?:/.test(url) ? url : SITE + url);
const money = (minor, currency) => {
  const digits = currencyDigits(currency);
  return `${currency} ${(minor / 10 ** digits).toFixed(digits)}`;
};

/* Live sale state from the database, laid over the static catalog (as src/lib/storefrontApi.ts does). */
export function catalogProducts(live = [], { liveOnly = false } = {}) {
  return storefrontCatalog.map((item) => {
    const row = live.find((p) => p.slug === item.slug);
    const hidden = row ? row.status === 'draft' || row.status === 'hidden' : liveOnly;
    const stock = row ? (row.stockUnits === undefined ? (Number.isFinite(row.inventoryPacks) ? row.inventoryPacks * row.packQuantity : undefined) : row.stockUnits ?? undefined) : undefined;
    return { ...item, active: row ? row.active !== false : true, purchaseEnabled: row ? row.purchaseEnabled !== false : true, stockQuantity: stock, markets: row?.markets, prices: row?.prices, hidden: Boolean(hidden), live: Boolean(row) };
  }).filter((p) => !p.hidden && p.active !== false);
}

/* Direct-checkout terms per market, from termsFor: the approved checkout conditions plus the operator's market settings. */
export function orderTerms(product) {
  const rows = [];
  for (const code of MARKET_ORDER) {
    const tiers = [];
    for (const quantity of [5, 10, 20, 30]) {
      const t = termsFor(product, code, quantity);
      if (t.status === 'direct' && t.billingCurrency && t.unitMinor > 0) tiers.push({ quantity, currency: t.billingCurrency, unitMinor: t.unitMinor, totalMinor: t.totalMinor, shippingMinor: t.shippingMinor || 0 });
    }
    if (tiers.length) rows.push({ market: code, country: markets[code]?.countryName || code, tiers });
  }
  return rows;
}
function termsHtml(rows, slug) {
  if (!rows.length) return '<p>Check current purchase options on the order page or contact HONDIT for a quote.</p>';
  return `<ul>${rows.map((row) => `<li><strong>${esc(row.country)}</strong>: ${row.tiers.map((tier) => {
    const label = `${tier.quantity} units: ${money(tier.totalMinor, tier.currency)} total (${money(tier.unitMinor, tier.currency)} per unit)${tier.shippingMinor === 0 ? ', delivery included' : ''}`;
    const href = `/bulk-orders/${slug}?${new URLSearchParams({ market: row.market, lang: 'en', quantity: String(tier.quantity) })}`;
    return `<a href="${esc(href)}">${esc(label)}</a>`;
  }).join('; ')}</li>`).join('')}</ul>`;
}
const TERMS_NOTE = '<p>Pay with PayPal at the quantities shown. Other quantities, mixed sizes or orders above available stock are handled as a quote, and import duties and taxes in the destination country are paid by the recipient.</p>';

const NAV = [['/', 'Home'], ['/products', 'Products'], ['/bulk-orders', 'Bulk orders'], ['/jeju/pickup', 'Jeju Airport pickup'], ['/jeju', 'Our Jeju'], ['/about', 'About'], ['/faq', 'FAQ'], ['/journal', 'Journal'], ['/shipping', 'Shipping'], ['/contact', 'Contact'], ['/policy/refund', 'Refund policy'], ['/policy/terms', 'Terms']];
const nav = () => `<nav aria-label="Site"><ul>${NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul></nav>`;
const wrap = (body, mainClass = '') => `<header><a href="/">HONDIT</a></header><main${mainClass ? ` class="${esc(mainClass)}"` : ''}>${body}</main><footer>${nav()}<p>HONDIT · Jeju National University GTEP student team · Business registration no. ${SITE_FACTS.businessRegistration} · <a href="mailto:${EMAIL}">${EMAIL}</a> · <a href="${INSTAGRAM}">Instagram</a></p></footer>`;

const org = () => ({ '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'HONDIT', alternateName: ['hondit', '혼딧'], url: SITE, email: EMAIL, sameAs: SITE_FACTS.profiles.map(([, url]) => url),
  mainEntityOfPage: `${SITE}/about`,
  identifier: { '@type': 'PropertyValue', name: 'Business registration number (Republic of Korea)', value: SITE_FACTS.businessRegistration },
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: EMAIL, telephone: PHONE },
  address: { '@type': 'PostalAddress', streetAddress: '102 Jejudaehak-ro', addressLocality: 'Jeju-si', postalCode: '63243', addressCountry: 'KR' },
  description: 'Selling and curation brand of a Jeju National University GTEP student team, introducing StoneJeju volcanic-stone diffusers to overseas customers.' });
const maker = { '@type': 'Organization', name: 'StoneJeju', url: 'https://stonejeju.com' };
// Cleansing care: J’essence is the product brand and 제주리퍼블릭 the manufacturer; HONDIT only sells and curates (mirrors ProductDetailPage.tsx).
const careMaker = { '@type': 'Organization', name: '제주리퍼블릭' };

export function productSchema(product) {
  const facts = diffuserFacts[product.slug];
  const isCare = product.category === 'CARE';
  const brandName = facts ? 'StoneJeju' : isCare ? 'J’essence' : 'HONDIT'; // same as the product page (src/pages/ProductDetailPage.tsx)
  // A market-neutral product overview has no single payable offer. The existing Merchant URLs own bundle Offer markup.
  const url = `${SITE}/products/${product.slug}`;
  return { '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`, url, name: product.name, description: product.description, image: [abs(product.image)], sku: product.apiSlug || product.slug,
    brand: { '@type': 'Brand', name: brandName }, ...(facts ? { manufacturer: maker } : isCare ? { manufacturer: careMaker } : {}) };
}

const breadcrumb = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })) });

function productSection(product, { heading = 'h2' } = {}) {
  const facts = diffuserFacts[product.slug];
  return `<article><${heading}><a href="/products/${esc(product.slug)}">${esc(product.name)}</a></${heading}><p>${esc(product.description)}</p>`
    + (facts ? `<p>${esc(facts.content)} Jeju volcanic scoria · ${esc(facts.container)} · ${esc(facts.dimensions)} · ${esc(facts.oil)} citrus fragrance oil included.</p>` : '')
    + `<p><a href="/bulk-orders/${esc(product.slug)}">Order conditions</a></p></article>`;
}

/* A page = { status, title, description, canonical, jsonLd[], html }. `path` is one of the names below. */
export function buildSeoPage(path, { slug = '', policy = '', language = 'en', products = [], showOrderTerms = true } = {}) {
  const list = products;
  const bySlug = (s) => list.find((p) => p.slug === s);
  if (path === 'home') {
    const diffusers = list.filter((p) => p.category === 'SCENT');
    return { status: 200, canonical: SITE + '/', title: 'HONDIT | Jeju volcanic-stone diffusers and care, by a Jeju student team',
      description: 'Jeju volcanic-stone diffusers made by StoneJeju and Jeju-inspired cleansing care, introduced by the HONDIT student team. Direct PayPal checkout for set quantities in Singapore, Hong Kong, Japan, Taiwan and more.',
      jsonLd: [org(), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'HONDIT', url: SITE }],
      html: wrap(`<h1>HONDIT: Jeju volcanic-stone diffusers and everyday care</h1><p>${esc(BRAND_LINE)}</p><p>${esc(WHO_LINE)}</p>`
        + `<section><h2>Volcanic-stone diffusers</h2><p>Porous Jeju volcanic scoria in a vessel, scented with the 10mL citrus fragrance oil that comes with it. No electricity and no flame.</p>${diffusers.map((p) => productSection(p, { heading: 'h3' })).join('')}</section>`
        + `<section><h2>Cleansing care</h2><ul>${list.filter((p) => p.category === 'CARE').map((p) => `<li><a href="/products/${esc(p.slug)}">${esc(p.name)}</a>: ${esc(p.description)}</li>`).join('')}</ul><p>Brand: J’essence. Manufacturer: 제주리퍼블릭. HONDIT sells and curates these products.</p></section>`
        + `<section><h2>How to order</h2><p>Choose a product and quantity, review the order conditions for your country, then pay with PayPal where direct checkout is open. <a href="/bulk-orders">Bulk order guide</a> · <a href="/shipping">Shipping</a> · <a href="/policy/refund">Refunds</a> · <a href="/contact">Contact</a></p></section>`
        + `<section><h2>From Jeju</h2><p><a href="/jeju">Our Jeju</a> · <a href="/journal">HONDIT Journal</a></p></section>`) };
  }
  if (path === 'products') {
    return { status: 200, canonical: SITE + '/products', title: 'Products | HONDIT', description: 'HONDIT product list: StoneJeju Jeju volcanic-stone diffusers (350g and 500g) and Jeju-inspired cleansing care, with order conditions by country.',
      jsonLd: [org(), breadcrumb([['Home', '/'], ['Products', '/products']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/products/${p.slug}`, name: p.name })) }],
      html: wrap(`<h1>HONDIT products</h1><p>${esc(BRAND_LINE)}</p>${list.map((p) => productSection(p)).join('')}<p>Order conditions differ by country. See the <a href="/bulk-orders">bulk order guide</a>.</p>`) };
  }
  if (path === 'product' || path === 'bulkProduct') {
    const product = bySlug(slug);
    if (!product) return { status: 404 };
    const rows = showOrderTerms ? orderTerms(product) : [];
    const facts = diffuserFacts[product.slug];
    const canonical = `${SITE}/${path === 'product' ? 'products' : 'bulk-orders'}/${product.slug}`;
    const care = facts ? `<section><h2>Care</h2><ul>${CARE.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>` : '';
    const searchName = facts ? `Jeju Volcanic Stone Diffuser ${slug.endsWith('500g') ? '500g' : '350g'} by StoneJeju` : product.name;
    return { status: 200, canonical, image: abs(product.image), title: `${searchName}${path === 'bulkProduct' ? ' order conditions' : ''} | HONDIT`,
      description: `${product.description} ${facts ? 'Made by StoneJeju, introduced by HONDIT. ' : product.category === 'CARE' ? 'J’essence, made by 제주리퍼블릭, sold by HONDIT. ' : ''}Check order options by country.`.slice(0, 300),
      jsonLd: [...(path === 'product' ? [productSchema(product)] : []), breadcrumb([['Home', '/'], [path === 'product' ? 'Products' : 'Bulk orders', path === 'product' ? '/products' : '/bulk-orders'], [product.name, new URL(canonical).pathname]])],
      html: wrap(`<nav aria-label="Breadcrumb"><a href="/products">Products</a> / ${esc(product.name)}</nav><h1>${esc(product.name)}</h1><p>${esc(product.description)}</p>`
        + (facts ? `<ul><li>Content: ${esc(facts.content)} Jeju volcanic scoria</li><li>Container: ${esc(facts.container)}</li><li>Size: ${esc(facts.dimensions)}</li><li>Fragrance oil: ${esc(facts.oil)} citrus oil included</li></ul><p>Maker and product brand: <a href="${esc(facts.source)}">StoneJeju</a>. Seller and curator: HONDIT.</p>` : product.category === 'CARE' ? '<p>Brand: J’essence. Manufacturer: 제주리퍼블릭. Seller and curator: HONDIT.</p>' : '')
        + `<section><h2>Highlights</h2><ul>${product.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></section>`
        + `<section><h2>How to use</h2><p>Follow the product label.</p><ol>${product.howTo.map((h) => `<li>${esc(h)}</li>`).join('')}</ol></section>`
        + (product.goodFor ? `<section><h2>Good for</h2><p>${esc(product.goodFor)}</p></section>` : '') + care
        + `<section><h2>Order conditions by country</h2>${termsHtml(rows, product.slug)}${rows.length ? TERMS_NOTE : ''}</section>`
        + (facts ? '<p><a href="/faq">Compare sizes and learn how to use a stone diffuser</a> · <a href="/jeju/pickup">Jeju Airport pickup</a></p>' : '')
        + `<p><a href="/bulk-orders/${esc(product.slug)}">Choose quantity</a> · <a href="/policy/refund">Refund policy</a> · <a href="/shipping">Shipping</a> · <a href="/contact">Ask a question</a></p>`) };
  }
  if (path === 'bulk') {
    return { status: 200, canonical: SITE + '/bulk-orders', title: 'Bulk and overseas bundle orders | HONDIT', description: 'How HONDIT overseas bundle orders work: direct PayPal checkout quantities, delivered prices and quote cases for each country.',
      jsonLd: [org(), breadcrumb([['Home', '/'], ['Bulk orders', '/bulk-orders']])],
      html: wrap(`<h1>Overseas bundle orders</h1><p>Choose a product and destination to see available quantities, payment options and delivery terms.</p>${list.map((p) => `<section><h2><a href="/bulk-orders/${esc(p.slug)}">${esc(p.name)}</a></h2>${showOrderTerms ? termsHtml(orderTerms(p), p.slug) : ''}</section>`).join('')}${showOrderTerms ? TERMS_NOTE : ''}<p><a href="/shipping">Shipping</a> · <a href="/policy/refund">Refunds</a> · <a href="/contact">Contact</a></p>`) };
  }
  if (path === 'pickup') {
    const copy = salesPresentationCopy(pickupSearchLanguage(language));
    const canonical = SITE + pickupSearchPath(language);
    const { lang, title, description } = pickupSearchMeta(language);
    const productLinks = ['350g', '500g'].map((size) => `<li><a href="/products/diffuser-${size}">StoneJeju ${size}</a> · KRW ${pickupRequestTotal(1, size).toLocaleString('en-US')}</li>`).join('');
    return {
      status: 200, canonical, lang, title, description, image: SITE + PICKUP_IMAGE,
      alternates: pickupAlternates.map((item) => ({ hreflang: item.hreflang, href: SITE + item.path })),
      jsonLd: [org(), { '@context': 'https://schema.org', '@type': 'WebPage', name: copy.pickupTitle, url: canonical, inLanguage: lang, about: { '@id': `${SITE}/#organization` } }, breadcrumb([['HONDIT', '/'], [copy.pickupNav, pickupSearchPath(language)]])],
      html: wrap(`<section class="pickup-introduction"><div><h1>${esc(copy.pickupTitle)}</h1><p>${esc(copy.pickupBody)}</p><a class="hd-textlink" href="mailto:${EMAIL}">${esc(copy.pickupAction)}</a></div>`
        + `<figure><div class="pickup-airport-sign-frame"><img src="${PICKUP_IMAGE}" alt="${esc(copy.pickupImageAlt)}" width="1504" height="418" fetchpriority="high"></div><figcaption>${esc(copy.pickupShort)}</figcaption></figure>`
        + `<ul class="pickup-intro-facts">${productLinks}</ul><div class="pickup-arrangements">`
        + `<article><h2>${esc(copy.pickupSchedule)}</h2><p>${esc(copy.pickupScheduleBody)}</p></article>`
        + `<article><h2>${esc(copy.pickupMethod)}</h2><p>${esc(copy.pickupMethodBody)}</p></article></div></section>`, 'pickup-page pickup-simple pickup-travel'),
    };
  }
  if (path === 'jeju') {
    return { status: 200, canonical: SITE + '/jeju', title: 'Our Jeju: a student project from Jeju National University | HONDIT', description: 'HONDIT began in Jeju. An independent student-led cross-border commerce project at Jeju National University that introduces StoneJeju volcanic-stone diffusers to overseas customers.',
      jsonLd: [org(), breadcrumb([['Home', '/'], ['Our Jeju', '/jeju']])],
      html: wrap(`<h1>Our Jeju</h1><p>HONDIT is an independent student-led cross-border commerce project based at Jeju National University (102 Jejudaehak-ro, Jeju-si, Jeju 63243, Republic of Korea). The campus is the working origin, not a product endorsement.</p><p>${esc(BRAND_LINE)}</p><p>${esc(WHO_LINE)}</p><p><a href="/jeju/pickup">Jeju pickup</a> · <a href="/jeju/stores">Stores in Jeju</a> · <a href="/products">Products</a> · <a href="/journal">Journal</a></p>`) };
  }
  if (path === 'about' || path === 'faq') {
    const info = INFO_PAGES[path];
    const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: info.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
    const links = (l = []) => (l.length ? `<p>${l.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join(' · ')}</p>` : '');
    const sections = info.sections.map((s) => `<section><h2>${esc(s.heading)}</h2>${(s.paragraphs || []).map((t) => `<p>${esc(t)}</p>`).join('')}${s.items ? `<ul>${s.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}${links(s.links)}</section>`).join('');
    const profiles = path === 'about' ? `<section><h2>Our channels</h2><ul>${SITE_FACTS.profiles.map(([label, url]) => `<li><a href="${esc(url)}" rel="me">${esc(label)}</a></li>`).join('')}</ul></section>` : '';
    const makers = path === 'about' ? `<section><h2>Maker pages</h2><ul>${SITE_FACTS.makerPages.map(([label, url]) => `<li><a href="${esc(url)}">${esc(label)}</a></li>`).join('')}</ul></section>` : '';
    return { status: 200, canonical: SITE + info.path, title: info.title, description: info.description,
      jsonLd: [org(), breadcrumb([['Home', '/'], [info.navLabel, info.path]]), { '@context': 'https://schema.org', '@type': path === 'about' ? 'AboutPage' : 'WebPage', name: info.h1, url: SITE + info.path, about: { '@id': `${SITE}/#organization` } }, faqLd],
      html: wrap(`<h1>${esc(info.h1)}</h1>${info.intro.map((t) => `<p>${esc(t)}</p>`).join('')}${sections}${makers}${profiles}<section><h2>Questions and answers</h2>${info.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</section>`) };
  }
  if (path === 'shipping') {
    return { status: 200, canonical: SITE + '/shipping', title: 'Shipping and delivery | HONDIT', description: 'HONDIT shipping: orders ship from Korea after payment is confirmed. Delivery timing, tracking, customs and returns of damaged items.',
      jsonLd: [breadcrumb([['Home', '/'], ['Shipping', '/shipping']])],
      html: wrap(`<h1>Shipping and delivery</h1>${(getPolicyContent('shipping', 'the selected country', 'the selected market currency', true)?.sections || []).map((s) => `<section><h2>${esc(s.heading)}</h2><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></section>`).join('')}<p><a href="/policy/shipping">Full shipping policy</a> · <a href="/policy/refund">Refunds</a> · <a href="/contact">Contact</a></p>`) };
  }
  if (path === 'contact') {
    return { status: 200, canonical: SITE + '/contact', title: 'Contact HONDIT', description: 'Contact HONDIT about orders, quotes, shipping or returns by email or Instagram.',
      jsonLd: [org(), { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact HONDIT', url: SITE + '/contact' }],
      html: wrap(`<h1>Contact HONDIT</h1><ul><li>Email: <a href="mailto:${EMAIL}">${EMAIL}</a></li><li>WhatsApp and Telegram: ${PHONE}</li><li>WeChat: hondit_jeju</li><li>Instagram: <a href="${INSTAGRAM}">@hondit.office</a></li></ul><p>Include your country, product, quantity and, for an existing order, the order number and payment email.</p><p><a href="/bulk-orders">Order conditions</a> · <a href="/policy/refund">Refund policy</a></p>`) };
  }
  if (path === 'policy') {
    const content = getPolicyContent(policy, 'the selected country', 'the selected market currency', true);
    if (!content) return { status: 404 };
    const canon = { 'shipping-policy': 'shipping', 'refund-policy': 'refund', 'privacy-policy': 'privacy', 'terms-of-service': 'terms' }[policy] || policy;
    return { status: 200, canonical: `${SITE}/policy/${canon}`, title: `${content.title} | HONDIT`, description: content.intro.slice(0, 300),
      jsonLd: [breadcrumb([['Home', '/'], [content.title, `/policy/${canon}`]])],
      html: wrap(`<h1>${esc(content.title)}</h1><p>${esc(content.intro)}</p>${content.sections.map((s) => `<section><h2>${esc(s.heading)}</h2><ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></section>`).join('')}<p><a href="/bulk-orders">Bulk orders</a> · <a href="/contact">Contact</a></p>`) };
  }
  return { status: 404 };
}
