import { Link } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { marketText, useMarket } from "../lib/market";

export function NotFoundPage() {
  const { language } = useMarket();

  return (
    <V23Page>
      <main className="v23-not-found-page">
        <section className="v23-not-found-panel" aria-labelledby="not-found-title">
          <p className="v23-eyebrow"><span /> 404</p>
          <h1 id="not-found-title">
            {marketText(language, "Page not found.", "페이지를 찾을 수 없습니다.")}
          </h1>
          <p>
            {marketText(
              language,
              "The address may have changed, or this page may no longer be available.",
              "주소가 변경되었거나 더 이상 제공하지 않는 페이지입니다.",
            )}
          </p>
          <div className="v23-not-found-actions" aria-label="Return links">
            <Link className="v23-not-found-primary" to="/">
              {marketText(language, "Back to Home", "홈으로 돌아가기")}
            </Link>
            <Link to="/products">{marketText(language, "View Products", "상품 보기")}</Link>
            <Link to="/bulk-orders">{marketText(language, "Bulk Orders", "대량 주문")}</Link>
            <Link to="/contact">{marketText(language, "Contact hondit", "hondit 문의")}</Link>
          </div>
        </section>
      </main>
    </V23Page>
  );
}
