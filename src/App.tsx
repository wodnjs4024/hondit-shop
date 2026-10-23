import {JejuPickupPage} from "./pages/JejuPickupPage";
import {ProductGuidePage} from "./pages/ProductGuidePage";
// Consultation URLs accept only public identifiers. Never retain free text or contact details.
if (typeof window !== 'undefined' && ['/contact','/partners'].some(path=>window.location.pathname===path || window.location.pathname.startsWith(path+'/'))) {
 const url=new URL(window.location.href);const allowed=new Set(['product','quantity','market','lang','reason','utm_source','utm_medium','utm_campaign','utm_content','utm_term','purpose','fulfillment']);
 for(const key of Array.from(url.searchParams.keys()))if(!allowed.has(key))url.searchParams.delete(key);
 window.history.replaceState({},'',url);
}
import {PartnersPage} from "./pages/PartnersPage";
import {PartnerGuidePage} from "./pages/PartnerGuidePage";
import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { trackCampaignLanding, trackPageView } from "./lib/analytics";
import { MarketProvider, MarketSelectionDialog } from "./lib/market";
import { getShortCampaign } from "./lib/shortCampaign";
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
const AdminPricesPage = lazy(() => import("./pages/AdminPricesPage").then((module) => ({ default: module.AdminPricesPage })));
const ShopAssistant = lazy(() => import("./components/ShopAssistant").then((module) => ({ default: module.ShopAssistant })));
const AdminReviewsPage = lazy(() => import("./pages/AdminReviewsPage").then((module) => ({ default: module.AdminReviewsPage })));
const AdminResetPasswordPage = lazy(() => import("./pages/AdminPasswordForms").then((module) => ({ default: module.AdminResetPasswordPage })));
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
const JournalIndexPage = lazy(() => import("./pages/JournalPages").then((module) => ({ default: module.JournalIndexPage })));
const JournalArticlePage = lazy(() => import("./pages/JournalPages").then((module) => ({ default: module.JournalArticlePage })));
const AdminJournalPage = lazy(() => import("./pages/AdminJournalPage").then((module) => ({ default: module.AdminJournalPage })));
const AdminPressPage = lazy(() => import("./pages/AdminPressPage").then((module) => ({ default: module.AdminPressPage })));
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
  if(pathname==="/jeju/pickup")return {title:"Jeju pickup information | HONDIT",description:"StoneJeju 350g pickup requests by message; confirm time, place and payment method before collecting.",robots:"noindex,follow",image:defaultOgImage};
  if(pathname.startsWith("/guide/"))return {title:"Product care & follow-up | hondit",description:"Product use, care and consultation.",robots:"noindex,follow",image:defaultOgImage};
  if(pathname==='/partners')return {title:'Store & business purchase guide | hondit',description:'Review products, approved bundle prices and sales support. Order eligible bundles directly or contact HONDIT for additional requests.',robots:'index,follow',image:defaultOgImage};
  if(pathname.startsWith('/partners/'))return {title:'Partner product guide | hondit',description:'Partner product information.',robots:'noindex,nofollow',image:defaultOgImage};
  // Journal pages are server-rendered with their own meta; these values only cover the moment before data arrives.
  if (pathname === "/journal" || pathname.startsWith("/journal/")) {
    return { title: "HONDIT Journal", description: "Stories from Jeju behind the products HONDIT introduces overseas.", robots: "index,follow", image: defaultOgImage };
  }
  if (pathname.startsWith("/admin")) {
    return {
      title: "Admin | hondit",
      description: "Protected hondit operations console.",
      robots: "noindex,nofollow",
      image: defaultOgImage,
    };
  }
  const shortCampaign = getShortCampaign(pathname);
  if (shortCampaign) {
    const marketMeta = {
      SG: { title: "hondit Singapore | Jeju-inspired care and scent", description: "Discover hondit volcanic diffusers and gentle vegan cleansing for Singapore." },
      HK: { title: "hondit Hong Kong | 濟州香氣與純素潔膚", description: "探索來自韓國濟州的火山石擴香與純素溫和潔膚產品。" },
      JP: { title: "hondit Japan | 済州発のボルカニックディフューザー", description: "韓国・済州の風景から着想を得た、火を使わないボルカニックディフューザー。" },
      TW: { title: "hondit Taiwan | 來自濟州的火山石擴香", description: "探索來自韓國濟州、無火且免插電的火山石擴香。" },
    }[shortCampaign.market];
    return { ...marketMeta, robots: "index,follow", image: `${siteUrl}/images/hondit-collection-hero.webp` };
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
    if (slug === "cleansing-mix") return {title:"Cleansing Mix Order | hondit",description:"Review existing market-specific cleansing bundle rules or request confirmation.",robots:"noindex,follow",image:defaultOgImage};
    if (productMeta[slug]) {
      return {
        ...productMeta[slug],
        title: `Bulk ${productMeta[slug].title}`,
        description: `Review the minimum order, unit price, shipping details and PayPal checkout for ${productMeta[slug].title.replace(" | hondit", "")}.`,
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
    // Journal pages set their own title, description, image and robots (and the server already rendered them).
    const journal = location.pathname === "/journal" || location.pathname.startsWith("/journal/");
    if (journal) {
      upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonical);
      upsertMeta('link[rel="canonical"]', { rel: "canonical" }, canonical);
      trackPageView(path);
      trackCampaignLanding();
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
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
    trackCampaignLanding();
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <MarketProvider>
      <MarketSelectionDialog disabled={isAdmin} />
      <Suspense fallback={<main className="v23-route-loading" aria-label="Loading page"><span /></main>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jeju" element={<JejuPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/sg/ig" element={<ProductsPage />} />
        <Route path="/sg/fb" element={<ProductsPage />} />
        <Route path="/sg/c01" element={<ProductsPage />} />
        <Route path="/hk/ig" element={<ProductsPage />} />
        <Route path="/hk/fb" element={<ProductsPage />} />
        <Route path="/hk/c01" element={<ProductsPage />} />
        <Route path="/jp/ig" element={<ProductsPage />} />
        <Route path="/jp/fb" element={<ProductsPage />} />
        <Route path="/jp/c01" element={<ProductsPage />} />
        <Route path="/tw/ig" element={<ProductsPage />} />
        <Route path="/tw/fb" element={<ProductsPage />} />
        <Route path="/tw/c01" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/bulk-orders" element={<BulkOrdersPage />} />
        <Route path="/bulk-orders/:slug" element={<BulkProductPage />} />
        <Route path="/jeju/pickup" element={<JejuPickupPage />} />
        <Route path="/jeju/stores" element={<Navigate to={`/jeju${location.search}`} replace />} />
        <Route path="/guide/:productId" element={<ProductGuidePage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/partners/:slug" element={<PartnerGuidePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/journal" element={<JournalIndexPage />} />
        <Route path="/journal/:lang" element={<JournalIndexPage />} />
        <Route path="/journal/:lang/:slug" element={<JournalArticlePage />} />
        <Route path="/policy/:policy" element={<PolicyPage />} />
        <Route path="/order-complete/:orderNumber" element={<OrderCompletePage />} />
        <Route path="/payment-failed/:orderNumber" element={<PaymentFailedPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/prices" element={<AdminPricesPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="campaign-links" element={<AdminCampaignLinksPage />} />
          <Route path="journal" element={<AdminJournalPage />} />
          <Route path="journal/:articleId" element={<AdminJournalPage />} />
          <Route path="press" element={<AdminPressPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      {!isAdmin && <Suspense fallback={null}><ShopAssistant /></Suspense>}
    </MarketProvider>
  );
}
