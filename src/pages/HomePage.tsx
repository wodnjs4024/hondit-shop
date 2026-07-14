import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { links, cleansingProducts, diffuserProducts, retailProducts } from "../data/siteData";
import { trackEvent, trackStoreClick } from "../lib/analytics";
import { Footer } from "../sections/Footer";

const homeBenefits = [
  ["Mindful Ingredients", "Vegan-friendly, clean and gentle formulas."],
  ["Inspired by Jeju Nature", "Volcanic rock, sea minerals and botanical extracts."],
  ["Made for Everyday Rituals", "Simple, sensory essentials that fit your life."],
];

const cleanserGuide = [
  ["Vegan Foam Oil Cleanser", "MAKEUP & SUNSCREEN", "For sunscreen, base makeup and a complete evening cleanse."],
  ["Vegan Foaming Cleanser", "DAILY FACE WASH", "For morning cleansing and soft daily face wash routines."],
  ["Vegan Cleansing Water", "QUICK & GENTLE CLEANSE", "For light makeup, quick resets and low-effort cleansing."],
];

const diffuserSteps = [
  ["01", "Add 10-12 drops", "Drop citrus oil directly onto the Jeju volcanic scoria."],
  ["02", "Let the stone absorb", "No reed sticks, no flame and no electricity are required."],
  ["03", "Refresh when needed", "Add a few more drops whenever you want the scent to return."],
];

const trustItems = [
  ["Official Shopee Singapore Store", "Retail purchases are completed through Shopee SG."],
  ["Ships from Korea", "hondit products are prepared and shipped from Korea."],
  ["Shopee purchase protection", "Retail payment, tracking and support are handled on Shopee."],
  ["Bulk orders available", "For business quantities, choose Bulk Order or Contact."],
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
              Jeju-inspired cleansing and scent, curated by hondit for everyday rituals in Singapore.
            </p>
            <div className="home-route-cards" aria-label="Choose a purchase route">
              <a href={links.shopeeStore} target="_blank" rel="noreferrer" onClick={() => trackStoreClick("home_route_card")}>
                <span className="route-icon" aria-hidden="true">Retail</span>
                <em>For individuals</em>
                <strong>Buy on Shopee</strong>
                <small>Shop our products easily on Shopee Singapore.</small>
              </a>
              <Link to="/bulk-orders" onClick={() => trackEvent("view_bulk_list", { button_location: "home_route_card" })}>
                <span className="route-icon" aria-hidden="true">Bulk</span>
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

        <section className="editorial-container cleanser-choice">
          <div className="choice-intro">
            <div className="choice-heading">
              <p className="eyebrow">CLEANSING GUIDE</p>
              <h2>Not sure which one to choose?</h2>
              <p>Compare all three cleansers before you move to Shopee.</p>
            </div>
            <figure className="cleanser-choice__visual">
              <img src="/images/hondit-cleansing-trio.png" alt="Three J'essence vegan cleansing products styled with soft foam and water." loading="lazy" decoding="async" />
            </figure>
          </div>
          <div className="choice-grid">
            {cleanserGuide.map(([name, role, body], index) => (
              <Link to={`/products/${cleansingProducts[index].id}`} key={name}>
                <span>{role}</span>
                <h3>{name}</h3>
                <p>{body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="editorial-container diffuser-method">
          <div className="diffuser-method__copy">
            <p className="eyebrow">VOLCANIC DIFFUSER</p>
            <h2>No flame. No electricity. Scent when you choose.</h2>
            <p>
              hondit volcanic diffusers use Jeju scoria stones. Drop the oil directly onto the stone and refresh the scent only when you want it.
            </p>
            <div className="diffuser-method__links">
              {diffuserProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>{product.size} details</Link>
              ))}
            </div>
          </div>
          <div className="diffuser-method__steps">
            {diffuserSteps.map(([number, title, body]) => (
              <article key={number}>
                <strong>{number}</strong>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
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
            <img src="/images/hondit-collection-studio.png" alt="hondit cleansing and volcanic diffuser products styled together with stone textures." loading="lazy" decoding="async" />
            <img src="/images/hondit-diffuser-detail.png" alt="Volcanic diffuser, fragrance oil and Jeju volcanic stones on warm stone." loading="lazy" decoding="async" />
            <img src="/images/jeju-sea-stone.png" alt="Jeju ocean and dark volcanic stone." loading="lazy" decoding="async" />
            <img src="/images/hondit-cleansing-trio.png" alt="J'essence cleansing products arranged with soft blue water textures." loading="lazy" decoding="async" />
          </div>
        </section>

        <section className="soft-cta">
          <div>
            <h2>From Jeju to you.</h2>
            <p>Thoughtful products. Honest ingredients. Quiet luxury in every detail.</p>
          </div>
          <Link className="button button--dark" to="/products">Explore Products</Link>
        </section>

        <section className="editorial-container retail-trust">
          {trustItems.map(([title, body]) => (
            <article key={title}>
              <strong>{title}</strong>
              <p>{body}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
