import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { links } from "../data/siteData";
import { trackJejuClick, trackStoreClick } from "../lib/analytics";
import { BrandLogo } from "./BrandLogo";
import { ExternalLink } from "./ExternalLink";

type HeaderNavItem = {
  label: string;
  to: string;
};

const navItems: HeaderNavItem[] = [
  { label: "Home", to: "/" },
  { label: "Explore Jeju", to: "/jeju" },
  { label: "Products", to: "/products" },
  { label: "Bulk Orders", to: "/bulk-orders" },
  { label: "Shipping", to: "/shipping" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
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
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) => `${item.to === "/bulk-orders" ? "nav-link--bulk" : ""} ${isActive ? "is-active" : ""}`.trim()}
          onClick={() => item.to === "/jeju" && trackJejuClick("header")}
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );

  return (
    <>
      <div className="shipping-bar" role="note">
        <span>Shopee delivery: 5-10 days</span>
        <span>Bulk dispatch: 3-5 days after dispatch</span>
      </div>
      <header className={`site-header ${bulk ? "site-header--bulk" : ""}`}>
        <div className="site-header__inner">
          <Link className="site-header__logo" to="/" aria-label="Go to hondit home">
            <BrandLogo />
          </Link>
          <nav className="site-header__nav" aria-label="Primary navigation">
            {menu}
          </nav>
          <ExternalLink className="header__shop" href={links.shopeeStore} onClick={() => trackStoreClick("header_cta")}>
            Shopee Singapore
          </ExternalLink>
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
            <ExternalLink className="header__shop" href={links.shopeeStore} onClick={() => trackStoreClick("mobile_header_cta")}>
              Shopee Singapore
            </ExternalLink>
          </nav>
        </div>
      </header>
    </>
  );
}
