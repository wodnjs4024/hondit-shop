import { Link, useParams } from "react-router-dom";
import { ExternalLink } from "../components/ExternalLink";
import { DISCOUNT_LABEL, links, retailProducts, type Product } from "../data/siteData";
import { formatSgd } from "../data/bulkProducts";
import { trackEvent, trackProductClick, trackStoreClick } from "../lib/analytics";
import { Footer } from "../sections/Footer";

type DetailCopy = {
  headline: string;
  forWho: string;
  whenToUse: string;
  howToUse: string[];
  keyFacts: string[];
  images: string[];
};

const detailCopy: Record<string, DetailCopy> = {
  "foam-oil": {
    headline: "For makeup, sunscreen and a complete first cleanse.",
    forWho: "Best for users who wear sunscreen, base makeup or want one product that melts away daily buildup before rinsing.",
    whenToUse: "Use in the evening or whenever you need a deeper cleanse.",
    howToUse: ["Apply to dry hands and face.", "Massage gently over makeup and sunscreen.", "Add water to emulsify, then rinse clean."],
    keyFacts: ["Vegan formula", "pH 5.5", "Fragrance-free", "Sensitive-skin friendly", "150ml"],
    images: ["/images/foam-oil.png", "/images/foam-oil-texture.png", "/images/jeju-clear-water.png"],
  },
  "foaming-cleanser": {
    headline: "For a soft daily face wash with a comfortable finish.",
    forWho: "Best for everyday cleansing, morning routines and skin that prefers a gentle foam texture.",
    whenToUse: "Use morning and evening after makeup removal, or as your daily cleanser.",
    howToUse: ["Dispense a small amount onto wet hands.", "Lather into a soft foam.", "Massage over face and rinse thoroughly."],
    keyFacts: ["Vegan formula", "pH 5.5", "Fragrance-free", "Daily face wash", "200ml"],
    images: ["/images/foaming-cleanser.png", "/images/cleansing-foam-texture.png", "/images/jeju-sea-detail.png"],
  },
  "cleansing-water": {
    headline: "For a quick, gentle cleanse when your skin needs a light reset.",
    forWho: "Best for light makeup, low-effort cleansing and moments when you want a fresh wipe-clean feeling.",
    whenToUse: "Use on busy days, before a second cleanse or for light makeup removal.",
    howToUse: ["Soak a cotton pad with cleansing water.", "Swipe gently across face and neck.", "Repeat as needed and follow with cleanser if desired."],
    keyFacts: ["Vegan formula", "pH 5.5", "Fragrance-free", "Quick cleanse", "300ml"],
    images: ["/images/cleansing-water.png", "/images/cleansing-water-use.png", "/images/jeju-clear-water.png"],
  },
  "diffuser-350": {
    headline: "A compact Jeju volcanic stone diffuser for desks, shelves and smaller corners.",
    forWho: "Best for personal spaces such as a desk, small bathroom, shelf or bedside corner.",
    whenToUse: "Use when you want to refresh a small area without flame, electricity or reeds.",
    howToUse: ["Place the Jeju volcanic scoria stones in the pot.", "Add 10-12 drops of citrus oil directly onto the stones.", "Let the stone absorb, then refresh whenever needed."],
    keyFacts: ["Jeju volcanic scoria", "No flame", "No electricity", "No reed sticks", "Citrus oil 10ml included", "350g"],
    images: ["/images/diffuser-350g.png", "/images/jeju-volcanic-rock.png", "/images/jeju-stone-detail.png"],
  },
  "diffuser-500": {
    headline: "A fuller Jeju volcanic stone diffuser for bedrooms, bathrooms and shared spaces.",
    forWho: "Best for larger rooms, shared spaces and buyers who want a stronger visual presence.",
    whenToUse: "Use when you want a calm scent object that can be refreshed only when you choose.",
    howToUse: ["Place the Jeju volcanic scoria stones in the pot.", "Add 10-12 drops of citrus oil directly onto the stones.", "Let the stone absorb, then refresh whenever needed."],
    keyFacts: ["Jeju volcanic scoria", "No flame", "No electricity", "No reed sticks", "Citrus oil 10ml included", "500g"],
    images: ["/images/diffuser-500g.png", "/images/jeju-volcanic-rock.png", "/images/jeju-stone-detail.png"],
  },
};

const cleanserComparison = [
  ["Vegan Foam Oil", "Makeup & sunscreen", "For a deeper evening cleanse."],
  ["Vegan Foaming Cleanser", "Daily face wash", "For morning and everyday cleansing."],
  ["Vegan Cleansing Water", "Quick & gentle cleanse", "For light makeup and fast resets."],
];

const diffuserComparison = [
  ["350g", "Desk, shelf, personal corner", "Compact and easy to place."],
  ["500g", "Bedroom, bathroom, shared space", "Fuller presence and longer visual impact."],
];

