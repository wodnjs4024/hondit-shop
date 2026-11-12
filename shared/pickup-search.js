import { salesPresentationCopy } from './sales-presentation-copy.js';

export const PICKUP_PATH = '/jeju/pickup';
export const PICKUP_IMAGE = '/images/jeju-airport-sign-reference.webp';
const languages = { en: 'en', ko: 'ko', ja: 'ja', 'zh-HK': 'zh-Hant', ms: 'ms', th: 'th' };

export function pickupSearchLanguage(language) {
  if (language === 'zh' || language === 'zh-TW') return 'zh-HK';
  return Object.hasOwn(languages, language) ? language : 'en';
}

export function pickupSearchPath(language) {
  const code = pickupSearchLanguage(language);
  return code === 'en' ? PICKUP_PATH : `${PICKUP_PATH}?lang=${code}`;
}

export const pickupAlternates = [
  ...Object.entries(languages).map(([code, hreflang]) => ({ hreflang, path: pickupSearchPath(code) })),
  { hreflang: 'x-default', path: PICKUP_PATH },
];

export function pickupSearchMeta(language) {
  const code = pickupSearchLanguage(language);
  const copy = salesPresentationCopy(code);
  return {
    lang: languages[code],
    title: `${copy.pickupNav} · StoneJeju 350g / 500g | HONDIT`,
    description: copy.pickupBody,
  };
}
