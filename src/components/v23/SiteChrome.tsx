import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { EMAIL, INSTAGRAM, SHOPEE, type StorefrontProduct } from "../../data/v23SiteData";
import {
  convertSgdToMarketAmount,
  formatCurrency,
  marketCountryName,
  marketText,
  markets,
  useMarket,
  type DisplayLanguage,
  type MarketCode,
} from "../../lib/market";

export function V23Header() {
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const { market, setMarket, language, setLanguage } = useMarket();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((response) => (response.ok ? response.json() : null))
      .then((value: { settings?: { announcement?: string } } | null) => {
        if (value?.settings?.announcement) setAnnouncement(value.settings.announcement);
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <div className="v23-shipping-bar">{announcement || marketText(language, market.announcement, market.announcementKo)}</div>
      <header className="v23-nav">
        <Link className="v23-brand" to="/" aria-label="hondit home">
          hondit<span>.</span>
        </Link>
        <nav className={open ? "v23-nav-links is-open" : "v23-nav-links"} aria-label="Main navigation">
          <NavLink to="/" onClick={() => setOpen(false)}>{marketText(language, "Home", "홈")}</NavLink>
          <NavLink to="/jeju" onClick={() => setOpen(false)}>{marketText(language, "Explore Jeju", "제주")}</NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>{marketText(language, "Products", "상품")}</NavLink>
          <NavLink to="/bulk-orders" onClick={() => setOpen(false)}>{marketText(language, "Bulk Orders", "대량 주문")}</NavLink>
          <NavLink to="/shipping" onClick={() => setOpen(false)}>{marketText(language, "Shipping", "배송")}</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)}>{marketText(language, "Contact", "문의")}</NavLink>
        </nav>
        <a className="v23-shop-button" href={SHOPEE} target="_blank" rel="noreferrer">
          {marketText(language, "Shop on Shopee ->", "Shopee에서 구매 ->")}
        </a>
        <label className="v23-market-switch" aria-label="Market">
          <span>{marketText(language, "Market", "판매 국가")}</span>
          <select value={market.code} onChange={(event) => setMarket(event.target.value as MarketCode)}>
            {Object.values(markets).map((option) => (
              <option key={option.code} value={option.code}>
                {marketText(language, option.label, option.koreanLabel)} / {option.currency}
              </option>
            ))}
          </select>
        </label>
        <label className="v23-market-switch v23-language-switch" aria-label="Language">
          <span>{marketText(language, "Language", "표시 언어")}</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as DisplayLanguage)}>
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
        </label>
        <button className="v23-menu-button" type="button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {marketText(language, "Menu", "메뉴")}
        </button>
      </header>
    </>
  );
}

export function V23Footer() {
  const { market, language } = useMarket();
  const footerLines = marketText(language, market.footerLine, market.footerLineKo).split("\n");

  return (
    <footer className="v23-footer">
      <div className="v23-footer-brand">
        <b>hondit<span>.</span></b>
        <p>{footerLines[0]}<br />{footerLines[1]}</p>
        <p>{marketText(language, "A student-led brand based at", "제주대학교 기반 학생 운영 브랜드")}<br />Jeju National University.</p>
      </div>
      <div>
        <p>{marketText(language, "EXPLORE", "둘러보기")}</p>
        <Link to="/jeju">{marketText(language, "Asia to Jeju", "제주 이야기")}</Link>
        <Link to="/products">{marketText(language, "Products", "상품")}</Link>
        <Link to="/bulk-orders">{marketText(language, "Bulk Orders", "대량 주문")}</Link>
        <Link to="/shipping">{marketText(language, "Shipping", "배송")}</Link>
      </div>
      <div>
        <p>{marketText(language, "CONNECT", "연결")}</p>
        <a href={SHOPEE} target="_blank" rel="noreferrer">Shopee -&gt;</a>
        <a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram -&gt;</a>
        <a href={`mailto:${EMAIL}`}>Email</a>
        <Link to="/contact">{marketText(language, "Contact", "문의")}</Link>
      </div>
      <div>
        <p>{marketText(language, "TRUST & SUPPORT", "안내")}</p>
        <Link to="/shipping">{marketText(language, "Delivery guide", "배송 안내")}</Link>
        <Link to="/policy/refund">{marketText(language, "Refund support", "환불 안내")}</Link>
        <a href="https://www.jejunu.ac.kr/eng/" target="_blank" rel="noreferrer">JNU official site -&gt;</a>
      </div>
      <small>(c) 2026 hondit - Student-led project based at Jeju National University. <Link to="/policy/refund">Refund</Link> - <Link to="/policy/privacy">Privacy</Link> - <Link to="/policy/terms">Terms</Link></small>
      <Link className="v23-footer-admin" to="/admin">Admin sign-in</Link>
    </footer>
  );
}

export function V23Page({ children }: { children: ReactNode }) {
  return (
    <>
      <V23Header />
      {children}
      <V23Footer />
    </>
  );
}

export function V23PageHero({
  eyebrow,
  title,
  description,
  image = "/images/jeju-wind-coast-v2.webp",
  imageAlt,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  imageAlt: string;
  children?: ReactNode;
}) {
  const { market, language } = useMarket();

  return (
    <section className="v23-page-hero">
      <div className="v23-page-hero-copy">
        <p className="v23-eyebrow"><span /> {eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
      <figure className="v23-page-hero-media">
        <img src={image} alt={imageAlt} width={1600} height={1100} />
        <figcaption><i /> FROM JEJU - TO {marketCountryName(market, language).toUpperCase()}</figcaption>
      </figure>
    </section>
  );
}

export function V23ProductCard({ product }: { product: StorefrontProduct }) {
  const { market, language } = useMarket();
  const outOfStock = typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq;
  const displayPrice = formatCurrency(convertSgdToMarketAmount(product.bulkUnitPrice, market), market.currency, market.locale);

  return (
    <article className="v23-product-card">
      <Link className="v23-product-image" to={`/products/${product.slug}`}>
        <span>{outOfStock ? marketText(language, "OUT OF STOCK", "품절") : product.badge}</span>
        <img src={product.image} alt={product.name} width={880} height={1100} loading="lazy" />
      </Link>
      <div className="v23-product-meta">
        <h3>{product.name}</h3>
        <p>{product.detail}</p>
        <small>{marketText(language, `${market.currency} BULK UNIT PRICE`, `${market.currency} 대량 주문 단가`)}</small>
        <strong>{displayPrice}</strong>
      </div>
      <div className="v23-product-links">
        <Link to={`/products/${product.slug}`}>{marketText(language, "View details", "상세 보기")}</Link>
        <a className="is-dark" href={product.shopee} target="_blank" rel="noreferrer">{marketText(language, "Buy on Shopee", "Shopee 구매")}</a>
        {outOfStock ? <span>{marketText(language, "Bulk unavailable", "대량 주문 불가")}</span> : <Link to={`/bulk-orders?product=${product.slug}`}>{marketText(language, "Bulk checkout", "대량 주문")}</Link>}
      </div>
    </article>
  );
}
