import { json, readBody, supabase } from "../_utils.js";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function maskEmail(email) {
  const [name = "", domain = ""] = String(email || "").split("@");
  if (!name || !domain) return "";
  return `${name.slice(0, 2)}***@${domain}`;
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const productSlug = clean(req.query?.productSlug, 80);
      const params = ["status=eq.approved", "select=id,product_slug,product_name_snapshot,display_name,rating,title,body,submitted_at", "order=submitted_at.desc", "limit=50"];
      if (productSlug) params.push(`product_slug=eq.${encodeURIComponent(productSlug)}`);
      const reviews = await supabase(`/reviews?${params.join("&")}`);
      return json(res, 200, { reviews });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const orderNumber = clean(body.orderNumber, 80);
      const email = clean(body.customerEmail, 180).toLowerCase();
      const productSlug = clean(body.productSlug, 80);
      const rating = Number(body.rating);
      const reviewBody = clean(body.body, 1200);
      const displayName = clean(body.displayName, 60) || maskEmail(email);
      const title = clean(body.title, 120) || null;

      if (!orderNumber || !email || !productSlug || !reviewBody || rating < 1 || rating > 5) {
        return json(res, 400, { error: "Please complete order number, email, product, rating and review." });
      }

      const orders = await supabase(`/orders?order_number=eq.${encodeURIComponent(orderNumber)}&customer_email=eq.${encodeURIComponent(email)}&select=*`);
      const order = orders[0];
      if (!order || order.payment_status !== "completed") {
        return json(res, 403, { error: "Only completed hondit orders can submit a review." });
      }

      const items = await supabase(`/order_items?order_id=eq.${encodeURIComponent(order.id)}&product_slug=eq.${encodeURIComponent(productSlug)}&select=*`);
      const item = items[0];
      if (!item) return json(res, 403, { error: "This product was not found in the verified order." });

      const existing = await supabase(`/reviews?order_number=eq.${encodeURIComponent(orderNumber)}&product_slug=eq.${encodeURIComponent(productSlug)}&customer_email=eq.${encodeURIComponent(email)}&status=neq.deleted&select=id`);
      if (existing.length) return json(res, 409, { error: "A review for this product and order already exists." });

      const created = await supabase("/reviews", {
        method: "POST",
        body: JSON.stringify({
          order_id: order.id,
          product_id: item.product_id,
          product_slug: productSlug,
          product_name_snapshot: item.product_name_snapshot,
          order_number: orderNumber,
          customer_email: email,
          display_name: displayName,
          rating,
          title,
          body: reviewBody,
          status: "pending",
        }),
      });

      return json(res, 201, { review: created[0], message: "Review submitted. It will appear after admin approval." });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 400, { error: error.message || "Review request failed" });
  }
}
