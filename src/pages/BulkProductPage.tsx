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
import { capturePayPalOrder, createPayPalOrder, fetchBulkProducts, updatePaymentAttempt, type CheckoutPayload } from "../lib/bulkApi";
import { trackEvent } from "../lib/analytics";
import { Footer } from "../sections/Footer";

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

const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
const paypalMode = ((import.meta.env.VITE_PAYPAL_MODE || import.meta.env.VITE_PAYPAL_ENV || "sandbox") as string).toLowerCase();

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
    return JSON.parse(window.localStorage.getItem("hondit_attribution") || "{}");
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
  const formRef = useRef(initialForm);
  const quantityRef = useRef(0);
  const productRef = useRef<BulkProduct | null>(null);
  const createdOrderNumber = useRef("");

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
  }, []);

  const product = products.find((entry) => entry.slug === slug && entry.active) || getBulkProduct(slug);
  if (!product) return <Navigate to="/bulk-orders" replace />;

  const moq = getBulkMoq(product);
  const maxUnits = getBulkMaxUnits(product);
  const quantity = normalizeBulkQuantity(product, packCount || moq);
  const totalSgd = getBulkTotal(product, quantity);
  const stockStatus = getStockStatus(product);
  const soldOut = stockStatus === "Sold out";

  useEffect(() => {
    formRef.current = form;
    quantityRef.current = quantity;
    productRef.current = product;
  }, [form, product, quantity]);

  useEffect(() => {
    if (!paypalClientId || soldOut) return;
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
  }, [soldOut]);

  const update = (key: keyof OrderForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const validate = (currentForm: OrderForm) => {
    if (soldOut) return "This product is currently sold out.";
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
    if (!ready || !window.paypal || !paypalClientId || !container || container.childElementCount > 0 || soldOut) return;

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
  }, [navigate, paypalClientId, ready, soldOut]);

  const shippingAddress = [form.addressLine1, form.addressLine2, form.city, "Singapore", form.postalCode].filter(Boolean).join(", ");

  return (
    <>
      <main className="approved-bulk-product-page">
        <section className="approved-checkout-hero">
          <div className="section-inner section-inner--wide approved-checkout-hero__grid">
            <div className="approved-checkout-hero__copy">
              <Link className="approved-back-link" to="/bulk-orders">
                Back to Bulk Orders
              </Link>
              <p className="approved-kicker"><span>{product.category} bulk checkout</span></p>
              <h1>{product.name}</h1>
              <p>
                Review the minimum quantity, Singapore delivery details and payment amount before opening the secure PayPal checkout.
              </p>
            </div>
            <figure className="approved-checkout-hero__image">
              <img src={product.imageUrl} alt={product.name} />
            </figure>
          </div>
        </section>

        <section className="approved-checkout-workspace">
          <div className="section-inner section-inner--wide approved-checkout-grid">
            <aside className="approved-checkout-summary" aria-label="Bulk order summary">
              <img src={product.imageUrl} alt="" />
              <p className={`stock-pill stock-pill--${stockStatus.toLowerCase().replaceAll(" ", "-")}`}>{stockStatus}</p>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <dl>
                <div><dt>Unit price</dt><dd>{formatSgd(product.unitPriceSgd)}</dd></div>
                <div><dt>Minimum</dt><dd>{moq} units</dd></div>
                <div><dt>Quantity step</dt><dd>{BULK_QTY_STEP} units</dd></div>
                <div><dt>Shipping</dt><dd>Singapore EMS included</dd></div>
              </dl>
              <p className="approved-checkout-summary__note">
                Bulk prices exclude marketplace fees applied on Shopee. Direct checkout passes those savings on to you.
              </p>
            </aside>

            <section className="approved-checkout-main" aria-label="Direct checkout form">
              <div className="approved-checkout-card approved-quantity-card">
                <div>
                  <p className="approved-kicker"><span>01 quantity</span></p>
                  <h2>Choose approved units.</h2>
                  <p>Minimum {moq} units. Increase in steps of {BULK_QTY_STEP}.{maxUnits ? ` Available up to ${maxUnits} units.` : ""}</p>
                </div>
                <div className="approved-quantity-control" aria-label="Order quantity">
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
                <div className="approved-total-panel">
                  <span>Total units</span>
                  <strong>{quantity}</strong>
                  <span>Total payment</span>
                  <strong>{formatSgd(totalSgd)}</strong>
                  <em>Free Singapore EMS shipping</em>
                </div>
              </div>

              <div className="approved-checkout-card">
                <p className="approved-kicker"><span>02 delivery details</span></p>
                <h2>Confirm the recipient.</h2>
                <form className="approved-checkout-form">
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
                  <label className="approved-field-wide">
                    Order note
                    <textarea
                      value={form.customerNote}
                      onChange={(event) => update("customerNote", event.target.value)}
                      placeholder="For receipt, company delivery name or special handling requests, write here."
                    />
                  </label>
                  <label className="approved-checkout-confirm approved-field-wide">
                    <input type="checkbox" checked={form.reviewed} onChange={(event) => update("reviewed", event.target.checked)} />
                    I confirm that my email, phone number, shipping address, product quantity and final payment amount are correct.
                  </label>
                </form>
              </div>

              <div className="direct-payment-summary">
                <div className="direct-payment-summary__header">
                  <span>03 final review</span>
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
                  <div><dt>Shipping address</dt><dd>{shippingAddress || "Not entered"}</dd></div>
                  <div><dt>Order note</dt><dd>{form.customerNote || "No note"}</dd></div>
                </dl>
                <div className="direct-payment-summary__notice">
                  <strong>Pay with PayPal or credit/debit card.</strong>
                  <span>For direct checkout, please use PayPal or an international card.</span>
                  <span>If your payment does not go through, please try another card, contact hondit, or purchase through Shopee SG.</span>
                  {paypalMode === "sandbox" && <span>PayPal Sandbox payment. Currency: SGD.</span>}
                </div>
              </div>

              <div className="approved-checkout-card approved-payment-card">
                <p className="approved-kicker"><span>04 payment</span></p>
                <h2>Pay securely.</h2>
                <p>PayPal handles wallet or eligible card details. hondit does not store card data.</p>
                {error && <p className="form-error">{error}</p>}
                {soldOut ? (
                  <a className="button button--primary" href={`/contact?type=restock&product=${product.slug}`}>
                    Notify me
                  </a>
                ) : !paypalClientId ? (
                  <p className="setup-warning">Add VITE_PAYPAL_CLIENT_ID in Vercel to enable PayPal buttons.</p>
                ) : (
                  <div id="direct-paypal-buttons" className="paypal-buttons" />
                )}
              </div>
            </section>
          </div>
        </section>

        <section className="approved-product-support">
          <div className="section-inner section-inner--wide approved-product-support__grid">
            <div>
              <p className="approved-kicker"><span>Product composition</span></p>
              <h2>What is included.</h2>
              <div className="product-card__chips">
                {product.features.map((feature) => (
                  <span key={feature}>{feature}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="approved-kicker"><span>Use and order notes</span></p>
              <ul>
                {product.usage.map((item) => (
                  <li key={item}>{item}</li>
                ))}
                <li>Orders are currently available for delivery within Singapore only.</li>
                <li>All listed prices include Singapore EMS shipping.</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="section-inner section-inner--wide">
          <ProductReviews product={product} />
        </div>
      </main>
      <Footer />
    </>
  );
}
