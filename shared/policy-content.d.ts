export const EMAIL: string;
export type PolicySection = { heading: string; items: string[] };
export type PolicyContent = { title: string; intro: string; sections: PolicySection[] };
export function getPolicyContent(policy: string, countryName: string, currency: string, hasShopee: boolean): PolicyContent | null;
