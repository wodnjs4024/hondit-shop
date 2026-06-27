import { diffuserProducts } from "../data/siteData";
import { ProductCard } from "../components/ProductCard";

export function Diffuser() {
  return (
    <section className="diffuser section-shell" id="diffuser" aria-labelledby="diffuser-title">
      <div className="section-inner section-inner--wide">
        <div className="section-heading">
          <p>FOR YOUR SPACE</p>
          <h2 id="diffuser-title">
            A quieter way
            <span>to scent the room.</span>
          </h2>
          <p className="section-copy">
            Jeju volcanic stone carries a light citrus scent without flame or electricity.
          </p>
        </div>
        <div className="product-grid product-grid--two">
          {diffuserProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} tone="sand" location="diffuser" />
          ))}
        </div>
      </div>
    </section>
  );
}
