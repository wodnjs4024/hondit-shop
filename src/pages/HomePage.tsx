import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "../components/ExternalLink";
import { JejuJourney } from "../components/JejuJourney";
import { diffuserProducts, honditImages, links, retailProducts, type Product } from "../data/siteData";
import { trackEvent, trackProductClick, trackStoreClick } from "../lib/analytics";
import { Footer } from "../sections/Footer";

type ProductFilter = "all" | "care" | "scent";

const filterLabels: { value: ProductFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "care", label: "Care" },
  { value: "scent", label: "Scent" },
];

const bulkSlugByProductId: Record<string, string> = {
  "diffuser-350": "diffuser-350g",
  "diffuser-500": "diffuser-500g",
  "foam-oil": "foam-oil",
  "foaming-cleanser": "foaming-cleanser",
  "cleansing-water": "cleansing-water",
};

const productMeta: Record<string, { label: string; title: string; subtitle: string }> = {
  "diffuser-350": {
    label: "HOME SCENT",
    title: "Volcanic Diffuser 350g",
    subtitle: "Compact scent for small spaces",
  },
  "diffuser-500": {
    label: "HOME SCENT",
    title: "Volcanic Diffuser 500g",
    subtitle: "Scent object for larger rooms",
  },
  "foam-oil": {
    label: "EVENING CARE",
    title: "Vegan Foam Oil 150ml",
    subtitle: "Makeup and sunscreen cleanse",
  },
  "foaming-cleanser": {
    label: "DAILY CARE",
    title: "Vegan Foaming Cleanser 200ml",
    subtitle: "Soft everyday face wash",
  },
  "cleansing-water": {
    label: "LIGHT CARE",
    title: "Vegan Cleansing Water 300ml",
    subtitle: "Quick and gentle cleanse",
  },
};

const cleanserGuide = [
  {
    productId: "foam-oil",
    role: "MAKEUP AND SUNSCREEN",
    title: "Vegan Foam Oil",
    body: "For sunscreen, base makeup and a complete evening cleanse.",
  },
  {
    productId: "foaming-cleanser",
    role: "DAILY FACE WASH",
    title: "Vegan Foaming Cleanser",
    body: "For morning cleansing and soft daily face wash routines.",
  },
  {
    productId: "cleansing-water",
    role: "QUICK AND GENTLE",
    title: "Vegan Cleansing Water",
    body: "For light makeup, quick resets and low-effort cleansing.",
  },
];

const confidenceItems = [
  ["ORIGIN", "Jeju National University", "Student-led and based in Jeju City."],
  ["RETAIL", "Official Shopee SG", "Live price, vouchers and protected checkout."],
  ["DELIVERY", "Clear windows", "Shopee 5-10 days. Bulk 3-5 days after dispatch."],
  ["PAYMENT", "Two secure routes", "Shopee retail or server-verified PayPal checkout."],
];

const diffuserSteps = [
  ["01", "Add 10-12 drops", "Drop citrus oil directly onto the Jeju volcanic scoria."],
  ["02", "Let the stone absorb", "No reed sticks, flame or electricity are required."],
  ["03", "Refresh when needed", "Add a few more drops whenever you want the scent to return."],
];

const orderSteps = [
  ["01", "Discover", "Explore the collection and choose your care or scent ritual."],
  ["02", "Select your route", "Use Shopee for individual purchases or Bulk Orders for larger quantities."],
  ["03", "Delivered from Korea", "Track the parcel as it makes its way from Korea to Singapore."],
];

function isScentProduct(product: Product) {
  return product.id.startsWith("diffuser");
}

function formatDisplaySgd(value: number) {
  return `S$${value.toFixed(2)}`;
}

