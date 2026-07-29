import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { trackEvent, trackPageView } from "./lib/analytics";
import { MarketProvider, MarketSelectionDialog } from "./lib/market";
import { AdminCampaignLinksPage } from "./pages/AdminCampaignLinksPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminInquiriesPage } from "./pages/AdminInquiriesPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminOrderDetailPage } from "./pages/AdminOrderDetailPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { AdminReviewsPage } from "./pages/AdminReviewsPage";
import { AdminSettingsPage } from "./pages/AdminSettingsPage";
import { BulkOrdersPage } from "./pages/BulkOrdersPage";
import { BulkProductPage } from "./pages/BulkProductPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { JejuPage } from "./pages/JejuPage";
import { OrderCompletePage } from "./pages/OrderCompletePage";
import { PaymentFailedPage } from "./pages/PaymentFailedPage";
import { PolicyPage } from "./pages/PolicyPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ShippingPage } from "./pages/ShippingPage";
import { NotFoundPage } from "./pages/NotFoundPage";

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

function analyticsToken(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);
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
    if (location.pathname === "/") trackEvent("view_home");
    if (location.pathname === "/bulk-orders") trackEvent("view_bulk_list");
    if (location.pathname.startsWith("/bulk-orders/")) trackEvent("view_product", { page_path: location.pathname });
    if (location.pathname.startsWith("/products/")) trackEvent("view_product", { page_path: location.pathname });
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

      const sourceToken = analyticsToken(attribution.utm_source || "direct");
      const mediumToken = analyticsToken(attribution.utm_medium || "none");
      if (sourceToken) {
        trackEvent(`landing_${sourceToken}_${mediumToken || "none"}`.slice(0, 40), campaignPayload);
      }
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

  return (
    <MarketProvider>
      <MarketSelectionDialog disabled={isAdmin} />
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
    </MarketProvider>
  );
}
