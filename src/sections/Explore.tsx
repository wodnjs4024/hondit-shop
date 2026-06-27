import { links } from "../data/siteData";
import { trackStoreClick } from "../lib/analytics";
import { ExternalLink } from "../components/ExternalLink";

export function Explore() {
  return (
    <section className="explore section-shell" id="explore" aria-labelledby="explore-title">
      <div className="section-inner section-inner--narrow">
        <div className="section-heading section-heading--center">
          <p>EXPLORE HONDIT</p>
          <h2 id="explore-title">
            Bring a little Jeju
            <span>into your day.</span>
          </h2>
          <p className="section-copy">
            Discover the full hondit collection on Shopee Singapore.
          </p>
          <ExternalLink
            className="button button--primary"
            href={links.shopeeStore}
            onClick={() => trackStoreClick("bottom_cta")}
          >
            Visit Official Shopee Store
          </ExternalLink>
        </div>
      </div>
    </section>
  );
}
