import { getProducts, json, readBody, supabase, toDbProduct, verifyAdmin } from "../_utils.js";

export default async function handler(req, res) {
  try {
    await verifyAdmin(req);

    if (req.method === "GET") {
      const products = await getProducts({ includeInactive: true });
      return json(res, 200, { products });
    }

    if (req.method === "PATCH") {
      const { products = [] } = await readBody(req);
      const rows = products.map(toDbProduct);
      const saved = await supabase("/products?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(rows),
      });
      return json(res, 200, { products: saved });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 401, { error: error.message || "Admin access failed" });
  }
}
