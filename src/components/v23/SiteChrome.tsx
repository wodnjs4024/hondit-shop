import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { EMAIL, INSTAGRAM, SHOPEE, type StorefrontProduct } from "../../data/v23SiteData";
import {
  displayLanguages,
  formatMarketUnitMoney,
  marketCountryName,
  marketProductText,
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
      <div className="v23-shipping-bar">
        {announcement || marketText(language, market.announcement, market.announcement)}
      </div>
      <header className="v23-nav">
        <div className="v23-nav-main">
          <Link className="v23-brand" to="/" aria-label="hondit home">
            hondit<span>.</span>
          </Link>
          <nav className={open ? "v23-nav-links is-open" : "v23-nav-links"} aria-label="Main navigation">
            <NavLink to="/" onClick={() => setOpen(false)}>
              {marketText(language, "Home", "Home")}
            </NavLink>
            <NavLink to="/jeju" onClick={() => setOpen(false)}>
              {marketText(language, "Explore Jeju", "Explore Jeju")}
            </NavLink>
            <NavLink to="/products" onClick={() => setOpen(false)}>
              {marketText(language, "Products", "Products")}
            </NavLink>
            <NavLink to="/bulk-orders" onClick={() => setOpen(false)}>
              {marketText(language, "Bulk Orders", "Bulk Orders")}
            </NavLink>
            <NavLink to="/shipping" onClick={() => setOpen(false)}>
              {marketText(language, "Shipping", "Shipping")}
            </NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)}>
              {marketText(language, "Contact", "Contact")}
            </NavLink>
          </nav>
          <div className="v23-nav-actions">
            {market.hasShopee ? (
              <a className="v23-shop-button" href={SHOPEE} target="_blank" rel="noreferrer">
                {marketText(language, "Shop on Shopee ->", "Shop on Shopee ->")}
              </a>
            ) : (
              <Link className="v23-shop-button" to="/bulk-orders">
                {marketText(language, "Bulk checkout ->", "Bulk checkout ->")}
              </Link>
            )}
            <button
              className="v23-menu-button"
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {marketText(language, "Menu", "Menu")}
            </button>
          </div>
        </div>
        <div className="v23-nav-tools" aria-label="Market and language settings">
          <label className="v23-market-switch" aria-label="Market">
            <span>Market</span>
            <select value={market.code} onChange={(event) => setMarket(event.target.value as MarketCode)}>
              {Object.values(markets).map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label} / {option.currency}
                </option>
              ))}
            </select>
          </label>
          <label className="v23-market-switch v23-language-switch" aria-label="Language">
            <span>Language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as DisplayLanguage)}>
              {displayLanguages.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.shortLabel}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
    </>
  );
}

