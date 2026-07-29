import { Link } from "react-router-dom";
import { V23CatalogGrid } from "../components/v23/CatalogGrid";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { SHOPEE } from "../data/v23SiteData";
import { marketCountryName, marketText, useMarket } from "../lib/market";

export function ProductsPage() {
  const { market, language } = useMarket();
  const countryName = marketCountryName(market, language);

  const heroDescription = market.hasShopee
    ? marketText(
        language,
        `Compare Korean vegan cleansing care and Jeju volcanic-stone scent for ${countryName}, then choose Shopee retail or secure direct PayPal bulk checkout.`,
        `${countryName} 고객을 위한 한국 비건 클렌징 케어와 제주 화산석 향 제품을 비교하고, Shopee 개별 구매 또는 PayPal 대량주문을 선택하세요.`,
      )
    : marketText(
        language,
        `Compare Korean vegan cleansing care and Jeju volcanic-stone scent for ${countryName}. This market uses direct bulk checkout only, with fixed ${market.currency} prices.`,
        `${countryName} 고객을 위한 한국 비건 클렌징 케어와 제주 화산석 향 제품을 비교하세요. 이 판매 지역은 고정 ${market.currency} 가격의 대량주문만 운영합니다.`,
      );

  return (
    <V23Page>
      <main className="v23-products-page">
        <V23PageHero
          eyebrow={marketText(language, "THE HONDIT EDIT", "hondit 셀렉션")}
          title={marketText(language, "Care shaped by water. Scent grounded in stone.", "물에서 시작한 케어. 돌에 머무는 향.")}
          description={heroDescription}
          image="/images/jeju-water-basalt-v2.webp"
          imageAlt="Clear Jeju water flowing across dark volcanic basalt."
        />

        <section className="v23-confidence">
          <article>
            <small>{marketText(language, "5 PRODUCTS", "상품 5종")}</small>
            <b>{marketText(language, "Focused care and scent edit", "케어와 향 제품 구성")}</b>
          </article>
          <article>
            <small>
              {market.currency} {marketText(language, "PRICES", "가격")}
            </small>
            <b>{marketText(language, "Fixed market bulk prices", "판매 지역별 고정 대량주문가")}</b>
          </article>
          <article>
            <small>
              {market.hasShopee
                ? marketText(language, "2 ROUTES", "2가지 구매 방식")
                : marketText(language, "BULK ONLY", "대량주문 전용")}
            </small>
            <b>
              {market.hasShopee
                ? marketText(language, "Individual or bulk orders", "개별 구매 또는 대량주문")
                : marketText(language, "Direct PayPal checkout", "PayPal 직접 결제")}
            </b>
          </article>
        </section>

        <section className="v23-products-section">
          <div className="v23-section-heading is-cream">
            <div>
              <p className="v23-eyebrow">
                <span /> {marketText(language, "SHOP BY RITUAL", "루틴별 상품")}
              </p>
              <h2>
                {marketText(language, "Find your", "나에게 맞는")}
                <br />
                <em>{marketText(language, "everyday fit.", "일상 루틴.")}</em>
              </h2>
            </div>
          </div>
          <V23CatalogGrid />
        </section>

        <section className="v23-route-guide">
          <div>
            <p className="v23-eyebrow is-light">
              <span /> {marketText(language, "CHOOSE YOUR ROUTE", "구매 방식 선택")}
            </p>
            <h2>
              {market.hasShopee
                ? marketText(language, "One item or a larger order?", "하나만 살까요, 대량으로 주문할까요?")
                : marketText(language, "Bulk orders only for this market.", "이 판매 지역은 대량주문만 운영합니다.")}
            </h2>
          </div>

          {market.hasShopee ? (
            <article>
              <small>{marketText(language, "INDIVIDUAL RETAIL", "개별 구매")}</small>
              <b>Shopee Singapore</b>
              <p>
                {marketText(
                  language,
                  "Use Shopee for live retail prices, vouchers, familiar checkout and order tracking.",
                  "실시간 판매가, 쿠폰, 익숙한 결제와 주문 추적은 Shopee에서 이용하세요.",
                )}
              </p>
              <a href={SHOPEE} target="_blank" rel="noreferrer">
                {marketText(language, "Shop on Shopee", "Shopee에서 구매")}
              </a>
            </article>
          ) : (
            <article>
              <small>{marketText(language, "DIRECT MARKET", "직접 판매 지역")}</small>
              <b>{marketText(language, "No Shopee route", "Shopee 경로 없음")}</b>
              <p>
                {marketText(
                  language,
                  `${countryName} orders are handled only through hondit's bulk checkout, so product price, quantity and payment stay in one controlled flow.`,
                  `${countryName} 주문은 hondit 대량주문으로만 처리합니다. 상품 가격, 수량, 결제가 하나의 운영 흐름에서 관리됩니다.`,
                )}
              </p>
              <Link to="/bulk-orders">{marketText(language, "Start bulk checkout", "대량주문 시작")}</Link>
            </article>
          )}

          <article>
            <small>{marketText(language, "BUSINESS AND GROUPS", "사업자 및 공동구매")}</small>
            <b>{marketText(language, "Direct PayPal checkout", "PayPal 직접 결제")}</b>
            <p>
              {marketText(
                language,
                `Review MOQ, included delivery and pay in ${market.currency} through PayPal or an eligible card.`,
                `MOQ와 배송 포함 금액을 확인한 뒤 ${market.currency}로 PayPal 또는 카드 결제합니다.`,
              )}
            </p>
            <Link to="/bulk-orders">{marketText(language, "Open bulk checkout", "대량주문 열기")}</Link>
          </article>
        </section>
      </main>
    </V23Page>
  );
}
