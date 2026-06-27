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

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
let initialized = false;

const hasMeasurementId = Boolean(measurementId && measurementId !== "G-XXXXXXXXXX");
const attributionKey = "hondit_attribution_v1";

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

export function initAnalytics() {
  captureAttribution();

  if (!hasMeasurementId || initialized || typeof window === "undefined") return;
  const id = measurementId;
  if (!id) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id);
  initialized = true;
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  const payload = { ...getAttributionPayload(), ...params };

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

    window.gtag("config", measurementId, {
      page_path: path,
      page_title: document.title,
      ...attribution,
    });
  }
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
