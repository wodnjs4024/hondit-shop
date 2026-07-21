import { ChangeEvent, FormEvent, useState } from "react";
import { FAQAccordion } from "../components/FAQAccordion";
import { honditImages, links } from "../data/siteData";
import { trackEvent } from "../lib/analytics";
import { Footer } from "../sections/Footer";

const inquiryTypes = ["General", "Payment issue", "Shipping / address issue", "Bulk inquiry", "Product question"];

const helpCards = [
  ["Payment issue", "Failed payment, duplicate charge or PayPal checkout question."],
  ["Shipping / address", "Delivery timing, address correction or tracking request."],
  ["Bulk inquiry", "MOQ, business purchase, reseller or group order question."],
  ["Product question", "Product usage, category choice or Shopee listing question."],
];

type ContactFormState = {
  name: string;
  email: string;
  company: string;
  orderNumber: string;
  type: string;
  message: string;
  website: string;
};

const initialForm: ContactFormState = {
  name: "",
  email: "",
  company: "",
  orderNumber: "",
  type: inquiryTypes[0],
  message: "",
  website: "",
};

export function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [referenceNumber, setReferenceNumber] = useState("");

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "Could not send inquiry");
      }

      setStatus("sent");
      setReferenceNumber(payload.referenceNumber || "");
      setForm(initialForm);
      trackEvent("submit_inquiry", {
        inquiry_channel: "contact_page",
        inquiry_type: form.type,
      });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <>
      <main className="approved-contact-page">
        <section className="approved-contact-hero approved-shell">
          <div>
            <p className="approved-kicker">CONTACT HONDIT</p>
            <h1>We will help you choose, order and receive clearly.</h1>
            <p>
              Send a product, payment, shipping or bulk order question. hondit is run from Jeju and prepared for
              Singapore customers, so a clear message helps us respond faster.
            </p>
            <div className="approved-contact-meta">
              <span>Usually replies within 1-2 business days</span>
              <span>English support</span>
              <span>Order number optional</span>
            </div>
          </div>
          <figure>
            <img
              src={honditImages.diffuserPair}
              alt="hondit volcanic diffuser arranged with Jeju volcanic stones."
              loading="eager"
              decoding="async"
            />
          </figure>
        </section>

        <section className="approved-contact-section approved-shell">
          <form className="approved-contact-form" onSubmit={submit}>
            <p className="approved-kicker">SEND A MESSAGE</p>
            <h2>Tell us what you need.</h2>
            <div className="approved-form-grid">
              <label>
                Name *
                <input name="name" value={form.name} onChange={updateField} required placeholder="Your name" />
              </label>
              <label>
                Email *
                <input name="email" value={form.email} onChange={updateField} type="email" required placeholder="you@example.com" />
              </label>
              <label>
                Company
                <input name="company" value={form.company} onChange={updateField} placeholder="Optional" />
              </label>
              <label>
                Order number
                <input name="orderNumber" value={form.orderNumber} onChange={updateField} placeholder="HD-..." />
              </label>
            </div>
            <label>
              Inquiry type *
              <select name="type" value={form.type} onChange={updateField}>
                {inquiryTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              Message *
              <textarea
                name="message"
                value={form.message}
                onChange={updateField}
                required
                placeholder="Please include product name, quantity, payment issue or shipping question."
              />
            </label>
            <input
              className="contact-form__trap"
              name="website"
              value={form.website}
              onChange={updateField}
              tabIndex={-1}
              autoComplete="off"
            />
            <button className="approved-button approved-button--dark" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
            {status === "sent" && (
              <p className="approved-contact-notice approved-contact-notice--success">
                Message received{referenceNumber ? ` (${referenceNumber})` : ""}. You can also reach us through Shopee Chat for retail order questions.
              </p>
            )}
            {status === "error" && (
              <p className="approved-contact-notice approved-contact-notice--error">
                We could not send the message. Please email hondit directly or try again.
              </p>
            )}
          </form>

          <aside className="approved-contact-side" id="contact-links">
            <p className="approved-kicker">QUICK HELP</p>
            <h2>Choose the closest route.</h2>
            <div className="approved-help-list">
              {helpCards.map(([title, body]) => (
                <article key={title}>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <div className="approved-contact-methods">
              <a href="mailto:hondit.official@gmail.com">hondit.official@gmail.com</a>
              <a href={links.instagram}>Instagram</a>
              <a href={links.shopeeStore}>Shopee Singapore Chat</a>
            </div>
          </aside>
        </section>

        <section className="approved-contact-lower approved-shell">
          <article>
            <p className="approved-kicker">FAQ</p>
            <h2>Frequently asked questions</h2>
            <FAQAccordion />
          </article>
          <article>
            <p className="approved-kicker">DIRECT ROUTES</p>
            <h2>Other ways to reach us</h2>
            <dl>
              <div><dt>Email</dt><dd><a href="mailto:hondit.official@gmail.com">hondit.official@gmail.com</a></dd></div>
              <div><dt>Instagram</dt><dd><a href={links.instagram}>@hondit.office</a></dd></div>
              <div><dt>Shopee Chat</dt><dd><a href={links.shopeeStore}>hondit Shopee SG</a></dd></div>
              <div><dt>Location</dt><dd>Jeju Island, Republic of Korea</dd></div>
            </dl>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
