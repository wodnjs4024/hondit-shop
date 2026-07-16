import { Link, useParams } from "react-router-dom";
import { Footer } from "../sections/Footer";

const policyContent: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping Policy",
    body: [
      "Bulk orders are currently available for delivery within Singapore only.",
      "Listed bulk order prices include Singapore EMS shipping. Bulk orders are dispatched for delivery within 3-5 days after payment verification.",
      "Retail purchases are completed on Shopee Singapore and usually follow a 5-10 day delivery window under Shopee order tracking and delivery rules.",
    ],
  },
  refund: {
    title: "Refund Policy",
    body: [
      "Please review product, pack quantity and shipping details before payment.",
      "Refund requests are reviewed manually. PayPal refunds, when approved, are processed through PayPal and then reflected in the hondit admin order record.",
      "For refund, exchange or dispute questions, contact hondit with your order number and payment email.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "Checkout information is used to process bulk orders, PayPal payment records and Singapore delivery.",
      "Customer order data is not shown publicly. Admin access is protected through Supabase Auth.",
      "Collected data may include name, email, phone, address, order details, inquiry messages and payment references. PayPal and delivery partners may receive the information needed to complete payment and fulfillment.",
      "For privacy questions, contact hondit through the official email, Instagram or Shopee Chat.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "Bulk order prices are listed in SGD and include Singapore EMS shipping.",
      "Orders are confirmed only after PayPal payment has been captured and verified.",
      "Retail purchases are completed through Shopee Singapore. Bulk purchases are completed through PayPal checkout on this site.",
      "Bulk orders are prepared for Singapore delivery after payment verification.",
    ],
  },
};

policyContent["shipping-policy"] = policyContent.shipping;
policyContent["refund-policy"] = policyContent.refund;

export function PolicyPage() {
  const { policy = "terms" } = useParams();
  const content = policyContent[policy] || policyContent.terms;

  return (
    <>
      <main className="bulk-page">
        <section className="policy-page section-shell">
          <div className="section-inner section-inner--narrow">
            <p className="eyebrow">HONDIT</p>
            <h1>{content.title}</h1>
            {content.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <Link className="button button--primary" to="/bulk-orders">Return to Bulk Orders</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
