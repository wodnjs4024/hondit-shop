import { Link } from "react-router-dom";
import { V23CatalogGrid } from "../components/v23/CatalogGrid";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { SHOPEE } from "../data/v23SiteData";
import { marketCountryName, marketText, useMarket } from "../lib/market";

export function ProductsPage() {
  const { market, language } = useMarket();
  const countryName = marketCountryName(market, language);

  return (
    <V23Page>
      <main className="v23-products-page">
        <V23PageHero
          eyebrow={marketText(language, "THE HONDIT EDIT", "혼딧 셀렉션")}
          title={marketText(language, "Care shaped by water. Scent grounded in stone.", "물에서 시작한 케어. 돌에 머무는 향.")}
          description={marketText(
            language,
            `Compare Korean vegan cleansing care and Jeju volcanic-stone scent for ${countryName}, then choose Shopee retail or secure direct PayPal bulk checkout.`,
            `${countryName} 고객을 위한 한국 비건 클렌징 케어와 제주 화산석 디퓨저를 비교하고, Shopee 구매 또는 PayPal 대량주문을 선택하세요.`,
          )}
          image="/images/jeju-water-basalt-v2.webp"
          imageAlt="Clear Jeju water flowing across dark volcanic basalt."
        />
        <section className="v23-confidence">
          <article><small>{marketText(language, "5 PRODUCTS", "5개 상품")}</small><b>{marketText(language, "Focused care and scent edit", "케어와 향 제품만 엄선")}</b></article>
          <article><small>{market.currency} {marketText(language, "PRICES", "가격")}</small><b>{marketText(language, "Market-specific PayPal bulk checkout", "판매국가별 PayPal 대량 결제")}</b></article>
          <article><small>{marketText(language, "2 ROUTES", "2가지 구매 방식")}</small><b>{marketText(language, "Individual or bulk orders", "개별 구매 또는 대량 주문")}</b></article>
        </section>
        <section className="v23-products-section">
          <div className="v23-section-heading is-cream">
            <div>
              <p className="v23-eyebrow"><span /> {marketText(language, "SHOP BY RITUAL", "루틴별 상품")}</p>
              <h2>{marketText(language, "Find your", "나에게 맞는")}<br /><em>{marketText(language, "everyday fit.", "일상 루틴.")}</em></h2>
            </div>
          </div>
          <V23CatalogGrid />
        </section>
        <section className="v23-route-guide">
          <div>
            <p className="v23-eyebrow is-light"><span /> {marketText(language, "CHOOSE YOUR ROUTE", "구매 방식 선택")}</p>
            <h2>{marketText(language, "One item or a larger order?", "한 개만 살까요, 대량으로 주문할까요?")}</h2>
          </div>
          <article>
            <small>{marketText(language, "INDIVIDUAL RETAIL", "개별 구매")}</small>
            <b>Shopee</b>
            <p>{marketText(language, "Live price, vouchers, familiar checkout and order tracking.", "실시간 가격, 바우처, 익숙한 결제와 주문 추적을 이용합니다.")}</p>
            <a href={SHOPEE} target="_blank" rel="noreferrer">{marketText(language, "Shop on Shopee", "Shopee에서 구매")}</a>
          </article>
          <article>
            <small>{marketText(language, "BUSINESS AND GROUPS", "비즈니스 및 공동구매")}</small>
            <b>{marketText(language, "Direct PayPal checkout", "PayPal 직접 결제")}</b>
            <p>{marketText(language, `Review MOQ, included delivery and pay in ${market.currency} through PayPal or an eligible card.`, `MOQ와 배송 포함 금액을 확인한 뒤 ${market.currency}로 PayPal 또는 카드 결제합니다.`)}</p>
            <Link to="/bulk-orders">{marketText(language, "Open bulk checkout", "대량주문 열기")}</Link>
          </article>
        </section>
      </main>
    </V23Page>
  );
}
