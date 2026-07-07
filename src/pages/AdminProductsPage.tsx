import { FormEvent, useEffect, useState } from "react";
import { formatSgd, type BulkProduct } from "../data/bulkProducts";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";

export function AdminProductsPage() {
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  const load = () => {
    adminFetch<{ products: BulkProduct[] }>("/api/admin/products").then((data) => setProducts(data.products)).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const update = (slug: string, key: keyof BulkProduct, value: string | number | boolean) => {
    setProducts((current) => current.map((product) => (product.slug === slug ? { ...product, [key]: value } : product)));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving("Saving product settings...");
    await adminFetch("/api/admin/products", {
      method: "PATCH",
      body: JSON.stringify({ products }),
    });
    setSaving("Saved.");
    load();
  };

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">PRODUCTS</p>
        <h1>Products, prices and inventory</h1>
      </div>
      <form className="admin-panel admin-product-list" onSubmit={submit}>
        {products.map((product) => {
          const expected = Number((product.unitPriceSgd * product.packQuantity).toFixed(2));
          const mismatch = expected !== product.packPriceSgd;
          return (
            <article className="admin-product-row" key={product.slug}>
              <img src={product.imageUrl} alt={product.name} />
              <div>
                <h2>{product.name} {product.volumeLabel}</h2>
                <label>Product description<textarea value={product.shortDescription} onChange={(event) => update(product.slug, "shortDescription", event.target.value)} /></label>
                <div className="admin-inline-grid">
                  <label>Unit price<input type="number" step="0.01" value={product.unitPriceSgd} onChange={(event) => update(product.slug, "unitPriceSgd", Number(event.target.value))} /></label>
                  <label>Pack quantity<input type="number" value={product.packQuantity} onChange={(event) => update(product.slug, "packQuantity", Number(event.target.value))} /></label>
                  <label>Pack price<input type="number" step="0.01" value={product.packPriceSgd} onChange={(event) => update(product.slug, "packPriceSgd", Number(event.target.value))} /></label>
                  <label>Inventory packs<input type="number" value={product.inventoryPacks} onChange={(event) => update(product.slug, "inventoryPacks", Number(event.target.value))} /></label>
                  <label>Sort order<input type="number" value={product.sortOrder} onChange={(event) => update(product.slug, "sortOrder", Number(event.target.value))} /></label>
                </div>
                {mismatch && <p className="setup-warning">Check price: {formatSgd(product.unitPriceSgd)} x {product.packQuantity} = {formatSgd(expected)}, but pack price is {formatSgd(product.packPriceSgd)}.</p>}
                <div className="admin-switches">
                  <label><input type="checkbox" checked={product.purchaseEnabled} onChange={(event) => update(product.slug, "purchaseEnabled", event.target.checked)} /> Purchase enabled</label>
                  <label><input type="checkbox" checked={product.active} onChange={(event) => update(product.slug, "active", event.target.checked)} /> Active</label>
                </div>
              </div>
            </article>
          );
        })}
        {saving && <p>{saving}</p>}
        <button className="button button--primary" type="submit">Save product settings</button>
      </form>
    </>
  );
}
