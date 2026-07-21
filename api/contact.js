import { json, readBody, supabase } from "./_utils.js";

function clean(value) {
  return String(value || "").trim();
}

function makeReferenceNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HI-${date}-${suffix}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  const body = await readBody(req);
  const referenceNumber = makeReferenceNumber();
  const honeypot = clean(body.website);

  if (honeypot) {
    return json(res, 200, { ok: true, referenceNumber });
  }

  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const type = clean(body.type) || "General";
  const company = clean(body.company);
  const orderNumber = clean(body.orderNumber);
  const message = clean(body.message);

  if (!name || !email || !message) {
    return json(res, 400, { ok: false, error: "Name, email and message are required." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { ok: false, error: "A valid email is required." });
  }

  const storedMessage = [
    `Reference: ${referenceNumber}`,
    company ? `Company: ${company}` : "",
    orderNumber ? `Order number: ${orderNumber}` : "",
    message,
  ]
    .filter(Boolean)
    .join("\n\n");

  const record = {
    created_at: new Date().toISOString(),
    name,
    email,
    type,
    quantity: null,
    message: storedMessage,
    status: "new",
  };

  try {
    await supabase("/inquiries", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(record),
    });

    return json(res, 200, { ok: true, stored: true, referenceNumber });
  } catch (error) {
    console.error("Contact inquiry storage failed", error);
    return json(res, 202, {
      ok: true,
      stored: false,
      referenceNumber,
      warning: "Inquiry received but storage is not configured.",
    });
  }
}
