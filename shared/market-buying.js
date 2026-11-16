// Plain answers to the questions answer engines could not settle from the site (checked 2026-11-16): can one piece be shipped
// to Hong Kong / Singapore / Taiwan, what does it cost delivered in that currency, what is the shipping cost, can oil be bought.
// Prices are never written here. They come from the same approved checkout terms the order page uses (passed in as `terms`),
// so the text cannot drift from checkout. Without live terms the price answer points to the order page instead.
import { pickupRequestTotal } from './contact-copy.js';
import { paypalCurrencyDigits } from './checkout-terms.js';
import { termsFor } from './market-overrides.js';

const SIZES = { 'diffuser-350g': '350g', 'diffuser-500g': '500g' };
export const BUYING_SLUGS = Object.keys(SIZES);
const krw = (size) => 'KRW ' + pickupRequestTotal(1, size).toLocaleString('en-US');
export const formatMoney = (minor, currency) => {
  const digits = paypalCurrencyDigits(currency);
  const [whole, fraction] = (minor / 10 ** digits).toFixed(digits).split('.');
  return `${currency} ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${fraction ? '.' + fraction : ''}`;
};

/* Smallest direct tier and the cheapest per-piece tier of one product in one market, from orderTerms() rows. */
export function buyingTerms(rowsBySlug) {
  const out = {};
  for (const [slug, rows] of Object.entries(rowsBySlug || {})) {
    for (const row of rows || []) {
      const tiers = [...row.tiers].sort((a, b) => a.quantity - b.quantity);
      if (!tiers.length) continue;
      const best = tiers.reduce((low, t) => (t.unitMinor < low.unitMinor ? t : low), tiers[0]);
      (out[slug] ||= {})[row.market] = { first: tiers[0], best: best.unitMinor < tiers[0].unitMinor ? best : null };
    }
  }
  return out;
}

