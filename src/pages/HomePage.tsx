import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { links, retailProducts } from "../data/siteData";
import { trackEvent, trackStoreClick } from "../lib/analytics";
import { Footer } from "../sections/Footer";

const homeBenefits = [
  ["Mindful Ingredients", "Vegan-friendly, clean and gentle formulas."],
  ["Inspired by Jeju Nature", "Volcanic rock, sea minerals and botanical extracts."],
  ["Made for Everyday Rituals", "Simple, sensory essentials that fit your life."],
];

export function HomePage() {
  return (
    <>
      <main className="editorial-home">
        <section className="home-hero" id="home">
          <div className="home-hero__shade" />
          <div className="home-hero__content">
            <p className="eyebrow">JEJU-INSPIRED CARE AND SCENT</p>
            <h1>
              Pieces of Jeju Island,
              <span>arriving in Singapore.</span>
            </h1>
            <p>
              Curated Korean cleansing and home fragrance - rooted in nature, made for quiet everyday rituals.
            </p>
            <div className="home-route-cards" aria-label="Choose a purchase route">
              <a href={links.shopeeStore} target="_blank" rel="noreferrer" onClick={() => trackStoreClick("home_route_card")}>
                <span className="route-icon" aria-hidden="true">Bag</span>
                <em>For individuals</em>
                <strong>Buy on Shopee</strong>
                <small>Shop our products easily on Shopee Singapore.</small>
              </a>
              <Link to="/bulk-orders" onClick={() => trackEvent("view_bulk_list", { button_location: "home_route_card" })}>
                <span className="route-icon" aria-hidden="true">Box</span>
                <em>For businesses</em>
                <strong>Bulk Order</strong>
                <small>Wholesale and corporate enquiries for larger orders.</small>
              </Link>
            </div>
          </div>
        </section>

        <section className="editorial-section featured-products">
          <div className="editorial-container">
            <div className="center-heading">
              <p className="eyebrow">FEATURED PRODUCTS</p>
              <h2>Inspired by Jeju. Made for you.</h2>
            </div>
            <div className="featured-strip">
              {retailProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} tone={product.id.includes("diffuser") ? "sand" : "water"} location="home_featured" />
              ))}
            </div>
            <div className="center-action">
              <Link className="button button--outline-dark" to="/products">View All Products</Link>
            </div>
          </div>
        </section>

        <section className="why-hondit">
          <div className="why-hondit__copy">
            <p className="eyebrow">WHY HONDIT</p>
            <h2>Jeju's quiet power, for everyday well-being.</h2>
            <p>
              Jeju Island is shaped by wind, ocean and volcanic earth. At hondit, we translate that purity into simple care and scent rituals for daily life.
            </p>
            <div className="why-hondit__benefits">
              {homeBenefits.map(([title, body]) => (
                <article key={title}>
                  <span aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="why-hondit__mosaic" aria-label="Jeju and hondit mood images">
            <img src="/images/jeju-canola-sea-stonewall.png" alt="Jeju canola flowers, sea and stone walls." loading="lazy" decoding="async" />
            <img src="/images/jeju-tangerine-stonewall.png" alt="Jeju green citrus leaves and stone wall." loading="lazy" decoding="async" />
            <img src="/images/jeju-sea-stone.png" alt="Jeju ocean and dark volcanic stone." loading="lazy" decoding="async" />
            <img src="/images/singapore-bedroom-desk.png" alt="A calm room styled for hondit rituals." loading="lazy" decoding="async" />
          </div>
        </section>

        <section className="soft-cta">
          <div>
            <h2>From Jeju to you.</h2>
            <p>Thoughtful products. Honest ingredients. Quiet luxury in every detail.</p>
          </div>
          <Link className="button button--dark" to="/products">Explore Products</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
