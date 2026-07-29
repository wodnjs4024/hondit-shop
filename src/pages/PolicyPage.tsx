import { Link, useParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { marketCountryName, marketText, useMarket, type DisplayLanguage } from "../lib/market";

function getPolicyContent(policy: string, countryName: string, currency: string, hasShopee: boolean, language: DisplayLanguage) {
  const content: Record<string, { title: string; body: string[] }> = {
    shipping: {
      title: marketText(language, "Shipping Policy", "배송 정책"),
      body: [
        marketText(language, `Bulk orders are currently available for delivery to ${countryName}.`, `현재 대량주문은 ${countryName} 배송 기준으로 운영합니다.`),
        marketText(language, `Listed bulk order prices include the selected ${countryName} delivery route and are charged in ${currency}.`, `표시된 대량주문 가격에는 선택한 ${countryName} 배송 경로가 포함되며 ${currency}로 결제됩니다.`),
        hasShopee
          ? marketText(language, "Retail purchases are completed on Shopee and follow Shopee order tracking and delivery rules.", "개별 구매는 Shopee에서 완료되며 Shopee의 주문 추적 및 배송 규칙을 따릅니다.")
          : marketText(language, "This market does not use Shopee retail checkout. Orders are handled through hondit bulk checkout only.", "이 시장은 Shopee 개별 구매를 사용하지 않습니다. 주문은 hondit 대량주문으로만 처리됩니다."),
      ],
    },
    refund: {
      title: marketText(language, "Refund Policy", "환불 정책"),
      body: [
        marketText(language, "Please review product, quantity, shipping address, company name and payment amount before payment.", "결제 전 상품, 수량, 배송 주소, 회사명, 결제 금액을 확인해주세요."),
        marketText(language, "Refund requests are reviewed manually. PayPal refunds, when approved, are processed through PayPal in the original payment currency and reflected in the hondit admin order record.", "환불 요청은 수동으로 검토됩니다. 승인된 PayPal 환불은 최초 결제 통화로 처리되고 hondit 관리자 주문 기록에 반영됩니다."),
        marketText(language, "For refund, exchange or dispute questions, contact hondit with your order number and payment email.", "환불, 교환, 분쟁 문의는 주문번호와 결제 이메일을 포함해 hondit에 문의해주세요."),
      ],
    },
    privacy: {
      title: marketText(language, "Privacy Policy", "개인정보 처리방침"),
      body: [
        marketText(language, "Checkout information is used to process bulk orders, PayPal payment records, delivery and customer support.", "체크아웃 정보는 대량주문 처리, PayPal 결제 기록, 배송, 고객 응대에 사용됩니다."),
        marketText(language, "Customer order data is not shown publicly. Admin access is protected through Supabase Auth.", "고객 주문 데이터는 공개되지 않으며 관리자 접근은 Supabase Auth로 보호됩니다."),
        marketText(language, "Collected data may include name, email, phone, company, address, market, order details, inquiry messages and payment references.", "수집 정보에는 이름, 이메일, 전화번호, 회사명, 주소, 판매 시장, 주문 상세, 문의 메시지, 결제 참조번호가 포함될 수 있습니다."),
      ],
    },
    terms: {
      title: marketText(language, "Terms", "이용 약관"),
      body: [
        marketText(language, `Bulk order prices are charged in ${currency} for the selected ${countryName} sales edition.`, `대량주문 가격은 선택한 ${countryName} 판매판 기준으로 ${currency} 결제됩니다.`),
        marketText(language, "Orders are confirmed only after PayPal payment has been captured and verified by the server.", "주문은 PayPal 결제가 서버에서 캡처 및 검증된 뒤 확정됩니다."),
        hasShopee
          ? marketText(language, "Retail purchases are completed through Shopee. Bulk purchases are completed through PayPal checkout on this site.", "개별 구매는 Shopee에서, 대량 구매는 이 사이트의 PayPal 체크아웃에서 완료됩니다.")
          : marketText(language, "Retail Shopee checkout is not offered for this market. Purchases are completed through PayPal bulk checkout on this site.", "이 시장에는 Shopee 개별 구매를 제공하지 않습니다. 구매는 이 사이트의 PayPal 대량주문 체크아웃에서 완료됩니다."),
      ],
    },
  };
  content["shipping-policy"] = content.shipping;
  content["refund-policy"] = content.refund;
  return content[policy] || content.terms;
}

export function PolicyPage() {
  const { market, language } = useMarket();
  const { policy = "terms" } = useParams();
  const countryName = marketCountryName(market, language);
  const content = getPolicyContent(policy, countryName, market.currency, market.hasShopee, language);

  return (
    <V23Page>
      <main className="v23-policy-page">
        <section>
          <p className="v23-eyebrow"><span /> HONDIT</p>
          <h1>{content.title}</h1>
          {content.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <Link to="/bulk-orders">{marketText(language, "Return to Bulk Orders", "대량주문으로 돌아가기")}</Link>
        </section>
      </main>
    </V23Page>
  );
}
