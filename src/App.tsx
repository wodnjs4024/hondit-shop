import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { getCampaignLandingEventName, trackEvent, trackPageView } from "./lib/analytics";
import { MarketProvider, MarketSelectionDialog } from "./lib/market";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

const AdminLayout = lazy(() => import("./components/AdminLayout").then((module) => ({ default: module.AdminLayout })));
const AdminCampaignLinksPage = lazy(() => import("./pages/AdminCampaignLinksPage").then((module) => ({ default: module.AdminCampaignLinksPage })));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const AdminInquiriesPage = lazy(() => import("./pages/AdminInquiriesPage").then((module) => ({ default: module.AdminInquiriesPage })));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })));
const AdminOrderDetailPage = lazy(() => import("./pages/AdminOrderDetailPage").then((module) => ({ default: module.AdminOrderDetailPage })));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage").then((module) => ({ default: module.AdminOrdersPage })));
const AdminProductsPage = lazy(() => import("./pages/AdminProductsPage").then((module) => ({ default: module.AdminProductsPage })));
const AdminReviewsPage = lazy(() => import("./pages/AdminReviewsPage").then((module) => ({ default: module.AdminReviewsPage })));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettingsPage").then((module) => ({ default: module.AdminSettingsPage })));
const BulkOrdersPage = lazy(() => import("./pages/BulkOrdersPage").then((module) => ({ default: module.BulkOrdersPage })));
const BulkProductPage = lazy(() => import("./pages/BulkProductPage").then((module) => ({ default: module.BulkProductPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const JejuPage = lazy(() => import("./pages/JejuPage").then((module) => ({ default: module.JejuPage })));
const OrderCompletePage = lazy(() => import("./pages/OrderCompletePage").then((module) => ({ default: module.OrderCompletePage })));
const PaymentFailedPage = lazy(() => import("./pages/PaymentFailedPage").then((module) => ({ default: module.PaymentFailedPage })));
const PolicyPage = lazy(() => import("./pages/PolicyPage").then((module) => ({ default: module.PolicyPage })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then((module) => ({ default: module.ProductDetailPage })));
const ProductsPage = lazy(() => import("./pages/ProductsPage").then((module) => ({ default: module.ProductsPage })));
const ShippingPage = lazy(() => import("./pages/ShippingPage").then((module) => ({ default: module.ShippingPage })));

const siteUrl = "https://hondit-shop.vercel.app";
const defaultOgImage = `${siteUrl}/images/hondit-collection-hero.webp`;

type PageMeta = {
  title: string;
  description: string;
  robots: string;
  image: string;
};

const productMeta: Record<string, { title: string; description: string; image: string }> = {
  "diffuser-350g": {
    title: "Volcanic Diffuser 350g | hondit",
    description: "Compact Jeju volcanic stone diffuser for small spaces, with bulk checkout and market-specific payment.",
    image: `${siteUrl}/images/diffuser-350g.webp`,
  },
  "diffuser-500g": {
    title: "Volcanic Diffuser 500g | hondit",
    description: "Larger Jeju volcanic stone diffuser for rooms and shared spaces, available for bulk order.",
    image: `${siteUrl}/images/diffuser-500g.webp`,
  },
  "foam-oil": {
    title: "Vegan Foam Oil 150ml | hondit",
    description: "Vegan Korean foam oil cleanser selected for everyday cleansing and bulk market checkout.",
    image: `${siteUrl}/images/foam-oil.webp`,
  },
  "foaming-cleanser": {
    title: "Vegan Foaming Cleanser 200ml | hondit",
    description: "Soft everyday vegan foaming cleanser with direct bulk order options.",
    image: `${siteUrl}/images/foaming-cleanser.webp`,
  },
  "cleansing-water": {
    title: "Vegan Cleansing Water 300ml | hondit",
    description: "Light vegan cleansing water for quick daily cleanse, available through hondit bulk order.",
    image: `${siteUrl}/images/cleansing-water.webp`,
  },
};

const policyMeta: Record<string, { title: string; description: string }> = {
  terms: {
    title: "Terms | hondit",
    description: "Review hondit purchasing terms for market-specific bulk orders and PayPal checkout.",
  },
  refund: {
    title: "Refund Policy | hondit",
    description: "Review hondit refund, exchange and support terms for bulk orders.",
  },
  "refund-policy": {
    title: "Refund Policy | hondit",
    description: "Review hondit refund, exchange and support terms for bulk orders.",
  },
  privacy: {
    title: "Privacy Policy | hondit",
    description: "Learn how hondit uses checkout, inquiry and payment reference information.",
  },
  shipping: {
    title: "Shipping Policy | hondit",
    description: "Review hondit market-specific shipping and delivery information.",
  },
  "shipping-policy": {
    title: "Shipping Policy | hondit",
    description: "Review hondit market-specific shipping and delivery information.",
  },
};

function routeMeta(pathname: string): PageMeta {
  if (pathname.startsWith("/admin")) {
    return {
      title: "Admin | hondit",
      description: "Protected hondit operations console.",
      robots: "noindex,nofollow",
      image: defaultOgImage,
    };
  }
  if (pathname === "/") {
    return {
      title: "hondit | Jeju-inspired care and scent",
      description: "Shop Jeju-inspired Korean cleansing care and volcanic stone diffusers through market-specific direct bulk PayPal orders.",
      robots: "index,follow",
      image: defaultOgImage,
    };
  }
  if (pathname === "/bulk-orders") {
    return {
      title: "Bulk Orders | hondit",
      description: "Order hondit cleansing and diffuser products by bulk quantity with market-specific PayPal checkout.",
      robots: "index,follow",
      image: `${siteUrl}/images/hondit-collection-studio.png`,
    };
  }
  if (pathname.startsWith("/bulk-orders/")) {
    const slug = pathname.split("/").filter(Boolean).at(-1) || "";
    if (productMeta[slug]) {
      return {
        ...productMeta[slug],
        title: `Bulk ${productMeta[slug].title}`,
        description: `Review MOQ, unit price, shipping details and PayPal checkout for ${productMeta[slug].title.replace(" | hondit", "")}.`,
        robots: "index,follow",
      };
    }
    return {
      title: "Page Not Found | hondit",
      description: "This hondit page could not be found.",
      robots: "noindex,follow",
      image: defaultOgImage,
    };
  }
  if (pathname === "/shipping") {
    return {
      title: "Shipping | hondit",
      description: "Compare hondit market-specific delivery windows and direct bulk PayPal order shipping.",
      robots: "index,follow",
      image: `${siteUrl}/images/jeju-wind-coast-v2.webp`,
    };
  }
  if (pathname === "/contact") {
    return {
      title: "Contact hondit | Bulk quote and custom quantity",
      description: "Contact hondit for custom quantity, bulk quote and product questions.",
      robots: "index,follow",
      image: `${siteUrl}/images/jnu-campus.webp`,
    };
  }
  if (pathname === "/products") {
    return {
      title: "Products | hondit",
      description: "Explore hondit Jeju-inspired diffuser and vegan cleansing products with market-specific bulk order options.",
      robots: "index,follow",
      image: `${siteUrl}/images/hondit-collection-hero.webp`,
    };
  }
  if (pathname.startsWith("/products/")) {
    const slug = pathname.split("/").filter(Boolean).at(-1) || "";
    if (productMeta[slug]) return { ...productMeta[slug], robots: "index,follow" };
    return {
      title: "Page Not Found | hondit",
      description: "This hondit page could not be found.",
      robots: "noindex,follow",
      image: defaultOgImage,
    };
  }
  if (pathname.startsWith("/payment-failed/")) {
    return {
      title: "Payment Not Completed | hondit",
      description: "Retry payment or contact hondit after an incomplete PayPal checkout.",
      robots: "noindex,follow",
      image: defaultOgImage,
    };
  }
  if (pathname.startsWith("/order-complete/")) {
    return {
      title: "Order Complete | hondit",
      description: "Your hondit order has been recorded.",
      robots: "noindex,nofollow",
      image: defaultOgImage,
    };
  }
  if (pathname === "/jeju") {
    return {
      title: "Our Jeju | hondit",
      description: "Explore the Jeju sea, wind and volcanic stone textures that inspire hondit.",
      robots: "index,follow",
      image: `${siteUrl}/images/jeju-hero.png`,
    };
  }
  if (pathname.startsWith("/policy/")) {
    const policy = pathname.split("/").filter(Boolean).at(-1) || "";
    if (policyMeta[policy]) return { ...policyMeta[policy], robots: "index,follow", image: defaultOgImage };
    return {
      title: "Page Not Found | hondit",
      description: "This hondit page could not be found.",
      robots: "noindex,follow",
      image: defaultOgImage,
    };
  }
  return {
    title: "Page Not Found | hondit",
    description: "This hondit page could not be found. Return to hondit products, bulk orders or contact.",
    robots: "noindex,follow",
    image: defaultOgImage,
  };
}

function upsertMeta(selector: string, attrs: Record<string, string>, value: string) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    element = attrs.rel ? document.createElement("link") : document.createElement("meta");
    Object.entries(attrs).forEach(([key, attrValue]) => element?.setAttribute(key, attrValue));
    document.head.appendChild(element);
  }
  if (element instanceof HTMLLinkElement) element.href = value;
  else element.content = value;
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    const meta = routeMeta(location.pathname);
    const canonical = `https://hondit-shop.vercel.app${location.pathname}`;
    document.title = meta.title;
    upsertMeta('meta[name="description"]', { name: "description" }, meta.description);
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, meta.title);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, meta.description);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonical);
    upsertMeta('meta[property="og:image"]', { property: "og:image" }, meta.image);
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, meta.title);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, meta.description);
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, meta.image);
    upsertMeta('meta[name="robots"]', { name: "robots" }, meta.robots);
    upsertMeta('link[rel="canonical"]', { rel: "canonical" }, canonical);
    trackPageView(path);
    if (location.pathname.startsWith("/products/") || location.pathname.startsWith("/bulk-orders/")) {
      const itemId = location.pathname.split("/").filter(Boolean).at(-1) || "unknown";
      trackEvent("view_item", {
        item_id: itemId,
        interaction_context: location.pathname.startsWith("/bulk-orders/") ? "bulk_checkout_detail" : "product_detail",
        items: [{ item_id: itemId }],
      });
    }
    const params = new URLSearchParams(location.search);
    const attribution = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      landing_page: `${location.pathname}${location.search}${location.hash}`,
      referrer: document.referrer || "",
      captured_at: new Date().toISOString(),
    };
    if (
      attribution.utm_source ||
      attribution.utm_medium ||
      attribution.utm_campaign ||
      attribution.utm_content ||
      attribution.utm_term ||
      attribution.referrer
    ) {
      window.localStorage.setItem("hondit_attribution", JSON.stringify(attribution));
    }
    if (attribution.utm_source || attribution.utm_campaign) {
      const campaignPayload = {
        campaign_source: attribution.utm_source || "direct",
        campaign_medium: attribution.utm_medium || "none",
        campaign_name: attribution.utm_campaign || "none",
        campaign_content: attribution.utm_content || "none",
        campaign_term: attribution.utm_term || "none",
        landing_page: attribution.landing_page,
      };
      trackEvent("campaign_landing", campaignPayload);
      trackEvent(getCampaignLandingEventName(attribution.utm_source, attribution.utm_medium), campaignPayload);
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

  return (
    <MarketProvider>
      <MarketSelectionDialog disabled={isAdmin} />
      <Suspense fallback={<main className="v23-route-loading" aria-label="Loading page"><span /></main>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jeju" element={<JejuPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/bulk-orders" element={<BulkOrdersPage />} />
        <Route path="/bulk-orders/:slug" element={<BulkProductPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/policy/:policy" element={<PolicyPage />} />
        <Route path="/order-complete/:orderNumber" element={<OrderCompletePage />} />
        <Route path="/payment-failed/:orderNumber" element={<PaymentFailedPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="campaign-links" element={<AdminCampaignLinksPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </MarketProvider>
  );
}
