import {salesPresentationCopy} from '../../data/salesPresentationCopy';
import {checkoutFlowCopy} from "../../data/checkoutFlowCopy";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { EMAIL, INSTAGRAM, SHOPEE } from "../../data/v23SiteData";
import {
  displayLanguages,
  marketCountryName,
  marketText,
  markets,
  useMarket,
  type DisplayLanguage,
  type MarketCode,
} from "../../lib/market";

/*
 * Site header, footer and mobile bar. The header sits on the hero film on the home (overlay)
 * and is a solid bar on every other page.
 */

const chromeCopy = {
  ko: { notice: "안내", settings: "국가·언어", close: "닫기", menu: "메뉴", explore: "둘러보기", connect: "연결", support: "고객 지원", seller: "판매자 정보", openMenu: "메뉴 열기" },
  en: { notice: "Notice", settings: "Country & language", close: "Close", menu: "Menu", explore: "Explore", connect: "Connect", support: "Support", seller: "Seller", openMenu: "Open menu" },
  ja: { notice: "お知らせ", settings: "国・言語", close: "閉じる", menu: "メニュー", explore: "ご案内", connect: "つながる", support: "サポート", seller: "販売者情報", openMenu: "メニューを開く" },
  zh: { notice: "公告", settings: "國家・語言", close: "關閉", menu: "選單", explore: "探索", connect: "聯絡", support: "支援", seller: "賣家資訊", openMenu: "開啟選單" },
  ms: { notice: "Notis", settings: "Negara & bahasa", close: "Tutup", menu: "Menu", explore: "Terokai", connect: "Hubungi", support: "Sokongan", seller: "Penjual", openMenu: "Buka menu" },
  th: { notice: "ประกาศ", settings: "ประเทศและภาษา", close: "ปิด", menu: "เมนู", explore: "สำรวจ", connect: "ติดต่อ", support: "ช่วยเหลือ", seller: "ข้อมูลผู้ขาย", openMenu: "เปิดเมนู" },
};
export function homeChromeCopy(language: DisplayLanguage) {
  return chromeCopy[language === "zh" || language === "zh-HK" || language === "zh-TW" ? "zh" : language];
}

const navItems = [["/products", "Products"], ["/bulk-orders", "Overseas bundle orders"], ["/partners", "Store & business purchase guide"], ["/jeju/pickup", "Jeju pickup information"], ["/jeju", "About HONDIT"]] as const;

function MarketLanguageFields({ idPrefix }: { idPrefix: string }) {
  const { market, setMarket, language, setLanguage } = useMarket();
  return <div className="hd-locale-fields">
    <label htmlFor={`${idPrefix}-market`}>{marketText(language, "Market")}</label>
    <select id={`${idPrefix}-market`} value={market.code} onChange={(event) => setMarket(event.target.value as MarketCode)}>
      {Object.values(markets).map((option) => <option key={option.code} value={option.code}>
        {marketCountryName(option, language)}{!["BN", "MO"].includes(option.code) && ` / ${option.currency}`}
      </option>)}
    </select>
    <label htmlFor={`${idPrefix}-language`}>{marketText(language, "Language")}</label>
    <select id={`${idPrefix}-language`} value={language} onChange={(event) => setLanguage(event.target.value as DisplayLanguage)}>
      {displayLanguages.map((option) => <option key={option.code} value={option.code}>{option.shortLabel}</option>)}
    </select>
  </div>;
}

const Chevron = () => <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>;
const Burger = () => <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M2 6h16M2 14h16" stroke="currentColor" strokeWidth="1.4" /></svg>;
const Cross = () => <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="m4 4 12 12M16 4 4 16" stroke="currentColor" strokeWidth="1.4" /></svg>;

