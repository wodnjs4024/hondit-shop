// Server-rendered text for the storefront pages that are otherwise an empty React shell: home, product list and detail,
// bulk-order guide, OUR JEJU, shipping, contact and the policies. Built only from the sources the storefront itself uses
// (storefront catalog, approved checkout terms, product facts, policy text), so crawlers that do not run JavaScript read
// the same facts a browser does. The same HTML goes to every visitor and every bot; React replaces it once it loads.
import { storefrontCatalog } from '../shared/storefront-catalog.js';
import { termsFor } from '../shared/market-overrides.js'; // the same function the product page and checkout use (admin price versions and market modes included)
import { getPolicyContent, EMAIL } from '../shared/policy-content.js';
import { INFO_PAGES, SITE_FACTS, infoPageFor } from '../shared/info-content.js';
import { pickupRequestTotal } from '../shared/contact-copy.js';
import { salesPresentationCopy } from '../shared/sales-presentation-copy.js';
import { PICKUP_IMAGE, pickupAlternates, pickupSearchLanguage, pickupSearchMeta, pickupSearchPath } from '../shared/pickup-search.js';
import { diffuserCare as CARE, diffuserGuide, diffuserSpecs as diffuserFacts } from '../shared/diffuser-guide.js';
import { diffuserGuideAlternates, diffuserGuideMarket, diffuserMarkets } from '../shared/diffuser-search-routes.js';
import { LOCALES, SEO_LANGUAGES, HREFLANGS, HTML_LANG, LOCALIZED_PAGES } from '../shared/seo-locales.js';
import { paypalCurrencyDigits as currencyDigits } from '../shared/checkout-terms.js';
import { markets } from './_markets.js';
import { escapeMarkup as esc } from './_merchant.js';

export const SITE = 'https://hondit-shop.vercel.app';
const INSTAGRAM = 'https://www.instagram.com/hondit.office/';
const PHONE = '+82 10-3338-2694'; // WhatsApp and Telegram (src/components/ContactQrs.tsx)
const MARKET_ORDER = ['SG', 'HK', 'JP', 'TW', 'TH', 'MY', 'BN', 'MO'];

export { diffuserFacts };
const BRAND_LINE = 'HONDIT is the selling and curation brand of a student team in the GTEP programme at Jeju National University. StoneJeju is the maker and product brand of the volcanic-stone diffusers.';
const WHO_LINE = 'HONDIT does not manufacture the diffusers. It introduces them to overseas customers and answers order questions.';

// Search phrases for the English product pages (see shared/seo-locales.js for the keyword notes).
const EN_TITLE_TAIL = {
  'diffuser-350g': 'Jeju Lava Stone Aroma Diffuser, Glass, No Electricity',
  'diffuser-500g': 'Jeju Lava Stone Diffuser in Onggi Pottery, No Electricity',
  'foam-oil': 'pH 5.5 Fragrance-Free Cleansing Foam Oil',
  'foaming-cleanser': 'pH 5.5 Fragrance-Free Foaming Face Wash',
  'cleansing-water': 'pH 5.5 Fragrance-Free Makeup Remover',
};
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
export function productOverviewSchema(product, {
  url = `${SITE}/products/${product.slug}`,
  name = product.name,
  description = product.description,
  language = 'en',
} = {}) {
  const facts = diffuserFacts[product.slug];
  return {
    '@context': 'https://schema.org', '@type': 'ItemPage', url, name, description, inLanguage: language,
    primaryImageOfPage: { '@type': 'ImageObject', contentUrl: abs(product.image) },
    mainEntity: {
      '@type': 'Thing', '@id': `${SITE}/products/${product.slug}#product`, name,
      ...(facts ? { sameAs: facts.source } : {}),
    },
  };
}

const productImage = (product, name = product.name) =>
  `<img src="${esc(product.image)}" alt="${esc(name)}" width="880" height="1100" decoding="async">`;

const breadcrumb = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })) });
const hrefAlternates = (alternates) => alternates.map(({ hreflang, path }) => ({ hreflang, href: SITE + path }));

