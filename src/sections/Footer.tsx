import { links } from "../data/siteData";
import { trackInstagramClick, trackStoreClick } from "../lib/analytics";
import { BrandLogo } from "../components/BrandLogo";
import { ExternalLink } from "../components/ExternalLink";
import { Link } from "react-router-dom";

type FooterProps = {
  minimal?: boolean;
};

export function Footer({ minimal = false }: FooterProps) {
  if (minimal) {
    return (
      <footer className="footer footer--minimal" id="footer">
        <div className="footer__brand">
          <BrandLogo className="footer__logo" />
          <p>Jeju-inspired Korean care and scent.</p>
          <p>Ships from Jeju, Korea</p>
          <p>&copy; 2026 hondit.</p>
        </div>
      <div className="footer__links footer__links--minimal" aria-label="Jeju page links">
          <ExternalLink href={links.shopeeStore} onClick={() => trackStoreClick("jeju_footer")}>
            Shop on Shopee SG
          </ExternalLink>
          <ExternalLink href={links.instagram} onClick={() => trackInstagramClick("jeju_footer")}>
            Instagram
          </ExternalLink>
          <Link to="/bulk-orders">Bulk Orders</Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer" id="footer">
      <div className="footer__brand">
        <BrandLogo className="footer__logo" />
        <p>Jeju-inspired Korean care and scent.</p>
        <p>Ships from Jeju, Korea</p>
        <p>&copy; 2026 hondit.</p>
      </div>
      <div className="footer__links">
        <div className="footer__utility">
          <ExternalLink href={links.shopeeStore} onClick={() => trackStoreClick("footer")}>
            Shop on Shopee SG
          </ExternalLink>
          <img src="/images/shopee-qr.png" alt="QR code linking to hondit official Shopee Singapore store." loading="lazy" decoding="async" />
        </div>
        <div className="footer__utility">
          <ExternalLink href={links.instagram} onClick={() => trackInstagramClick("footer")}>
            Instagram
          </ExternalLink>
          <img src="/images/instagram-qr.png" alt="QR code linking to hondit official Instagram profile." loading="lazy" decoding="async" />
        </div>
        <nav className="footer__policy" aria-label="Business policy links">
          <Link to="/bulk-orders">Bulk Orders</Link>
          <Link to="/shipping-policy">Shipping policy</Link>
          <Link to="/refund-policy">Refund policy</Link>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