export function HomeHeader({ overlay = false }: { overlay?: boolean }) {
  const { market, language } = useMarket();
  const location = useLocation();
  const partnerOnly = location.pathname.startsWith("/partners/");
  const pickupOnly = location.pathname === "/jeju/pickup" || (location.pathname === "/contact" && new URLSearchParams(location.search).get("fulfillment") === "jeju_pickup");
  const copy = homeChromeCopy(language);
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const localeRef = useRef<HTMLDivElement>(null);
  const languageLabel = displayLanguages.find((option) => option.code === language)?.shortLabel ?? language;

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((response) => (response.ok ? response.json() : null))
      .then((value: { settings?: { announcement?: string } } | null) => { if (value?.settings?.announcement) setNotice(value.settings.announcement); })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setLocaleOpen(false); } };
    const onPointer = (event: PointerEvent) => { if (localeRef.current && !localeRef.current.contains(event.target as Node)) setLocaleOpen(false); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); };
  }, []);
  useEffect(() => {
    document.body.classList.toggle("is-menu-open", menuOpen);
    return () => document.body.classList.remove("is-menu-open");
  }, [menuOpen]);

  const announcement = market.code !== "SG"
    ? `${marketCountryName(market, language)} · ${marketText(language, "Confirm final amount and shipping before payment.")}`
    : notice ? marketText(language, notice) : marketText(language, market.announcement, market.announcement);

  return <>
    {!partnerOnly && !pickupOnly && <aside className="hd-announce" aria-label={copy.notice}>{announcement}</aside>}
    <header className={`hd-header${overlay ? " is-overlay" : ""}${!overlay || solid || menuOpen ? " is-solid" : ""}`}>
      <button type="button" className="hd-header__menu" aria-expanded={menuOpen} aria-controls="hd-menu" aria-label={menuOpen ? copy.close : copy.openMenu} onClick={() => setMenuOpen((value) => !value)}>
        {menuOpen ? <Cross /> : <Burger />}
      </button>
      <Link className="hd-header__brand" to="/" aria-label="hondit home">hondit<span>.</span></Link>
      <nav className="hd-header__nav" aria-label="Main navigation">
        {navItems.map(([path, label]) => <NavLink key={path} to={path}>{path === "/bulk-orders" ? checkoutFlowCopy(language).primary : path === "/jeju/pickup" ? salesPresentationCopy(language).pickupNav : marketText(language, label)}</NavLink>)}
      </nav>
      <div className="hd-header__tools">
        <Link className="hd-header__pickup" to="/jeju/pickup">{salesPresentationCopy(language).pickupNav}</Link>
        <div className="hd-locale" ref={localeRef}>
          <button type="button" className="hd-locale__toggle" aria-expanded={localeOpen} aria-controls="hd-locale-panel" aria-label={`${copy.settings}: ${marketCountryName(market, language)} · ${languageLabel}`} onClick={() => setLocaleOpen((value) => !value)}>
            <span>{market.code}<span className="hd-locale__cur"> · {market.currency}</span></span><span className="hd-locale__lang">{languageLabel}</span><Chevron />
          </button>
          {localeOpen && <div className="hd-locale__panel" id="hd-locale-panel" role="group" aria-label={copy.settings}>
            <MarketLanguageFields idPrefix="hd-header" />
          </div>}
        </div>
      </div>
    </header>
    <div className={`hd-menu${menuOpen ? " is-open" : ""}`} id="hd-menu" hidden={!menuOpen}>
      <nav aria-label={copy.menu}>
        {navItems.map(([path, label]) => <NavLink key={path} to={path} onClick={() => setMenuOpen(false)}>{path === "/bulk-orders" ? checkoutFlowCopy(language).primary : marketText(language, label)}</NavLink>)}
        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>{marketText(language, "Contact", "Contact")}</NavLink>
      </nav>
      <section aria-label={copy.settings}>
        <p className="hd-menu__label">{copy.settings}</p>
        <MarketLanguageFields idPrefix="hd-menu" />
      </section>
    </div>
  </>;
}