const COPY = {
  en: {
    country: { SG: 'Singapore', HK: 'Hong Kong', TW: 'Taiwan', JP: 'Japan', MY: 'Malaysia', TH: 'Thailand' },
    heading: (c) => `Buying in ${c}: quick answers`,
    overviewHeading: 'Buying from Singapore, Hong Kong, Taiwan, Malaysia, Japan or Thailand: quick answers',
    singleQ: (c) => `Can I buy a single diffuser shipped to ${c}?`,
    singleSG: 'Yes, through HONDIT’s Shopee Singapore listing, which is linked on each product page and shows the current retail price. Direct checkout on this site starts at 5 pieces of one size, delivered together to one address.',
    single: (c, first) => `No. HONDIT does not ship a single piece to ${c}. Direct checkout starts at ${first} pieces of one size, delivered together to one address.`,
    pickup: `Visiting Jeju? One to three pieces can be picked up at Jeju Airport by prior arrangement: 350g ${krw('350g')}, 500g ${krw('500g')} each.`,
    priceQ: (c) => `How much does it cost delivered to ${c}, and what is the shipping cost?`,
    piece: (size, t, best) => `${size} × ${t.quantity} = ${formatMoney(t.totalMinor, t.currency)} (${formatMoney(t.unitMinor, t.currency)} each)${best ? `, ${best.quantity}+ pieces ${formatMoney(best.unitMinor, best.currency)} each` : ''}`,
    priceTail: (cur, market) => ` Shipping from Korea is included in these prices; there is no separate shipping charge. PayPal charges in ${cur}${market === 'MY' ? ' (Malaysia orders are priced in SGD)' : ''}. Import duties or taxes, if any, are paid by the recipient.`,
    noPrice: 'Current delivered prices in the local currency are on the order page for each size. Shipping from Korea is included in those prices.',
    overviewSingleQ: 'Can I buy a single diffuser?',
    overviewSingle: (first) => `In Singapore, yes: through HONDIT’s Shopee Singapore listing linked on this page. To Hong Kong, Taiwan, Malaysia, Japan and Thailand, HONDIT does not ship a single piece; direct checkout starts at ${first} pieces of one size, delivered together to one address.`,
    overviewPriceQ: 'How much does it cost delivered to my country, and what is the shipping cost?',
    overviewPriceTail: ' Shipping from Korea is included in every price above; there is no separate shipping charge. PayPal charges in the currency shown (Malaysia orders are priced in SGD). Import duties or taxes, if any, are paid by the recipient.',
    deliveryQ: 'How long does delivery take, and can I return it?',
    delivery: 'Orders ship from Korea after payment is confirmed and usually arrive 3-5 business days after dispatch, with tracking. Change-of-mind returns after dispatch are not accepted. Report a damaged, wrong or missing item within 7 days of delivery, with photos, for a replacement, reshipment or refund.',
    oilQ: 'Can I buy extra fragrance oil?',
    oil: 'Each diffuser comes with 10mL citrus fragrance oil. HONDIT does not sell refill oil separately. You can use your own fragrance or essential oil after rinsing the stones in warm water and drying them completely.',
    offers: 'Offer pages with price, delivery and returns',
  },
  'zh-HK': {
    country: { HK: '香港', TW: '台灣' },
    heading: (c) => `${c}購買：快速解答`,
    singleQ: (c) => `可以單件寄到${c}嗎？`,
    single: (c, first) => `不可以。HONDIT 不提供單件寄${c}。網站直接付款最少 ${first} 件（同一款式），一次寄到同一地址。`,
    pickup: `會到濟州旅遊？可預約於濟州機場交收 1 至 3 件：350g 每件 ${krw('350g')}，500g 每件 ${krw('500g')}。`,
    priceQ: (c) => `寄到${c}要幾多錢？運費多少？`,
    piece: (size, t, best) => `${size} × ${t.quantity} 件 = ${formatMoney(t.totalMinor, t.currency)}（每件 ${formatMoney(t.unitMinor, t.currency)}）${best ? `；${best.quantity} 件或以上每件 ${formatMoney(best.unitMinor, best.currency)}` : ''}`,
    priceTail: (cur) => `。以上價錢已包括由韓國寄出的運費，不另收運費。PayPal 以港幣（${cur}）收費。如有進口關稅或稅項，由收件人支付。`,
    noPrice: '各款式的最新連運費港幣價錢列在訂購頁面，運費已包括在價錢內。',
    deliveryQ: '幾耐收到？可以退貨嗎？',
    delivery: '確認付款後由韓國發貨，一般發貨後 3 至 5 個工作天送達，並提供追蹤資料。發貨後不接受改變主意的退貨。如收到損壞、錯誤或缺漏的商品，請於收貨後 7 天內附相片聯絡，HONDIT 會安排更換、補寄或退款。',
    oilQ: '可以另購香氛油嗎？',
    oil: '每件擴香附 10mL 柑橘香氛油。HONDIT 不另售補充油。用溫水沖洗石頭並完全晾乾後，可改用你自己的香氛油或精油。',
    offers: '價錢、送貨及退貨資料頁',
  },
  'zh-TW': {
    country: { HK: '香港', TW: '台灣' },
    heading: (c) => `在${c}購買：快速解答`,
    singleQ: (c) => `可以只買一個寄到${c}嗎？`,
    single: (c, first) => `不行。HONDIT 沒有提供單件寄送${c}。網站直接付款最少 ${first} 個（同一規格），一次寄到同一個地址。`,
    pickup: `會去濟州旅遊嗎？可以預約在濟州機場取貨 1 到 3 個：350g 每個 ${krw('350g')}，500g 每個 ${krw('500g')}。`,
    priceQ: (c) => `寄到${c}多少錢？運費怎麼算？`,
    piece: (size, t, best) => `${size} × ${t.quantity} 個 = ${formatMoney(t.totalMinor, t.currency)}（每個 ${formatMoney(t.unitMinor, t.currency)}）${best ? `；${best.quantity} 個以上每個 ${formatMoney(best.unitMinor, best.currency)}` : ''}`,
    priceTail: (cur) => `。以上價格已含從韓國寄出的運費，不另收運費。PayPal 以 ${cur}（新台幣）計價。如有進口關稅或稅金，由收件人負擔。`,
    noPrice: '各規格最新的含運新台幣價格列在訂購頁面，運費已含在價格內。',
    deliveryQ: '多久會收到？可以退貨嗎？',
    delivery: '確認付款後由韓國出貨，通常出貨後 3 到 5 個工作天送達，並提供追蹤資訊。出貨後不接受個人因素退貨。收到破損、寄錯或缺件的商品，請在收貨後 7 天內附照片聯絡，HONDIT 會安排更換、補寄或退款。',
    oilQ: '可以加購香氛油嗎？',
    oil: '每組附 10mL 柑橘香氛油。HONDIT 沒有另外販售補充油。把石頭用溫水沖洗並完全晾乾後，可以改用自己的香氛油或精油。',
    offers: '價格、配送與退貨資訊頁',
  },
  ja: {
    country: { JP: '日本' },
    heading: () => '日本からのご購入：よくある確認',
    singleQ: () => '1個だけ日本に送ってもらえますか？',
    single: (c, first) => `いいえ。日本への1個単位の配送は行っていません。サイトでの直接決済は同じサイズ${first}個からで、1つの住所へまとめてお届けします。`,
    pickup: `済州旅行の予定があれば、済州空港での受け取り（1〜3個）を事前に予約できます。350g 1個 ${krw('350g')}、500g 1個 ${krw('500g')}。`,
    priceQ: () => '日本までの送料込み価格と送料はいくらですか？',
    piece: (size, t, best) => `${size} × ${t.quantity}個 = ${formatMoney(t.totalMinor, t.currency)}（1個 ${formatMoney(t.unitMinor, t.currency)}）${best ? `、${best.quantity}個以上は1個 ${formatMoney(best.unitMinor, best.currency)}` : ''}`,
    priceTail: () => '。韓国からの送料は上記価格に含まれ、別途の送料はかかりません。PayPalで日本円（JPY）でのお支払いです。関税・輸入税がかかる場合は受取人のご負担です。',
    noPrice: 'サイズごとの最新の送料込み価格（日本円）は注文ページに表示しています。送料は価格に含まれます。',
    deliveryQ: '届くまでの日数と返品について教えてください。',
    delivery: 'お支払い確認後に韓国から発送し、通常は発送後3〜5営業日でお届けします（追跡番号あり）。発送後のお客様都合による返品はお受けしていません。破損・誤配送・不足は受け取りから7日以内に写真を添えてご連絡ください。交換、再送または返金をご案内します。',
    oilQ: 'オイルだけ追加で買えますか？',
    oil: '各ディフューザーに10mLのシトラスオイルが付属します。詰め替え用オイルの単品販売はありません。石をぬるま湯で洗い、完全に乾かせば、お手持ちのアロマオイルやエッセンシャルオイルも使えます。',
    offers: '価格・配送・返品の詳細ページ',
  },
};
const MERCHANT_LANG = { SG: 'en', HK: 'zh-HK', TW: 'zh-TW', JP: 'ja', MY: 'ms', TH: 'th' };
export const buyingCopyLanguage = (lang, market) => (lang === 'zh-HK' || lang === 'zh-TW' ? (market === 'TW' ? 'zh-TW' : 'zh-HK') : COPY[lang] ? lang : null);
const firstQuantity = (terms, market, slugs) => Math.min(...slugs.map((s) => terms?.[s]?.[market]?.first?.quantity).filter(Number.isFinite)) || 5;

