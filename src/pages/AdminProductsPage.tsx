import { FormEvent, useEffect, useState } from "react";
import { bulkProducts, formatSgd, type BulkCategory, type BulkProduct } from "../data/bulkProducts";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";

const categoryOptions: BulkCategory[] = ["cleansing", "diffuser"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function createProductDraft(products: BulkProduct[]): BulkProduct {
  const nextOrder = Math.max(0, ...products.map((product) => Number(product.sortOrder) || 0)) + 10;
  const seed = `new-product-${Date.now().toString(36)}`;
  return {
    id: seed,
    slug: seed,
    name: "New hondit product",
    category: "cleansing",
    volumeLabel: "100ml",
    shortDescription: "Short product summary for the catalog card.",
    description: "Detailed product description for the product page.",
    imageUrl: "/images/foam-oil.png",
    unitPriceSgd: 0,
    packQuantity: 1,
    packPriceSgd: 0,
    unitWeightKg: 0,
    inventoryPacks: 0,
    active: false,
    purchaseEnabled: false,
    sortOrder: nextOrder,
    features: ["Feature"],
    usage: ["Order note"],
  };
}

function listToText(items: string[]) {
  return (items || []).join("\n");
}

function textToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  const load = () => {
    adminFetch<{ products: BulkProduct[] }>("/api/admin/products").then((data) => setProducts(data.products)).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const update = (slug: string, key: keyof BulkProduct, value: string | number | boolean | string[]) => {
    setProducts((current) => current.map((product) => (product.slug === slug ? { ...product, [key]: value } : product)));
  };

  const addProduct = () => {
    setProducts((current) => [createProductDraft(current), ...current]);
    setSaving("New product draft added. Fill it in, then save.");
  };

  const duplicateProduct = (product: BulkProduct) => {
    const seedSlug = slugify(`${product.slug}-copy-${Date.now().toString(36)}`);
    setProducts((current) => [
      {
        ...product,
        id: seedSlug,
        slug: seedSlug,
        name: `${product.name} Copy`,
        active: false,
        purchaseEnabled: false,
        sortOrder: Math.max(0, ...current.map((entry) => Number(entry.sortOrder) || 0)) + 10,
      },
      ...current,
    ]);
    setSaving("Product copy created. Review it, then save.");
  };

  const removeDraft = (slug: string) => {
    setProducts((current) => current.filter((product) => product.slug !== slug));
    setSaving("Removed from this editing screen. Save to keep database changes for other products.");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving("Saving product settings...");
    const normalizedProducts = products.map((product) => {
      const slug = slugify(product.slug || product.name);
      return {
        ...product,
        id: product.id || slug,
        slug,
        unitPriceSgd: Number(product.unitPriceSgd) || 0,
        packQuantity: Math.max(1, Math.floor(Number(product.packQuantity) || 1)),
        packPriceSgd: Number(product.packPriceSgd) || 0,
        unitWeightKg: Number(product.unitWeightKg) || 0,
        inventoryPacks: Math.max(0, Math.floor(Number(product.inventoryPacks) || 0)),
        sortOrder: Math.floor(Number(product.sortOrder) || 100),
      };
    });
    await adminFetch("/api/admin/products", {
      method: "PATCH",
      body: JSON.stringify({ products: normalizedProducts }),
    });
    setSaving("Saved.");
    load();
  };

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">PRODUCTS</p>
        <h1>Upload and manage products</h1>
        <p>Add products here to show them on the bulk order page. Keep new drafts inactive until the information is ready.</p>
      </div>
      <div className="admin-toolbar">
        <button className="button button--primary" type="button" onClick={addProduct}>Add new product</button>
        <a className="button button--ghost" href="/bulk-orders" target="_blank" rel="noreferrer">View bulk order page</a>
      </div>
      <form className="admin-panel admin-product-list" onSubmit={submit}>
        {products.map((product) => {
          const expected = Number((product.unitPriceSgd * product.packQuantity).toFixed(2));
          const mismatch = expected !== product.packPriceSgd;
          return (
            <article className="admin-product-row" key={product.slug}>
              <img src={product.imageUrl} alt={product.name} />
              <div>
                <div className="admin-product-row__head">
                  <div>
                    <p className={`admin-product-status ${product.active && product.purchaseEnabled ? "is-live" : ""}`}>
                      {product.active && product.purchaseEnabled ? "Live on shop" : "Draft or hidden"}
                    </p>
                    <h2>{product.name} {product.volumeLabel}</h2>
                  </div>
                  <div className="admin-row-actions">
                    <button className="button button--ghost" type="button" onClick={() => duplicateProduct(product)}>Duplicate</button>
                    {!product.active && <button className="button button--danger" type="button" onClick={() => removeDraft(product.slug)}>Remove draft</button>}
                  </div>
                </div>
                <div className="admin-inline-grid admin-inline-grid--product-main">
                  <label>Product name<input value={product.name} onChange={(event) => update(product.slug, "name", event.target.value)} /></label>
                  <label>Slug / page URL<input value={product.slug} onChange={(event) => update(product.slug, "slug", slugify(event.target.value))} /></label>
                  <label>Category
                    <select value={product.category} onChange={(event) => update(product.slug, "category", event.target.value as BulkCategory)}>
                      {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <label>Volume label<input value={product.volumeLabel} onChange={(event) => update(product.slug, "volumeLabel", event.target.value)} /></label>
                  <label>Image URL<input value={product.imageUrl} onChange={(event) => update(product.slug, "imageUrl", event.target.value)} /></label>
                  <label>Unit weight kg<input type="number" step="0.001" value={product.unitWeightKg} onChange={(event) => update(product.slug, "unitWeightKg", Number(event.target.value))} /></label>
                </div>
                <label>Catalog card summary<textarea value={product.shortDescription} onChange={(event) => update(product.slug, "shortDescription", event.target.value)} /></label>
                <label>Product detail description<textarea value={product.description} onChange={(event) => update(product.slug, "description", event.target.value)} /></label>
                <div className="admin-inline-grid">
                  <label>Unit price<input type="number" step="0.01" value={product.unitPriceSgd} onChange={(event) => update(product.slug, "unitPriceSgd", Number(event.target.value))} /></label>
                  <label>Pack quantity<input type="number" value={product.packQuantity} onChange={(event) => update(product.slug, "packQuantity", Number(event.target.value))} /></label>
                  <label>Pack price<input type="number" step="0.01" value={product.packPriceSgd} onChange={(event) => update(product.slug, "packPriceSgd", Number(event.target.value))} /></label>
                  <label>Inventory packs<input type="number" value={product.inventoryPacks} onChange={(event) => update(product.slug, "inventoryPacks", Number(event.target.value))} /></label>
                  <label>Sort order<input type="number" value={product.sortOrder} onChange={(event) => update(product.slug, "sortOrder", Number(event.target.value))} /></label>
                </div>
                <div className="admin-inline-grid admin-inline-grid--textarea">
                  <label>Feature chips, one per line<textarea value={listToText(product.features)} onChange={(event) => update(product.slug, "features", textToList(event.target.value))} /></label>
                  <label>Use and order notes, one per line<textarea value={listToText(product.usage)} onChange={(event) => update(product.slug, "usage", textToList(event.target.value))} /></label>
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