export function HomeFooter() {
  const { market, language } = useMarket();
  const location = useLocation();
  const partnerOnly = location.pathname.startsWith("/partners/");
  const pickupOnly = location.pathname === "/jeju/pickup" || (location.pathname === "/contact" && new URLSearchParams(location.search).get("fulfillment") === "jeju_pickup");
  const copy = homeChromeCopy(language);
  const footerLines = (pickupOnly ? marketText(language, "StoneJeju 350g · Jeju Airport pickup") : marketText(language, market.footerLine, market.footerLine)).split("\n");
  return <footer className="hd-footer">
    <div className="hd-footer__brand">
      <b>hondit<span>.</span></b>
      <p>{footerLines[0]}{footerLines[1] ? <><br />{footerLines[1]}</> : null}</p>
    </div>
    <nav className="hd-footer__cols" aria-label={copy.explore}>
      <div>
        <h2>{copy.explore}</h2>
        <Link to="/products">{marketText(language, "Products", "Products")}</Link>
        {!partnerOnly && <Link to="/bulk-orders">{marketText(language, "Bulk Orders", "Bulk Orders")}</Link>}
        <Link to="/jeju/pickup">{salesPresentationCopy(language).pickupNav}</Link>
        <Link to="/jeju/stores">{marketText(language, "Meet StoneJeju in Jeju")}</Link>
        <Link to="/jeju">{marketText(language, "Asia to Jeju", "Asia to Jeju")}</Link>
      </div>
      <div>
        <h2>{copy.connect}</h2>
        {!partnerOnly && market.hasShopee && <a href={SHOPEE} target="_blank" rel="noreferrer">{marketText(language, "Shopee ->")}</a>}
        <a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram ↗</a>
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <Link to="/contact">{marketText(language, "Contact", "Contact")}</Link>
      </div>
      <div>
        <h2>{copy.support}</h2>
        <Link to="/shipping">{marketText(language, "Delivery guide", "Delivery guide")}</Link>
        <Link to="/policy/refund">{marketText(language, "Refund support", "Refund support")}</Link>
        <Link to="/policy/terms">{marketText(language, "Terms", "Terms")}</Link>
        <Link to="/policy/privacy">{marketText(language, "Privacy", "Privacy")}</Link>
      </div>
      <div>
        <h2>{copy.seller}</h2>
        <p>{marketText(language, "Student-led project based at Jeju National University.", "Student-led project based at Jeju National University.")}</p>
        <p>{marketText(language, "Business registration no.")} 637-12-03059</p>
        <a href="https://www.jejunu.ac.kr/eng/" target="_blank" rel="noreferrer">{marketText(language, "JNU official site ->")}</a>
      </div>
    </nav>
    <div className="hd-footer__base">
      <span>© 2026 hondit</span>
      <span>{marketCountryName(market, language)} · {market.currency}</span>
    </div>
  </footer>;
}

/** Browsing pages only. On the home it waits until the hero has gone; everywhere it steps aside for the footer. */
const barPaths = /^\/($|products\/?$|jeju\/?$|jeju\/stores|guide\/|shipping|policy\/)/;
export function HomeMobileBar() {
  const { language } = useMarket();
  const location = useLocation();
  const [shown, setShown] = useState(false);
  const enabled = barPaths.test(location.pathname);
  useEffect(() => {
    if (!enabled) return;
    const hero = document.querySelector(".hd-hero");
    const footer = document.querySelector(".hd-footer");
    let pastTop = false, footerVisible = false;
    const update = () => setShown(pastTop && !footerVisible);
    const onScroll = () => {
      pastTop = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 160;
      update();
    };
    const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => { footerVisible = entries[0].isIntersecting; update(); }) : null;
    if (observer && footer) observer.observe(footer);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer?.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [location.pathname, enabled]);
  if (!enabled) return null;
  const query = location.search;
  const productMatch = location.pathname.match(/^\/products\/([^/]+)/);
  const orderParams = new URLSearchParams(query);
  if(productMatch)orderParams.set("product",productMatch[1]);
  const orderHref = `/bulk-orders?${orderParams}`;
  return <nav className={`hd-mobile-bar v23-mobile-actions${shown ? " is-shown" : ""}`} aria-label={marketText(language, "Quick purchase links", "빠른 구매 링크")} aria-hidden={!shown}>
    <Link to={`/products${query}`} tabIndex={shown ? 0 : -1}>{marketText(language, "Products", "상품")}</Link>
    <Link to={orderHref} tabIndex={shown ? 0 : -1} className="is-primary">{checkoutFlowCopy(language).primary}</Link>
  </nav>;
}
