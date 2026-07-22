import { Link } from "react-router-dom";
import { V23CatalogGrid } from "../components/v23/CatalogGrid";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { SHOPEE } from "../data/v23SiteData";

export function ProductsPage() {
  return (
    <V23Page>
      <main className="v23-products-page">
        <V23PageHero
          eyebrow="THE HONDIT EDIT"
          title="Care shaped by water. Scent grounded in stone."
          description="Compare Korean vegan cleansing care and Jeju volcanic-stone scent, then choose Shopee retail or secure direct PayPal bulk checkout."
          image="/images/jeju-water-basalt-v2.webp"
          imageAlt="Clear Jeju water flowing across dark volcanic basalt."
        />
        <section className="v23-confidence">
          <article><small>5 PRODUCTS</small><b>Focused care and scent edit</b></article>
          <article><small>SGD PRICES</small><b>Live retail terms on Shopee</b></article>
          <article><small>2 ROUTES</small><b>Individual or bulk orders</b></article>
        </section>
        <section className="v23-products-section">
          <div className="v23-section-heading is-cream">
            <div>
              <p className="v23-eyebrow"><span /> SHOP BY RITUAL</p>
              <h2>Find your<br /><em>everyday fit.</em></h2>
            </div>
          </div>
          <V23CatalogGrid />
        </section>
        <section className="v23-route-guide">
          <div>
            <p className="v23-eyebrow is-light"><span /> CHOOSE YOUR ROUTE</p>
            <h2>One item or a larger order?</h2>
          </div>
          <article>
            <small>INDIVIDUAL RETAIL</small>
            <b>Shopee Singapore</b>
            <p>Live price, vouchers, familiar checkout and order tracking.</p>
            <a href={SHOPEE} target="_blank" rel="noreferrer">Shop on Shopee</a>
          </article>
          <article>
            <small>BUSINESS AND GROUPS</small>
            <b>Direct PayPal checkout</b>
            <p>Review MOQ, included EMS shipping and pay through PayPal or an eligible card.</p>
            <Link to="/bulk-orders">Open bulk checkout</Link>
          </article>
        </section>
      </main>
    </V23Page>
  );
}
