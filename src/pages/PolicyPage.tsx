import { Link, useParams } from "react-router-dom";

const policyContent: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping Policy",
    body: [
      "Bulk orders are currently available for delivery within Singapore only.",
      "Listed bulk order prices include Singapore EMS shipping. Delivery timing may vary depending on order date, customs handling and logistics conditions.",
      "Retail purchases are completed on Shopee Singapore and follow Shopee order tracking and delivery rules. Operator to confirm exact delivery estimates before launch.",
    ],
  },
  refund: {
    title: "Refund Policy",
    body: [
      "Please review product, pack quantity and shipping details before payment.",
      "Refund requests are reviewed manually. PayPal refunds, when approved, are processed through PayPal admin tools and reflected in the order record.",
      "Placeholder legal note: final refund, exchange, dispute and return windows should be reviewed before live sales.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "Checkout information is used to process bulk orders, PayPal payment records and Singapore delivery.",
      "Customer order data is not shown publicly. Admin access is protected through Supabase Auth.",
      "Collected data may include name, email, phone, address, order details, inquiry messages and payment references. PayPal and delivery partners may receive the information needed to complete payment and fulfillment.",
      "Placeholder legal note: retention period and operator contact details should be confirmed before live sales.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "Bulk order prices are listed in SGD and include Singapore EMS shipping.",
      "Orders are confirmed only after PayPal payment has been captured and verified.",
      "Retail purchases are completed through Shopee Singapore. Bulk purchases are completed through PayPal checkout on this site.",
      "Placeholder legal note: final business terms should be reviewed before live sales.",
    ],
  },
};

policyContent["shipping-policy"] = policyContent.shipping;
policyContent["refund-policy"] = policyContent.refund;

export function PolicyPage() {
  const { policy = "terms" } = useParams();
  const content = policyContent[policy] || policyContent.terms;

  return (
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
  );
}
