import { randomUUID } from "node:crypto";
import { json, notifyTelegramNewInquiry, readBody, supabase } from "./_utils.js";
import { resolveMarket } from "./_markets.js";

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

async function notifyInquiryByEmail(inquiry) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.SUPPORT_FROM_EMAIL?.trim();
  const to = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || process.env.CUSTOMER_SERVICE_EMAIL?.trim() || "hondit.official@gmail.com";
  if (!apiKey || !from || !to) return { skipped: true };

  const adminBase = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "";
  const siteUrl = adminBase ? (adminBase.startsWith("http") ? adminBase : `https://${adminBase}`) : "";
  const lines = [
    `New enquiry: ${inquiry.reference_number}`,
    "",
    `Type: ${inquiry.inquiry_type}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Company: ${inquiry.company || "-"}`,
    `Order number: ${inquiry.order_number || "-"}`,
    "",
    inquiry.message,
    siteUrl ? `\nOpen admin inbox: ${siteUrl}/admin/inquiries` : "",
  ].filter(Boolean);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.email,
      subject: `[hondit enquiry] ${inquiry.inquiry_type} - ${inquiry.reference_number}`,
      text: lines.join("\n"),
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "Inquiry notification email failed");
  return { sent: true, providerId: data.id };
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
    const market = resolveMarket(payload);
    const language = cleanOptional(payload.language, 20) || "en";

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
        admin_note: `Market: ${market.code} / ${market.countryName} / ${market.currency}; Language: ${language}`,
        status: "new",
        created_at: now,
        updated_at: now,
      }),
    });

    const inquiry = saved[0];
    const notificationResults = await Promise.allSettled([
      notifyInquiryByEmail(inquiry),
      notifyTelegramNewInquiry(inquiry),
    ]);
    notificationResults.forEach((result) => {
      if (result.status === "rejected") console.error("Inquiry notification failed", result.reason);
    });

    return json(res, 201, { ok: true, referenceNumber, inquiry });
  } catch (error) {
    return json(res, 400, { error: error.message || "Contact request failed" });
  }
}
