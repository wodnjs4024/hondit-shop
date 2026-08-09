import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { V23CatalogGrid } from "../components/v23/CatalogGrid";
import { V23GeoJourney } from "../components/v23/GeoJourney";
import { V23Page } from "../components/v23/SiteChrome";
import { SHOPEE } from "../data/v23SiteData";
import { marketCountryName, marketText, useMarket } from "../lib/market";

export function HomePage() {
  const { market, language } = useMarket();
  const countryName = marketCountryName(market, language);
  const diffuserVideoRef = useRef<HTMLVideoElement | null>(null);

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
        <section className="v23-home-hero">
          <div className="v23-home-hero-copy">
            <p className="v23-eyebrow"><span /> {marketText(language, "JEJU NATIONAL UNIVERSITY - STUDENT-LED")}</p>
            <h1>{marketText(language, "Jeju, held in")}<br /><em>{marketText(language, "everyday ritual.")}</em></h1>
            <p>
              {marketText(
                language,
                `Vegan Korean cleansing care and volcanic-stone scent, selected in Jeju and delivered to ${countryName} with a clear way to buy.`,
                `제주에서 고른 비건 클렌징 케어와 화산석 향 제품을 ${countryName} 고객에게 명확한 구매 방식으로 제공합니다.`,
              )}
            </p>

            <div className="v23-route-cards">
              {market.hasShopee ? (
                <a href={SHOPEE} target="_blank" rel="noreferrer">
                  <small>{marketText(language, "FOR INDIVIDUALS", "개별 구매")}</small>
                  <b>{marketText(language, "Buy on Shopee", "Shopee에서 구매")}</b>
                  <span>{marketText(language, `Live prices, vouchers and secure ${countryName} checkout.`, `실시간 가격, 쿠폰, ${countryName} 결제 환경을 확인하세요.`)}</span>
                </a>
              ) : (
                <Link to="/bulk-orders">
                  <small>{marketText(language, `FOR ${market.shortLabel}`, `${market.koreanLabel} 전용`)}</small>
                  <b>{marketText(language, "Bulk only", "대량주문 전용")}</b>
                  <span>{marketText(language, `Fixed ${market.currency} prices and direct PayPal checkout.`, `고정 ${market.currency} 가격과 PayPal 직접 결제로 운영합니다.`)}</span>
                </Link>
              )}

              <Link to="/bulk-orders">
                <small>{marketText(language, "FOR BUSINESSES AND GROUPS", "사업자 및 단체")}</small>
                <b>{marketText(language, "Bulk Checkout", "대량주문")}</b>
                <span>{marketText(language, `Review MOQ, then pay securely through PayPal in ${market.currency}.`, `최소 주문 수량을 확인하고 PayPal ${market.currency}로 결제합니다.`)}</span>
              </Link>
            </div>

            <div className="v23-trust-row">
              <span>{marketText(language, "Jeju-based student team", "제주 기반 학생 운영팀")}</span>
              <span>
                {market.hasShopee
                  ? marketText(language, "Official Shopee route", "공식 Shopee 구매 경로")
                  : marketText(language, "Direct bulk checkout", "직접 대량주문")}
              </span>
              <span>{marketText(language, `PayPal ${market.currency} checkout`, `PayPal ${market.currency} 결제`)}</span>
            </div>
          </div>

          <figure className="v23-home-hero-media">
            <img src="/images/hondit-tidal-ritual-hero.webp" alt="hondit cleansing care and volcanic diffuser products on Jeju-inspired stone and water." />
          </figure>
        </section>

        <section className="v23-confidence">
          <article>
            <small>{marketText(language, "ORIGIN")}</small>
            <b>{marketText(language, "Jeju National University")}</b>
            <p>{marketText(language, "Student-led and based in Jeju City.", "제주시에 기반을 둔 학생 운영 프로젝트입니다.")}</p>
          </article>
          <article>
            <small>{marketText(language, market.hasShopee ? "RETAIL" : "ROUTE")}</small>
            <b>
              {market.hasShopee
                ? marketText(language, "Official Shopee route", "공식 Shopee 경로")
                : marketText(language, "Bulk only direct route", "대량주문 전용 경로")}
            </b>
            <p>
              {market.hasShopee
                ? marketText(language, "Live price, vouchers and protected checkout.", "실시간 가격, 쿠폰, 보호된 체크아웃을 이용합니다.")
                : marketText(language, `No Shopee retail route is shown for ${countryName}. Orders go through hondit checkout only.`, `${countryName}에는 Shopee 개별 구매 경로를 표시하지 않습니다. 주문은 hondit 체크아웃으로만 진행합니다.`)}
            </p>
          </article>
          <article>
            <small>{marketText(language, "DELIVERY")}</small>
            <b>{marketText(language, `${countryName} delivery`, `${countryName} 배송`)}</b>
            <p>{marketText(language, "Direct bulk orders dispatch from Korea after PayPal capture.", "대량주문은 PayPal 결제 완료 후 한국에서 발송 준비합니다.")}</p>
          </article>
          <article>
            <small>{marketText(language, "PAYMENT")}</small>
            <b>
              {market.hasShopee
                ? marketText(language, "Two clear routes", "두 가지 구매 경로")
                : marketText(language, `Fixed ${market.currency} bulk price`, `고정 ${market.currency} 대량주문가`)}
            </b>
            <p>
              {market.hasShopee
                ? marketText(language, `Shopee retail or secure PayPal ${market.currency} direct checkout.`, `Shopee 개별 구매 또는 PayPal ${market.currency} 직접 결제.`)
                : marketText(language, `Bulk orders are priced and captured in ${market.currency}.`, `대량주문은 ${market.currency}로 가격 표시 및 결제됩니다.`)}
            </p>
          </article>
        </section>

        <section className="v23-editorial-breeze">
          <img src="/images/hondit-jeju-dawn-hero-v2.webp" alt="Wind moving across a Jeju coastal field at dawn." />
          <div>
            <p className="v23-eyebrow is-light"><span /> {marketText(language, "SEA - STONE - WIND")}</p>
            <h2>{marketText(language, "A place you can feel,")}<br />{marketText(language, "before it becomes a ritual.")}</h2>
            <p>{marketText(language, "Our edit begins with Jeju's quiet materials: moving water, porous volcanic stone and air that never quite stands still.")}</p>
            <Link to="/jeju">{marketText(language, "Explore our Jeju ->")}</Link>
          </div>
        </section>

        <V23GeoJourney />

        <section className="v23-products-section">
          <div className="v23-section-heading is-cream">
            <div>
              <p className="v23-eyebrow"><span /> {marketText(language, "SHOP BY RITUAL")}</p>
              <h2>{marketText(language, "Find your")}<br /><em>{marketText(language, "everyday fit.")}</em></h2>
            </div>
          </div>
          <V23CatalogGrid featuredOnly />
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
              <img src="/images/stonejeju-diffuser-product.png" alt="Jeju Volcanic Stone Diffuser with citrus fragrance oil, ceramic bowl and volcanic stones." />
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