export function V23Footer() {
  const { market, language } = useMarket();
  const footerLines = marketText(language, market.footerLine, market.footerLine).split("\n");

  return (
    <footer className="v23-footer">
      <div className="v23-footer-brand">
        <b>
          hondit<span>.</span>
        </b>
        <p>
          {footerLines[0]}
          <br />
          {footerLines[1] || ""}
        </p>
        <p>
          {marketText(language, "A student-led brand based at", "A student-led brand based at")}
          <br />
          {marketText(language, "Jeju National University.", "Jeju National University.")}
        </p>
        <p className="v23-footer-legal-line">Business registration no. 637-12-03059</p>
      </div>
      <div>
        <p>{marketText(language, "EXPLORE", "EXPLORE")}</p>
        <Link to="/jeju">{marketText(language, "Asia to Jeju", "Asia to Jeju")}</Link>
        <Link to="/products">{marketText(language, "Products", "Products")}</Link>
        <Link to="/bulk-orders">{marketText(language, "Bulk Orders", "Bulk Orders")}</Link>
        <Link to="/shipping">{marketText(language, "Shipping", "Shipping")}</Link>
      </div>
      <div>
        <p>{marketText(language, "CONNECT", "CONNECT")}</p>
        {market.hasShopee ? (
          <a href={SHOPEE} target="_blank" rel="noreferrer">
            Shopee -&gt;
          </a>
        ) : (
          <Link to="/bulk-orders">{marketText(language, "Bulk checkout ->", "Bulk checkout ->")}</Link>
        )}
        <a href={INSTAGRAM} target="_blank" rel="noreferrer">
          Instagram -&gt;
        </a>
        <a href={`mailto:${EMAIL}`}>{marketText(language, "Email", "Email")}</a>
        <Link to="/contact">{marketText(language, "Contact", "Contact")}</Link>
      </div>
      <div>
        <p>{marketText(language, "TRUST & SUPPORT", "TRUST & SUPPORT")}</p>
        <Link to="/shipping">{marketText(language, "Delivery guide", "Delivery guide")}</Link>
        <Link to="/policy/refund">{marketText(language, "Refund support", "Refund support")}</Link>
        <a href="https://www.jejunu.ac.kr/eng/" target="_blank" rel="noreferrer">
          JNU official site -&gt;
        </a>
      </div>
      <small>
        (c) 2026 hondit -{" "}
        {marketText(language, "Student-led project based at Jeju National University.", "Student-led project based at Jeju National University.")}{" "}
        <Link to="/policy/refund">{marketText(language, "Refund", "Refund")}</Link> -{" "}
        <Link to="/policy/privacy">{marketText(language, "Privacy", "Privacy")}</Link> -{" "}
        <Link to="/policy/terms">{marketText(language, "Terms", "Terms")}</Link> -{" "}
        <Link to="/policy/shipping">{marketText(language, "Shipping", "Shipping")}</Link>
      </small>
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
        <p className="v23-eyebrow">
          <span /> {eyebrow}
        </p>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
      <figure className="v23-page-hero-media">
        <img
          src={image}
          alt={imageAlt}
          width={1600}
          height={1100}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="(max-width: 900px) 100vw, 50vw"
        />
        <figcaption>
          <i /> FROM JEJU - TO {marketCountryName(market, language).toUpperCase()}
        </figcaption>
      </figure>
    </section>
  );
}

export function V23ProductCard({ product }: { product: StorefrontProduct }) {
  const { market, language } = useMarket();
  const [imageLoaded, setImageLoaded] = useState(false);
  const outOfStock = typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq;
  const displayPrice = formatMarketUnitMoney(product, market);
  const productBadge = marketProductText(language, product.badge);
  const productName = marketProductText(language, product.name);
  const productDetail = marketProductText(language, product.detail);

  return (
    <article className="v23-product-card">
      <Link className={`v23-product-image${imageLoaded ? " is-loaded" : ""}`} to={`/products/${product.slug}`}>
        <span>{outOfStock ? marketText(language, "OUT OF STOCK", "OUT OF STOCK") : productBadge}</span>
        <img
          src={product.image}
          alt={productName}
          width={880}
          height={1100}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 900px) 90vw, 20vw"
          onLoad={() => setImageLoaded(true)}
        />
      </Link>
      <Link className="v23-product-meta" to={`/products/${product.slug}`} aria-label={`${productName} details`}>
        <h3>{productName}</h3>
        <p>{productDetail}</p>
        <small>{marketText(language, `${market.currency} BULK UNIT PRICE`, `${market.currency} BULK UNIT PRICE`)}</small>
        <strong>{displayPrice}</strong>
      </Link>
      <div className="v23-product-links">
        <Link to={`/products/${product.slug}`}>{marketText(language, "View details", "View details")}</Link>
        {market.hasShopee ? (
          <a className="is-dark" href={product.shopee} target="_blank" rel="noreferrer">
            {marketText(language, "Buy on Shopee", "Buy on Shopee")}
          </a>
        ) : (
          <Link className="is-dark" to={`/bulk-orders?product=${product.slug}`}>
            {marketText(language, "Bulk checkout", "Bulk checkout")}
          </Link>
        )}
        {outOfStock ? (
          <span>{marketText(language, "Bulk unavailable", "Bulk unavailable")}</span>
        ) : market.hasShopee ? (
          <Link to={`/bulk-orders?product=${product.slug}`}>{marketText(language, "Bulk checkout", "Bulk checkout")}</Link>
        ) : (
          <Link to={`/contact?product=${product.slug}`}>{marketText(language, "Ask hondit", "Ask hondit")}</Link>
        )}
      </div>
    </article>
  );
}
