import { useState } from "react";
import { Link } from "react-router-dom";
import {
  reviewAmount,
  reviewCheckout,
  selectionUrl,
  validQuantity,
} from "../../shared/sales-tools.js";
import { sgTerms } from "../../shared/page-sales.js";
import { useSearchParams } from "react-router-dom";
import { purchaseRoute } from "../../shared/purchase-context.js";
import {
  getMarketUnitPrice,
  marketText,
  useMarket,
  formatCurrency,
} from "../lib/market";
import type { StorefrontProduct } from "../data/v23SiteData";
export function QuantityReview({ product, purpose="unspecified" }: { product: StorefrontProduct;purpose?:string }) {
  const { market, language } = useMarket();
  const t = (s: string) => marketText(language, s);
  const [params] = useSearchParams();
  const [quantity, setQuantity] = useState(
    validQuantity(params.get("quantity")||"") ? params.get("quantity")! : String(
      (market.code === "SG" ? sgTerms(product)?.moq : null) ?? product.bulkMoq,
    ),
  );
  const amount = reviewAmount(
    getMarketUnitPrice(product, market),
    quantity,
    market.currency,
  );
  const direct =
    reviewCheckout(product, quantity, market.code) &&
    product.active !== false &&
    (product.stockQuantity === undefined ||
      Number(quantity) <= product.stockQuantity);
  const input = {
    slug: product.slug,
    quantity,
    market: market.code,
    language,
    reason: "quantity",
    purpose,
  };
  return (
    <section className="quantity-review sales-tools-section">
      <h2>{t("Selected product amount")}</h2>
      <label>
        {t("Order quantity")}
        <input
          type="number"
          min="1"
          max="9999"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </label>
      {amount ? (
        <output aria-live="polite">
          {formatCurrency(
            amount.totalMinor / 10 ** amount.digits,
            market.currency,
            market.locale,
          )}
        </output>
      ) : (
        <p role="alert">
          {t("Quantity must be a whole number from 1 to 9999.")}
        </p>
      )}
      <p className="route-status">{t(purchaseRoute([{product,quantity:Number(quantity)}],market.code)==="confirmation"?"Confirmation required":direct?"Direct order candidate":"Consultation required")}</p>
      <p>{t("Review only — not a confirmed quotation or purchase order.")}</p>
      <p>
        {t(
          direct
            ? "Existing checkout rules apply; final availability and payment settings are checked on the order page."
            : "Consultation required before payment. No new quantity or combination is approved here.",
        )}
      </p>
      {validQuantity(quantity) && (
        <div className="v23-actions">
          {direct && (
            <Link to={selectionUrl(`/bulk-orders/${product.slug}`, input)}>
              {t("Continue to delivery and PayPal ->")}
            </Link>
          )}
          <Link to={selectionUrl("/contact", input)}>
            {t("Consultation")} →
          </Link>
        </div>
      )}
    </section>
  );
}
