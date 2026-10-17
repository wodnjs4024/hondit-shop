import partnerGuide from "./_partner-guide.js";
import pickupInfo from './_pickup.js';
import { getProducts, json } from "./_utils.js";

export default async function handler(req, res) {
  // Reuse the existing function so unknown QR links need no extra deployment slot.
  if(req.query?.qrNotFound !== undefined) {
    res.setHeader('Cache-Control','no-store');
    return json(res,404,{error:'QR link not registered',home:'/'});
  }
  if(req.query?.pickupInfo !== undefined) return pickupInfo(req,res);
  if (req.query?.partnerSlug !== undefined) return partnerGuide({...req,query:{slug:req.query.partnerSlug}},res);
  if (process.env.VERCEL_ENV === "preview" && !["GET", "HEAD", "OPTIONS"].includes(req.method)) { res.status(403).json({ error: "Read-only preview: payments and data changes are disabled." }); return; }
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const products = await getProducts();
    const slug = req.query?.slug ? String(req.query.slug) : "";
    const filtered = slug ? products.filter((product) => product.slug === slug) : products;
    return json(res, 200, { products: filtered });
  } catch (error) {
    return json(res, 500, { error: error.message || "Could not load products" });
  }
}
