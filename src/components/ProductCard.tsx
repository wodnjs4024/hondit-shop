import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DISCOUNT_LABEL, type Product } from "../data/siteData";
import { formatSgd } from "../data/bulkProducts";
import { trackEvent, trackProductClick } from "../lib/analytics";
import { ExternalLink } from "./ExternalLink";

type ProductCardProps = {
  product: Product;
  index: number;
  tone?: "water" | "sand";
  location: string;
};

const bulkSlugByProductId: Record<string, string> = {
  "foam-oil": "foam-oil",
  "foaming-cleanser": "foaming-cleanser",
  "cleansing-water": "cleansing-water",
  "diffuser-350": "diffuser-350g",
  "diffuser-500": "diffuser-500g",
};

export function ProductCard({ product, index, tone = "water", location }: ProductCardProps) {
  const savings = Math.max(0, product.listPrice - product.salePrice);
  const bulkSlug = bulkSlugByProductId[product.id];
  const detailPath = `/products/${product.id}`;
  const track = (clickTarget: "image" | "button") => {
    trackProductClick({
      eventName: product.eventName,
      productName: product.name,
      destinationUrl: product.href,
      buttonLocation: location,
      clickTarget,
    });
  };

  return (
    <motion.article
      id={product.id}
      className={`product-card product-card--${tone}`}
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        className="product-card__image-link"
        to={detailPath}
        aria-label={`View details for ${product.name}`}
        onClick={() => track("image")}
      >
        <span className="discount-badge">{DISCOUNT_LABEL}</span>
        <img
          src={product.image}
          alt={product.alt}
          width="900"
          height="1125"
          loading="lazy"
          decoding="async"
        />
      </Link>
      <div className="product-card__meta">
        {product.category && <p className="product-card__category">{product.category}</p>}
        <div className="product-card__title-row">
          <h3>{product.displayName || product.name}</h3>
          {product.size && <span>{product.size}</span>}
        </div>
        <p className="product-card__description">{product.description}</p>
        <div className="retail-price" aria-label={`${product.name} retail price`}>
          <span className="retail-price__list">{formatSgd(product.listPrice)}</span>
          <strong>{formatSgd(product.salePrice)}</strong>
          <em>You save {formatSgd(savings)}</em>
        </div>
        {product.bestFor && (
          <p className="product-card__best">
            <span>BEST FOR</span>
            {product.bestFor}
          </p>
        )}
        <div className="product-card__chips" aria-label={`${product.name} features`}>
          {product.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
        <div className="product-card__actions" aria-label={`${product.name} purchase options`}>
          <Link className="button button--detail" to={detailPath}>
            View Details
          </Link>
          <ExternalLink className="button button--quiet" href={product.href} onClick={() => track("button")}>
            Buy on Shopee
          </ExternalLink>
          {bulkSlug && (
            <Link
              className="button button--bulk"
              to={`/bulk-orders/${bulkSlug}`}
              onClick={() => trackEvent("click_bulk_product", { product_id: bulkSlug, button_location: `${location}_bulk_button` })}
            >
              Bulk Inquiry
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
