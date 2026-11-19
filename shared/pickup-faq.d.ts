export const AVAILABILITY: Record<'en' | 'ko' | 'ja' | 'zh-HK' | 'zh-TW', string>;
export function pickupFaq(language?: string | null): { language: string; items: [string, string][] } | null;
export const pickupFaqHeading: Record<string, string>;