export function HomePage() {
  const [filter, setFilter] = useState<ProductFilter>("all");

  const visibleProducts = useMemo(() => {
    if (filter === "care") return retailProducts.filter((product) => !isScentProduct(product));
    if (filter === "scent") return retailProducts.filter(isScentProduct);
    return retailProducts;
  }, [filter]);

  const handleShopeeProductClick = (product: Product, location: string) => {
    trackProductClick({
      eventName: product.eventName,
      productName: product.displayName || product.name,
      destinationUrl: product.href,
      buttonLocation: location,
      clickTarget: "button",
    });
  };

  return (
    <>
      <main className="approved-home" id="home">
        <section className="approved-hero" aria-labelledby="home-heading">
          <div className="approved-hero__inner">
            <figure className="approved-hero__media">
              <img
                src={honditImages.fullLineReal}
                alt="hondit volcanic diffusers and J'essence vegan cleansing products arranged with Jeju-inspired stone textures."
                width="1920"
                height="1080"
                loading="eager"
                decoding="async"
              />
            </figure>

            <div className="approved-hero__copy">
              <p className="approved-kicker"><span />JEJU NATIONAL UNIVERSITY - STUDENT-LED</p>
              <h1 id="home-heading">
                A quiet piece
                <br />
                of Jeju, <em>for you.</em>
              </h1>
              <p className="approved-hero__lead">
                Korean vegan cleansing care and natural volcanic stone scent, thoughtfully selected in Jeju for calm everyday rituals in Singapore.
              </p>

              <div className="approved-route-grid" aria-label="Choose how to order">
                <ExternalLink className="approved-route-card" href={links.shopeeStore} onClick={() => trackStoreClick("home_route_card")}>
                  <span>FOR INDIVIDUALS</span>
                  <strong>Buy on Shopee</strong>
                  <small>Live prices, vouchers and secure Singapore checkout.</small>
                </ExternalLink>
                <Link
                  className="approved-route-card"
                  to="/bulk-orders"
                  onClick={() => trackEvent("view_bulk_list", { button_location: "home_route_card" })}
                >
                  <span>FOR BUSINESSES AND GROUPS</span>
                  <strong>Bulk Checkout</strong>
                  <small>Review MOQ, then pay securely through PayPal.</small>
                </Link>
              </div>

              <ul className="approved-proof-row" aria-label="hondit purchase confidence notes">
                <li>Based at Jeju National University</li>
                <li>Official Shopee SG</li>
                <li>Ships from Korea</li>
                <li>Bulk orders available</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="approved-confidence" aria-label="hondit trust information">
          {confidenceItems.map(([label, title, body]) => (
            <article key={title}>
              <span>{label}</span>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <JejuJourney />

        <section className="approved-products" aria-labelledby="products-heading">
          <div className="approved-section-head">
            <div>
              <p className="approved-kicker"><span />THE HONDIT EDIT</p>
              <h2 id="products-heading">
                Jeju-inspired rituals,
                <br />
                <em>made for everyday.</em>
              </h2>
            </div>
            <div className="approved-filters" aria-label="Filter products">
              {filterLabels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={filter === item.value ? "is-active" : ""}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="approved-product-grid">
            {visibleProducts.map((product) => {
              const meta = productMeta[product.id];
              const bulkSlug = bulkSlugByProductId[product.id];
              return (
                <article className="approved-product-card" key={product.id}>
                  <Link className="approved-product-card__image" to={`/products/${product.id}`} aria-label={`View ${meta.title}`}>
                    <span>{meta.label}</span>
                    <img src={product.image} alt={product.alt} width="900" height="1100" loading="lazy" decoding="async" />
                  </Link>
                  <div className="approved-product-card__body">
                    <h3>{meta.title}</h3>
                    <p>{meta.subtitle}</p>
                    <small>DISPLAY PRICE - CHECK LIVE ON SHOPEE</small>
                    <strong>{formatDisplaySgd(product.salePrice)}</strong>
                  </div>
                  <div className="approved-product-actions">
                    <Link to={`/products/${product.id}`}>View Details</Link>
                    <ExternalLink href={product.href} onClick={() => handleShopeeProductClick(product, "home_product_card")}>
                      Buy on Shopee
                    </ExternalLink>
                    <Link to={`/bulk-orders/${bulkSlug}`}>Bulk Checkout</Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="approved-products__note">
            <p>Prices, vouchers and stock are always updated on our official Shopee Singapore store.</p>
            <ExternalLink className="approved-dark-button" href={links.shopeeStore} onClick={() => trackStoreClick("home_products_all")}>
              View all on Shopee SG
            </ExternalLink>
          </div>
        </section>

        <section className="approved-cleansing" aria-labelledby="cleansing-heading">
          <figure>
            <img src={honditImages.cleansingTrio} alt="Three J'essence vegan cleansing products styled with soft foam and water." loading="lazy" decoding="async" />
          </figure>
          <div>
            <p className="approved-kicker"><span />CLEANSING GUIDE</p>
            <h2 id="cleansing-heading">Not sure which one to choose?</h2>
            <p>Compare all three cleansers before you move to Shopee.</p>
            <div className="approved-cleansing__cards">
              {cleanserGuide.map((card) => (
                <Link to={`/products/${card.productId}`} key={card.productId}>
                  <span>{card.role}</span>
                  <strong>{card.title}</strong>
                  <small>{card.body}</small>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="approved-diffuser" aria-labelledby="diffuser-heading">
          <img src={honditImages.diffuser350Stone} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <div className="approved-diffuser__content">
            <div className="approved-diffuser__copy">
              <p className="approved-kicker"><span />VOLCANIC DIFFUSER</p>
              <h2 id="diffuser-heading">No flame. No electricity. Scent when you choose.</h2>
              <p>Drop citrus oil directly onto Jeju volcanic scoria and refresh the scent only when you want it.</p>
              <div>
                {diffuserProducts.map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`}>{product.size} details</Link>
                ))}
              </div>
            </div>
            <div className="approved-diffuser__steps">
              {diffuserSteps.map(([number, title, body]) => (
                <article key={number}>
                  <span>{number}</span>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="approved-origin" aria-labelledby="origin-heading">
          <div className="approved-origin__copy">
            <p className="approved-kicker"><span />OUR ORIGIN - JEJU NATIONAL UNIVERSITY</p>
            <h2 id="origin-heading">Built by students. Grounded in Jeju.</h2>
            <p>
              hondit is an independent student-led commerce project based at Jeju National University. From our campus in Jeju City, we curate Korean care and scent products and make the cross-border buying journey clearer for customers in Singapore.
            </p>
            <div className="approved-origin__address">
              <strong>JEJU NATIONAL UNIVERSITY-BASED</strong>
              <span>102 Jejudaehak-ro, Jeju-si - Independent student project; university location does not imply product endorsement.</span>
            </div>
            <div className="approved-origin__pillars">
              <article>
                <strong>Selected in Jeju</strong>
                <p>Products chosen with a clear Jeju story and everyday purpose.</p>
              </article>
              <article>
                <strong>Prepared for Singapore</strong>
                <p>English guidance, SGD display prices and familiar Shopee checkout.</p>
              </article>
              <article>
                <strong>Accountable payment</strong>
                <p>Shopee handles retail orders; hondit's server verifies every completed PayPal capture for bulk orders.</p>
              </article>
            </div>
            <ExternalLink href="https://www.jejunu.ac.kr/" className="approved-text-link">
              Visit the official JNU website
            </ExternalLink>
          </div>
          <figure className="approved-origin__image">
            <img src={honditImages.jejuUniversity} alt="Jeju National University Ara campus in Jeju City." loading="lazy" decoding="async" />
            <figcaption>
              <strong>h.</strong>
              <span>AT JEJU NATIONAL UNIVERSITY</span>
            </figcaption>
          </figure>
        </section>

        <section className="approved-order-flow" aria-labelledby="order-flow-heading">
          <div className="approved-order-flow__copy">
            <p className="approved-kicker"><span />TWO WAYS TO ORDER</p>
            <h2 id="order-flow-heading">Choose the route that fits your order.</h2>
            <p>Buy individual products on Shopee Singapore, or review MOQ and complete a larger direct order through PayPal checkout.</p>
            <div>
              <ExternalLink className="approved-light-button" href={links.shopeeStore} onClick={() => trackStoreClick("home_order_flow")}>
                Shop on Shopee
              </ExternalLink>
              <Link className="approved-outline-button" to="/bulk-orders">Open bulk checkout</Link>
            </div>
          </div>
          <div className="approved-order-flow__steps">
            {orderSteps.map(([number, title, body]) => (
              <article key={number}>
                <span>{number}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
