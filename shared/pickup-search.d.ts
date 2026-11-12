export const PICKUP_PATH: string;
export const PICKUP_IMAGE: string;
export function pickupSearchLanguage(language?: string | null): string;
export function pickupSearchPath(language?: string | null): string;
export const pickupAlternates: { hreflang: string; path: string }[];
export function pickupSearchMeta(language?: string | null): { lang: string; title: string; description: string };