/* The same direct tiers the order page offers, for one product in one market (used by the React product page). */
export function productBuyingTerms(product, market) {
  const tiers = [5, 10, 20, 30].map((quantity) => ({ quantity, t: termsFor(product, market, quantity) }))
    .filter(({ t }) => t.status === 'direct' && t.billingCurrency && t.unitMinor > 0)
    .map(({ quantity, t }) => ({ quantity, currency: t.billingCurrency, unitMinor: t.unitMinor, totalMinor: t.totalMinor, shippingMinor: t.shippingMinor || 0 }));
  return buyingTerms({ [product.slug]: tiers.length ? [{ market, tiers }] : [] });
}

/* Four answers for one market in that market's language (guide pages, Chinese/Japanese product and FAQ pages). */
export function marketBuyingQA(market, lang, terms, slugs = BUYING_SLUGS) {
  const L = COPY[buyingCopyLanguage(lang, market)];
  if (!L || !L.country[market]) return null;
  const c = L.country[market];
  const first = firstQuantity(terms, market, slugs);
  const pieces = slugs.map((s) => terms?.[s]?.[market] && L.piece(SIZES[s], terms[s][market].first, terms[s][market].best)).filter(Boolean);
  const currency = slugs.map((s) => terms?.[s]?.[market]?.first?.currency).find(Boolean);
  const english = buyingCopyLanguage(lang, market) === 'en';
  const price = pieces.length === slugs.length ? pieces.join(english ? '. ' : '。') + (english ? '.' : '') + L.priceTail(currency, market) : L.noPrice;
  return {
    heading: L.heading(c),
    items: [
      { q: L.singleQ(c), a: (market === 'SG' ? L.singleSG : L.single(c, first)) + ' ' + L.pickup },
      { q: L.priceQ(c), a: price },
      { q: L.deliveryQ, a: L.delivery },
      { q: L.oilQ, a: L.oil },
    ],
    offers: pieces.length ? slugs.map((s) => ({ label: `${SIZES[s]} · ${c}`, path: `/merchant/${market}/${MERCHANT_LANG[market]}/${s}` })) : [],
    offersLabel: L.offers,
  };
}

/* English answers covering several markets at once (English product page and FAQ). */
export function overviewBuyingQA(markets, terms, slugs = BUYING_SLUGS) {
  const L = COPY.en;
  const first = Math.min(...markets.filter((m) => m !== 'SG').map((m) => firstQuantity(terms, m, slugs)));
  const lines = markets.map((m) => {
    const parts = slugs.map((s) => terms?.[s]?.[m] && L.piece(SIZES[s], terms[s][m].first, terms[s][m].best)).filter(Boolean);
    return parts.length === slugs.length ? `${L.country[m]}: ${parts.join('; ')}.` : '';
  }).filter(Boolean);
  return {
    heading: L.overviewHeading,
    items: [
      { q: L.overviewSingleQ, a: L.overviewSingle(first) + ' ' + L.pickup },
      { q: L.overviewPriceQ, a: lines.length ? lines.join(' ') + L.overviewPriceTail : L.noPrice, list: lines, tail: L.overviewPriceTail.trim() },
      { q: L.deliveryQ, a: L.delivery },
      { q: L.oilQ, a: L.oil },
    ],
    offers: lines.length ? markets.flatMap((m) => slugs.map((s) => ({ label: `${SIZES[s]} · ${L.country[m]}`, path: `/merchant/${m}/${MERCHANT_LANG[m]}/${s}` }))) : [],
    offersLabel: L.offers,
  };
}
