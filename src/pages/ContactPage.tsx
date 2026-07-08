import { FormEvent, useState } from "react";
import { Footer } from "../sections/Footer";
import { trackEvent } from "../lib/analytics";

const inquiryTypes = ["General", "Bulk quote", "Custom quantity"];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    trackEvent("submit_inquiry", { inquiry_channel: "contact_page_preview" });
  };

  return (
    <>
      <main className="contact-page">
        <section className="contact-hero section-shell">
          <div className="section-inner section-inner--narrow">
            <p className="eyebrow">CONTACT HONDIt</p>
            <h1>Need a custom quantity or a bulk quote?</h1>
            <p>
              Tell us what you need. You can also reach us through Instagram or Shopee Chat for product questions and custom quantities.
            </p>
            <div className="contact-direct-links">
              <a href="mailto:hondit.official@gmail.com">hondit.official@gmail.com</a>
              <a href="https://www.instagram.com/hondit.office/">Instagram</a>
              <a href="https://shopee.sg/hondit.office.sg">Shopee Chat</a>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="section-inner section-inner--narrow">
            <form className="contact-form" onSubmit={submit}>
              <label>Name<input name="name" required /></label>
              <label>Email<input name="email" type="email" required /></label>
              <label>Inquiry type
                <select name="type">
                  {inquiryTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label>Desired quantity<input name="quantity" inputMode="numeric" placeholder="e.g. 50 units" /></label>
              <label className="contact-form__wide">Message<textarea name="message" required placeholder="Product, quantity, delivery timeline or question." /></label>
              <input className="contact-form__trap" name="website" tabIndex={-1} autoComplete="off" />
              <button className="button button--primary" type="submit">Request a quote</button>
              {submitted && <p className="setup-warning">Thank you. Please also contact us through email, Instagram or Shopee Chat for the fastest reply.</p>}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
