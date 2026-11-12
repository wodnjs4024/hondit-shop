export type SeoLanguage = 'en' | 'ko' | 'ja' | 'zh-HK' | 'th';
export function canonicalSeoLanguage(lang: string | null | undefined, pathname?: string): SeoLanguage;
export function seoLanguagesFor(pathname: string): readonly SeoLanguage[];
