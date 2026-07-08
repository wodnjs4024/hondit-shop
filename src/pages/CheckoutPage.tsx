import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bulkProducts, formatSgd, type BulkProduct } from "../data/bulkProducts";
import { capturePayPalOrder, createPayPalOrder, fetchBulkProducts, type CheckoutPayload } from "../lib/bulkApi";
import { clearCart, getCartLines, getCartSummary, readCart } from "../lib/cart";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError?: (error: unknown) => void;
      }) => { render: (selector: string) => Promise<void> };
    };
  }
}

const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;

const orderTypes = [
  "Personal bulk order",
  "Business / store order",
  "Gift or event order",
  "Retail / resale order",
];

type FormState = {
  orderType: string;
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

const initialForm: FormState = {
  orderType: orderTypes[0],
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

export function CheckoutPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const createdOrderNumber = useRef("");

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
  }, []);

  const lines = useMemo(() => getCartLines(readCart(), products), [products]);
  const summary = getCartSummary(lines);

  const payload = (): CheckoutPayload => ({
    orderType: form.orderType,
    customerName: form.customerName.trim(),
    customerEmail: form.customerEmail.trim(),
    customerPhone: form.customerPhone.trim(),
    companyName: form.companyName.trim() || undefined,
    countryCode: "SG",
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2.trim() || undefined,
    city: form.city.trim(),
    postalCode: form.postalCode.trim(),
    customerNote: form.customerNote.trim() || undefined,
    attribution: readAttribution(),
    cart: readCart(),
  });

  const validate = () => {
    if (lines.length === 0) return "Your cart is empty.";
    if (!form.customerName || !form.customerEmail || !form.customerPhone || !form.addressLine1 || !form.city || !form.postalCode) {
      return "Please complete all required checkout fields.";
    }
    if (!form.reviewed) return "Please review and confirm the order details before payment.";
    return "";
  };

  useEffect(() => {
    if (!paypalClientId || lines.length === 0) return;
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
  }, [lines.length]);

  useEffect(() => {
    if (!ready || !window.paypal || !paypalClientId) return;
    const container = document.getElementById("paypal-buttons");
    if (!container || container.childElementCount > 0) return;

    window.paypal.Buttons({
      createOrder: async () => {
        const validationError = validate();
        if (validationError) {
          setError(validationError);
          throw new Error(validationError);
        }
        setError("");
        const response = await createPayPalOrder(payload());
        createdOrderNumber.current = response.orderNumber;
        return response.paypalOrderId;
      },
      onApprove: async (data) => {
        const response = await capturePayPalOrder(data.orderID, createdOrderNumber.current);
        clearCart();
        navigate(`/order-complete/${response.orderNumber}`);
      },
      onError: (paypalError) => {
        console.error(paypalError);
        setError("PayPal payment could not be completed. Please try again or contact hondit.");
      },
    }).render("#paypal-buttons");
  }, [ready, form, lines.length, navigate, paypalClientId]);

  const update = (key: keyof FormState, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <main className="bulk-page">
      <section className="bulk-checkout section-shell">
        <div className="section-inner section-inner--wide">
          <div className="bulk-page-title">
            <p className="eyebrow">CHECKOUT</p>
            <h1>Shipping details and PayPal Sandbox payment.</h1>
          </div>

          {lines.length === 0 ? (
            <div className="empty-state">
              <h2>Your cart is empty.</h2>
              <Link className="button button--primary" to="/bulk-orders">View Bulk Orders</Link>
            </div>
          ) : (
            <div className="checkout-grid">
              <form className="checkout-form">
                <label>
                  Order type
                  <select value={form.orderType} onChange={(event) => update("orderType", event.target.value)}>
                    {orderTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
                <label>Full name *<input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} /></label>
                <label>Email *<input type="email" value={form.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} /></label>
                <label>Phone / WhatsApp *<input value={form.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} /></label>
                <label>Company name<input value={form.companyName} onChange={(event) => update("companyName", event.target.value)} /></label>
                <label>Country<input value="Singapore" readOnly /></label>
                <label>Address line 1 *<input value={form.addressLine1} onChange={(event) => update("addressLine1", event.target.value)} /></label>
                <label>Address line 2<input value={form.addressLine2} onChange={(event) => update("addressLine2", event.target.value)} /></label>
                <label>City / District *<input value={form.city} onChange={(event) => update("city", event.target.value)} /></label>
                <label>Postal code *<input value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} /></label>
                <label className="checkout-form__wide">Order note<textarea value={form.customerNote} onChange={(event) => update("customerNote", event.target.value)} /></label>
                <label className="checkout-confirm checkout-form__wide">
                  <input type="checkbox" checked={form.reviewed} onChange={(event) => update("reviewed", event.target.checked)} />
                  I have reviewed the pack quantity, shipping address, refund policy and order total.
                </label>
              </form>

              <aside className="order-summary">
                <h2>Order Summary</h2>
                {lines.map((line) => (
                  <div className="summary-line" key={line.product.slug}>
                    <span>{line.product.name} {line.product.volumeLabel}</span>
                    <em>{line.packCount} packs · {line.totalUnits} units</em>
                    <strong>{formatSgd(line.lineTotalSgd)}</strong>
                  </div>
                ))}
                <dl>
                  <div><dt>Subtotal</dt><dd>{formatSgd(summary.subtotalSgd)}</dd></div>
                  <div><dt>Shipping</dt><dd>Included</dd></div>
                  <div><dt>Final total</dt><dd>{formatSgd(summary.totalSgd)}</dd></div>
                  <div><dt>Currency</dt><dd>SGD</dd></div>
                </dl>
                {error && <p className="form-error">{error}</p>}
                {!paypalClientId ? (
                  <p className="setup-warning">Add VITE_PAYPAL_CLIENT_ID in Vercel to enable PayPal Sandbox buttons.</p>
                ) : (
                  <div id="paypal-buttons" className="paypal-buttons" />
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
