import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { trackJejuClick } from "../lib/analytics";
import { BrandLogo } from "./BrandLogo";

type HeaderNavItem =
  | { label: string; href: string; to?: never }
  | { label: string; to: string; href?: never };

const navItems: HeaderNavItem[] = [
  { label: "Home", to: "/" },
  { label: "Our Jeju", to: "/jeju" },
  { label: "Products", to: "/products" },
  { label: "Bulk Orders", to: "/bulk-orders" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const dark = false;
  const bulk = location.pathname.startsWith("/bulk-orders");

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
      <Link className="header__shop header__shop--bulk" to="/bulk-orders">
        Bulk Order
      </Link>
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
