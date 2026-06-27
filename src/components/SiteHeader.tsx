import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { links } from "../data/siteData";
import { trackJejuClick, trackStoreClick } from "../lib/analytics";
import { BrandLogo } from "./BrandLogo";
import { ExternalLink } from "./ExternalLink";

type HeaderNavItem =
  | { label: string; href: string; to?: never }
  | { label: string; to: string; href?: never };

const navItems: HeaderNavItem[] = [
  { label: "Shop", href: "/#cleansing" },
  { label: "Find Yours", href: "/#ritual" },
  { label: "Singapore Days", href: "/#singapore" },
  { label: "Our Jeju", to: "/jeju" },
  { label: "About", href: "/#about" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const dark = location.pathname === "/jeju";

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
            onClick={() => trackJejuClick("header")}
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
    <header className={`site-header ${dark ? "site-header--dark" : ""}`}>
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
