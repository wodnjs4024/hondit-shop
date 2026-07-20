import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "../components/ExternalLink";
import { honditImages, links, retailProducts, type Product } from "../data/siteData";
import { trackProductClick, trackStoreClick } from "../lib/analytics";
import { Footer } from "../sections/Footer";

type ProductFilter = "all" | "care" | "scent";

const filterLabels: Array<{ label: string; value: ProductFilter }> = [
  { label: "All", value: "all" },
  { label: "Care", value: "care" },
  { label: "Scent", value: "scent" },
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
    label: "Home scent",
    title: "Volcanic Diffuser 350g",
    subtitle: "Compact scent for small spaces",
  },
  "diffuser-500": {
    label: "Home scent",
    title: "Volcanic Diffuser 500g",
    subtitle: "Scent object for larger rooms",
  },
  "foam-oil": {
    label: "Evening care",
    title: "Vegan Foam Oil 150ml",
    subtitle: "Makeup and sunscreen cleanse",
  },
  "foaming-cleanser": {
    label: "Daily care",
    title: "Vegan Foaming Cleanser 200ml",
    subtitle: "Soft everyday face wash",
  },
  "cleansing-water": {
    label: "Light care",
    title: "Vegan Cleansing Water 300ml",
    subtitle: "Quick and gentle cleanse",
  },
};

const cleanserGuide = [
  {
    role: "Makeup and sunscreen",
    title: "Vegan Foam Oil",
    body: "For sunscreen, base makeup and a complete evening cleanse.",
    productId: "foam-oil",
  },
  {
    role: "Daily face wash",
    title: "Vegan Foaming Cleanser",
    body: "For morning cleansing and soft daily face wash routines.",
    productId: "foaming-cleanser",
  },
  {
    role: "Quick and gentle",
    title: "Vegan Cleansing Water",
    body: "For light makeup, quick resets and low-effort cleansing.",
    productId: "cleansing-water",
  },
];

function isScentProduct(product: Product) {
  return product.id.startsWith("diffuser");
}

function formatDisplaySgd(value: number) {
  return `S$${value.toFixed(2)}`;
}

export function ProductsPage() {
  const [filter, setFilter] = useState<ProductFilter>("all");

  const products = useMemo(() => {
    if (filter === "care") return retailProducts.filter((product) => !isScentProduct(product));
    if (filter === "scent") return retailProducts.filter(isScentProduct);
    return retailProducts;
  }, [filter]);

  const handleShopeeProductClick = (product: Product) => {
    trackProductClick({
      eventName: product.eventName,
      productName: product.displayName || product.name,
      destinationUrl: product.href,
      buttonLocation: "products_page_card",
      clickTarget: "button",
    });
  };

  return (
    <>
      <main className="approved-home approved-products-page">
        <section className="approved-products approved-products--catalog" aria-labelledby="products-heading">
          <div className="approved-section-head">
            <div>
              <p className="approved-kicker"><span />THE HONDIT EDIT</p>
              <h1 id="products-heading">
                Jeju-inspired rituals,
                <br />
                <em>made for everyday.</em>
              </h1>
            </div>
            <div className="approved-filters" aria-label="Filter products">
              {filterLabels.map((item) => (
                <button
                  className={filter === item.value ? "is-active" : ""}
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="approved-product-grid">
            {products.map((product) => {
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
                    <ExternalLink href={product.href} onClick={() => handleShopeeProductClick(product)}>
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
            <ExternalLink className="approved-dark-button" href={links.shopeeStore} onClick={() => trackStoreClick("products_all")}>
              View all on Shopee SG
            </ExternalLink>
          </div>
        </section>

        <section className="approved-cleansing" aria-labelledby="cleansing-heading">
          <figure>
            <img
              src={honditImages.cleansingTrio}
              alt="Three J'essence vegan cleansing products styled with soft foam and water."
              loading="lazy"
              decoding="async"
            />
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
      </main>
      <Footer />
    </>
  );
}
