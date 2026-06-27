import { motion } from "framer-motion";

export function Bridge() {
  return (
    <section className="bridge section-shell" aria-label="Brand transition">
      <div className="bridge__wave" aria-hidden="true" />
      <motion.div
        className="bridge__content"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p>FROM SKIN TO SPACE</p>
        <h2>
          Small rituals can change
          <span>how the day feels.</span>
        </h2>
        <p className="bridge__copy">
          From a quiet cleansing moment to a calmer atmosphere at home.
        </p>
      </motion.div>
    </section>
  );
}
