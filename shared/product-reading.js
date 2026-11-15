// Product page -> Journal links. Journal articles already link to products; this closes the loop so
// readers, crawlers and answer engines can move from a product to the stories that explain it.
import { articlePath, languageByCode } from './journal.js';

export const READING_LABELS = {
  en: 'Read more in the Journal', ko: '저널에서 더 읽기', ja: 'ジャーナルで読む',
  'zh-HK': '延伸閱讀', th: 'อ่านเพิ่มเติมในเจอร์นัล', ms: 'Baca lagi dalam Jurnal',
};
const PREFERRED = { en: ['en'], ko: ['en'], ja: ['ja'], 'zh-HK': ['zh-HK', 'zh-TW'], 'zh-TW': ['zh-TW', 'zh-HK'], th: ['en'], ms: ['en'] };

export function relatedReading(articles, slug, language = 'en', limit = 4) {
  const preferred = PREFERRED[language] || ['en'];
  const rank = (a) => { const i = preferred.indexOf(a.language); return i === -1 ? preferred.length : i; };
  const time = (a) => Date.parse(a.published_at || a.updated_at || 0) || 0;
  return (Array.isArray(articles) ? articles : [])
    .filter((a) => a && a.slug && languageByCode(a.language) && Array.isArray(a.related_products) && a.related_products.includes(slug))
    .sort((a, b) => rank(a) - rank(b) || time(b) - time(a))
    .slice(0, limit)
    .map((a) => ({ title: a.title, dek: a.dek || '', path: articlePath(a), language: a.language, hreflang: languageByCode(a.language).hreflang }));
}

export function readingLabel(language) {
  return READING_LABELS[language === 'zh-TW' ? 'zh-HK' : language] || READING_LABELS.en;
}
