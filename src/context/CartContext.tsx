import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getBulkMaxUnits, getBulkMoq, getStockStatus, normalizeBulkQuantity, type BulkProduct } from "../data/bulkProducts";
import { fetchBulkProducts } from "../lib/bulkApi";
import {
  clearCart as clearStoredCart,
  getCartLines,
  getCartSummary,
  readCart,
  removeCartItem,
  setCartItem,
  writeCart,
  type CartItem,
  type CartLine,
} from "../lib/cart";

type CartToast = {
  id: number;
  message: string;
};

type CartWarning = {
  slug: string;
  message: string;
};

type CartContextValue = {
  items: CartItem[];
  products: BulkProduct[];
  lines: CartLine[];
  summary: ReturnType<typeof getCartSummary>;
  totalQuantity: number;
  warnings: CartWarning[];
  hasBlockingIssue: boolean;
  drawerOpen: boolean;
  toast: CartToast | null;
  addItem: (product: BulkProduct, quantity: number) => void;
  setQuantity: (product: BulkProduct, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function buildWarnings(lines: CartLine[]) {
  return lines.flatMap((line) => {
    const stockStatus = getStockStatus(line.product);
    const maxUnits = getBulkMaxUnits(line.product);
    const warnings: CartWarning[] = [];

    if (stockStatus === "Sold out") {
      warnings.push({
        slug: line.product.slug,
        message: `${line.product.name} is currently sold out.`,
      });
    }

    if (maxUnits !== undefined && line.totalUnits > maxUnits) {
      warnings.push({
        slug: line.product.slug,
        message: `${line.product.name} is only available up to ${maxUnits} units.`,
      });
    }

    return warnings;
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readCart());
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<CartToast | null>(null);

  const sync = useCallback(() => setItems(readCart()), []);

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
    window.addEventListener("hondit-cart-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hondit-cart-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const lines = useMemo(() => getCartLines(items, products.length ? products : undefined), [items, products]);
  const summary = useMemo(() => getCartSummary(lines), [lines]);
  const warnings = useMemo(() => buildWarnings(lines), [lines]);

  const persist = useCallback((nextItems: CartItem[]) => {
    writeCart(nextItems);
    setItems(nextItems);
  }, []);

  const addItem = useCallback(
    (product: BulkProduct, quantity: number) => {
      if (getStockStatus(product) === "Sold out") {
        setToast({ id: Date.now(), message: `${product.name} is sold out.` });
        return;
      }

      const normalizedQuantity = normalizeBulkQuantity(product, quantity || getBulkMoq(product));
      const nextItems = [...readCart()];
      const existing = nextItems.find((item) => item.slug === product.slug);

      if (existing) {
        existing.packCount = normalizeBulkQuantity(product, existing.packCount + normalizedQuantity);
      } else {
        nextItems.push({ slug: product.slug, packCount: normalizedQuantity });
      }

      persist(nextItems);
      setToast({ id: Date.now(), message: `Added ${normalizedQuantity} x ${product.name} to cart` });
      setDrawerOpen(true);
    },
    [persist],
  );

  const setQuantity = useCallback(
    (product: BulkProduct, quantity: number) => {
      if (getStockStatus(product) === "Sold out") return;
      setCartItem(product.slug, normalizeBulkQuantity(product, quantity));
      sync();
    },
    [sync],
  );

  const removeItem = useCallback(
    (slug: string) => {
      removeCartItem(slug);
      sync();
    },
    [sync],
  );

  const clearCart = useCallback(() => {
    clearStoredCart();
    sync();
  }, [sync]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      products,
      lines,
      summary,
      totalQuantity: summary.totalUnits,
      warnings,
      hasBlockingIssue: warnings.length > 0,
      drawerOpen,
      toast,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [addItem, clearCart, drawerOpen, items, lines, products, removeItem, setQuantity, summary, toast, warnings],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