function comparisonPage(option) {
  const data = diffuserGuide(option);
  const models = data.products.map((item) => `<article><img src="${esc(item.image)}" alt="${esc(item.name)}" width="880" height="1100" decoding="async"><h3>${esc(item.name)}</h3><p>${esc(item.useCase)}</p><dl><div><dt>${esc(data.specs)}</dt><dd>${esc(item.dimensions)}</dd></div><div><dt>${esc(data.included)}</dt><dd>${esc(data.oil)}</dd></div></dl><p class="diffuser-guide__links"><a href="${esc(item.detailsPath)}">${esc(data.details)}</a><a href="${esc(item.orderPath)}">${esc(data.order)}</a><a href="${esc(item.source)}">${esc(data.source)}</a></p></article>`).join('');
  const answers = [[data.how, data.use], [data.buy, data.buying], [data.pickup, data.pickupNote, data.pickupPath]]
    .map(([question, answer, path]) => `<section><h2>${esc(question)}</h2><p>${esc(answer)}</p>${path ? `<a href="${esc(path)}">${esc(question)}</a>` : ''}</section>`).join('');
  const other = data.otherMarkets.map((market) => `<a href="${market.path}" lang="${market.lang}" hreflang="${market.hreflang}">${esc(market.label)}</a>`).join('');
  return {
    status: 200, canonical: SITE + option.path, lang: option.lang, locale: option.locale,
    title: data.title + ' | HONDIT', description: data.description, image: abs(data.products[0].image),
    alternates: hrefAlternates(diffuserGuideAlternates()),
    jsonLd: [org(), breadcrumb([['HONDIT', '/'], [data.title, option.path]]), {
      '@context': 'https://schema.org', '@type': 'CollectionPage', url: SITE + option.path, name: data.title,
      inLanguage: option.lang,
      mainEntity: { '@type': 'ItemList', itemListElement: data.products.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: SITE + item.detailsPath })) },
    }],
    html: wrap(`<header class="diffuser-guide__intro"><h1>${esc(data.title)}</h1><p>${esc(data.description)}</p></header>`
      + `<section class="diffuser-guide__comparison"><h2>${esc(data.compare)}</h2><div class="diffuser-guide__models">${models}</div><p>${esc(data.maker)}</p></section>`
      + `<div class="diffuser-guide__answers">${answers}</div><nav class="diffuser-guide__markets" aria-label="${esc(data.other)}">${other}</nav>`, 'diffuser-guide'),
  };
}

function productSection(product, { heading = 'h2' } = {}) {
  const facts = diffuserFacts[product.slug];
  return `<article><${heading}><a href="/products/${esc(product.slug)}">${esc(product.name)}</a></${heading}><p>${esc(product.description)}</p>`
    + (facts ? `<p>${esc(facts.content)} Jeju volcanic scoria · ${esc(facts.container)} · ${esc(facts.dimensions)} · ${esc(facts.oil)} citrus fragrance oil included.</p>` : '')
    + `<p><a href="/bulk-orders/${esc(product.slug)}">Order conditions</a></p></article>`;
}

