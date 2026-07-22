import { FormEvent, useState } from "react";
import { V23Page } from "../components/v23/SiteChrome";
import { EMAIL, INSTAGRAM, SHOPEE } from "../data/v23SiteData";
import { trackEvent } from "../lib/analytics";

const inquiryTypes = ["General", "Product question", "Order support", "Bulk order", "Partnership"];

export function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") || "")) return;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          company: form.get("company"),
          orderNumber: form.get("orderNumber"),
          inquiryType: form.get("inquiryType"),
          message: form.get("message"),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Message could not be saved.");
      setStatus("success");
      setMessage(data.referenceNumber ? `Your message has been saved. Reference: ${data.referenceNumber}` : "Your message has been saved. hondit will reply by email.");
      trackEvent("submit_inquiry", { inquiry_channel: "contact_page" });
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Message could not be sent. Please try again or email hondit.");
    }
  }

  return (
    <V23Page>
      <main className="v23-contact-page">
        <section className="v23-contact-hero">
          <div>
            <p className="v23-eyebrow"><span /> CONTACT HONDIT</p>
            <h1>A real inbox,<br />with a clear route for every question.</h1>
            <p>Send a message directly to the hondit admin inbox or choose the fastest external channel for an existing Shopee order.</p>
          </div>
          <img src="/images/jeju-field-university.webp" alt="Jeju National University Ara Campus." />
        </section>
        <section className="v23-contact-grid">
          <form onSubmit={submit}>
            <p className="v23-eyebrow"><span /> SEND A MESSAGE</p>
            <h2>Tell us what you need.</h2>
            <p>This form sends your enquiry to hondit's protected admin inbox.</p>
            <div className="v23-form-two">
              <label>Name *<input name="name" required placeholder="Your name" /></label>
              <label>Email *<input name="email" type="email" required placeholder="you@example.com" /></label>
            </div>
            <div className="v23-form-two">
              <label>Company<input name="company" placeholder="Optional" /></label>
              <label>Order number<input name="orderNumber" placeholder="Shopee or HON reference" /></label>
            </div>
            <label>Enquiry type *
              <select name="inquiryType" required>{inquiryTypes.map((type) => <option key={type}>{type}</option>)}</select>
            </label>
            <label>Message *<textarea name="message" required placeholder="Include the product, order reference or question so we can help quickly." /></label>
            <input className="v23-honeypot" name="website" tabIndex={-1} autoComplete="off" />
            <button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending..." : "Send to hondit"}</button>
            {message && <p className={`v23-form-status is-${status}`}>{message}</p>}
          </form>
          <aside>
            <p className="v23-eyebrow is-light"><span /> QUICK ROUTES</p>
            <h2>Use the right channel.</h2>
            <a href={SHOPEE} target="_blank" rel="noreferrer"><small>EXISTING SHOPEE ORDER</small><b>Shopee Chat</b><span>Payment, voucher, delivery tracking or address changes for Shopee orders. ↗</span></a>
            <a href={INSTAGRAM} target="_blank" rel="noreferrer"><small>PRODUCT AND SOCIAL</small><b>Instagram</b><span>Short product questions, social content and informal collaborations. ↗</span></a>
            <a href={`mailto:${EMAIL}`}><small>FORMAL DOCUMENTS</small><b>Email</b><span>Attachments and formal records can still be sent by email.</span></a>
            <a href="/bulk-orders"><small>DIRECT BULK ORDER</small><b>PayPal checkout</b><span>Choose an MOQ quantity and create a tracked order. →</span></a>
          </aside>
        </section>
      </main>
    </V23Page>
  );
}
