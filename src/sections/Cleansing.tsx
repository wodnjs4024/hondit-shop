import { cleansingProducts } from "../data/siteData";
import { ProductCard } from "../components/ProductCard";

export function Cleansing() {
  return (
    <section className="cleansing section-shell" id="cleansing" aria-labelledby="cleansing-title">
      <div className="section-inner section-inner--wide">
        <div className="section-heading section-heading--sticky">
          <p>FOR YOUR SKIN</p>
          <h2 id="cleansing-title">
            A gentler start
            <span>and finish.</span>
          </h2>
          <p className="section-copy">
            Three fragrance-free cleansing choices for sensitive everyday routines.
          </p>
        </div>
        <div className="product-grid product-grid--three">
          {cleansingProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} location="cleansing" />
          ))}
        </div>
      </div>
    </section>
  );
}
