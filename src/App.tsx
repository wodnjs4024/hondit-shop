import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { trackEvent, trackPageView } from "./lib/analytics";
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

function routeMeta(pathname: string) {
  if (pathname === "/bulk-orders") {
    return {
      title: "Bulk Orders | hondit Singapore",
      description: "Order hondit cleansing and diffuser products by bulk quantity with PayPal checkout and free Singapore EMS shipping included.",
    };
  }
  if (pathname.startsWith("/bulk-orders/")) {
    return {
      title: "Bulk Product | hondit Singapore",
      description: "Review hondit bulk product details, MOQ, unit price and free Singapore EMS shipping before PayPal checkout.",
    };
  }
  if (pathname === "/shipping") {
    return {
      title: "Shipping | hondit Singapore",
      description: "Compare hondit retail Shopee shipping and bulk PayPal order shipping for Singapore buyers.",
    };
  }
  if (pathname === "/contact") {
    return {
      title: "Contact hondit | Bulk quote and custom quantity",
      description: "Contact hondit for custom quantity, bulk quote and product questions.",
    };
  }
  if (pathname === "/products") {
    return {
      title: "Products | hondit Singapore",
      description: "Explore hondit Jeju-inspired diffuser and vegan cleansing products with Shopee and direct bulk order options.",
    };
  }
  if (pathname.startsWith("/products/")) {
    return {
      title: "Product Detail | hondit Singapore",
      description: "Compare hondit product details, use cases, volume, Shopee purchase route and bulk inquiry options.",
    };
  }
  if (pathname.startsWith("/payment-failed/")) {
    return {
      title: "Payment Not Completed | hondit Singapore",
      description: "Retry payment, contact hondit or purchase through Shopee Singapore after an incomplete PayPal checkout.",
    };
  }
  if (pathname === "/jeju") {
    return {
      title: "Our Jeju | hondit",
      description: "Explore the Jeju sea, wind and volcanic stone textures that inspire hondit.",
    };
  }
  return {
    title: "hondit | Jeju-inspired care and scent in Singapore",
    description: "Shop Jeju-inspired Korean cleansing care and volcanic stone diffusers through Shopee Singapore or direct bulk PayPal orders.",
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
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
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
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="/:policy" element={<PolicyPage />} />
      </Routes>
    </>
  );
}
