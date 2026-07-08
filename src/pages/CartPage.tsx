import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bulkProducts, formatSgd, type BulkProduct } from "../data/bulkProducts";
import { fetchBulkProducts } from "../lib/bulkApi";
import { getCartLines, getCartSummary, readCart, removeCartItem, setCartItem, type CartItem } from "../lib/cart";

export function CartPage() {
  const [items, setItems] = useState<CartItem[]>(readCart());
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);

  const sync = () => setItems(readCart());

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
    window.addEventListener("hondit-cart-change", sync);
    return () => window.removeEventListener("hondit-cart-change", sync);
  }, []);

  const lines = useMemo(() => getCartLines(items, products), [items, products]);
  const summary = getCartSummary(lines);

  const updatePackCount = (slug: string, next: number) => {
    setCartItem(slug, next);
    sync();
  };

  return (
    <main className="bulk-page">
      <section className="bulk-checkout section-shell">
        <div className="section-inner section-inner--wide">
          <div className="bulk-page-title">
            <p className="eyebrow">CART</p>
            <h1>Your bulk order cart.</h1>
          </div>

          {lines.length === 0 ? (
            <div className="empty-state">
              <h2>Your cart is empty.</h2>
              <Link className="button button--primary" to="/bulk-orders">View Bulk Orders</Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-lines">
                {lines.map((line) => (
                  <article className="cart-line" key={line.product.slug}>
                    <img src={line.product.imageUrl} alt={line.product.name} />
                    <div>
                      <h2>{line.product.name}</h2>
                      <p>{line.product.volumeLabel} · 1 pack = {line.product.packQuantity} units</p>
                      <p>{formatSgd(line.product.unitPriceSgd)} per unit · {formatSgd(line.product.packPriceSgd)} per pack</p>
                    </div>
                    <div className="pack-stepper">
                      <span>Packs</span>
                      <div>
                        <button type="button" onClick={() => updatePackCount(line.product.slug, line.packCount - 1)}>-</button>
                        <strong>{line.packCount}</strong>
                        <button type="button" onClick={() => updatePackCount(line.product.slug, line.packCount + 1)}>+</button>
                      </div>
                      <em>{line.totalUnits} units</em>
                    </div>
                    <strong>{formatSgd(line.lineTotalSgd)}</strong>
                    <button type="button" onClick={() => { removeCartItem(line.product.slug); sync(); }}>Remove</button>
                  </article>
                ))}
              </div>

              <aside className="order-summary">
                <h2>Order Summary</h2>
                <dl>
                  <div><dt>Total packs</dt><dd>{summary.totalPacks}</dd></div>
                  <div><dt>Total units</dt><dd>{summary.totalUnits}</dd></div>
                  <div><dt>Subtotal</dt><dd>{formatSgd(summary.subtotalSgd)}</dd></div>
                  <div><dt>Shipping</dt><dd>Included</dd></div>
                  <div><dt>Total in SGD</dt><dd>{formatSgd(summary.totalSgd)}</dd></div>
                </dl>
                <Link className="button button--primary" to="/checkout">Proceed to Checkout</Link>
                <Link className="text-link" to="/bulk-orders">Continue shopping</Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
