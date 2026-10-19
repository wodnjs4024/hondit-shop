import partnerGuide from "./_partner-guide.js";
import pickupInfo from './_pickup.js';
import { googleFeed, sitemap } from "./_feeds.js";
import { applyProductSnapshot, getProducts, getStorefrontProducts, json, previewWritesBlocked, supabase, verifyAdmin } from "./_utils.js";

/* Admin-only: the product as it would look if the current draft were published. */
async function draftPreview(req, res, slug) {
  try {
    await verifyAdmin(req);
  } catch {
    return json(res, 401, { error: "Admin login required for preview" });
  }
  const all = await getProducts({ includeInactive: true });
  const product = all.find((item) => item.slug === slug);
  if (!product) return json(res, 404, { error: "Product not found" });
  const drafts = await supabase(`/product_revisions?product_id=eq.${encodeURIComponent(product.id)}&state=eq.draft&select=snapshot&limit=1`).catch(() => []);
  const preview = applyProductSnapshot(product, drafts[0]?.snapshot || {});
  return json(res, 200, { products: [{ ...preview, status: "published", active: true }], preview: true, hasDraft: Boolean(drafts[0]) });
}

export default async function handler(req, res) {
  // Reuse the existing function so unknown QR links need no extra deployment slot.
  if(req.query?.qrNotFound !== undefined) {
    res.setHeader('Cache-Control','no-store');
    return json(res,404,{error:'QR link not registered',home:'/'});
  }
  if(req.query?.pickupInfo !== undefined) return pickupInfo(req,res);
  // Google Merchant Center feed (/feeds/google/:market) and sitemap.xml, both from the live catalog.
  if (req.method === "GET" && (req.query?.feed === "google" || req.query?.sitemap !== undefined)) {
    try {
      const products = await getStorefrontProducts();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=3600");
      res.statusCode = 200;
      return res.end(req.query?.feed === "google" ? googleFeed(products, String(req.query.market || "SG").toUpperCase()) : sitemap(products));
    } catch (error) {
      return json(res, 500, { error: "Could not build feed" });
    }
  }
  if (req.query?.partnerSlug !== undefined) return partnerGuide({...req,query:{slug:req.query.partnerSlug}},res);
  if (previewWritesBlocked(req.method)) { res.status(403).json({ error: "Read-only preview: payments and data changes are disabled." }); return; }
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const previewSlug = req.query?.preview ? String(req.query.preview) : "";
    if (previewSlug) return draftPreview(req, res, previewSlug);
    const products = await getStorefrontProducts();
    const slug = req.query?.slug ? String(req.query.slug) : "";
    const filtered = slug ? products.filter((product) => product.slug === slug) : products;
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=60");
    return json(res, 200, { products: filtered });
  } catch (error) {
    return json(res, 500, { error: error.message || "Could not load products" });
  }
}
