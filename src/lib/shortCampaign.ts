export type ShortCampaign = {
  market: "SG" | "HK" | "JP" | "TW";
  language: "en" | "zh-HK" | "ja" | "zh-TW";
  source: "instagram" | "facebook" | "community";
  medium: "organic_social" | "community" | "community_post";
  campaign: string;
  content: string;
};

const campaigns: Record<string, ShortCampaign> = {
  "/sg/ig": { market: "SG", language: "en", source: "instagram", medium: "organic_social", campaign: "sg_launch_202608", content: "sg_product_carousel_01" },
  "/sg/fb": { market: "SG", language: "en", source: "facebook", medium: "community", campaign: "sg_launch_202608", content: "sg_facebook_post_01" },
  "/sg/c01": { market: "SG", language: "en", source: "community", medium: "community_post", campaign: "sg_launch_202608", content: "sg_community_post_01" },
  "/hk/ig": { market: "HK", language: "zh-HK", source: "instagram", medium: "organic_social", campaign: "hk_launch_202608", content: "hk_product_carousel_01" },
  "/hk/fb": { market: "HK", language: "zh-HK", source: "facebook", medium: "community", campaign: "hk_launch_202608", content: "hk_facebook_post_01" },
  "/hk/c01": { market: "HK", language: "zh-HK", source: "community", medium: "community_post", campaign: "hk_launch_202608", content: "hk_community_post_01" },
  "/jp/ig": { market: "JP", language: "ja", source: "instagram", medium: "organic_social", campaign: "jp_launch_202608", content: "jp_diffuser_carousel_01" },
  "/jp/fb": { market: "JP", language: "ja", source: "facebook", medium: "community", campaign: "jp_launch_202608", content: "jp_facebook_post_01" },
  "/jp/c01": { market: "JP", language: "ja", source: "community", medium: "community_post", campaign: "jp_launch_202608", content: "jp_community_post_01" },
  "/tw/ig": { market: "TW", language: "zh-TW", source: "instagram", medium: "organic_social", campaign: "tw_launch_202608", content: "tw_diffuser_carousel_01" },
  "/tw/fb": { market: "TW", language: "zh-TW", source: "facebook", medium: "community", campaign: "tw_launch_202608", content: "tw_facebook_post_01" },
  "/tw/c01": { market: "TW", language: "zh-TW", source: "community", medium: "community_post", campaign: "tw_launch_202608", content: "tw_community_post_01" },
};

export function getShortCampaign(pathname: string) {
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "").toLowerCase() : pathname;
  return campaigns[key] || null;
}