function ProductDetailActions({ product }: { product: Product }) {
  const isDiffuser = product.id.includes("diffuser");
  const bulkSlug = product.id === "diffuser-350" ? "diffuser-350g" : product.id === "diffuser-500" ? "diffuser-500g" : product.id;

  return (
    <div className="product-detail-actions">
      <ExternalLink
        className="button button--dark"
        href={product.href}
        onClick={() => {
          trackStoreClick("product_detail");
          trackProductClick({
            eventName: product.eventName,
            productName: product.name,
            destinationUrl: product.href,
            buttonLocation: "product_detail",
            clickTarget: "button",
          });
        }}
      >
        Buy on Shopee
      </ExternalLink>
      <Link
        className="button button--outline-dark"
        to={`/bulk-orders/${bulkSlug}`}
        onClick={() => trackEvent("click_bulk_product", { product_id: bulkSlug, button_location: "product_detail" })}
      >
        {isDiffuser ? "Bulk Order" : "Bulk Inquiry"}
      </Link>
    </div>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams();
  const product = retailProducts.find((item) => item.id === productId);

  if (!product || !productId) {
    return (
      <>
        <main className="editorial-page product-detail-page">
          <section className="editorial-container product-not-found">
            <p className="eyebrow">PRODUCTS</p>
            <h1>Product not found.</h1>
            <Link className="button button--dark" to="/products">Back to Products</Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const copy = detailCopy[productId];
  const isDiffuser = product.id.includes("diffuser");

  return (
    <>
      <main className="editorial-page product-detail-page">
        <section className="editorial-container product-detail-hero">
          <div className="product-detail-gallery" aria-label={`${product.name} product images`}>
            <img className="product-detail-gallery__main" src={copy.images[0]} alt={product.alt} loading="eager" decoding="async" />
            <div>
              {copy.images.slice(1).map((image) => (
                <img src={image} alt="" key={image} loading="lazy" decoding="async" />
              ))}
            </div>
          </div>
          <div className="product-detail-summary">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.displayName || product.name}</h1>
            <p>{copy.headline}</p>
            <div className="retail-price retail-price--detail">
              <span className="discount-badge">{DISCOUNT_LABEL}</span>
              <span className="retail-price__list">{formatSgd(product.listPrice)}</span>
              <strong>{formatSgd(product.salePrice)}</strong>
              <em>Official Shopee Singapore Store</em>
            </div>
            <dl className="product-detail-quick">
              <div><dt>Volume</dt><dd>{product.size}</dd></div>
              <div><dt>Ships</dt><dd>From Korea</dd></div>
              <div><dt>Retail</dt><dd>Shopee SG purchase protection</dd></div>
            </dl>
            <ProductDetailActions product={product} />
          </div>
        </section>

        <section className="editorial-container product-detail-info">
          <article>
            <h2>Who it is for</h2>
            <p>{copy.forWho}</p>
          </article>
          <article>
            <h2>When to use</h2>
            <p>{copy.whenToUse}</p>
          </article>
          <article>
            <h2>Key facts</h2>
            <div className="product-detail-chips">
              {copy.keyFacts.map((fact) => <span key={fact}>{fact}</span>)}
            </div>
          </article>
        </section>

        <section className={`editorial-container ${isDiffuser ? "diffuser-use-panel" : "cleanser-use-panel"}`}>
          <div>
            <p className="eyebrow">{isDiffuser ? "HOW TO USE" : "CLEANSING ROUTINE"}</p>
            <h2>{isDiffuser ? "No flame. No electricity. Scent when you choose." : "Simple steps before you buy."}</h2>
          </div>
          <div className="product-steps">
            {copy.howToUse.map((step, index) => (
              <article key={step}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="editorial-container product-comparison">
          <div>
            <p className="eyebrow">{isDiffuser ? "SIZE GUIDE" : "NOT SURE WHICH ONE TO CHOOSE?"}</p>
            <h2>{isDiffuser ? "Compare 350g and 500g." : "Compare all three cleansers."}</h2>
          </div>
          <div className="comparison-table">
            {(isDiffuser ? diffuserComparison : cleanserComparison).map(([name, role, note]) => (
              <article key={name}>
                <strong>{name}</strong>
                <span>{role}</span>
                <p>{note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="editorial-container product-detail-trust">
          <div>
            <strong>Official Shopee Singapore Store</strong>
            <p>Retail payment, shipping updates and purchase protection are handled through Shopee SG.</p>
          </div>
          <div>
            <strong>Bulk and business orders</strong>
            <p>For larger quantities, choose Bulk Inquiry so hondit can confirm quantity, destination and schedule.</p>
          </div>
          <ExternalLink className="button button--dark" href={links.shopeeStore} onClick={() => trackStoreClick("product_detail_store")}>
            Visit Shopee Store
          </ExternalLink>
        </section>
      </main>
      <Footer />
    </>
  );
}
