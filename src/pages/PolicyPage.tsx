import { Link, useParams } from "react-router-dom";
import { Footer } from "../sections/Footer";

type PolicyContent = {
  eyebrow: string;
  title: string;
  summary: string;
  body: string[];
  note: string;
};

const policyContent: Record<string, PolicyContent> = {
  shipping: {
    eyebrow: "DELIVERY GUIDE",
    title: "Shipping guide",
    summary: "Two clear delivery routes: Shopee retail orders and direct bulk checkout for Singapore.",
    body: [
      "Retail purchases are completed on Shopee Singapore. Shopee orders usually follow a 5-10 day delivery window and are tracked inside Shopee.",
      "Bulk orders are currently prepared for Singapore delivery. Listed bulk prices include Singapore EMS shipping.",
      "Bulk orders are dispatched for delivery within 3-5 days after payment verification, unless hondit contacts the customer about address or stock confirmation.",
      "For direct checkout, order details are confirmed after PayPal payment is captured and the internal order total matches the PayPal payment record.",
    ],
    note: "Shipping details may be updated as carrier schedules and operating conditions change.",
  },
  refund: {
    eyebrow: "REFUND SUPPORT",
    title: "Refund and cancellation",
    summary: "Refunds are handled carefully because retail and direct bulk orders use different payment routes.",
    body: [
      "Shopee retail orders follow Shopee Singapore's cancellation, return and refund process.",
      "Direct bulk checkout orders can be cancelled before dispatch if the order is still pending, failed, cancelled or not yet prepared.",
      "When a PayPal payment has been completed, an approved refund must be issued through PayPal first and then marked in the hondit admin order record.",
      "Please contact hondit with your order number, payment email and reason for cancellation or refund before the parcel is dispatched.",
    ],
    note: "PayPal refunds are not manual bank transfers. If PayPal captured the payment, refund action should happen through PayPal where available.",
  },
  privacy: {
    eyebrow: "PRIVACY",
    title: "Privacy policy",
    summary: "hondit only collects the information needed to answer inquiries, process bulk orders and support delivery.",
    body: [
      "Checkout information may include name, email, phone number, company name, shipping address, postal code, order quantity, payment references and order notes.",
      "Inquiry information may include name, email, inquiry type, order number, company name and message content.",
      "Payment card details are handled by PayPal. hondit does not store card numbers or PayPal passwords.",
      "Order and inquiry records are kept for customer support, fulfillment, fraud prevention and operating records. Admin access is protected.",
    ],
    note: "For privacy questions, contact hondit through the official contact form, Instagram or Shopee Chat.",
  },
  terms: {
    eyebrow: "TERMS",
    title: "Terms of use",
    summary: "These terms explain how hondit presents retail Shopee purchasing and direct bulk checkout.",
    body: [
      "Prices are displayed in SGD. Retail prices shown on hondit are for guidance and may be updated by Shopee vouchers, promotions and live store settings.",
      "Bulk order prices include Singapore EMS shipping and follow the listed MOQ and quantity step for each product.",
      "Retail purchases are completed through Shopee Singapore. Bulk purchases are completed through PayPal checkout on this site.",
      "A direct bulk order is confirmed only when PayPal capture is completed and the captured amount and currency match the internal order record.",
    ],
    note: "hondit is a student-led commerce project based at Jeju National University. University location does not imply product endorsement.",
  },
};

const aliases: Record<string, keyof typeof policyContent> = {
  "shipping-policy": "shipping",
  "refund-policy": "refund",
};

const policyLinks = [
  ["shipping", "Shipping"],
  ["refund", "Refund"],
  ["privacy", "Privacy"],
  ["terms", "Terms"],
] as const;

export function PolicyPage() {
  const { policy = "terms" } = useParams();
  const key = aliases[policy] || policy;
  const content = policyContent[key] || policyContent.terms;

  return (
    <>
      <main className="approved-policy-page">
        <section className="approved-policy-hero approved-shell">
          <p className="approved-kicker">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.summary}</p>
        </section>

        <section className="approved-policy-grid approved-shell">
          <aside className="approved-policy-nav" aria-label="Policy pages">
            <p>Trust & support</p>
            {policyLinks.map(([slug, label]) => (
              <Link className={slug === key ? "is-active" : ""} key={slug} to={`/${slug}`}>
                {label}
              </Link>
            ))}
          </aside>

          <article className="approved-policy-card">
            <div className="approved-policy-card__head">
              <span>{content.eyebrow}</span>
              <Link to="/contact">Contact hondit -&gt;</Link>
            </div>
            <ol>
              {content.body.map((paragraph) => (
                <li key={paragraph}>{paragraph}</li>
              ))}
            </ol>
            <div className="approved-policy-note">
              <strong>Operator note</strong>
              <p>{content.note}</p>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
