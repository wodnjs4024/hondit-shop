import partnerGuide from "./_partner-guide.js";
import pickupInfo from './_pickup.js';
import { googleFeed, sitemap } from "./_feeds.js";
import { merchantMarket, merchantOffer, merchantHtml } from "./_merchant.js";
import { journalRoute, journalArticlesForSitemap } from "./_journal-route.js";
import { applyProductSnapshot, getProducts, getStorefrontProducts, getPayPalMode, json, previewWritesBlocked, requireEnv, supabase, verifyAdmin } from "./_utils.js";

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
  // Read-only merchant routes: same product rows/terms, never static fallback inventory.
  if (req.query?.feed === "google" || req.query?.merchantSlug !== undefined) {
    res.setHeader("Cache-Control", "no-store");
    if (!["GET", "HEAD"].includes(req.method)) { res.setHeader("Allow", "GET, HEAD"); return json(res,405,{error:"Method not allowed"}); }
    if (["market", "lang", "quantity"].some(key => req.query[key] !== undefined && typeof req.query[key] !== "string")) return json(res,400,{error:"Invalid merchant parameters"});
    const market = typeof req.query.market === "string" ? req.query.market.toUpperCase() : "SG";
    const language = typeof req.query.lang === "string" ? req.query.lang : undefined;
    if (!merchantMarket(market, language)) return json(res,404,{error:"Merchant market/language not enabled"});
    try {
      requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
      if (process.env.VERCEL_ENV === "preview") return json(res,503,{error:"Merchant offers disabled in read-only Preview"});
      if (process.env.VERCEL_ENV === "production") {
        requireEnv(["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"]);
        if (getPayPalMode() !== "live") return json(res,503,{error:"Live checkout unavailable"});
      }
      const settings = await supabase("/site_settings?id=eq.1&select=checkout_enabled");
      if (settings?.[0]?.checkout_enabled === false) return json(res,503,{error:"Direct checkout temporarily unavailable"});
      const products = await getStorefrontProducts();
      res.setHeader("Cache-Control", "no-store");
      if (req.query?.feed === "google") {
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.statusCode = 200;
        return res.end(req.method === "HEAD" ? "" : googleFeed(products,market,language));
      }
      const product = products.find(p => p.slug === req.query.merchantSlug);
      const result = merchantOffer(product,market,language,req.query.quantity);
      if (!result.item) return json(res,404,{error:"Merchant offer unavailable"});
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'; img-src https:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
      return res.end(req.method === "HEAD" ? "" : merchantHtml(result.item));
    } catch {
      res.setHeader("Cache-Control", "no-store");
      return json(res,503,{error:"Live merchant catalog unavailable"});
    }
  }
  // HONDIT Journal: server-rendered pages, public JSON and the scheduled publisher (same function, no new slot).
  if (req.query?.journalPage !== undefined || req.query?.journalApi !== undefined || req.query?.journalCron !== undefined) return journalRoute(req, res);
  if (["GET", "HEAD"].includes(req.method) && req.query?.sitemap !== undefined) {
    try {
      const products = await getStorefrontProducts();
      const journal = await journalArticlesForSitemap();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=3600");
      res.statusCode = 200;
      return res.end(req.method === "HEAD" ? "" : sitemap(products, undefined, journal));
    } catch { return json(res,503,{error:"Could not build sitemap"}); }
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
