type GtagCommand = "js" | "config" | "event";

type Attribution = {
  traffic_source: string;
  traffic_medium: string;
  traffic_campaign: string;
  traffic_content?: string;
  traffic_term?: string;
  landing_page: string;
  referrer: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, eventName: string | Date, params?: Record<string, unknown>) => void;
  }
}

const fallbackMeasurementId = "G-FKMMTFM45C";
const envMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const measurementId = envMeasurementId && envMeasurementId !== "G-XXXXXXXXXX" ? envMeasurementId : fallbackMeasurementId;
let initialized = false;

const hasMeasurementId = Boolean(measurementId);
const attributionKey = "hondit_attribution_v1";
type AnalyticsContext = {
  market_code: string;
  market_country: string;
  currency: string;
  display_language: string;
};
let analyticsContext: AnalyticsContext = {
  market_code: "SG",
  market_country: "Singapore",
  currency: "SGD",
  display_language: "en",
};

function getAnalyticsContext(): AnalyticsContext {
  if (typeof window === "undefined") return analyticsContext;
  const marketCode = new URLSearchParams(window.location.search).get("market") || window.localStorage.getItem("hondit-market") || analyticsContext.market_code;
  const language = new URLSearchParams(window.location.search).get("lang") || window.localStorage.getItem("hondit-language") || analyticsContext.display_language;
  const marketMap: Record<string, Pick<AnalyticsContext, "market_country" | "currency">> = {
    SG: { market_country: "Singapore", currency: "SGD" },
    HK: { market_country: "Hong Kong", currency: "HKD" },
    TW: { market_country: "Taiwan", currency: "TWD" },
    JP: { market_country: "Japan", currency: "JPY" },
  };
  const selected = marketMap[marketCode] || marketMap.SG;
  return { market_code: marketCode, display_language: language, ...selected };
}

export type CampaignAttribution = Attribution;

function getDefaultAttribution(): Attribution {
  if (typeof window === "undefined") {
    return {
      traffic_source: "direct",
      traffic_medium: "none",
      traffic_campaign: "none",
      landing_page: "/",
      referrer: "",
    };
  }

  return {
    traffic_source: "direct",
    traffic_medium: "none",
    traffic_campaign: "none",
    landing_page: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || "",
  };
}

function readStoredAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.sessionStorage.getItem(attributionKey);
    return value ? (JSON.parse(value) as Attribution) : null;
  } catch {
    return null;
  }
}

function writeStoredAttribution(attribution: Attribution) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(attributionKey, JSON.stringify(attribution));
  } catch {
    // Session storage may be unavailable in some in-app browsers. Tracking still works without persistence.
  }
}

export function captureAttribution() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const hasUtm = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].some((key) => params.has(key));

  if (!hasUtm && readStoredAttribution()) return;

  const attribution: Attribution = {
    traffic_source: params.get("utm_source") || (document.referrer ? "referral" : "direct"),
    traffic_medium: params.get("utm_medium") || (document.referrer ? "referral" : "none"),
    traffic_campaign: params.get("utm_campaign") || "none",
    traffic_content: params.get("utm_content") || undefined,
    traffic_term: params.get("utm_term") || undefined,
    landing_page: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || "",
  };

  writeStoredAttribution(attribution);
}

function getAttributionPayload() {
  return readStoredAttribution() || getDefaultAttribution();
}

export function getCurrentAttribution() {
  return getAttributionPayload();
}

export function setAnalyticsContext(context: AnalyticsContext) {
  analyticsContext = context;
  if (hasMeasurementId && typeof window !== "undefined" && window.gtag) {
    window.gtag("config", measurementId, { ...context, send_page_view: false });
  }
}

export function getPageType(pathname = typeof window !== "undefined" ? window.location.pathname : "/") {
  if (pathname === "/") return "home";
  if (pathname === "/products") return "product_list";
  if (pathname.startsWith("/products/")) return "product_detail";
  if (pathname === "/bulk-orders") return "bulk_product_list";
  if (pathname.startsWith("/bulk-orders/")) return "checkout";
  if (pathname === "/jeju") return "brand_story";
  if (pathname === "/shipping") return "shipping_info";
  if (pathname === "/contact") return "contact";
  if (pathname.startsWith("/order-complete/")) return "order_complete";
  if (pathname.startsWith("/payment-failed/")) return "payment_failed";
  if (pathname.startsWith("/policy/")) return "policy";
  if (pathname.startsWith("/admin")) return "admin";
  return "other";
}

export function initAnalytics() {
  captureAttribution();

  if (!hasMeasurementId || initialized || typeof window === "undefined") return;
  const id = measurementId;
  if (!id) return;

  if (window.gtag) {
    initialized = true;
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });
  initialized = true;
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  const payload = {
    ...getAttributionPayload(),
    ...getAnalyticsContext(),
    page_type: getPageType(),
    ...params,
  };

  if (hasMeasurementId && typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, payload);
    return;
  }

  if (import.meta.env.DEV) {
    console.info("[analytics]", eventName, payload);
  }
}

export function trackPageView(path: string) {
  if (hasMeasurementId && typeof window !== "undefined" && window.gtag && measurementId) {
    const attribution = getAttributionPayload();

    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      ...attribution,
      ...getAnalyticsContext(),
      page_type: getPageType(window.location.pathname),
    });
  }
}

export function trackNavigationClick(params: { destination: string; label: string; area: string }) {
  trackEvent("navigation_click", {
    destination_url: params.destination,
    link_text: params.label.slice(0, 100),
    navigation_area: params.area,
  });
}

export function trackOutboundClick(params: { destination: string; label: string; area: string; platform: string }) {
  trackEvent("outbound_click", {
    destination_url: params.destination,
    link_text: params.label.slice(0, 100),
    navigation_area: params.area,
    outbound_platform: params.platform,
  });
}

export function trackProductClick(params: {
  eventName: string;
  productName: string;
  destinationUrl: string;
  buttonLocation: string;
  clickTarget: "image" | "button";
}) {
  trackEvent(params.eventName, {
    product_name: params.productName,
    destination_url: params.destinationUrl,
    button_location: params.buttonLocation,
    click_target: params.clickTarget,
  });
}

export function trackStoreClick(buttonLocation: string) {
  trackEvent("shopee_shop_all_click", {
    destination_url: "https://shopee.sg/hondit.office.sg",
    button_location: buttonLocation,
    click_target: "button",
  });
}

export function trackJejuClick(source: string) {
  trackEvent("nav_jeju_click", {
    section_name: source,
    destination_url: "/jeju",
  });
}

export function trackJejuPreview(source: string) {
  trackEvent("jeju_preview_click", {
    section_name: source,
    destination_url: "/jeju",
  });
}

export function trackRitualSelect(selectionName: string) {
  trackEvent("find_ritual_select", {
    section_name: "find_your_ritual",
    selection_name: selectionName,
  });
}

export function trackFaqOpen(question: string) {
  trackEvent("faq_open", {
    section_name: "faq",
    selection_name: question,
  });
}

export function trackInstagramClick(buttonLocation: string) {
  trackEvent("instagram_profile_click", {
    destination_url: "https://www.instagram.com/hondit.office/",
    button_location: buttonLocation,
    click_target: "button",
  });
}

export function trackSectionNav(sectionId: string, sectionLabel: string) {
  trackEvent("section_nav_click", {
    section_id: sectionId,
    section_label: sectionLabel,
    button_location: "right_section_rail",
  });
}
