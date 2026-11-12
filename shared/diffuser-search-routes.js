export const diffuserSlugs = ['diffuser-350g', 'diffuser-500g'];
export const diffuserMarkets = {
  SG: { market: 'SG', lang: 'en', hreflang: 'en-SG', locale: 'en_SG', path: '/diffusers', label: 'Singapore' },
  JP: { market: 'JP', lang: 'ja', hreflang: 'ja-JP', locale: 'ja_JP', path: '/diffusers/japan', label: '日本' },
  HK: { market: 'HK', lang: 'zh-HK', hreflang: 'zh-HK', locale: 'zh_HK', path: '/diffusers/hong-kong', label: '香港' },
  TW: { market: 'TW', lang: 'zh-TW', hreflang: 'zh-TW', locale: 'zh_TW', path: '/diffusers/taiwan', label: '台灣' },
};

export function diffuserMarket(market, lang) {
  const option = Object.hasOwn(diffuserMarkets, market) ? diffuserMarkets[market] : undefined;
  return option?.lang === lang ? option : undefined;
}

export function diffuserGuideMarket(path) {
  return Object.values(diffuserMarkets).find((option) => option.path === path);
}

export function diffuserProductPath(slug, option = diffuserMarkets.SG) {
  return '/products/' + slug + (option.market === 'SG' ? '' : '?' + new URLSearchParams({ market: option.market, lang: option.lang }));
}

export function diffuserProductLocale(path, search) {
  const slug = path.startsWith('/products/') ? path.slice('/products/'.length) : '';
  if (!diffuserSlugs.includes(slug)) return undefined;
  const query = new URLSearchParams(search);
  if (query.has('preview')) return undefined;
  const option = diffuserMarket(query.get('market'), query.get('lang'));
  return option ? { slug, option } : undefined;
}

export function diffuserMarketOptions(product) {
  return Object.values(diffuserMarkets).filter((option) => product?.markets?.[option.market] !== 'hidden');
}

export function diffuserGuideAlternates() {
  return [
    ...Object.values(diffuserMarkets).map(({ hreflang, path }) => ({ hreflang, path })),
    { hreflang: 'x-default', path: diffuserMarkets.SG.path },
  ];
}

export function diffuserProductAlternates(product) {
  const options = diffuserMarketOptions(product);
  return [
    ...options.map((option) => ({ hreflang: option.hreflang, path: diffuserProductPath(product.slug, option) })),
    ...(options.some((option) => option.market === 'SG') ? [{ hreflang: 'x-default', path: diffuserProductPath(product.slug) }] : []),
  ];
}
