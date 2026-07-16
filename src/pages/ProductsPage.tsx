import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { honditImages, retailProducts } from "../data/siteData";
import { Footer } from "../sections/Footer";

type ProductFilter = "all" | "scent" | "care";

const filterLabels: Array<{ label: string; value: ProductFilter }> = [
  { label: "All", value: "all" },
  { label: "Scent", value: "scent" },
  { label: "Care", value: "care" },
];

export function ProductsPage() {
  const [filter, setFilter] = useState<ProductFilter>("all");

  const products = useMemo(() => {
    return retailProducts.filter((product) => {
      if (filter === "all") return true;
      if (filter === "scent") return product.id.includes("diffuser");
      return !product.id.includes("diffuser");
    });
  }, [filter]);

  return (
    <>
      <main className="editorial-page products-page">
        <section className="editorial-hero editorial-hero--products">
          <img className="editorial-hero__image" src={honditImages.homeStoneHero} alt="" width="1920" height="1080" loading="eager" decoding="async" />
          <div className="editorial-hero__copy">
            <p className="eyebrow">PRODUCTS</p>
            <h1>Products</h1>
            <p>Curated Jeju-inspired care and scent - rooted in nature, made for your everyday rituals.</p>
          </div>
        </section>

        <section className="editorial-section products-catalog">
          <div className="editorial-container">
            <div className="products-toolbar">
              <div className="products-filter" aria-label="Product filter">
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
              <p>{products.length} products</p>
              <Link className="quiet-link" to="/bulk-orders">Bulk order guide</Link>
            </div>
            <div className="product-grid product-grid--three editorial-product-grid">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} tone={product.id.includes("diffuser") ? "sand" : "water"} location="products_page" />
              ))}
            </div>
          </div>
        </section>

        <section className="benefit-band">
          <div className="editorial-container benefit-band__grid">
            <div>
              <h2>Best for daily rituals</h2>
              <p>Thoughtfully selected Korean care and scent products for a mindful life, every day.</p>
              <strong>Made for you. Made for Jeju.</strong>
            </div>
            {[
              ["Vegan Cleansing", "Three gentle daily cleansing choices for different routines."],
              ["Jeju Volcanic Stone", "A scent object built around porous volcanic stone texture."],
              ["No Fire or Electricity", "The diffuser refreshes with oil drops, without flame or plugs."],
              ["Two Purchase Routes", "Shop single items on Shopee SG or order business quantities directly."],
            ].map(([title, body]) => (
              <article key={title}>
                <span aria-hidden="true" />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
