import { motion } from "framer-motion";
import { links } from "../data/siteData";
import { trackInstagramClick, trackStoreClick } from "../lib/analytics";
import { BrandLogo } from "../components/BrandLogo";
import { ExternalLink } from "../components/ExternalLink";

export function Hero() {
  return (
    <section className="hero section-shell" id="home" aria-labelledby="hero-title">
      <div className="hero__glow hero__glow--one" />
      <div className="hero__glow hero__glow--two" />
      <div className="hero__content">
        <motion.div
          className="hero__logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <BrandLogo />
        </motion.div>
        <motion.h1
          id="hero-title"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Pieces of Jeju,
          <span>arriving in Singapore.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Korean care and scent,
          <span>curated for quieter everyday rituals.</span>
        </motion.p>
        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <ExternalLink className="button button--primary" href={links.shopeeStore} onClick={() => trackStoreClick("hero")}>
            Shop on Shopee SG
          </ExternalLink>
          <ExternalLink className="text-link" href={links.instagram} onClick={() => trackInstagramClick("hero")}>
            Follow @hondit.office
          </ExternalLink>
        </motion.div>
      </div>
      <motion.a
        className="hero__discover"
        href="#cleansing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        Discover
      </motion.a>
    </section>
  );
}
