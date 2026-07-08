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
              Tell us what you need. This first version prepares the inquiry flow; email delivery and database storage will be connected in the backend step.
            </p>
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
              {submitted && <p className="setup-warning">Inquiry noted on this screen. Backend email/database connection will be added in the next phase.</p>}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
