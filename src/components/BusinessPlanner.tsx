import { ProductSalesSummary } from "./ProductSalesSummary";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  allocateQuantity,
  reviewAmount,
  resaleDifference,
  validQuantity,
} from "../../shared/sales-tools.js";
import { sgTerms } from "../../shared/page-sales.js";
import { v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { loadStorefrontProducts } from "../lib/storefrontApi";
import { productFacts, diffuserCare } from "../data/productFacts";
import {
  displayLanguages,
  markets,
  formatCurrency,
  getMarketUnitPrice,
  isStorefrontProductAllowedForMarket,
  marketCountryName,
  marketProductText,
  marketText,
  useMarket,
  type DisplayLanguage,
  type MarketCode,
} from "../lib/market";
import { ConsultationPanel } from "./ConsultationPanel";
const purposes = ["Display / space", "Resale", "Gifts", "Group purchase"];
export function BusinessPlanner() {
  const { market, language, setMarket } = useMarket();
  const [params] = useSearchParams();
  const t = (s: string) => marketText(language, s);
  const [products, setProducts] = useState<StorefrontProduct[]>(v23Products);
  const [slug, setSlug] = useState(params.get("product") || "diffuser-350g");
  const initialProduct =
    v23Products.find(
      (p) => p.slug === (params.get("product") || "diffuser-350g"),
    ) || v23Products[0];
  const [quantity, setQuantity] = useState(
    validQuantity(params.get("quantity") || "")
      ? params.get("quantity")!
      : String(
          (market.code === "SG" ? sgTerms(initialProduct)?.moq : null) ??
            initialProduct.bulkMoq,
        ),
  );
  const [purpose, setPurpose] = useState(purposes[0]);
  const [display, setDisplay] = useState(0);
  const [reserve, setReserve] = useState(0);
  const [resale, setResale] = useState("");
  const [store, setStore] = useState("");
  const [cardLanguage, setCardLanguage] = useState<DisplayLanguage>(language);
  useEffect(() => {
    let alive = true;
    loadStorefrontProducts().then((p) => {
      if (alive) setProducts(p);
    });
    return () => {
      alive = false;
    };
  }, []);
  const available = products.filter((p) =>
    isStorefrontProductAllowedForMarket(p, market),
  );
  const product = available.find((p) => p.slug === slug) || available[0];
  const allocation = allocateQuantity(quantity, display, reserve);
  useEffect(() => {
    if (allocation) {
      setDisplay(allocation.display);
      setReserve(allocation.reserve);
    }
  }, [quantity]);
  if (!product) return null;
  const facts = productFacts(product.slug);
  const amount = reviewAmount(
    getMarketUnitPrice(product, market),
    quantity,
    market.currency,
  );
  const difference =
    amount && allocation
      ? resaleDifference(
          resale,
          amount.unitMinor,
          allocation.sale,
          market.currency,
        )
      : null;
  const money = (minor: number) =>
    formatCurrency(
      minor / 10 ** (amount?.digits ?? 2),
      market.currency,
      market.locale,
    );
  const summary = [
    `${t("Introduction summary")}: ${t(purpose)}`,
    `${t("Selected product amount")}: ${amount ? money(amount.totalMinor) : t("No confirmed amount")}`,
    t("Review only — not a confirmed quotation or purchase order."),
    allocation
      ? `${t("Display units")}: ${allocation.display}; ${t("Units for sale")}: ${allocation.sale}; ${t("Reserve units")}: ${allocation.reserve}`
      : "",
    t(
      "Consultation required before payment. No new quantity or combination is approved here.",
    ),
    t(
      "Product photos, specifications and published use guidance are available. Supply, dispatch timing, import rules and shipping are confirmed per order.",
    ),
    `${t("Tax & customs")}: ${t("Excluded; payable by the recipient where applicable.")}`,
  ]
    .filter(Boolean)
    .join("\n");
  const ct = (s: string) => marketText(cardLanguage, s);
  return (
    <section
      id="partner-consultation"
      className="business-planner sales-tools-section"
    >
      <header>
        <h2>{t("Plan your introduction")}</h2>
        <p>{t("Review only — not a confirmed quotation or purchase order.")}</p>
      </header>
      <div className="business-planner__fields">
        <label>
          {t("Purpose")}
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            {purposes.map((p) => (
              <option key={p} value={p}>
                {t(p)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Market")}
          <select
            value={market.code}
            onChange={(e) => {
              setMarket(e.target.value as MarketCode);
              setResale("");
            }}
          >
            {Object.values(markets).map((m) => (
              <option value={m.code} key={m.code}>
                {marketCountryName(m, language)} · {m.currency}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Products")}
          <select
            value={product.slug}
            onChange={(e) => {
              const p = available.find((p) => p.slug === e.target.value)!;
              setSlug(p.slug);
              setQuantity(
                String(
                  (market.code === "SG" ? sgTerms(p)?.moq : null) ?? p.bulkMoq,
                ),
              );
              setDisplay(0);
              setReserve(0);
              setResale("");
            }}
          >
            {available.map((p) => (
              <option value={p.slug} key={p.slug}>
                {marketProductText(language, p.name)}
              </option>
            ))}
          </select>
        </label>
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
      </div>
      <ProductSalesSummary product={product} />
      <section className="planner-summary" aria-live="polite">
        <h3>{t("Introduction summary")}</h3>
        <p>
          {marketProductText(language, product.name)} ·{" "}
          {marketCountryName(market, language)} · {market.currency}
        </p>
        <output>
          {amount ? money(amount.totalMinor) : t("No confirmed amount")}
        </output>
        <p>
          {t(
            "Consultation required before payment. No new quantity or combination is approved here.",
          )}
        </p>
        <p>
          {t("Tax & customs")}:{" "}
          {t("Excluded; payable by the recipient where applicable.")}
        </p>
        <p>
          {t(
            "Product photos, specifications and published use guidance are available. Supply, dispatch timing, import rules and shipping are confirmed per order.",
          )}
        </p>
      </section>
      {!allocation && (
        <p role="alert">
          {t("Quantity must be a whole number from 1 to 9999.")}
        </p>
      )}
      {allocation && (
        <section>
          <h3>{t("Quantity allocation")}</h3>
          <div className="business-planner__fields">
            <label>
              {t("Display units")}
              <input
                type="number"
                min="0"
                max={allocation.total - allocation.reserve}
                step="1"
                value={allocation.display}
                onChange={(e) =>
                  setDisplay(
                    Math.max(
                      0,
                      Math.min(
                        Number(e.target.value) || 0,
                        allocation.total - allocation.reserve,
                      ),
                    ),
                  )
                }
              />
            </label>
            <label>
              {t("Reserve units")}
              <input
                type="number"
                min="0"
                max={allocation.total - allocation.display}
                step="1"
                value={allocation.reserve}
                onChange={(e) =>
                  setReserve(
                    Math.max(
                      0,
                      Math.min(
                        Number(e.target.value) || 0,
                        allocation.total - allocation.display,
                      ),
                    ),
                  )
                }
              />
            </label>
            <label>
              {t("Units for sale")}
              <input
                data-testid="allocation-sale"
                type="number"
                min="0"
                max={allocation.total - allocation.display}
                step="1"
                value={allocation.sale}
                onChange={(e) =>
                  setReserve(
                    allocation.total -
                      allocation.display -
                      Math.max(
                        0,
                        Math.min(
                          Math.trunc(Number(e.target.value) || 0),
                          allocation.total - allocation.display,
                        ),
                      ),
                  )
                }
              />
            </label>
            <p>
              {t("Allocated total")}:{" "}
              <output data-testid="allocation-total">{allocation.total}</output>
            </p>
          </div>
        </section>
      )}
      <section>
        <h3>{t("Simple resale difference")}</h3>
        <label>
          {t("Your resale unit price")} ({market.currency})
          <input
            type="number"
            min="0"
            step={market.currency === "JPY" ? "1" : "0.01"}
            value={resale}
            onChange={(e) => setResale(e.target.value)}
          />
        </label>
        {difference ? (
          <p aria-live="polite">
            {t("Unit price difference")}: {money(difference.unitMinor)}
            <br />
            {t("Difference for sale allocation")}:{" "}
            <output data-testid="resale-difference">
              {money(difference.totalMinor)}
            </output>
          </p>
        ) : (
          resale !== "" && (
            <p role="alert">
              {t("Enter a non-negative amount in the displayed currency.")}
            </p>
          )
        )}
        <p>
          {t(
            "Same currency only. Excludes freight, taxes, duties, fees, discounts, display stock and losses. Not net profit or guaranteed income.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Sales support materials")}</h3>
        <p>
          {t(
            "Resale is permitted. Import and shipping requirements are checked separately for each destination.",
          )}
        </p>
        <p>
          {t(
            "Product photos, specifications and published use guidance are available. Supply, dispatch timing, import rules and shipping are confirmed per order.",
          )}
        </p>
        <div className="business-planner__fields">
          <label>
            {t("Store name (optional)")}
            <input
              maxLength={80}
              value={store}
              onChange={(e) => setStore(e.target.value)}
            />
          </label>
          <label>
            {t("Card language")}
            <select
              value={cardLanguage}
              onChange={(e) =>
                setCardLanguage(e.target.value as DisplayLanguage)
              }
            >
              {displayLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <h3>{t("Store sales card preview")}</h3>
        <article className="store-sales-card" lang={cardLanguage}>
          {store.trim() && (
            <p className="store-sales-card__store">{store.trim()}</p>
          )}
          <img
            src={product.image}
            alt={marketProductText(cardLanguage, product.name)}
            width="360"
            height="360"
          />
          <div>
            <p>{facts ? "STONEJEJU" : "J’essence"}</p>
            <h2>{marketProductText(cardLanguage, product.name)}</h2>
            <p>
              {facts
                ? ct(facts.description)
                : marketProductText(cardLanguage, product.description)}
            </p>
            {facts && (
              <p>
                {ct(facts.container)} · {facts.dimensions} · {facts.oil}
              </p>
            )}
            <h3>{ct("HOW TO USE")}</h3>
            <ol>
              {product.howTo.map((s) => (
                <li key={s}>{marketProductText(cardLanguage, s)}</li>
              ))}
            </ol>
            {facts && <p>{ct(diffuserCare[0])}</p>}
            <p>{ct("Ask this store about availability and price.")}</p>
          </div>
        </article>
        <button
          className="button button--ghost"
          type="button"
          onClick={() => window.print()}
        >
          {t("Print / save as PDF")}
        </button>
        <p>
          {t(
            "Print preview. This does not approve a partner or issue a public partner QR.",
          )}
        </p>
      </section>
      {amount && allocation && (
        <ConsultationPanel
          key={`${product.slug}-${market.code}`}
          lines={[{ name: product.name, quantity: Number(quantity) }]}
          reason="partner"
          presetPurpose={t(purpose)}
          summaryDetails={summary}
        />
      )}
    </section>
  );
}
