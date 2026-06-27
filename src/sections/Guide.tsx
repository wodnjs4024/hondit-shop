import { motion } from "framer-motion";
import { guideCards } from "../data/siteData";

export function Guide() {
  const goToProduct = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  };

  return (
    <section className="guide section-shell" id="guide" aria-labelledby="guide-title">
      <div className="section-inner">
        <div className="section-heading section-heading--center">
          <p>FIND YOUR CLEANSER</p>
          <h2 id="guide-title">
            Which ritual
            <span>fits your day?</span>
          </h2>
        </div>
        <div className="guide-grid">
          {guideCards.map((card, index) => (
            <motion.button
              className="guide-card"
              key={card.number}
              type="button"
              aria-label={`See ${card.title} product card`}
              onClick={() => goToProduct(card.targetId)}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="guide-card__number">{card.number}</span>
              <h3>{card.title}</h3>
              <p className="guide-card__intro">{card.intro}</p>
              <p>{card.body}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
