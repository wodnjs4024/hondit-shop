import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BULK_QTY_STEP, formatSgd, getStockStatus } from "../data/bulkProducts";
import { useCart } from "../context/CartContext";

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const {
    closeDrawer,
    drawerOpen,
    hasBlockingIssue,
    lines,
    removeItem,
    setQuantity,
    summary,
    toast,
    warnings,
  } = useCart();
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add("is-cart-open");
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled"),
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("is-cart-open");
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [closeDrawer, drawerOpen]);

  return (
    <>
      <div className={`cart-drawer ${drawerOpen ? "is-open" : ""}`} aria-hidden={!drawerOpen} hidden={!drawerOpen}>
        <button className="cart-drawer__backdrop" type="button" aria-label="Close cart" onClick={closeDrawer} />
        <aside
          ref={panelRef}
          className="cart-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Bulk order cart"
        >
          <div className="cart-drawer__header">
            <div>
              <p className="eyebrow">BULK CART</p>
              <h2>Your selected products</h2>
            </div>
            <button ref={closeButtonRef} className="cart-drawer__close" type="button" onClick={closeDrawer}>
              Close
            </button>
          </div>

          {lines.length === 0 ? (
            <div className="cart-drawer__empty">
              <h3>Your cart is empty.</h3>
              <p>Add bulk products first, then continue to checkout.</p>
              <Link className="button button--primary" to="/bulk-orders" onClick={closeDrawer}>
                View bulk orders
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-drawer__items">
                {lines.map((line) => (
                  <article className="cart-mini-line" key={line.product.slug}>
                    <img src={line.product.imageUrl} alt={line.product.name} loading="lazy" decoding="async" />
                    <div className="cart-mini-line__body">
                      <div className="cart-mini-line__title">
                        <h3>{line.product.name}</h3>
                        <span>{line.product.volumeLabel}</span>
                      </div>
                      <p>{formatSgd(line.product.unitPriceSgd)} per unit</p>
                      {getStockStatus(line.product) === "Sold out" && (
                        <p className="cart-warning">This item is currently sold out.</p>
                      )}
                      <div className="cart-mini-line__controls">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.product, line.packCount - BULK_QTY_STEP)}
                          aria-label={`Decrease ${line.product.name} quantity`}
                        >
                          -
                        </button>
                        <strong>{line.packCount}</strong>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.product, line.packCount + BULK_QTY_STEP)}
                          aria-label={`Increase ${line.product.name} quantity`}
                        >
                          +
                        </button>
                        <button className="cart-mini-line__remove" type="button" onClick={() => removeItem(line.product.slug)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <strong className="cart-mini-line__total">{formatSgd(line.lineTotalSgd)}</strong>
                  </article>
                ))}
              </div>

              <div className="cart-drawer__footer">
                {warnings.length > 0 && (
                  <div className="cart-drawer__warnings">
                    {warnings.map((warning) => (
                      <p key={`${warning.slug}-${warning.message}`}>{warning.message}</p>
                    ))}
                  </div>
                )}
                <dl>
                  <div>
                    <dt>Total units</dt>
                    <dd>{summary.totalUnits}</dd>
                  </div>
                  <div>
                    <dt>Total payment</dt>
                    <dd>{formatSgd(summary.totalSgd)}</dd>
                  </div>
                </dl>
                <p>Free Singapore EMS shipping</p>
                <div className="cart-drawer__actions">
                  <Link className="button button--ghost" to="/cart" onClick={closeDrawer}>
                    View cart
                  </Link>
                  {hasBlockingIssue ? (
                    <button className="button button--primary" type="button" disabled>
                      Checkout
                    </button>
                  ) : (
                    <Link className="button button--primary" to="/checkout" onClick={closeDrawer}>
                      Checkout
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      <div className={`cart-toast ${toast ? "is-visible" : ""}`} aria-live="polite" aria-atomic="true">
        {toast && (
          <>
            <span>{toast.message}</span>
            <Link to="/cart" onClick={closeDrawer}>
              View cart
            </Link>
          </>
        )}
      </div>
    </>
  );
}
