import { Link, NavLink } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { EMAIL, INSTAGRAM, SHOPEE, type StorefrontProduct } from "../../data/v23SiteData";

export function V23Header() {
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("SHOPEE DELIVERY 5-10 DAYS - BULK DELIVERY 3-5 DAYS AFTER DISPATCH - SHIPS FROM KOREA");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((response) => (response.ok ? response.json() : null))
      .then((value: { settings?: { announcement?: string } } | null) => {
        if (value?.settings?.announcement) setAnnouncement(value.settings.announcement);
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <div className="v23-shipping-bar">{announcement}</div>
      <header className="v23-nav">
        <Link className="v23-brand" to="/" aria-label="hondit home">
          hondit<span>.</span>
        </Link>
        <nav className={open ? "v23-nav-links is-open" : "v23-nav-links"} aria-label="Main navigation">
          <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/jeju" onClick={() => setOpen(false)}>Explore Jeju</NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>Products</NavLink>
          <NavLink to="/bulk-orders" onClick={() => setOpen(false)}>Bulk Orders</NavLink>
          <NavLink to="/shipping" onClick={() => setOpen(false)}>Shipping</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
        </nav>
        <a className="v23-shop-button" href={SHOPEE} target="_blank" rel="noreferrer">
          Shop on Shopee -&gt;
        </a>
        <button className="v23-menu-button" type="button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          Menu
        </button>
      </header>
    </>
  );
}

export function V23Footer() {
  return (
    <footer className="v23-footer">
      <div className="v23-footer-brand">
        <b>hondit<span>.</span></b>
        <p>Pieces of Jeju Island,<br />arriving in Singapore.</p>
        <p>A student-led brand based at<br />Jeju National University.</p>
      </div>
      <div>
        <p>EXPLORE</p>
        <Link to="/jeju">Asia to Jeju</Link>
        <Link to="/products">Products</Link>
        <Link to="/bulk-orders">Bulk Orders</Link>
        <Link to="/shipping">Shipping</Link>
      </div>
      <div>
        <p>CONNECT</p>
        <a href={SHOPEE} target="_blank" rel="noreferrer">Shopee Singapore -&gt;</a>
        <a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram -&gt;</a>
        <a href={`mailto:${EMAIL}`}>Email</a>
        <Link to="/contact">Contact</Link>
      </div>
      <div>
        <p>TRUST & SUPPORT</p>
        <Link to="/shipping">Delivery guide</Link>
        <Link to="/policy/refund">Refund support</Link>
        <a href="https://www.jejunu.ac.kr/eng/" target="_blank" rel="noreferrer">JNU official site -&gt;</a>
      </div>
      <small>(c) 2026 hondit - Student-led project based at Jeju National University. <Link to="/policy/refund">Refund</Link> - <Link to="/policy/privacy">Privacy</Link> - <Link to="/policy/terms">Terms</Link></small>
      <Link className="v23-footer-admin" to="/admin">Admin sign-in</Link>
    </footer>
  );
}

export function V23Page({ children }: { children: ReactNode }) {
  return (
    <>
      <V23Header />
      {children}
      <V23Footer />
    </>
  );
}

export function V23PageHero({
  eyebrow,
  title,
  description,
  image = "/images/jeju-wind-coast-v2.webp",
  imageAlt,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  imageAlt: string;
  children?: ReactNode;
}) {
  return (
    <section className="v23-page-hero">
      <div className="v23-page-hero-copy">
        <p className="v23-eyebrow"><span /> {eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
      <figure className="v23-page-hero-media">
        <img src={image} alt={imageAlt} width={1600} height={1100} />
        <figcaption><i /> FROM JEJU - TO SINGAPORE</figcaption>
      </figure>
    </section>
  );
}

export function V23ProductCard({ product }: { product: StorefrontProduct }) {
  const outOfStock = typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq;

  return (
    <article className="v23-product-card">
      <Link className="v23-product-image" to={`/products/${product.slug}`}>
        <span>{outOfStock ? "OUT OF STOCK" : product.badge}</span>
        <img src={product.image} alt={product.name} width={880} height={1100} loading="lazy" />
      </Link>
      <div className="v23-product-meta">
        <h3>{product.name}</h3>
        <p>{product.detail}</p>
        <small>DISPLAY PRICE - CHECK LIVE ON SHOPEE</small>
        <strong>{product.price}</strong>
      </div>
      <div className="v23-product-links">
        <Link to={`/products/${product.slug}`}>View details</Link>
        <a className="is-dark" href={product.shopee} target="_blank" rel="noreferrer">Buy on Shopee</a>
        {outOfStock ? <span>Bulk unavailable</span> : <Link to={`/bulk-orders?product=${product.slug}`}>Bulk checkout</Link>}
      </div>
    </article>
  );
}
