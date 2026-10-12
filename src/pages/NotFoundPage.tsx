import { marketText, useMarket } from "../lib/market";
import { Link } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";

export function NotFoundPage() {
  const { language } = useMarket();
  return (
    <V23Page>
      <main className="v23-not-found-page">
        <section className="v23-not-found-panel" aria-labelledby="not-found-title">
          <p className="v23-eyebrow"><span /> 404</p>
          <h1 id="not-found-title">{marketText(language,"We couldn't find this page.")}</h1>
          <p>{marketText(language,"The page may have moved, or the address may be incorrect.")}</p>
          <div className="v23-not-found-actions" aria-label="Return links">
            <Link className="v23-not-found-primary" to="/">{marketText(language,"Back to home")}</Link>
            <Link to="/products">{marketText(language,"View products")}</Link>
            <Link to="/contact">{marketText(language,"Contact hondit")}</Link>
          </div>
        </section>
      </main>
    </V23Page>
  );
}
