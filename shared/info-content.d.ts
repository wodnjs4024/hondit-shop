export type InfoSection = { heading: string; paragraphs?: string[]; items?: string[]; links?: string[][] };
export type InfoPageContent = { path: string; navLabel: string; title: string; description: string; h1: string; intro: string[]; sections: InfoSection[]; faq: { q: string; a: string }[] };
export const SITE_FACTS: { address: string; businessRegistration: string; email: string; phone: string; wechat: string; instagram: string; profiles: string[][]; makerPages: string[][] };
export const ABOUT_PAGE: InfoPageContent;
export const FAQ_PAGE: InfoPageContent;
export const INFO_PAGES: { about: InfoPageContent; faq: InfoPageContent };
