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
          <p>&copy; 2026 hondit. All rights reserved.</p>
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
        <p>From Jeju to you.</p>
        <p>Thoughtful products. Honest ingredients.</p>
        <p>&copy; 2026 hondit. All rights reserved.</p>
      </div>
      <div className="footer__links">
        <div className="footer__utility">
          <ExternalLink href={links.shopeeStore} onClick={() => trackStoreClick("footer")}>
            Shopee SG
          </ExternalLink>
        </div>
        <div className="footer__utility">
          <ExternalLink href={links.instagram} onClick={() => trackInstagramClick("footer")}>
            Instagram
          </ExternalLink>
        </div>
        <nav className="footer__policy" aria-label="Business policy links">
          <Link to="/bulk-orders">Bulk Orders</Link>
          <Link to="/shipping">Shipping</Link>
          <Link to="/policy/refund">Refund policy</Link>
          <Link to="/policy/privacy">Privacy policy</Link>
          <Link to="/policy/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
