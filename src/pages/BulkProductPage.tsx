import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  BULK_QTY_STEP,
  bulkProducts,
  formatSgd,
  getBulkMaxUnits,
  getBulkMoq,
  getBulkProduct,
  getBulkTotal,
  getStockStatus,
  normalizeBulkQuantity,
  type BulkProduct,
} from "../data/bulkProducts";
import { ProductReviews } from "../components/ProductReviews";
import {
  capturePayPalOrder,
  createPayPalOrder,
  fetchBulkProducts,
  fetchPayPalConfig,
  updatePaymentAttempt,
  type CheckoutPayload,
} from "../lib/bulkApi";
import { trackEvent } from "../lib/analytics";
import { V23Page } from "../components/v23/SiteChrome";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onCancel?: (data: { orderID: string }) => Promise<void>;
        onError?: (error: unknown) => void;
      }) => { render: (selector: string) => Promise<void> };
    };
  }
}

type OrderForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  customerNote: string;
  reviewed: boolean;
};

const fallbackPayPalClientId = (import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined) || "";
const fallbackPayPalMode = ((import.meta.env.VITE_PAYPAL_MODE || import.meta.env.VITE_PAYPAL_ENV || "sandbox") as string).toLowerCase();

const initialForm: OrderForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  companyName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  customerNote: "",
  reviewed: false,
};

function readAttribution() {
  try {
    const stored = JSON.parse(window.localStorage.getItem("hondit_attribution") || "{}");
    const analyticsStored = JSON.parse(window.sessionStorage.getItem("hondit_attribution_v1") || "{}");
    return {
      utm_source: stored.utm_source || analyticsStored.traffic_source || "",
      utm_medium: stored.utm_medium || analyticsStored.traffic_medium || "",
      utm_campaign: stored.utm_campaign || analyticsStored.traffic_campaign || "",
      utm_content: stored.utm_content || analyticsStored.traffic_content || "",
      utm_term: stored.utm_term || analyticsStored.traffic_term || "",
      landing_page: stored.landing_page || analyticsStored.landing_page || "",
      referrer: stored.referrer || analyticsStored.referrer || "",
    };
  } catch {
    return {};
  }
}

