import { getProducts, json } from "./_utils.js";

export default async function handler(req, res) {
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
