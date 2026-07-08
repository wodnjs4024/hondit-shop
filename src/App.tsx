import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { MobileShopCTA } from "./components/MobileShopCTA";
import { SectionRail } from "./components/SectionRail";
import { SiteHeader } from "./components/SiteHeader";
import { AdminLayout } from "./components/AdminLayout";
import { sections, type SectionId } from "./data/siteData";
import { trackEvent, trackPageView } from "./lib/analytics";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
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
import { PolicyPage } from "./pages/PolicyPage";
import { ShippingPage } from "./pages/ShippingPage";

function getScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / scrollable));
}

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
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [progress, setProgress] = useState(0);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const sectionIds = useMemo(() => sections.map((section) => section.id), []);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const mobileCtaVisible =
    isHome && (showMobileCta || (activeSection !== "home" && activeSection !== "explore" && activeSection !== "about"));

  const scrollToSection = (id: string, behavior: ScrollBehavior = "auto") => {
    const target = document.getElementById(id);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior });
  };

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      const scrollProgress = getScrollProgress();
      const hero = document.getElementById("home");
      const explore = document.getElementById("explore");
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      const exploreTop = explore ? explore.getBoundingClientRect().top : Number.POSITIVE_INFINITY;

      setProgress(scrollProgress);
      setShowMobileCta(heroBottom < window.innerHeight * 0.36 && exploreTop > window.innerHeight * 0.75);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id as SectionId);
        }
      },
      {
        root: null,
        rootMargin: "-28% 0px -52% 0px",
        threshold: [0.12, 0.24, 0.48, 0.72],
      },
    );

    sectionIds.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [sectionIds, isHome]);

  useEffect(() => {
    if (!isHome) return;

    const handleHash = () => {
      if (!window.location.hash) return;

      const id = window.location.hash.replace("#", "");
      if (sectionIds.includes(id as SectionId)) {
        setActiveSection(id as SectionId);
      }

      const alignHashSection = () => {
        scrollToSection(id);
        window.dispatchEvent(new Event("scroll"));
      };

      window.setTimeout(alignHashSection, 0);
      window.setTimeout(alignHashSection, 120);
      window.setTimeout(alignHashSection, 360);
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);

    return () => window.removeEventListener("hashchange", handleHash);
  }, [sectionIds, isHome]);

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
    const params = new URLSearchParams(location.search);
    const attribution = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      landing_page: `${location.pathname}${location.search}${location.hash}`,
      referrer: document.referrer || "",
      captured_at: new Date().toISOString(),
    };
    if (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign || attribution.referrer) {
      window.localStorage.setItem("hondit_attribution", JSON.stringify(attribution));
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jeju" element={<JejuPage />} />
        <Route path="/bulk-orders" element={<BulkOrdersPage />} />
        <Route path="/bulk-orders/:slug" element={<BulkProductPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/policy/:policy" element={<PolicyPage />} />
        <Route path="/order-complete/:orderNumber" element={<OrderCompletePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="/:policy" element={<PolicyPage />} />
      </Routes>
      {isHome && <SectionRail activeSection={activeSection} progress={progress} />}
      <MobileShopCTA visible={mobileCtaVisible} dark={activeSection === "diffuser"} />
    </>
  );
}
