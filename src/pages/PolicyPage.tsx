import { Link, useParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { EMAIL } from "../data/v23SiteData";
import { marketCountryName, useMarket } from "../lib/market";
import { NotFoundPage } from "./NotFoundPage";

const SHIPPING_NOTICE =
  "Bulk orders are usually delivered within 3-5 business days after dispatch. Weekends, public holidays, customs inspections and carrier delays may affect the delivery date. Tracking information will be provided after dispatch.";

type PolicySection = {
  heading: string;
  items: string[];
};

type PolicyContent = {
  title: string;
  intro: string;
  sections: PolicySection[];
};

function getPolicyContent(policy: string, countryName: string, currency: string, hasShopee: boolean): PolicyContent | null {
  const content: Record<string, PolicyContent> = {
    shipping: {
      title: "Shipping Policy",
      intro: `This policy explains how hondit prepares and ships bulk orders for the selected ${countryName} sales edition.`,
      sections: [
        {
          heading: "Bulk Order Delivery",
          items: [SHIPPING_NOTICE, `Bulk checkout prices are shown in ${currency} for the selected market.`],
        },
        {
          heading: "Retail Orders",
          items: [
            hasShopee
              ? "Retail purchases made through Shopee follow Shopee order tracking, delivery and support rules."
              : "This market does not offer Shopee retail checkout. Orders are handled through hondit bulk checkout only.",
          ],
        },
        {
          heading: "Address and Tracking",
          items: [
            "Customers are responsible for entering a complete delivery name, phone number, company name where relevant, shipping address and postal code.",
            "Tracking information will be sent after dispatch when it is available from the carrier.",
          ],
        },
        {
          heading: "Customs and Local Handling",
          items: ["Customs checks, public holidays, carrier handover and local delivery schedules can affect the final delivery date."],
        },
      ],
    },
    refund: {
      title: "Refund Policy",
      intro: "This policy applies to direct bulk orders paid through hondit's PayPal checkout. Shopee orders follow Shopee cancellation, return and refund procedures.",
      sections: [
        {
          heading: "Scope",
          items: [
            "This policy covers direct bulk orders placed on hondit and paid through PayPal.",
            "Shopee purchases must be managed through Shopee support and Shopee order pages.",
          ],
        },
        {
          heading: "Cancellation Before Dispatch",
          items: ["A cancellation request can be reviewed before dispatch. Contact hondit as soon as possible with the order number and payment email."],
        },
        {
          heading: "Damaged, Incorrect or Missing Items",
          items: [
            "Report damaged, incorrect or missing items within 7 days after receiving the parcel.",
            "Include the order number, order email, a clear description of the issue and photos that show the parcel and product condition.",
            "When hondit confirms that the issue is seller-side damage, incorrect shipment or missing items, hondit will arrange a suitable replacement, reshipment or refund route.",
          ],
        },
        {
          heading: "Change-of-Mind Returns",
          items: ["Change-of-mind returns after dispatch are generally not accepted because bulk orders are prepared for a specific shipment and market."],
        },
        {
          heading: "Refund Method and Timing",
          items: [
            "Approved refunds are processed through the original payment method and original payment currency.",
            "After a refund is approved, the payment provider may take 5-10 business days to reflect the refund.",
          ],
        },
        {
          heading: "Contact",
          items: [`Email ${EMAIL} with your order number, payment email and issue details.`],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      intro: "hondit collects only the information needed to process orders, payments, delivery, customer support and business enquiries.",
      sections: [
        {
          heading: "Information We Collect",
          items: [
            "Name, email address, phone or WhatsApp number, company name, shipping address, selected market, selected language, products, quantities, order amount, order number, payment references, enquiry messages and support replies.",
          ],
        },
        {
          heading: "How We Use Information",
          items: [
            "To create and confirm orders, verify PayPal payment records, prepare products for shipment, provide tracking information, respond to customer support, handle cancellation or refund requests and prevent duplicate or fraudulent order activity.",
          ],
        },
        {
          heading: "Service Providers",
          items: [
            "Information may be processed by payment services such as PayPal, delivery carriers such as EMS or local carriers, hosting services, database and authentication services, email services, support tools and analytics services such as Google Analytics where enabled.",
          ],
        },
        {
          heading: "International Processing",
          items: ["Because hondit handles cross-border orders, information may be processed in more than one country for payment, delivery, hosting and support purposes."],
        },
        {
          heading: "Data Retention",
          items: [
            "Order and enquiry information is kept only for as long as needed for operations, customer support, accounting, tax, refund or dispute handling.",
            "You may request access, correction or deletion of your personal information where applicable by contacting hondit.",
          ],
        },
        {
          heading: "Security",
          items: ["hondit uses reasonable technical and organisational measures to protect order information, but no internet transmission can be guaranteed to be completely secure."],
        },
        {
          heading: "Policy Updates",
          items: ["This policy may be updated as hondit's sales markets, payment services or operating tools change."],
        },
        {
          heading: "Contact",
          items: [`Privacy enquiries can be sent to ${EMAIL}.`],
        },
      ],
    },
    terms: {
      title: "Terms",
      intro: "These terms apply when you browse hondit or place a direct bulk order through hondit's checkout.",
      sections: [
        {
          heading: "About These Terms",
          items: ["By using hondit, you agree to use the site only for lawful product browsing, enquiries and orders."],
        },
        {
          heading: "Markets and Currency",
          items: [`The selected market controls the displayed delivery destination, currency and available order route. Bulk order prices for the current market are shown in ${currency}.`],
        },
        {
          heading: "Product Prices and MOQ",
          items: [
            "Product prices, minimum order quantities and quantity increments are shown on the product and bulk checkout pages.",
            "Do not rely on information that is not shown on the product page or policy pages as a confirmed product claim.",
          ],
        },
        {
          heading: "Order Confirmation",
          items: ["A direct bulk order is confirmed only after payment is completed and hondit can match the payment to the submitted order information."],
        },
        {
          heading: "Stock and Pricing Errors",
          items: ["If stock is unavailable, the price is incorrect or payment cannot be matched to the order, hondit may cancel the order and arrange an appropriate refund route."],
        },
        {
          heading: "Shipping and Delivery",
          items: [SHIPPING_NOTICE, "Customers must provide accurate email, phone number, company name where relevant and shipping address."],
        },
        {
          heading: "Customs and Taxes",
          items: ["Any customs duties, import taxes or local charges are handled according to the rules of the selected market and delivery destination."],
        },
        {
          heading: "Product Variations",
          items: ["Natural volcanic-stone products may vary slightly in colour, shape, texture and size. Screen colours may also differ from the physical product."],
        },
        {
          heading: "Cancellation and Refunds",
          items: ["Cancellation and refund handling follows the Refund Policy."],
        },
        {
          heading: "Limitation and Uncontrollable Events",
          items: [
            "hondit is not responsible for delays or failures caused by events outside reasonable control, including customs delays, carrier delays, public holidays, severe weather, payment provider outages or incorrect customer information.",
          ],
        },
        {
          heading: "Contact",
          items: [`Questions about these terms can be sent to ${EMAIL}.`],
        },
        {
          heading: "Effective Date",
          items: ["Effective date: 2026-08-11."],
        },
      ],
    },
  };

  content["shipping-policy"] = content.shipping;
  content["refund-policy"] = content.refund;
  content["privacy-policy"] = content.privacy;
  content["terms-of-service"] = content.terms;
  return content[policy] || null;
}

export function PolicyPage() {
  const { market } = useMarket();
  const { policy = "terms" } = useParams();
  const countryName = marketCountryName(market, "en");
  const content = getPolicyContent(policy, countryName, market.currency, market.hasShopee);

  if (!content) return <NotFoundPage />;

  return (
    <V23Page>
      <main className="v23-policy-page">
        <article className="v23-policy-shell">
          <p className="v23-eyebrow">
            <span /> HONDIT POLICY
          </p>
          <h1>{content.title}</h1>
          <p className="v23-policy-intro">{content.intro}</p>
          {content.sections.map((section) => (
            <section className="v23-policy-section" key={section.heading}>
              <h2>{section.heading}</h2>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
          <div className="v23-policy-actions">
            <Link to="/bulk-orders">Return to Bulk Orders</Link>
            <Link to="/contact">Contact hondit</Link>
          </div>
        </article>
      </main>
    </V23Page>
  );
}
