import { Link } from "react-router-dom";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { marketCountryName, marketText, useMarket } from "../lib/market";

export function ShippingPage() {
  const { market, language } = useMarket();
  const countryName = marketCountryName(market, language);
  const shopeeName = marketText(language, "Shopee Singapore", "Shopee 싱가포르");

  return (
    <V23Page>
      <main className="v23-shipping-page">
        <V23PageHero
          eyebrow={marketText(language, `SHIPPING TO ${market.label.toUpperCase()}`, `${market.koreanLabel} 배송`)}
          title={marketText(language, "Two order routes. Two clear delivery windows.", "두 가지 주문 방식, 명확한 배송 흐름.")}
          description={marketText(
            language,
            `Shopee orders follow marketplace delivery tracking. Confirmed bulk shipments to ${countryName} are prepared after PayPal capture and dispatched from Korea.`,
            `Shopee 주문은 마켓플레이스 배송 추적을 따릅니다. ${countryName} 대량주문은 PayPal 결제 완료 후 한국에서 준비 및 발송됩니다.`,
          )}
          image="/images/jeju-wind-coast-v2.webp"
          imageAlt="Wind moving through grasses on a Jeju coast."
        />
        <section className="v23-shipping-compare">
          <article>
            <p className="v23-eyebrow"><span /> {marketText(language, "INDIVIDUAL PURCHASE", "개별 구매")}</p>
            <h2>{marketText(language, `Shop through ${shopeeName}`, `${shopeeName}에서 구매`)}</h2>
            <ul>
              <li>{marketText(language, "Marketplace delivery window and tracking", "마켓플레이스 배송 일정 및 추적")}</li>
              <li>{marketText(language, `Familiar ${countryName} checkout and payment methods`, `${countryName} 결제 환경에 맞춘 체크아웃`)}</li>
              <li>{marketText(language, "Live vouchers and product availability", "실시간 쿠폰 및 재고 확인")}</li>
              <li>{marketText(language, "Order tracking inside Shopee", "Shopee 안에서 주문 추적")}</li>
            </ul>
            <Link to="/products">{marketText(language, "Choose a product →", "상품 선택하기 →")}</Link>
          </article>
          <article>
            <p className="v23-eyebrow"><span /> {marketText(language, "LARGER PURCHASE", "대량 구매")}</p>
            <h2>{marketText(language, `Pay through PayPal in ${market.currency}`, `PayPal ${market.currency} 결제`)}</h2>
            <ul>
              <li>{marketText(language, "Delivery begins after payment capture and preparation", "결제 완료 및 준비 후 배송 시작")}</li>
              <li>{marketText(language, "Product-specific MOQ and quantity steps", "상품별 최소 수량과 주문 단위 적용")}</li>
              <li>{marketText(language, market.checkoutNote, market.checkoutNoteKo)}</li>
              <li>{marketText(language, "Server-verified PayPal capture before an admin order is confirmed", "서버 검증된 PayPal 결제 완료 건만 관리자 주문으로 확정")}</li>
            </ul>
            <Link to="/bulk-orders">{marketText(language, "Open bulk checkout →", "대량주문 열기 →")}</Link>
          </article>
        </section>
        <section className="v23-timing-notes">
          <div><p className="v23-eyebrow is-light"><span /> {marketText(language, "TIMING NOTES", "배송 참고")}</p><h2>{marketText(language, "What can change the delivery date?", "배송일은 왜 달라질 수 있나요?")}</h2></div>
          <article><b>{marketText(language, "Dispatch day", "발송일")}</b><p>{marketText(language, "Orders placed close to weekends or holidays may begin moving on the next working day.", "주말이나 공휴일 직전 주문은 다음 영업일부터 이동이 시작될 수 있습니다.")}</p></article>
          <article><b>{marketText(language, "Customs and carrier handover", "통관 및 운송사 인계")}</b><p>{marketText(language, "Inspection, flight capacity and local handover can add time.", "검사, 항공편, 현지 인계 상황에 따라 시간이 추가될 수 있습니다.")}</p></article>
          <article><b>{marketText(language, "Bulk size and stock", "대량 수량과 재고")}</b><p>{marketText(language, "Larger paid orders may require additional preparation before dispatch.", "큰 수량의 결제 완료 주문은 발송 전 준비 시간이 더 필요할 수 있습니다.")}</p></article>
          <article><b>{marketText(language, "Tracking", "배송 추적")}</b><p>{marketText(language, "For Shopee purchases, use the order page. For a paid bulk order, use the tracking details supplied after dispatch.", "Shopee 구매는 주문 페이지에서, 대량주문은 발송 후 안내되는 추적 정보로 확인합니다.")}</p></article>
        </section>
        <section className="v23-route-banner">
          <h2>{marketText(language, "Need help with an order?", "주문 도움이 필요하신가요?")}</h2>
          <p>{marketText(language, "Use Shopee chat for a Shopee transaction, or prepare a message for the hondit team.", "Shopee 주문은 Shopee 채팅을, 대량주문은 hondit 문의를 이용해주세요.")}</p>
          <Link to="/contact">{marketText(language, "Go to contact →", "문의하기 →")}</Link>
        </section>
      </main>
    </V23Page>
  );
}