/* A page = { status, title, description, canonical, jsonLd[], html }. `path` is one of the names below. */
export function buildSeoPage(path, { slug = '', policy = '', language = 'en', products = [], showOrderTerms = true, guidePath } = {}) {
  const list = products;
  const bySlug = (s) => list.find((p) => p.slug === s);
  if (path === 'diffuserGuide') {
    const option = diffuserGuideMarket(guidePath);
    return option ? comparisonPage(option) : { status: 404 };
  }
  if (path === 'home') {
    const diffusers = list.filter((p) => p.category === 'SCENT');
    return { status: 200, canonical: SITE + '/', title: 'Jeju Volcanic Stone Diffuser, No Electricity | Aroma Stone and Jeju Gifts | HONDIT',
      description: 'Jeju volcanic-stone (lava stone) diffusers made by StoneJeju: a waterless aroma stone with no electricity, no flame and no reeds, plus Jeju cleansing care. Delivered from Korea to Singapore, Hong Kong, Japan and Taiwan.',
      jsonLd: [org(), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'HONDIT', url: SITE }],
      html: wrap(`<h1>HONDIT: Jeju volcanic-stone diffusers and everyday care</h1><p>${esc(BRAND_LINE)}</p><p>${esc(WHO_LINE)}</p>`
        + `<section><h2>Volcanic-stone diffusers (aroma stones)</h2><p>Porous Jeju volcanic scoria, the island's lava stone, in a vessel, scented with the 10mL citrus fragrance oil that comes with it. No electricity, no flame, no water and no reeds: add a few drops when you want scent. <a href="/diffusers">Compare the 350g and 500g diffusers</a>.</p>${diffusers.map((p) => productSection(p, { heading: 'h3' })).join('')}</section>`
        + `<section><h2>Cleansing care</h2><ul>${list.filter((p) => p.category === 'CARE').map((p) => `<li><a href="/products/${esc(p.slug)}">${esc(p.name)}</a>: ${esc(p.description)}</li>`).join('')}</ul><p>Brand: J’essence. Manufacturer: 제주리퍼블릭. HONDIT sells and curates these products.</p></section>`
        + `<section><h2>Jeju souvenirs and corporate gifts</h2><p>Looking for a Jeju souvenir that is not food, or a Korean gift for a team? A volcanic-stone diffuser ships from Korea to overseas addresses, and HONDIT takes quantity orders for corporate gifts, event giveaways and shops. <a href="/bulk-orders">Quantity orders</a> · <a href="/faq">Questions and answers</a></p></section>`
        + `<section><h2>How to order</h2><p>Choose a product and quantity, review the order conditions for your country, then pay with PayPal where direct checkout is open. <a href="/bulk-orders">Bulk order guide</a> · <a href="/shipping">Shipping</a> · <a href="/policy/refund">Refunds</a> · <a href="/contact">Contact</a></p></section>`
        + `<section><h2>From Jeju</h2><p><a href="/jeju">Our Jeju</a> · <a href="/journal">HONDIT Journal</a></p></section>`) };
  }
  if (path === 'products') {
    return { status: 200, canonical: SITE + '/products', title: 'Products: Jeju Volcanic Stone Diffusers and Cleansing Care | HONDIT', description: 'HONDIT product list: StoneJeju Jeju volcanic-stone (lava stone) diffusers in 350g and 500g, non-electric aroma stones, and Jeju-inspired vegan cleansing care, with order conditions by country.',
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
    return { status: 200, canonical, image: abs(product.image), title: `${product.name}${path === 'bulkProduct' ? ' order conditions' : EN_TITLE_TAIL[product.slug] ? `: ${EN_TITLE_TAIL[product.slug]}` : ''} | HONDIT`,
      description: `${product.description} ${facts ? 'A non-electric aroma stone with no flame. Made by StoneJeju, introduced by HONDIT. ' : product.category === 'CARE' ? 'J’essence, made by 제주리퍼블릭, sold by HONDIT. ' : ''}Direct checkout quantities and prices by country.`.slice(0, 300),
      jsonLd: [...(path === 'product' ? [productOverviewSchema(product)] : []), breadcrumb([['Home', '/'], [path === 'product' ? 'Products' : 'Bulk orders', path === 'product' ? '/products' : '/bulk-orders'], [product.name, new URL(canonical).pathname]])],
      html: wrap(`<nav aria-label="Breadcrumb"><a href="/products">Products</a> / ${esc(product.name)}</nav><h1>${esc(product.name)}</h1><p>${esc(product.description)}</p>`
        + (path === 'product' ? productImage(product) : '')
        + (facts ? `<ul><li>Content: ${esc(facts.content)} Jeju volcanic scoria</li><li>Container: ${esc(facts.container)}</li><li>Size: ${esc(facts.dimensions)}</li><li>Fragrance oil: ${esc(facts.oil)} citrus oil included</li></ul><p>Maker and product brand: <a href="${esc(facts.source)}">StoneJeju</a>. Seller and curator: HONDIT.</p>` : product.category === 'CARE' ? '<p>Brand: J’essence. Manufacturer: 제주리퍼블릭. Seller and curator: HONDIT.</p>' : '')
        + `<section><h2>Highlights</h2><ul>${product.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></section>`
        + `<section><h2>How to use</h2><p>Follow the product label.</p><ol>${product.howTo.map((h) => `<li>${esc(h)}</li>`).join('')}</ol></section>`
        + (product.goodFor ? `<section><h2>Good for</h2><p>${esc(product.goodFor)}</p></section>` : '') + care
        + `<section><h2>Order conditions by country</h2>${termsHtml(rows, product.slug)}${rows.length ? TERMS_NOTE : ''}</section>`
        + (facts ? '<p><a href="/diffusers">Compare the 350g and 500g diffusers</a> · <a href="/faq">Diffuser questions and answers</a> · <a href="/jeju/pickup">Jeju Airport pickup</a></p>' : '')
        + `<p><a href="/bulk-orders/${esc(product.slug)}">Choose quantity</a> · <a href="/policy/refund">Refund policy</a> · <a href="/shipping">Shipping</a> · <a href="/contact">Ask a question</a></p>`) };
  }
  if (path === 'bulk') {
    return { status: 200, canonical: SITE + '/bulk-orders', title: 'Bulk Orders and Corporate Gifts: Overseas Quantity Orders | HONDIT', description: 'How HONDIT overseas bundle orders work for corporate gifts, event giveaways and shops: direct PayPal checkout quantities, delivered prices and quote cases for each country.',
      jsonLd: [org(), breadcrumb([['Home', '/'], ['Bulk orders', '/bulk-orders']])],
      html: wrap(`<h1>Overseas bundle orders</h1><p>Choose a product and destination to see available quantities, payment options and delivery terms.</p>${list.map((p) => `<section><h2><a href="/bulk-orders/${esc(p.slug)}">${esc(p.name)}</a></h2>${showOrderTerms ? termsHtml(orderTerms(p), p.slug) : ''}</section>`).join('')}${showOrderTerms ? TERMS_NOTE : ''}<p><a href="/shipping">Shipping</a> · <a href="/policy/refund">Refunds</a> · <a href="/contact">Contact</a></p>`) };
  }
  if (path === 'partners') {
    const path = '/partners';
    const title = 'Store & business purchase guide';
    const { businessBody, industries } = salesPresentationCopy('en');
    const image = '/images/hondit-pack/hondit_codex_image_pack/01_product_originals/08_diffuser_500_wood.webp';
    return {
      status: 200, canonical: SITE + path, title: `${title} | HONDIT`, description: businessBody, image: abs(image),
      jsonLd: [org(), breadcrumb([['HONDIT', '/'], [title, path]])],
      html: wrap(`<h1>${esc(title)}</h1><p>${esc(businessBody)}</p><figure><img src="${image}" alt="Volcanic Diffuser 500g" width="1126" height="826" decoding="async"><figcaption>${esc(industries)}</figcaption></figure>`
        + '<section><h2>How an order moves</h2><ol><li>Choose a product and quantity for your market.</li><li>Enter the recipient and delivery details.</li><li>Pay with PayPal when direct checkout is available.</li><li>Receive tracking details after dispatch.</li></ol><p>Send a message for quantities, combinations or support outside these terms.</p></section>'
        + '<p><a href="/bulk-orders">Overseas bundle orders</a> · <a href="/diffusers">Compare the 350g and 500g diffusers</a> · <a href="/contact">Contact HONDIT</a></p>'),
    };
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

/* ---------- Language versions (?lang=ko|ja|zh-HK) ---------- */

const PAGE_PATH = { home: '/', products: '/products', bulk: '/bulk-orders', jeju: '/jeju', about: '/about', faq: '/faq' };
const LOCALIZED_HREFS = new Set(['/', '/products', '/bulk-orders', '/jeju', '/about', '/faq']);
/* Path of a page (product pages carry their slug). */
export function seoPath(path, slug = '') {
  if (path === 'product') return `/products/${slug}`;
  return PAGE_PATH[path] || '';
}
/* Absolute URL of a page in a display language. English is the plain URL. */
export function seoUrl(pathname, lang) {
  return SITE + pathname + (lang && lang !== 'en' ? `?lang=${encodeURIComponent(lang)}` : '');
}
/* hreflang links for a page that has language versions (empty when it has none). */
export function seoAlternates(path, slug = '') {
  if (!LOCALIZED_PAGES.includes(path) || (path === 'product' && !SEO_LANGUAGES.slice(1).every((l) => LOCALES[l].products[slug]))) return [];
  const pathname = seoPath(path, slug);
  return [
    ...SEO_LANGUAGES.flatMap((lang) => HREFLANGS[lang].map((hreflang) => ({ hreflang, href: seoUrl(pathname, lang) }))),
    { hreflang: 'x-default', href: seoUrl(pathname, 'en') },
  ];
}
export const isSeoLanguage = (lang) => SEO_LANGUAGES.includes(lang) && lang !== 'en';

/* Internal links in a language version stay in that language where the target has one. */
const hrefIn = (href, lang) => {
  const [pathname] = href.split('?');
  const localized = LOCALIZED_HREFS.has(pathname) || (pathname.startsWith('/products/') && Boolean(LOCALES[lang].products[pathname.slice(10)]));
  return localized ? `${pathname}?lang=${lang}` : href;
};

export function buildLocalizedSeoPage(path, lang, { slug = '', products = [], showOrderTerms = true } = {}) {
  const L = LOCALES[lang];
  if (!L || !LOCALIZED_PAGES.includes(path)) return { status: 404 };
  const list = products;
  const a = (href, text) => `<a href="${esc(hrefIn(href, lang))}">${esc(text)}</a>`;
  const sep = lang === 'ko' ? ': ' : '：';
  const stop = lang === 'ko' ? '. ' : '。';
  const navOrder = ['/', '/products', '/bulk-orders', '/jeju', '/about', '/faq', '/journal', '/shipping', '/contact'];
  const navL = `<nav aria-label="Site"><ul>${navOrder.map((h) => `<li>${a(h, L.nav[h])}</li>`).join('')}</ul></nav>`;
  const wrapL = (body) => `<header>${a('/', 'HONDIT')}</header><main>${body}</main><footer>${navL}<p>${esc(L.footer(SITE_FACTS.businessRegistration))} · <a href="mailto:${EMAIL}">${EMAIL}</a> · <a href="${INSTAGRAM}">Instagram</a></p></footer>`;
  const name = (p) => L.products[p.slug]?.name || p.name;
  const desc = (p) => L.products[p.slug]?.body || p.description;
  const totalLabel = { ko: '총액', ja: '合計', 'zh-HK': '總額' }[lang];
  const termsL = (rows, itemSlug) => (!rows.length ? `<p>${a('/bulk-orders/' + itemSlug, L.label.orderConditions)} · ${a('/contact', L.label.ask)}</p>`
    : `<ul>${rows.map((r) => `<li><strong>${esc(L.countries[r.market] || r.country)}</strong>${sep}${r.tiers.map((t) => {
      const query = new URLSearchParams({ market: r.market, lang, quantity: String(t.quantity) });
      const label = L.tier(t.quantity, money(t.unitMinor, t.currency), t.shippingMinor === 0) + ' · ' + totalLabel + ' ' + money(t.totalMinor, t.currency);
      return `<a href="${esc('/bulk-orders/' + itemSlug + '?' + query)}">${esc(label)}</a>`;
    }).join(' / ')}</li>`).join('')}</ul>`);
  const localGuides = lang === 'ja' ? [diffuserMarkets.JP] : lang === 'zh-HK' ? [diffuserMarkets.HK, diffuserMarkets.TW] : [];
  const guideLinks = localGuides.map((option) => `<a href="${option.path}" lang="${option.lang}">${esc(option.label + ' · ' + diffuserGuide(option).guide)}</a>`);
  const pickup = salesPresentationCopy(lang);
  const related = `<p>${[...guideLinks, a(pickupSearchPath(lang), pickup.pickupNav)].join(' · ')}</p>`;
  const factLine = (p) => {
    const f = diffuserFacts[p.slug]; const lf = L.facts[p.slug];
    return f && lf ? `<p>${esc(lf.content)} · ${esc(lf.container)} · ${esc(f.dimensions)} · ${esc(lf.oil)}</p>` : '';
  };
  const card = (p, h = 'h2') => `<article><${h}>${a(`/products/${p.slug}`, name(p))}</${h}><p>${esc(desc(p))}</p>${factLine(p)}<p>${a(`/bulk-orders/${p.slug}`, L.label.orderConditions)}</p></article>`;
  const page = (pathname, data) => ({ status: 200, canonical: seoUrl(pathname, lang), alternates: seoAlternates(path, slug), ...data });
  const crumbs = (items) => breadcrumb(items.map(([n, pth]) => [n, pth])).itemListElement.map((it) => ({ ...it, item: seoUrl(items[it.position - 1][1], lang) }));
  const breadcrumbL = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs(items) });

  if (path === 'home') {
    const c = L.pages.home;
    return page('/', { title: c.title, description: c.description,
      jsonLd: [org(), { '@context': 'https://schema.org', '@type': 'WebSite', name: 'HONDIT', url: SITE, inLanguage: lang }],
      html: wrapL(`<h1>${esc(c.h1)}</h1><p>${esc(L.brandLine)}</p><p>${esc(L.whoLine)}</p>`
        + `<section><h2>${esc(c.scentH2)}</h2><p>${esc(c.scentP)}</p>${list.filter((p) => p.category === 'SCENT').map((p) => card(p, 'h3')).join('')}${related}</section>`
        + `<section><h2>${esc(c.giftH2)}</h2><p>${esc(c.giftP)}</p><p>${a('/bulk-orders', L.nav['/bulk-orders'])} · ${a('/faq', L.nav['/faq'])}</p></section>`
        + `<section><h2>${esc(c.careH2)}</h2><ul>${list.filter((p) => p.category === 'CARE').map((p) => `<li>${a(`/products/${p.slug}`, name(p))}${sep}${esc(desc(p))}</li>`).join('')}</ul><p>${esc(L.label.careBrand)}</p></section>`
        + `<section><h2>${esc(c.orderH2)}</h2><p>${esc(c.orderP)}</p><p>${a('/bulk-orders', L.nav['/bulk-orders'])} · ${a('/shipping', L.nav['/shipping'])} · ${a('/policy/refund', L.label.refund)} · ${a('/contact', L.nav['/contact'])}</p></section>`
        + `<section><h2>${esc(c.fromH2)}</h2><p>${a('/jeju', L.nav['/jeju'])} · ${a('/journal', L.nav['/journal'])}</p></section>`) });
  }
  if (path === 'products') {
    const c = L.pages.products;
    return page('/products', { title: c.title, description: c.description,
      jsonLd: [org(), breadcrumbL([[L.nav['/'], '/'], [L.nav['/products'], '/products']]), { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: seoUrl(`/products/${p.slug}`, lang), name: name(p) })) }],
      html: wrapL(`<h1>${esc(c.h1)}</h1><p>${esc(L.brandLine)}</p>${list.map((p) => card(p)).join('')}<p>${esc(c.note)} ${a('/bulk-orders', L.nav['/bulk-orders'])}</p>`) });
  }
  if (path === 'product') {
    const product = list.find((p) => p.slug === slug);
    const lp = product && L.products[product.slug];
    if (!product || !lp) return { status: 404 };
    const rows = showOrderTerms ? orderTerms(product) : [];
    const f = diffuserFacts[product.slug]; const lf = L.facts[product.slug];
    const schema = productOverviewSchema(product, { url: seoUrl(`/products/${product.slug}`, lang), name: lp.name, description: lp.body, language: HTML_LANG[lang] });
    return page(`/products/${product.slug}`, { image: abs(product.image), title: lp.title, description: lp.description,
      jsonLd: [schema, breadcrumbL([[L.nav['/'], '/'], [L.nav['/products'], '/products'], [lp.name, `/products/${product.slug}`]])],
      html: wrapL(`<nav aria-label="Breadcrumb">${a('/products', L.label.products)} / ${esc(lp.name)}</nav><h1>${esc(lp.name)}</h1><p>${esc(lp.body)}</p>${productImage(product, lp.name)}`
        + (f && lf ? `<ul><li>${esc(L.label.content)}${sep}${esc(lf.content)}</li><li>${esc(L.label.container)}${sep}${esc(lf.container)}</li><li>${esc(L.label.size)}${sep}${esc(f.dimensions)}</li><li>${esc(L.label.oil)}${sep}${esc(lf.oil)}</li></ul><p>${esc(L.label.maker)}${sep}<a href="${esc(f.source)}">StoneJeju</a>${stop}${esc(L.label.seller)}${sep}HONDIT${stop.trim()}</p>` : product.category === 'CARE' ? `<p>${esc(L.label.careBrand)}</p>` : '')
        + `<section><h2>${esc(L.label.highlights)}</h2><ul>${lp.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></section>`
        + `<section><h2>${esc(L.label.howTo)}</h2><p>${esc(L.label.followLabel)}</p><ol>${lp.howTo.map((h) => `<li>${esc(h)}</li>`).join('')}</ol></section>`
        + `<section><h2>${esc(L.label.goodFor)}</h2><p>${esc(lp.goodFor)}</p></section>`
        + (f ? `<section><h2>${esc(L.label.care)}</h2><ul>${L.care.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>` : '')
        + `<section><h2>${esc(L.label.terms)}</h2>${termsL(rows, product.slug)}${rows.length ? '<p>' + esc(L.termsNote) + '</p>' : ''}</section>`
        + (f ? related : '')
        + `<p>${a(`/bulk-orders/${product.slug}`, L.label.chooseQty)} · ${a('/policy/refund', L.label.refund)} · ${a('/shipping', L.label.shipping)} · ${a('/contact', L.label.ask)}</p>`) });
  }
  if (path === 'bulk') {
    const c = L.pages.bulk;
    return page('/bulk-orders', { title: c.title, description: c.description,
      jsonLd: [org(), breadcrumbL([[L.nav['/'], '/'], [L.nav['/bulk-orders'], '/bulk-orders']])],
      html: wrapL(`<h1>${esc(c.h1)}</h1>${showOrderTerms ? '<p>' + esc(c.intro) + '</p>' : ''}${list.map((p) => `<section><h2>${a(`/bulk-orders/${p.slug}`, name(p))}</h2>${showOrderTerms ? termsL(orderTerms(p), p.slug) : ''}</section>`).join('')}${showOrderTerms ? '<p>' + esc(L.termsNote) + '</p>' : ''}<p>${a('/shipping', L.nav['/shipping'])} · ${a('/policy/refund', L.label.refund)} · ${a('/contact', L.nav['/contact'])}</p>`) });
  }
  if (path === 'jeju') {
    const c = L.pages.jeju;
    return page('/jeju', { title: c.title, description: c.description,
      jsonLd: [org(), breadcrumbL([[L.nav['/'], '/'], [L.nav['/jeju'], '/jeju']])],
      html: wrapL(`<h1>${esc(c.h1)}</h1>${c.paras.map((t) => `<p>${esc(t)}</p>`).join('')}<p>${esc(L.brandLine)}</p><p>${esc(L.whoLine)}</p><p>${a('/products', L.nav['/products'])} · ${a('/journal', L.nav['/journal'])}</p>`) });
  }
  if (path === 'about' || path === 'faq') {
    const info = infoPageFor(path, lang);
    const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang, mainEntity: info.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
    const links = (l = []) => (l.length ? `<p>${l.map(([label, href]) => a(href, label)).join(' · ')}</p>` : '');
    const sections = info.sections.map((sec) => `<section><h2>${esc(sec.heading)}</h2>${(sec.paragraphs || []).map((t) => `<p>${esc(t)}</p>`).join('')}${sec.items ? `<ul>${sec.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}${links(sec.links)}</section>`).join('');
    const extra = path === 'about' ? `<section><ul>${SITE_FACTS.makerPages.map(([label, url]) => `<li><a href="${esc(url)}">${esc(label)}</a></li>`).join('')}${SITE_FACTS.profiles.map(([label, url]) => `<li><a href="${esc(url)}" rel="me">${esc(label)}</a></li>`).join('')}</ul></section>` : '';
    return page(info.path, { title: info.title, description: info.description,
      jsonLd: [org(), breadcrumbL([[L.nav['/'], '/'], [info.navLabel, info.path]]), { '@context': 'https://schema.org', '@type': path === 'about' ? 'AboutPage' : 'WebPage', name: info.h1, url: seoUrl(info.path, lang), inLanguage: lang, about: { '@id': `${SITE}/#organization` } }, faqLd],
      html: wrapL(`<h1>${esc(info.h1)}</h1>${info.intro.map((t) => `<p>${esc(t)}</p>`).join('')}${sections}${extra}<section>${info.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</section>`) });
  }
  return { status: 404 };
}
