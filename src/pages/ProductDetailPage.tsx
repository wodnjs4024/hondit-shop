import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink } from "../components/ExternalLink";
import { DISCOUNT_LABEL, honditImages, links, retailProducts, type Product } from "../data/siteData";
import { formatSgd, type BulkProduct } from "../data/bulkProducts";
import { trackEvent, trackProductClick, trackStoreClick } from "../lib/analytics";
import { fetchBulkProducts } from "../lib/bulkApi";
import { Footer } from "../sections/Footer";

type DetailCopy = {
  headline: string;
  forWho: string;
  whenToUse: string;
  howToUse: string[];
  keyFacts: string[];
  images: string[];
};

const bulkSlugByRetailId: Record<string, string> = {
  "foam-oil": "foam-oil",
  "foaming-cleanser": "foaming-cleanser",
  "cleansing-water": "cleansing-water",
  "diffuser-350": "diffuser-350g",
  "diffuser-500": "diffuser-500g",
};

const detailCopy: Record<string, DetailCopy> = {
  "foam-oil": {
    headline: "For makeup, sunscreen and a complete first cleanse.",
    forWho: "Best for users who wear sunscreen, base makeup or want one product that melts away daily buildup before rinsing.",
    whenToUse: "Use in the evening or whenever you need a deeper cleanse.",
    howToUse: ["Apply to dry hands and face.", "Massage gently over makeup and sunscreen.", "Add water to emulsify, then rinse clean."],
    keyFacts: ["Vegan formula", "pH 5.5", "Fragrance-free", "Sensitive-skin friendly", "150ml"],
    images: [honditImages.foamOil, honditImages.cleansingTrio, honditImages.fullLineReal, honditImages.jejuSea],
  },
  "foaming-cleanser": {
    headline: "For a soft daily face wash with a comfortable finish.",
    forWho: "Best for everyday cleansing, morning routines and skin that prefers a gentle foam texture.",
    whenToUse: "Use morning and evening after makeup removal, or as your daily cleanser.",
    howToUse: ["Dispense a small amount onto wet hands.", "Lather into a soft foam.", "Massage over face and rinse thoroughly."],
    keyFacts: ["Vegan formula", "pH 5.5", "Fragrance-free", "Daily face wash", "200ml"],
    images: [honditImages.foamingPack, honditImages.foamingCutout, honditImages.foamingLifestyle, honditImages.cleansingTrio],
  },
  "cleansing-water": {
    headline: "For a quick, gentle cleanse when your skin needs a light reset.",
    forWho: "Best for light makeup, low-effort cleansing and moments when you want a fresh wipe-clean feeling.",
    whenToUse: "Use on busy days, before a second cleanse or for light makeup removal.",
    howToUse: ["Soak a cotton pad with cleansing water.", "Swipe gently across face and neck.", "Repeat as needed and follow with cleanser if desired."],
    keyFacts: ["Vegan formula", "pH 5.5", "Fragrance-free", "Quick cleanse", "300ml"],
    images: [honditImages.cleansingWaterPack, honditImages.cleansingWaterCutout, honditImages.cleansingTrio, honditImages.jejuSea],
  },
  "diffuser-350": {
    headline: "A compact Jeju volcanic stone diffuser for desks, shelves and smaller corners.",
    forWho: "Best for personal spaces such as a desk, small bathroom, shelf or bedside corner.",
    whenToUse: "Use when you want to refresh a small area without flame, electricity or reeds.",
    howToUse: ["Place the Jeju volcanic scoria stones in the pot.", "Add 10-12 drops of citrus oil directly onto the stones.", "Let the stone absorb, then refresh whenever needed."],
    keyFacts: ["Jeju volcanic scoria", "No flame", "No electricity", "No reed sticks", "Citrus oil 10ml included", "350g"],
    images: [honditImages.diffuser350Studio, honditImages.diffuser350Window, honditImages.diffuser350Stone, honditImages.diffuser350Shelf, honditImages.diffuserPair],
  },
  "diffuser-500": {
    headline: "A fuller Jeju volcanic stone diffuser for bedrooms, bathrooms and shared spaces.",
    forWho: "Best for larger rooms, shared spaces and buyers who want a stronger visual presence.",
    whenToUse: "Use when you want a calm scent object that can be refreshed only when you choose.",
    howToUse: ["Place the Jeju volcanic scoria stones in the pot.", "Add 10-12 drops of citrus oil directly onto the stones.", "Let the stone absorb, then refresh whenever needed."],
    keyFacts: ["Jeju volcanic scoria", "No flame", "No electricity", "No reed sticks", "Citrus oil 10ml included", "500g"],
    images: [honditImages.diffuser500Studio, honditImages.diffuser500Window, honditImages.diffuser500Wood, honditImages.diffuserPair, honditImages.jejuStone],
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

function cleanImages(images: Array<string | undefined>) {
  return Array.from(new Set(images.map((image) => String(image || "").trim()).filter(Boolean)));
}

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
  const [managedProducts, setManagedProducts] = useState<BulkProduct[]>([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchBulkProducts().then(setManagedProducts).catch(() => setManagedProducts([]));
  }, []);

  useEffect(() => {
    setActiveImage(0);
  }, [productId]);

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
  const managedProduct = managedProducts.find((item) => item.slug === bulkSlugByRetailId[productId]);
  const galleryImages = cleanImages([...(managedProduct?.galleryImages || []), product.image, ...(copy.images || [])]).slice(0, 6);
  const detailImages = cleanImages([...(managedProduct?.detailImages || []), ...(copy.images || [])]).slice(0, 8);
  const detailHighlights = managedProduct?.detailHighlights?.length ? managedProduct.detailHighlights : copy.keyFacts;
  const howToUse = managedProduct?.detailHowToUse?.length ? managedProduct.detailHowToUse : copy.howToUse;
  const selectedImage = galleryImages[activeImage] || product.image;

  return (
    <>
      <main className="editorial-page product-detail-page">
        <section className="editorial-container product-detail-hero">
          <div className="product-detail-gallery product-detail-gallery--carousel" aria-label={`${product.name} product image gallery`}>
            <div className="product-detail-gallery__stage">
              <button
                className="product-detail-gallery__nav product-detail-gallery__nav--prev"
                type="button"
                aria-label="Previous product image"
                onClick={() => setActiveImage((current) => (current - 1 + galleryImages.length) % galleryImages.length)}
              >
                {"<"}
              </button>
              <img className="product-detail-gallery__main" src={selectedImage} alt={product.alt} loading="eager" decoding="async" />
              <button
                className="product-detail-gallery__nav product-detail-gallery__nav--next"
                type="button"
                aria-label="Next product image"
                onClick={() => setActiveImage((current) => (current + 1) % galleryImages.length)}
              >
                {">"}
              </button>
            </div>
            <div className="product-detail-gallery__thumbs">
              {galleryImages.map((image, index) => (
                <button
                  className={index === activeImage ? "is-active" : ""}
                  type="button"
                  key={image}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={index === activeImage}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt="" loading="lazy" decoding="async" />
                </button>
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
            {howToUse.map((step, index) => (
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

        <section className="editorial-container product-long-detail">
          <div className="product-long-detail__intro">
            <p className="eyebrow">PRODUCT DETAILS</p>
            <h2>See the texture, use and mood before you buy.</h2>
            <p>
              A closer look at the product surface, use moments and Jeju-inspired material mood, gathered so the choice feels clear before checkout.
            </p>
            <div className="product-long-detail__points">
              {detailHighlights.slice(0, 6).map((fact) => <span key={fact}>{fact}</span>)}
            </div>
          </div>
          <div className="product-long-detail__images">
            {detailImages.map((image, index) => (
              <figure key={`${image}-${index}`}>
                <img src={image} alt={`${product.displayName || product.name} detail ${index + 1}`} loading="lazy" decoding="async" />
              </figure>
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
