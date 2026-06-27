import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { MobileShopCTA } from "./components/MobileShopCTA";
import { SectionRail } from "./components/SectionRail";
import { SiteHeader } from "./components/SiteHeader";
import { sections, type SectionId } from "./data/siteData";
import { trackPageView } from "./lib/analytics";
import { HomePage } from "./pages/HomePage";
import { JejuPage } from "./pages/JejuPage";

function getScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / scrollable));
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
    trackPageView(`${location.pathname}${location.search}${location.hash}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jeju" element={<JejuPage />} />
      </Routes>
      {isHome && <SectionRail activeSection={activeSection} progress={progress} />}
      <MobileShopCTA visible={mobileCtaVisible} dark={activeSection === "diffuser"} />
    </>
  );
}
