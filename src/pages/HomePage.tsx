import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { V23Page, V23ProductCard } from "../components/v23/SiteChrome";
import { SHOPEE, v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { trackEvent } from "../lib/analytics";
import { isStorefrontProductAllowedForMarket, marketCountryName, marketText, useMarket } from "../lib/market";
import { loadStorefrontProducts } from "../lib/storefrontApi";

export function HomePage() {
  const { market, language } = useMarket();
  const countryName = marketCountryName(market, language);
  const diffuserVideoRef = useRef<HTMLVideoElement | null>(null);
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

  useEffect(() => {
    const video = diffuserVideoRef.current;
    if (!video) return;

    const keepPlaying = () => {
      video.muted = true;
      video.defaultMuted = true;
      if (document.visibilityState === "hidden") return;
      const playRequest = video.play();
      if (playRequest) playRequest.catch(() => undefined);
    };

    keepPlaying();
    document.addEventListener("visibilitychange", keepPlaying);
    window.addEventListener("focus", keepPlaying);
    window.addEventListener("pageshow", keepPlaying);

    return () => {
      document.removeEventListener("visibilitychange", keepPlaying);
      window.removeEventListener("focus", keepPlaying);
      window.removeEventListener("pageshow", keepPlaying);
    };
  }, []);

  return (
    <V23Page>
      <main className="v23-home">
        <section className="v23-home-commerce" aria-labelledby="home-products-title">
          <header className="v23-home-commerce__header">
            <div>
              <p className="v23-eyebrow"><span /> {homeProductCopy.eyebrow}</p>
              <h1 id="home-products-title">{homeProductCopy.title} <em>{marketText(language, "everyday ritual.")}</em></h1>
              <p>{homeProductCopy.description}</p>
            </div>
            <div className="v23-home-commerce__actions">
              {market.hasShopee && <a href={SHOPEE} target="_blank" rel="noreferrer">{marketText(language, "Shop on Shopee ->", "Shopee에서 구매 ->")}</a>}
              <Link to="/bulk-orders">{marketText(language, "Bulk checkout", "대량주문")}</Link>
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
            <Link to="/products">{marketText(language, "View all products ->", "전체 상품 보기 ->")}</Link>
          </footer>
        </section>

        <section className="v23-editorial-breeze">
          <img
            src="/images/hondit-jeju-dawn-hero-v2.webp"
            alt="Wind moving across a Jeju coastal field at dawn."
            width={1600}
            height={900}
            sizes="100vw"
            loading="lazy"
            decoding="async"
          />
          <div>
            <p className="v23-eyebrow is-light"><span /> {marketText(language, "SEA - STONE - WIND")}</p>
            <h2>{marketText(language, "A place you can feel,")}<br />{marketText(language, "before it becomes a ritual.")}</h2>
            <p>{marketText(language, "Our edit begins with Jeju's quiet materials: moving water, porous volcanic stone and air that never quite stands still.")}</p>
            <Link to="/jeju">{marketText(language, "Explore our Jeju ->")}</Link>
          </div>
        </section>

        <section className="v23-diffuser-guide" aria-labelledby="v23-diffuser-title">
          <div className="v23-diffuser-guide__inner">
            <div className="v23-diffuser-guide__copy">
              <p className="v23-eyebrow is-light"><span /> {marketText(language, "VOLCANIC DIFFUSER")}</p>
              <h2 id="v23-diffuser-title">{marketText(language, "No flame. No electricity.")}<br />{marketText(language, "Refresh the scent whenever you choose.")}</h2>
              <p>{marketText(language, "Apply the citrus fragrance oil directly to the porous Jeju volcanic stone. The stone absorbs the oil and releases the scent naturally-without reed sticks, heat or electricity.")}</p>
            </div>

            <figure className="v23-diffuser-guide__video">
              <video
                ref={diffuserVideoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/images/stonejeju-diffuser-product.png"
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback"
                aria-label="Fragrance oil being applied directly to volcanic stone"
              >
                <source src="/videos/stonejeju-use-loop.mp4" type="video/mp4" />
              </video>
            </figure>

            <figure className="v23-diffuser-guide__product">
              <img
                src="/images/stonejeju-diffuser-product.png"
                alt="Jeju Volcanic Stone Diffuser with citrus fragrance oil, ceramic bowl and volcanic stones."
                width={1200}
                height={1200}
                sizes="(max-width: 900px) 100vw, 30vw"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <strong>{marketText(language, "Jeju Volcanic Stone Diffuser")}</strong>
                <span>{marketText(language, "Volcanic stone / Citrus fragrance oil / Ceramic bowl")}</span>
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
      </main>
    </V23Page>
  );
}
