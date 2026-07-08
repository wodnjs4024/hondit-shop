import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { links } from "../data/siteData";
import { useCart } from "../context/CartContext";
import { trackJejuClick, trackStoreClick } from "../lib/analytics";
import { BrandLogo } from "./BrandLogo";
import { ExternalLink } from "./ExternalLink";

type HeaderNavItem =
  | { label: string; href: string; to?: never }
  | { label: string; to: string; href?: never };

const navItems: HeaderNavItem[] = [
  { label: "Shop", href: "/#retail-shop" },
  { label: "Bulk", to: "/bulk-orders" },
  { label: "About", href: "/#about" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { openDrawer, totalQuantity } = useCart();
  const location = useLocation();
  const dark = location.pathname === "/jeju";
  const bulk = location.pathname.startsWith("/bulk-orders") || location.pathname === "/cart" || location.pathname === "/checkout";

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.classList.toggle("is-menu-open", open);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("is-menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu = (
    <>
      {navItems.map((item) =>
        item.to ? (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `${item.to === "/bulk-orders" ? "nav-link--bulk" : ""} ${isActive ? "is-active" : ""}`.trim()}
            onClick={() => item.to === "/jeju" && trackJejuClick("header")}
          >
            {item.label}
          </NavLink>
        ) : (
          <a key={item.label} href={item.href}>
            {item.label}
          </a>
        ),
      )}
      <ExternalLink className="header__shop" href={links.shopeeStore} onClick={() => trackStoreClick("header")}>
        Shop on Shopee SG
      </ExternalLink>
    </>
  );

  return (
    <header className={`site-header ${dark ? "site-header--dark" : ""} ${bulk ? "site-header--bulk" : ""}`}>
      <div className="site-header__inner">
        <Link className="site-header__logo" to="/" aria-label="Go to hondit home">
          <BrandLogo />
        </Link>
        <nav className="site-header__nav" aria-label="Primary navigation">
          {menu}
        </nav>
        <button
          className={`site-header__cart ${totalQuantity > 0 ? "has-items" : ""}`}
          type="button"
          aria-label={`Cart, ${totalQuantity} items`}
          onClick={openDrawer}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M7.2 8.3h13.1l-1.4 7.2a2 2 0 0 1-2 1.6H9.3a2 2 0 0 1-2-1.6L5.9 5.7H3.4" />
            <circle cx="9.8" cy="20" r="1.2" />
            <circle cx="17.2" cy="20" r="1.2" />
          </svg>
          <span>Cart</span>
          {totalQuantity > 0 && <strong>{totalQuantity}</strong>}
        </button>
        <button
          className="site-header__menu"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
      <div className={`mobile-drawer ${open ? "is-open" : ""}`} id="mobile-menu">
        <button className="mobile-drawer__backdrop" type="button" aria-label="Close menu" onClick={() => setOpen(false)} />
        <nav className="mobile-drawer__panel" aria-label="Mobile navigation">
          {menu}
        </nav>
      </div>
    </header>
  );
}
