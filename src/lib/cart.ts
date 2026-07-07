import { bulkProducts, type BulkProduct } from "../data/bulkProducts";

export type CartItem = {
  slug: string;
  packCount: number;
};

export type CartLine = {
  product: BulkProduct;
  packCount: number;
  totalUnits: number;
  lineTotalSgd: number;
};

const cartKey = "hondit_bulk_cart_v1";

function clampPackCount(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(99, Math.floor(value)));
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(cartKey);
    if (!value) return [];
    const parsed = JSON.parse(value) as CartItem[];
    return parsed
      .filter((item) => typeof item.slug === "string")
      .map((item) => ({ slug: item.slug, packCount: clampPackCount(item.packCount) }));
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(cartKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("hondit-cart-change"));
}

export function clearCart() {
  writeCart([]);
}

export function addToCart(slug: string, packCount = 1) {
  const items = readCart();
  const existing = items.find((item) => item.slug === slug);
  if (existing) {
    existing.packCount = clampPackCount(existing.packCount + packCount);
  } else {
    items.push({ slug, packCount: clampPackCount(packCount) });
  }
  writeCart(items);
}

export function setCartItem(slug: string, packCount: number) {
  const next = readCart()
    .map((item) => (item.slug === slug ? { ...item, packCount: clampPackCount(packCount) } : item))
    .filter((item) => item.packCount > 0);
  writeCart(next);
}

export function removeCartItem(slug: string) {
  writeCart(readCart().filter((item) => item.slug !== slug));
}

export function getCartLines(items = readCart(), products = bulkProducts): CartLine[] {
  return items
    .map((item) => {
      const product = products.find((entry) => entry.slug === item.slug && entry.active);
      if (!product) return null;
      const packCount = clampPackCount(item.packCount);
      return {
        product,
        packCount,
        totalUnits: product.packQuantity * packCount,
        lineTotalSgd: product.packPriceSgd * packCount,
      };
    })
    .filter((line): line is CartLine => Boolean(line));
}

export function getCartSummary(lines = getCartLines()) {
  return lines.reduce(
    (summary, line) => ({
      totalPacks: summary.totalPacks + line.packCount,
      totalUnits: summary.totalUnits + line.totalUnits,
      subtotalSgd: summary.subtotalSgd + line.lineTotalSgd,
      totalSgd: summary.totalSgd + line.lineTotalSgd,
    }),
    { totalPacks: 0, totalUnits: 0, subtotalSgd: 0, totalSgd: 0 },
  );
}