export function BulkProductPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [packCount, setPackCount] = useState(0);
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [payPalConfig, setPayPalConfig] = useState({
    checkoutEnabled: true,
    clientId: fallbackPayPalClientId,
    mode: fallbackPayPalMode,
  });
  const formRef = useRef(initialForm);
  const quantityRef = useRef(0);
  const productRef = useRef<BulkProduct | null>(null);
  const createdOrderNumber = useRef("");

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
    fetchPayPalConfig()
      .then((config) =>
        setPayPalConfig({
          checkoutEnabled: config.checkoutEnabled !== false,
          clientId: config.clientId || fallbackPayPalClientId,
          mode: (config.mode || fallbackPayPalMode).toLowerCase(),
        }),
      )
      .catch(() => {});
  }, []);

  const product = products.find((entry) => entry.slug === slug && entry.active) || getBulkProduct(slug);
  if (!product) return <Navigate to="/bulk-orders" replace />;

  const moq = getBulkMoq(product);
  const maxUnits = getBulkMaxUnits(product);
  const quantity = normalizeBulkQuantity(product, packCount || moq);
  const totalSgd = getBulkTotal(product, quantity);
  const stockStatus = getStockStatus(product);
  const soldOut = stockStatus === "Sold out";
  const paypalClientId = payPalConfig.clientId;
  const paypalMode = payPalConfig.mode;
  const checkoutDisabled = !payPalConfig.checkoutEnabled;

  useEffect(() => {
    formRef.current = form;
    quantityRef.current = quantity;
    productRef.current = product;
  }, [form, product, quantity]);

  useEffect(() => {
    if (!paypalClientId || soldOut || checkoutDisabled) return;
    const scriptId = "paypal-sdk";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=SGD&intent=capture`;
      script.onload = () => setReady(true);
      document.body.appendChild(script);
    } else {
      setReady(true);
    }
  }, [checkoutDisabled, paypalClientId, soldOut]);

  const update = (key: keyof OrderForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const validate = (currentForm: OrderForm) => {
    if (soldOut) return "This product is currently sold out.";
    if (checkoutDisabled) return "Direct PayPal checkout is temporarily closed. Please contact hondit.";
    if (
      !currentForm.customerName ||
      !currentForm.customerEmail ||
      !currentForm.customerPhone ||
      !currentForm.addressLine1 ||
      !currentForm.city ||
      !currentForm.postalCode
    ) {
      return "Please complete all required shipping fields before payment.";
    }
    if (!currentForm.reviewed) return "Please confirm the quantity, address and final payment amount.";
    return "";
  };

  const payload = (currentProduct: BulkProduct, currentQuantity: number, currentForm: OrderForm): CheckoutPayload => ({
    orderType: "Direct bulk order",
    customerName: currentForm.customerName.trim(),
    customerEmail: currentForm.customerEmail.trim(),
    customerPhone: currentForm.customerPhone.trim(),
    companyName: currentForm.companyName.trim() || undefined,
    countryCode: "SG",
    addressLine1: currentForm.addressLine1.trim(),
    addressLine2: currentForm.addressLine2.trim() || undefined,
    city: currentForm.city.trim(),
    postalCode: currentForm.postalCode.trim(),
    customerNote: currentForm.customerNote.trim() || undefined,
    attribution: readAttribution(),
    cart: [{ slug: currentProduct.slug, packCount: currentQuantity }],
  });

  useEffect(() => {
    const container = document.getElementById("direct-paypal-buttons");
    if (!ready || !window.paypal || !paypalClientId || !container || container.childElementCount > 0 || soldOut || checkoutDisabled) return;

    window.paypal
      .Buttons({
        createOrder: async () => {
          const currentForm = formRef.current;
          const currentProduct = productRef.current;
          const currentQuantity = quantityRef.current;
          if (!currentProduct) throw new Error("Product is not ready.");

          const validationError = validate(currentForm);
          if (validationError) {
            setError(validationError);
            throw new Error(validationError);
          }

          setError("");
          const value = getBulkTotal(currentProduct, currentQuantity);
          trackEvent("begin_checkout", {
            product_id: currentProduct.slug,
            quantity: currentQuantity,
            value,
            currency: "SGD",
          });
          const response = await createPayPalOrder(payload(currentProduct, currentQuantity, currentForm));
          createdOrderNumber.current = response.orderNumber;
          return response.paypalOrderId;
        },
        onApprove: async (data) => {
          try {
            const response = await capturePayPalOrder(data.orderID, createdOrderNumber.current);
            navigate(`/order-complete/${response.orderNumber}`);
          } catch (captureError) {
            const reason = captureError instanceof Error ? captureError.message : "Payment could not be completed.";
            await updatePaymentAttempt({
              orderNumber: createdOrderNumber.current,
              paypalOrderId: data.orderID,
              status: "payment_failed",
              reason,
            }).catch(() => {});
            navigate(`/payment-failed/${createdOrderNumber.current}`);
          }
        },
        onCancel: async (data) => {
          await updatePaymentAttempt({
            orderNumber: createdOrderNumber.current,
            paypalOrderId: data.orderID,
            status: "payment_cancelled",
            reason: "Customer cancelled PayPal checkout",
          }).catch(() => {});
          navigate(`/payment-failed/${createdOrderNumber.current}?status=cancelled`);
        },
        onError: (paypalError) => {
          console.error(paypalError);
          const reason = paypalError instanceof Error ? paypalError.message : "PayPal payment could not be completed.";
          if (createdOrderNumber.current) {
            updatePaymentAttempt({
              orderNumber: createdOrderNumber.current,
              status: "payment_failed",
              reason,
            }).catch(() => {});
            navigate(`/payment-failed/${createdOrderNumber.current}`);
            return;
          }
          setError("Payment could not be completed. Please try another card, contact hondit, or purchase through Shopee SG.");
        },
      })
      .render("#direct-paypal-buttons");
  }, [checkoutDisabled, navigate, paypalClientId, ready, soldOut]);

  return (
    <V23Page>
    <main className="bulk-page v23-operational-page">
      <section className="bulk-detail section-shell">
        <div className="section-inner section-inner--wide bulk-detail__grid">
          <figure className="bulk-detail__image">
            <img src={product.imageUrl} alt={product.name} />
          </figure>

          <div className="bulk-detail__content">
            <Link className="text-link" to="/bulk-orders">
              Back to Bulk Orders
            </Link>
            <p className="eyebrow">{product.category.toUpperCase()} BULK ORDER</p>
            <h1>{product.name}</h1>
            <p className="bulk-detail__volume">{product.volumeLabel}</p>
            <p>{product.description}</p>
            <p className="bulk-price-explainer">
              Bulk prices are lower because they exclude the marketplace fees applied on Shopee. Ordering directly here passes those
              savings on to you.
            </p>

            <dl className="bulk-price-list bulk-price-list--detail">
              <div>
                <dt>Unit price</dt>
                <dd>{formatSgd(product.unitPriceSgd)}</dd>
              </div>
              <div>
                <dt>Minimum</dt>
                <dd>{moq} units</dd>
              </div>
              <div>
                <dt>Step</dt>
                <dd>{BULK_QTY_STEP} units</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>Free Singapore EMS included</dd>
              </div>
            </dl>

            <p className={`stock-pill stock-pill--${stockStatus.toLowerCase().replaceAll(" ", "-")}`}>{stockStatus}</p>
            <p className="shipping-pill">
              Order from {moq} units, in steps of {BULK_QTY_STEP}.{maxUnits ? ` Available up to ${maxUnits} units.` : ""}
            </p>

            <section className="direct-order-box" aria-label="Direct bulk order">
              <div className="pack-stepper" aria-label="Order quantity">
                <span>Order quantity</span>
                <div>
                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => setPackCount((value) => normalizeBulkQuantity(product, (value || moq) - BULK_QTY_STEP))}
                  >
                    -
                  </button>
                  <input
                    aria-label="Units"
                    disabled={soldOut}
                    inputMode="numeric"
                    value={quantity}
                    onChange={(event) => setPackCount(normalizeBulkQuantity(product, Number(event.target.value)))}
                  />
                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => setPackCount((value) => normalizeBulkQuantity(product, (value || moq) + BULK_QTY_STEP))}
                  >
                    +
                  </button>
                </div>
                <em>Minimum {moq}. Increase in steps of {BULK_QTY_STEP}.</em>
              </div>

              <div className="bulk-total-box">
                <span>Total units</span>
                <strong>{quantity}</strong>
                <span>Total payment</span>
                <strong>{formatSgd(totalSgd)}</strong>
                <p>Free Singapore EMS shipping</p>
              </div>

              <form className="checkout-form direct-order-form">
                <label>
                  Full name *<input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} />
                </label>
                <label>
                  Email *<input type="email" value={form.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} />
                </label>
                <label>
                  Phone / WhatsApp *<input value={form.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} />
                </label>
                <label>
                  Company name<input value={form.companyName} onChange={(event) => update("companyName", event.target.value)} />
                </label>
                <label>
                  Country<input value="Singapore" readOnly />
                </label>
                <label>
                  Address line 1 *<input value={form.addressLine1} onChange={(event) => update("addressLine1", event.target.value)} />
                </label>
                <label>
                  Address line 2<input value={form.addressLine2} onChange={(event) => update("addressLine2", event.target.value)} />
                </label>
                <label>
                  City / District *<input value={form.city} onChange={(event) => update("city", event.target.value)} />
                </label>
                <label>
                  Postal code *<input value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} />
                </label>
                <label className="checkout-form__wide">
                  Order note
                  <textarea
                    value={form.customerNote}
                    onChange={(event) => update("customerNote", event.target.value)}
                    placeholder="For receipt, company delivery name or special handling requests, write here."
                  />
                </label>
                <label className="checkout-confirm checkout-form__wide">
                  <input type="checkbox" checked={form.reviewed} onChange={(event) => update("reviewed", event.target.checked)} />
                  I confirm that my email, phone number, shipping address, product quantity and final payment amount are correct.
                </label>
              </form>

              <div className="direct-payment-summary">
                <div className="direct-payment-summary__header">
                  <span>Review before payment</span>
                  <h2>Final payment check</h2>
                  <p>Please confirm these details before opening PayPal or card checkout.</p>
                </div>
                <div className="direct-payment-summary__total">
                  <span>{product.name}</span>
                  <strong>{quantity} units / {formatSgd(totalSgd)}</strong>
                </div>
                <dl className="direct-payment-summary__details">
                  <div><dt>Full name</dt><dd>{form.customerName || "Not entered"}</dd></div>
                  <div><dt>Email</dt><dd>{form.customerEmail || "Not entered"}</dd></div>
                  <div><dt>Phone / WhatsApp</dt><dd>{form.customerPhone || "Not entered"}</dd></div>
                  <div>
                    <dt>Shipping address</dt>
                    <dd>{[form.addressLine1, form.addressLine2, form.city, "Singapore", form.postalCode].filter(Boolean).join(", ") || "Not entered"}</dd>
                  </div>
                  <div><dt>Order note</dt><dd>{form.customerNote || "No note"}</dd></div>
                </dl>
                <div className="direct-payment-summary__notice">
                  <strong>Pay with PayPal or credit/debit card.</strong>
                  <span>For direct checkout, please use PayPal or an international card.</span>
                  <span>If your payment does not go through, please try another card, contact hondit, or purchase through Shopee SG.</span>
                  {paypalMode === "sandbox" && <span>PayPal Sandbox payment. Currency: SGD.</span>}
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}
              {soldOut ? (
                <a className="button button--primary" href={`/contact?type=restock&product=${product.slug}`}>
                  Notify me
                </a>
              ) : checkoutDisabled ? (
                <p className="setup-warning">Direct PayPal checkout is temporarily closed. Please contact hondit for this order.</p>
              ) : !paypalClientId ? (
                <p className="setup-warning">Add PAYPAL_CLIENT_ID in Vercel to enable PayPal buttons.</p>
              ) : (
                <div id="direct-paypal-buttons" className="paypal-buttons" />
              )}
            </section>

            <section className="bulk-product-info">
              <h2>Product composition</h2>
              <div className="product-card__chips">
                {product.features.map((feature) => (
                  <span key={feature}>{feature}</span>
                ))}
              </div>
              <h2>Use and order notes</h2>
              <ul>
                {product.usage.map((item) => (
                  <li key={item}>{item}</li>
                ))}
                <li>Orders are currently available for delivery within Singapore only.</li>
                <li>All listed prices include Singapore EMS shipping.</li>
              </ul>
            </section>
          </div>
        </div>
        <div className="section-inner section-inner--wide">
          <ProductReviews product={product} />
        </div>
      </section>
    </main>
    </V23Page>
  );
}
