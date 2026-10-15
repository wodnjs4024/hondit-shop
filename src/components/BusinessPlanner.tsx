import {salesPresentationCopy} from '../data/salesPresentationCopy';
import {DiffuserQuantitySelector,usePurchaseQuantity} from './DiffuserQuantitySelector';
import {isDiffuser} from '../../shared/diffuser-quantity.js';
import {resolveCheckoutTerms} from "../../shared/checkout-terms.js";
import {ResaleCalculator} from "./ResaleCalculator";
import {approvedResaleTerms} from "../../shared/resale-economics.js";
import { ProductSalesSummary } from "./ProductSalesSummary";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  allocateQuantity,
  reviewAmount,
  validQuantity,
  selectionUrl,
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
import {purchaseRoute} from '../../shared/purchase-context.js';
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
  const [quantity,setQuantity]=usePurchaseQuantity(slug,String((market.code==='SG'?sgTerms(initialProduct)?.moq:null)??initialProduct.bulkMoq));
  const [purpose, setPurpose] = useState(params.get("purpose")==="resale"?"Resale":purposes[0]);
  const [requirements,setRequirements]=useState("");
  const [timing,setTiming]=useState("");
  const [display, setDisplay] = useState(0);
  const [reserve, setReserve] = useState(0);
  const [resaleSummary,setResaleSummary]=useState("");
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
  const saleDecision=resolveCheckoutTerms(product,market.code,quantity);
  const route=saleDecision.status==='direct'?'direct':saleDecision.status==='unavailable'?'confirmation':'consultation';
  const routeMessage=route==='direct'?'Existing checkout rules apply; final availability and payment settings are checked on the order page.':'Shipping and payment require confirmation. Extra freight may apply; your selection is kept in the payment request.';
  const facts = productFacts(product.slug);
  const approved=approvedResaleTerms(product,market.code,quantity);
  const amount = saleDecision.status!=='unavailable'&&saleDecision.referenceTotalMinor!==null?{totalMinor:saleDecision.referenceTotalMinor,digits:saleDecision.referenceDigits}:null;
  const money = (minor: number) =>
    formatCurrency(
      minor / 10 ** (amount?.digits ?? 2),
      market.currency,
      market.locale,
    );
  const summary = [
    `${marketProductText(language,product.name)} · ${marketCountryName(market,language)} · ${quantity} ${t('units')}`,
    `${t("Introduction summary")}: ${t(purpose)}`,
    `${t(approved?"Selected product amount":"Reference product amount")}: ${amount ? money(amount.totalMinor) : t("No confirmed amount")}`,
    t("Review only — not a confirmed quotation or purchase order."),
    purpose==="Resale" ? resaleSummary : "",
    purpose!=="Resale" ? `${t("Placement / requirements")}: ${requirements}; ${t("Preferred timing")}: ${timing}` : "",
    allocation && purpose === "Resale"
      ? `${t("Display units")}: ${allocation.display}; ${t("Units for sale")}: ${allocation.sale}; ${t("Reserve units")}: ${allocation.reserve}`
      : "",
    t(routeMessage),
    t(
      "Product photos, specifications and published use guidance are available. Supply, dispatch timing, import rules and shipping are confirmed per order.",
    ),
    `${t("Tax & customs")}: ${salesPresentationCopy(language).taxNeutral}`,
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
              setResaleSummary("");
            }}
          >
            {Object.values(markets).map((m) => (
              <option value={m.code} key={m.code}>
                {marketCountryName(m, language)}{!['BN','MO'].includes(m.code)&&` · ${m.currency}`}
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
              if(!isDiffuser(p))setQuantity(String(p.bulkMoq));
              setDisplay(0);
              setReserve(0);
              setResaleSummary("");
            }}
          >
            {available.map((p) => (
              <option value={p.slug} key={p.slug}>
                {marketProductText(language, p.name)}
              </option>
            ))}
          </select>
        </label>
        {isDiffuser(product)?<DiffuserQuantitySelector value={quantity} onChange={setQuantity}/>:<label>
          {t("Order quantity")}
          <input
            type="number"
            min="1"
            max="9999"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>}
      </div>
      {purpose!=="Resale" && <div className="business-planner__fields"><label>{t("Placement / requirements")}<textarea maxLength={1000} value={requirements} onChange={e=>setRequirements(e.target.value)}/></label>{["Gifts","Group purchase"].includes(purpose)&&<label>{t("Preferred timing")}<input type="date" value={timing} onChange={e=>setTiming(e.target.value)}/></label>}</div>}
      {approved ? <ProductSalesSummary product={product} quantity={quantity}/> : <p role="status">{t("Approved terms unavailable for this selection. Contact us to confirm.")}</p>}
      <section className="planner-summary" aria-live="polite">
        <p className="route-status">{t(route==='direct'?'Direct order candidate':route==='confirmation'?'Confirmation required':'Consultation required')}</p>
        <h3>{t("Introduction summary")}</h3>
        <p>
          {marketProductText(language, product.name)} ·{" "}
          {marketCountryName(market, language)} · {market.currency}
        </p>
        <output>
          {amount ? money(amount.totalMinor) : t("No confirmed amount")}
        </output>
        <p>
          {t(routeMessage)}
        </p>
        <p>

          {salesPresentationCopy(language).taxNeutral}
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
      {allocation && purpose === "Resale" && (
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
      {purpose === "Resale" && <>
      <ResaleCalculator key={`${market.code}-${product.slug}-${quantity}`} product={product} quantity={quantity} saleQuantity={allocation?.sale} onSummary={setResaleSummary}/>
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
</>}
      <article className="introduction-print"><h3>{t('Introduction summary')}</h3><pre>{summary}</pre></article>
      {approved&&route==='direct'&&<Link className="button button--primary" to={selectionUrl('/bulk-orders/'+product.slug,{slug:product.slug,quantity,market:market.code,language,reason:'partner',purpose:purpose==='Resale'?'resale':purpose==='Display / space'?'business_use':purpose==='Group purchase'?'group_purchase':'personal_gift'})}>{t('Continue to delivery and PayPal ->')}</Link>}
      <div className="planner-summary-actions"><button type="button" className="button button--ghost" onClick={()=>{document.body.dataset.printReview='1';try{window.print()}finally{delete document.body.dataset.printReview}}}>{t("Print / save as PDF")}</button></div>
      {allocation && saleDecision.status!=='unavailable' && (
        <ConsultationPanel
          key={`${product.slug}-${market.code}`}
          lines={[{ name: product.name, quantity: Number(quantity) }]}
          reason={saleDecision.status==='request'?"payment_request":"partner"}
          presetPurpose={t(purpose)}
          summaryDetails={summary+"\n\n"+(saleDecision.status==='request'?t("Please confirm the billing currency, final amount and shipping terms, and send me a PayPal payment link."):"")}
        />
      )}
    </section>
  );
}
