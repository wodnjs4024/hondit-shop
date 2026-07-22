import { bulkProducts, type BulkProduct } from "../data/bulkProducts";
import { productOrder, v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { fetchBulkProducts } from "./bulkApi";

function mergeProduct(staticProduct: StorefrontProduct, apiProduct?: BulkProduct): StorefrontProduct {
  if (!apiProduct) return staticProduct;
  return {
    ...staticProduct,
    active: apiProduct.active,
    stockQuantity: apiProduct.inventoryPacks * apiProduct.packQuantity,
    bulkUnitPrice: apiProduct.unitPriceSgd,
    bulkMoq: apiProduct.packQuantity,
    bulkStep: 10,
  };
}

export async function loadStorefrontProducts() {
  const apiProducts = await fetchBulkProducts().catch(() => bulkProducts);
  return v23Products
    .map((product) => mergeProduct(product, apiProducts.find((item) => item.slug === product.apiSlug)))
    .filter((product) => product.active !== false)
    .sort((a, b) => productOrder.indexOf(a.slug) - productOrder.indexOf(b.slug));
}

export async function loadStorefrontProduct(slug: string) {
  const products = await loadStorefrontProducts();
  return products.find((product) => product.slug === slug || product.apiSlug === slug);
}
