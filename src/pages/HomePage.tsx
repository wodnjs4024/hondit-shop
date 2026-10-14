import { homeMediaCopy } from "../data/homeMediaCopy";
import { StoneJejuFilm } from "../components/StoneJejuMedia";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { V23Page, V23ProductCard } from "../components/v23/SiteChrome";
import { EMAIL, SHOPEE, v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { PurchasePaths, ProductComparison } from "../components/SalesDiscovery";
import { discoveryText } from "../data/discoveryCopy";
import { trackEvent } from "../lib/analytics";
import { isStorefrontProductAllowedForMarket, marketCountryName, marketText, useMarket } from "../lib/market";
import { loadStorefrontProducts } from "../lib/storefrontApi";

export function HomePage() {
  const { market, language } = useMarket();
  const location = useLocation();
  const selectionParams = new URLSearchParams(location.search);
  selectionParams.set("market", market.code);
  selectionParams.set("lang", language);
  const pageQuery = `?${selectionParams.toString()}`;
  const filmCopy = homeMediaCopy(language);
  const countryName = marketCountryName(market, language);
  const productRailRef = useRef<HTMLDivElement | null>(null);
  const railDirectionRef = useRef(1);
  const railPausedRef = useRef(false);
  const [catalog, setCatalog] = useState<StorefrontProduct[]>(v23Products);
  const marketProducts = useMemo(
    () => catalog.filter((product) => isStorefrontProductAllowedForMarket(product, market)),
    [catalog, market],
  );
  const homeProductCopy = (() => {
    if (language === "ko") return { eyebrow: "제주에서 고른 컬렉션", title: "당신의", description: `${countryName}에서 구매 가능한 제품을 확인하세요.` };
    if (language === "ja") return { eyebrow: "済州から選んだコレクション", title: "あなたの", description: `${countryName}で購入できる商品をご覧ください。` };
    if (language === "zh-HK") return { eyebrow: "濟州精選系列", title: "選擇你的", description: `查看可配送至${countryName}的產品。` };
    if (language === "zh-TW" || language === "zh") return { eyebrow: "濟州精選系列", title: "選擇你的", description: `查看可配送至${countryName}的產品。` };
    if (language === "ms") return { eyebrow: "KOLEKSI PILIHAN JEJU", title: "Pilih", description: `Terokai produk yang tersedia untuk ${countryName}.` };
    if (language === "th") return { eyebrow: "คอลเลกชันจากเชจู", title: "เลือก", description: `ดูสินค้าที่มีสำหรับ${countryName}` };
    return { eyebrow: "JEJU-SELECTED COLLECTION", title: "Choose your", description: `Explore the products available for ${countryName}.` };
  })();

  useEffect(() => {
    loadStorefrontProducts().then(setCatalog).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!marketProducts.length) return;
    trackEvent("view_item_list", {
      item_list_name: "home_product_rail",
      items: marketProducts.map((product, index) => ({
        item_id: product.slug,
        item_name: product.name,
        item_category: product.category,
        index,
        price: product.marketUnitPrices?.[market.code] ?? product.bulkUnitPrice,
        currency: market.currency,
      })),
    });
  }, [market, marketProducts]);

  useEffect(() => {
    const rail = productRailRef.current;
    if (!rail || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let animationFrame = 0;
    let previousTime = 0;
    const animate = (time: number) => {
      if (!railPausedRef.current && time - previousTime >= 24) {
        const maxScroll = rail.scrollWidth - rail.clientWidth;
        if (maxScroll > 2) {
          if (rail.scrollLeft >= maxScroll - 1) railDirectionRef.current = -1;
          if (rail.scrollLeft <= 1) railDirectionRef.current = 1;
          rail.scrollLeft += railDirectionRef.current * 0.6;
        }
        previousTime = time;
      }
      animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [market.code, marketProducts.length]);

  const moveProductRail = (direction: -1 | 1) => {
    const rail = productRailRef.current;
    if (!rail) return;
    railDirectionRef.current = direction;
    rail.scrollBy({ left: direction * Math.min(420, rail.clientWidth * 0.72), behavior: "smooth" });
  };


  return (
    <V23Page>
      <main className="v23-home">
        <section className="discovery-hero home-film-hero">
          <div className="home-film-intro"><p className="v23-eyebrow">HONDIT · JEJU</p><h1>{discoveryText(language,'intro')}</h1><p>{filmCopy.intro}</p></div>
          <StoneJejuFilm kind="product" />
          <div className="discovery-hero-actions"><Link to={`/products${pageQuery}`}>{filmCopy.products} →</Link><Link to={`/bulk-orders${pageQuery}`}>{marketText(language,"Overseas bundle orders")} →</Link></div>
        </section>
        <section className="v23-editorial-breeze home-nature-story">
          <StoneJejuFilm kind="forest" />
          <div><p className="v23-eyebrow is-light"><span /> {marketText(language,"SEA - STONE - WIND")}</p>
            <h2>{filmCopy.forest}</h2><p>{filmCopy.forestText}</p><Link to={`/jeju${pageQuery}`}>{marketText(language,"Explore our Jeju ->")}</Link>
            <figure className="home-coast-reference"><img src="/images/hondit-jeju-dawn-hero-v2.webp" alt={filmCopy.coast} width={1600} height={900} loading="lazy" decoding="async"/><figcaption>{filmCopy.coast}</figcaption></figure>
          </div>
        </section>
        <section className="v23-diffuser-guide home-material-story" aria-labelledby="v23-diffuser-title">
          <div className="v23-diffuser-guide__inner">
            <div className="v23-diffuser-guide__copy">
              <p className="v23-eyebrow is-light"><span /> {marketText(language, "VOLCANIC DIFFUSER")}</p>
              <h2 id="v23-diffuser-title">{marketText(language, "No flame. No electricity.")}</h2>
              <p className="v23-diffuser-guide__lead">{marketText(language, "Refresh the scent whenever you choose.")}</p>
              <p>{marketText(language, "Apply the citrus fragrance oil directly to the porous Jeju volcanic stone. The stone absorbs the oil and releases the scent naturally-without reed sticks, heat or electricity.")}</p>
            </div>

            <StoneJejuFilm kind="detail">
                <div className="v23-diffuser-guide__links">
                  <Link to={`/products/diffuser-350g${pageQuery}`}>350g <span aria-hidden="true">↗</span></Link>
                  <Link to={`/products/diffuser-500g${pageQuery}`}>500g <span aria-hidden="true">↗</span></Link>
                </div>
            </StoneJejuFilm>

            <figure className="v23-diffuser-guide__product">
              <img
                src="/images/stonejeju-diffuser-product.png"
                alt="Jeju Volcanic Stone Diffuser with citrus fragrance oil, ceramic bowl and volcanic stones."
                width={1200}
                height={1200}
                sizes="(max-width: 680px) 35vw, 180px"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <strong>{marketText(language, "Jeju Volcanic Stone Diffuser")}</strong>
                <span>{marketText(language, "Jeju volcanic scoria")} / {marketText(language, "Citrus fragrance oil")}</span>
                <span>{marketText(language, "Flameless / No electricity / Refreshable scent")}</span>

              </figcaption>
            </figure>
          </div>

          <div className="v23-diffuser-guide__steps" aria-label="How to use the volcanic diffuser">
            <article>
              <span>01</span>
              <b>{marketText(language, "ADD 10-12 DROPS")}</b>
              <p>{marketText(language, "Apply the fragrance oil directly onto the volcanic stone.")}</p>
            </article>
            <article>
              <span>02</span>
              <b>{marketText(language, "LET IT ABSORB")}</b>
              <p>{marketText(language, "Allow the porous stone to absorb the oil naturally.")}</p>
            </article>
            <article>
              <span>03</span>
              <b>{marketText(language, "REFRESH AS NEEDED")}</b>
              <p>{marketText(language, "Add a few more drops when the scent becomes lighter.")}</p>
            </article>
          </div>
        </section>
        <ProductComparison products={marketProducts} />
        <section className="v23-home-commerce" aria-labelledby="home-products-title">
          <header className="v23-home-commerce__header">
            <div>
              <p className="v23-eyebrow"><span /> {homeProductCopy.eyebrow}</p>
              <h2 id="home-products-title">{homeProductCopy.title} <em>{marketText(language, "everyday ritual.")}</em></h2>
              <p>{homeProductCopy.description}</p>
            </div>
            <div className="v23-home-commerce__actions">
              <Link to={`/bulk-orders${pageQuery}`}>{marketText(language, "Bulk checkout", "대량주문")}</Link>
            </div>
          </header>

          <div className="v23-home-rail-controls" aria-label={marketText(language, "Product carousel controls", "상품 슬라이더 조작")}>
            <button type="button" onClick={() => moveProductRail(-1)} aria-label={marketText(language, "Previous products", "이전 상품")}>←</button>
            <button type="button" onClick={() => moveProductRail(1)} aria-label={marketText(language, "Next products", "다음 상품")}>→</button>
          </div>
          <div
            ref={productRailRef}
            className="v23-home-product-rail"
            onMouseEnter={() => { railPausedRef.current = true; }}
            onMouseLeave={() => { railPausedRef.current = false; }}
            onFocus={() => { railPausedRef.current = true; }}
            onBlur={() => { railPausedRef.current = false; }}
          >
            {marketProducts.map((product) => (
              <div className="v23-home-product-rail__item" key={product.slug}>
                <V23ProductCard product={product} />
              </div>
            ))}
          </div>

          <footer className="v23-home-commerce__trust">
            <span>{marketText(language, "Jeju-based student team", "제주 기반 학생 운영팀")}</span>
            <span>{marketText(language, `${countryName} delivery`, `${countryName} 배송`)}</span>
            <span>{marketText(language, `PayPal ${market.currency} checkout`, `PayPal ${market.currency} 결제`)}</span>
            <Link to={`/products${pageQuery}`}>{marketText(language, "View all products ->", "전체 상품 보기 ->")}</Link>
          </footer>
        </section>

        <PurchasePaths />
        <section className="discovery-section home-support"><div className="discovery-paths"><article className="discovery-path"><h2>{marketText(language,'Store & business purchase guide')}</h2><p>{marketText(language,'Product photos, specifications and published use guidance are available. Supply, dispatch timing, import rules and shipping are confirmed per order.')}</p><Link to={`/partners${pageQuery}`}>{marketText(language,'Store & business purchase guide')} →</Link></article><article className="discovery-path"><h2>{marketText(language,'Product care & follow-up')}</h2><p>{marketText(language,'Reorders require a new check of current prices, availability and delivery conditions.')}</p><Link to={`/guide/diffuser-350g${pageQuery}`}>350g · {marketText(language,'HOW TO USE')} →</Link><br/><Link to={`/guide/diffuser-500g${pageQuery}`}>500g · {marketText(language,'HOW TO USE')} →</Link></article><article className="discovery-path"><h2>{marketText(language,'TRUST & SUPPORT')}</h2><p>{marketText(language,'Jeju-based student team')}</p><p>{marketText(language,'Business registration no.')} 637-12-03059</p><a href={`mailto:${EMAIL}`}>{EMAIL}</a><p>{marketText(language,"You can also view HONDIT products and sales activity on our Singapore Shopee store.")}</p><a className="shopee-trust-link" href={SHOPEE} target="_blank" rel="noreferrer">{marketText(language,"View Shopee store ↗")}</a><p><Link to={`/jeju${pageQuery}`}>{marketText(language,'About HONDIT')} →</Link></p></article></div></section>
      </main>
    </V23Page>
  );
}
