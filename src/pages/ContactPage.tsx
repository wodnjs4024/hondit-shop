import { FormEvent, useState } from "react";
import { FAQAccordion } from "../components/FAQAccordion";
import { links } from "../data/siteData";
import { trackEvent } from "../lib/analytics";
import { Footer } from "../sections/Footer";

const inquiryTypes = ["General", "Payment issue", "Shipping / address issue", "Bulk inquiry", "Product question"];

const helpCards = [
  ["Payment Issue", "Questions about payments, charges or failed transactions."],
  ["Shipping / Address Issue", "Delivery status, shipping times or address changes."],
  ["Bulk Inquiry", "Interested in bulk orders or corporate gifting?"],
  ["Product Question", "Ingredients, usage or product recommendations."],
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    trackEvent("submit_inquiry", { inquiry_channel: "contact_page_preview" });
  };

  return (
    <>
      <main className="editorial-page contact-page-v2">
        <section className="editorial-hero editorial-hero--contact">
          <div className="editorial-hero__copy">
            <p className="eyebrow">CONTACT</p>
            <h1>Contact</h1>
            <p>We are here to help. Whether you have a product question, need support with an order, or are interested in partnering with us.</p>
            <strong>We typically respond within 1-2 business days.</strong>
          </div>
        </section>

        <section className="editorial-section">
          <div className="editorial-container contact-grid">
            <form className="contact-form contact-form-v2" onSubmit={submit}>
              <h2>Send us a message</h2>
              <div className="form-two">
                <label>Name *<input name="name" required placeholder="Your name" /></label>
                <label>Email *<input name="email" type="email" required placeholder="you@example.com" /></label>
              </div>
              <div className="form-two">
                <label>Company (optional)<input name="company" placeholder="Your company" /></label>
                <label>Order Number (optional)<input name="orderNumber" placeholder="#12345" /></label>
              </div>
              <label>Inquiry Type *
                <select name="type">
                  {inquiryTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label>Message *<textarea name="message" required placeholder="How can we help you?" /></label>
              <input className="contact-form__trap" name="website" tabIndex={-1} autoComplete="off" />
              <button className="button button--dark" type="submit">Send Message</button>
              <p className="contact-safe">Your information is safe with us and will only be used to respond to your inquiry.</p>
              {submitted && <p className="setup-warning">Thank you. For the fastest reply, you can also contact us by email, Instagram or Shopee Chat.</p>}
            </form>

            <aside className="quick-help">
              <h2>Quick help</h2>
              <div>
                {helpCards.map(([title, body]) => (
                  <a href="#contact-links" key={title}>
                    <span aria-hidden="true" />
                    <h3>{title}</h3>
                    <p>{body}</p>
                    <strong>Get help</strong>
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="editorial-container contact-lower" id="contact-links">
          <article>
            <h2>Frequently asked questions</h2>
            <FAQAccordion />
          </article>
          <article className="contact-methods">
            <h2>Other ways to reach us</h2>
            <p><strong>Email</strong><a href="mailto:hondit.official@gmail.com">hondit.official@gmail.com</a></p>
            <p><strong>Instagram</strong><a href={links.instagram}>@hondit.office</a></p>
            <p><strong>Shopee Chat</strong><a href={links.shopeeStore}>hondit Shopee SG</a></p>
            <p><strong>Location</strong>Jeju Island, Republic of Korea</p>
            <img src="/images/hondit-diffuser-detail.png" alt="hondit volcanic stone diffuser and fragrance oil arranged with Jeju volcanic stones." loading="lazy" decoding="async" />
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
