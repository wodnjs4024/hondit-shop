export type ShortCampaign = {
  market: "SG" | "HK" | "JP" | "TW";
  language: "en" | "zh-HK" | "ja" | "zh-TW";
  source: "instagram";
  medium: "organic_social";
  campaign: string;
  content: string;
};

const campaigns: Record<string, ShortCampaign> = {
  "/sg/ig": { market: "SG", language: "en", source: "instagram", medium: "organic_social", campaign: "sg_launch_202608", content: "sg_product_carousel_01" },
  "/hk/ig": { market: "HK", language: "zh-HK", source: "instagram", medium: "organic_social", campaign: "hk_launch_202608", content: "hk_product_carousel_01" },
  "/jp/ig": { market: "JP", language: "ja", source: "instagram", medium: "organic_social", campaign: "jp_launch_202608", content: "jp_diffuser_carousel_01" },
  "/tw/ig": { market: "TW", language: "zh-TW", source: "instagram", medium: "organic_social", campaign: "tw_launch_202608", content: "tw_diffuser_carousel_01" },
};

export function getShortCampaign(pathname: string) {
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "").toLowerCase() : pathname;
  return campaigns[key] || null;
}
