import { randomUUID } from "node:crypto";
import { json, readBody, supabase } from "./_utils.js";

const inquiryTypes = new Set(["General", "Product question", "Order support", "Bulk order", "Partnership"]);

function cleanRequired(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function cleanOptional(value, maxLength) {
  const cleaned = cleanRequired(value, maxLength);
  return cleaned || null;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function createReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HON-Q-${date}-${random}`;
}

function normalizeInquiryType(value) {
  const raw = cleanRequired(value, 60);
  const aliases = {
    "Payment issue": "Order support",
    "Shipping or address issue": "Order support",
    "Bulk inquiry": "Bulk order",
  };
  return aliases[raw] || raw;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const payload = await readBody(req);
    if (cleanOptional(payload.website, 200)) {
      return json(res, 200, { ok: true, referenceNumber: "HON-SPAM-FILTERED" });
    }

    const name = cleanRequired(payload.name, 100);
    const email = cleanRequired(payload.email, 254).toLowerCase();
    const company = cleanOptional(payload.company, 120);
    const orderNumber = cleanOptional(payload.orderNumber, 80);
    const inquiryType = normalizeInquiryType(payload.inquiryType || payload.type);
    const message = cleanRequired(payload.message, 4000);

    if (!name || !isEmail(email) || !inquiryTypes.has(inquiryType) || message.length < 10) {
      return json(res, 422, { error: "Complete your name, email, enquiry type and a message of at least 10 characters." });
    }

    const now = new Date().toISOString();
    const referenceNumber = createReference();
    const saved = await supabase("/inquiries", {
      method: "POST",
      body: JSON.stringify({
        id: randomUUID(),
        reference_number: referenceNumber,
        name,
        email,
        company,
        order_number: orderNumber,
        inquiry_type: inquiryType,
        message,
        status: "new",
        created_at: now,
        updated_at: now,
      }),
    });

    return json(res, 201, { ok: true, referenceNumber, inquiry: saved[0] });
  } catch (error) {
    return json(res, 400, { error: error.message || "Contact request failed" });
  }
}
