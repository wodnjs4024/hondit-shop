import type { DiffuserMarket, DiffuserSlug } from './diffuser-search-routes.js';
export type DiffuserSpec = { officialName: string; content: string; dimensions: string; container: string; oil: string; description: string; source: string; image: string };
export const diffuserSpecs: Record<DiffuserSlug, DiffuserSpec>;
export const diffuserCare: string[];
export function thaiDiffuserActions(slug?: string): { deliveryLabel: string; deliveryPath: string; pickupLabel: string; pickupPath: string };
export function diffuserLocalizedMeta(slug: DiffuserSlug, option: DiffuserMarket): { name: string; title: string; description: string; image: string };
export function diffuserGuide(option: DiffuserMarket): {
  title: string; description: string; compare: string; model: string[]; modelDescription: string[];
  details: string; order: string; source: string; specs: string; included: string; oil: string;
  how: string; use: string; buy: string; buying: string; pickup: string; pickupNote: string; maker: string;
  other: string; guide: string; products: (DiffuserSpec & { slug: DiffuserSlug; name: string; useCase: string; detailsPath: string; orderPath: string })[];
  pickupPath: string; otherMarkets: DiffuserMarket[];
};
