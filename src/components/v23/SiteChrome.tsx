import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { HomeFooter, HomeHeader, HomeMobileBar } from "../home/HomeChrome";
import { EMAIL, INSTAGRAM, SHOPEE, type StorefrontProduct } from "../../data/v23SiteData";
import { trackEvent, trackNavigationClick, trackOutboundClick } from "../../lib/analytics";
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

export function V23Page({ children, chrome = "default" }: { children: ReactNode; chrome?: "default" | "home" }) {
  const { language } = useMarket();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add("hd-site");
    return () => document.body.classList.remove("hd-site");
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    if (!sections.length) return;
    sections.forEach((section) => section.classList.add("v23-reveal"));
    sections[0].classList.add("is-visible");
    if (!("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    sections.slice(1).forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const label = link.textContent?.trim().replace(/\s+/g, " ") || link.getAttribute("aria-label") || "unlabelled_link";
      const area = link.closest("header") ? "header" : link.closest("footer") ? "footer" : link.closest(".v23-mobile-actions") ? "mobile_sticky" : "main_content";
      const productCard = link.closest<HTMLElement>(".v23-product-card[data-item-id]");
      if (productCard) {
        trackEvent("select_item", {
          item_list_name: location.pathname === "/" ? "home_featured_products" : "products_catalog",
          interaction_target: href.includes("shopee") ? "shopee" : href.startsWith("/bulk-orders") ? "bulk_checkout" : "product_detail",
          items: [{
            item_id: productCard.dataset.itemId,
            item_name: productCard.dataset.itemName,
            item_category: productCard.dataset.itemCategory,
            price: Number(productCard.dataset.itemPrice || 0),
            currency: productCard.dataset.currency,
          }],
        });
        return;
      }
      if (/^https?:/i.test(href) && !href.startsWith(window.location.origin)) {
        const platform = href.includes("shopee") ? "shopee" : href.includes("instagram") ? "instagram" : "external_site";
        trackOutboundClick({ destination: href, label, area, platform });
        return;
      }
      if (href.startsWith("/") || href.startsWith("#")) {
        trackNavigationClick({ destination: href, label, area });
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [location.pathname]);

  return (
    <>
      <HomeHeader overlay={chrome === "home"} />
      {children}
      <HomeFooter />
      {!location.pathname.startsWith("/partners/") && <HomeMobileBar />}
      
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
          <i />{marketText(language,"FROM JEJU - TO")}{marketCountryName(market, language).toUpperCase()}
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
    <article
      className="v23-product-card"
      data-item-id={product.slug}
      data-item-name={productName}
      data-item-category={product.category}
      data-item-price={product.marketUnitPrices?.[market.code] ?? product.bulkUnitPrice}
      data-currency={market.currency}
    >
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
        <Link className="is-dark" to={`/bulk-orders?product=${product.slug}`}>{marketText(language,"Overseas bundle orders")} →</Link>
        <Link to={`/products/${product.slug}`}>{marketText(language, "View details", "View details")}</Link>
      </div>
      <p className="product-moq">{marketText(language,"Minimum")}: {product.bulkMoq} {marketText(language,"units")}</p>
      {market.hasShopee && <details className="retail-alternative"><summary>Shopee</summary><a href={product.shopee} target="_blank" rel="noreferrer">{marketText(language,"Buy on Shopee")} ↗</a></details>}
    </article>
  );
}
