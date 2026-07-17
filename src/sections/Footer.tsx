import { Link } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { ExternalLink } from "../components/ExternalLink";
import { links } from "../data/siteData";
import { trackInstagramClick, trackStoreClick } from "../lib/analytics";

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
    <footer className="footer footer--approved" id="footer">
      <div className="footer__main">
        <div className="footer__brand">
          <BrandLogo className="footer__logo" />
          <p>Pieces of Jeju Island, arriving in Singapore.</p>
          <p>A student-led brand based at Jeju National University.</p>
        </div>
        <nav className="footer__column" aria-label="Explore hondit">
          <span>EXPLORE</span>
          <Link to="/jeju">Asia to Jeju</Link>
          <Link to="/products">Products</Link>
          <Link to="/bulk-orders">Bulk Orders</Link>
          <Link to="/shipping">Shipping</Link>
        </nav>
        <nav className="footer__column" aria-label="Connect with hondit">
          <span>CONNECT</span>
          <ExternalLink href={links.shopeeStore} onClick={() => trackStoreClick("footer")}>
            Shopee Singapore ↗
          </ExternalLink>
          <ExternalLink href={links.instagram} onClick={() => trackInstagramClick("footer")}>
            Instagram ↗
          </ExternalLink>
          <a href="mailto:hondit.office@gmail.com">Email</a>
          <Link to="/contact">Contact</Link>
        </nav>
        <nav className="footer__column" aria-label="Trust and support">
          <span>TRUST & SUPPORT</span>
          <Link to="/shipping">Delivery guide</Link>
          <Link to="/policy/refund">Refund support</Link>
          <ExternalLink href="https://www.jejunu.ac.kr/">JNU official site ↗</ExternalLink>
        </nav>
      </div>
      <div className="footer__bottom">
        <span>&copy; 2026 hondit · Student-led project based at Jeju National University.</span>
        <nav aria-label="Policy links">
          <Link to="/policy/refund">Refund</Link>
          <Link to="/policy/privacy">Privacy</Link>
          <Link to="/policy/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
