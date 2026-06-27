import { links } from "../data/siteData";
import { trackStoreClick } from "../lib/analytics";
import { ExternalLink } from "./ExternalLink";

type MobileShopCTAProps = {
  visible: boolean;
  dark?: boolean;
};

export function MobileShopCTA({ visible, dark = false }: MobileShopCTAProps) {
  return (
    <ExternalLink
      className={`mobile-shop-cta ${visible ? "is-visible" : ""} ${dark ? "mobile-shop-cta--dark" : ""}`}
      href={links.shopeeStore}
      onClick={() => trackStoreClick("sticky_mobile")}
    >
      Shop on Shopee SG
    </ExternalLink>
  );
}
