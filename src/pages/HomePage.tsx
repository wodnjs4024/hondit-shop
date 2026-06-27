import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FAQAccordion } from "../components/FAQAccordion";
import { ProductCard } from "../components/ProductCard";
import { cleansingProducts, diffuserProducts, ritualCards, trustItems } from "../data/siteData";
import { trackJejuPreview, trackRitualSelect } from "../lib/analytics";
import { About } from "../sections/About";
import { Footer } from "../sections/Footer";

function scrollToProduct(id: string, label: string) {
  trackRitualSelect(label);
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function HomePage() {
  return (
    <>
      <main>
        <section className="commerce-hero section-shell" id="home">
          <div className="commerce-hero__content">
            <p className="eyebrow">KOREAN CARE & SCENT · CURATED IN JEJU</p>
            <h1>
              Care for your skin.
              <span>Scent for your space.</span>
            </h1>
            <p>
              A considered collection of Korean cleansing and home fragrance, selected for calm everyday moments in Singapore.
            </p>
            <div className="commerce-hero__actions">
              <a className="button button--primary" href="#cleansing">
                Shop the collection
              </a>
              <Link className="button button--ghost" to="/jeju" onClick={() => trackJejuPreview("hero")}>
                Discover Our Jeju
              </Link>
            </div>
            <div className="hero-categories" aria-label="Product categories">
              <a href="#cleansing">
                <span>SKIN</span>
                Vegan cleansing rituals
              </a>
              <a href="#diffuser">
                <span>SPACE</span>
                Volcanic stone scent
              </a>
            </div>
          </div>
        </section>

        <section className="collection-nav section-shell">
          <div className="section-inner section-inner--wide collection-nav__grid">
            <a className="collection-panel collection-panel--skin" href="#cleansing">
              <span>FOR YOUR SKIN</span>
              <strong>Clear, gentle cleansing for everyday routines.</strong>
              <em>Explore cleansing</em>
            </a>
            <a className="collection-panel collection-panel--space" href="#diffuser">
              <span>FOR YOUR SPACE</span>
              <strong>Quiet citrus scent carried by volcanic stone.</strong>
              <em>Explore scent</em>
            </a>
          </div>
        </section>

        <section className="singapore-days section-shell" id="singapore">
          <div className="section-inner section-inner--wide singapore-days__grid">
            <div className="section-heading">
              <p>MADE FOR SINGAPORE DAYS</p>
              <h2>
                Small rituals for warm,
                <span>fast-moving days.</span>
              </h2>
              <p className="section-copy">
                From a clear morning cleanse to a quiet scent at the end of the day, hondit brings Korean care and fragrance into familiar Singapore spaces.
              </p>
            </div>
            <figure className="editorial-photo editorial-photo--large">
              <img src="/images/singapore-bathroom.png" alt="A calm Singapore bathroom setting for a morning reset." width="1200" height="900" loading="lazy" decoding="async" />
              <figcaption><span>MORNING RESET</span>A clean start after sunscreen, humidity and city days.</figcaption>
            </figure>
            <figure className="editorial-photo">
              <img src="/images/singapore-bedroom-desk.png" alt="A quiet bedroom and desk corner for evening scent rituals." width="1200" height="900" loading="lazy" decoding="async" />
              <figcaption><span>QUIET EVENING</span>A light citrus scent for bedrooms, desks and personal corners.</figcaption>
            </figure>
          </div>
        </section>

        <section className="ritual section-shell" id="ritual">
          <div className="section-inner section-inner--wide">
            <div className="section-heading section-heading--center">
              <p>FIND YOUR RITUAL</p>
              <h2>Which ritual fits your day?</h2>
            </div>
            <div className="ritual-grid">
              {ritualCards.map((card) => (
                <button key={card.number} type="button" onClick={() => scrollToProduct(card.targetId, card.title)}>
                  <span>{card.number}</span>
                  <em>{card.eyebrow}</em>
                  <strong>{card.title}</strong>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="cleansing section-shell" id="cleansing">
          <div className="section-inner section-inner--wide">
            <div className="section-heading">
              <p>01 · CLEANSING</p>
              <h2>
                A clearer way
                <span>to close the day.</span>
              </h2>
              <p className="section-copy">
                Three fragrance-free vegan cleansing options designed for different routines, from makeup removal to a simple daily wash.
              </p>
            </div>
            <div className="product-grid product-grid--three">
              {cleansingProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} tone="water" location="cleansing" />
              ))}
            </div>
          </div>
        </section>

        <section className="texture-editorial section-shell">
          <div className="section-inner section-inner--wide texture-editorial__grid">
            {[
              ["/images/foam-oil-texture.png", "OIL TO MILK", "A silky oil texture meets water and transforms into a soft milky emulsion."],
              ["/images/cleansing-foam-texture.png", "SOFT FOAM", "Airy micro-bubbles for a gentle everyday cleanse."],
              ["/images/cleansing-water-use.png", "QUICK RESET", "Clear cleansing water for light, effortless routines."],
            ].map(([src, title, body], index) => (
              <figure className={index === 0 ? "texture-card texture-card--large" : "texture-card"} key={title}>
                <img src={src} alt={`${title.toLowerCase()} editorial texture.`} width="900" height="760" loading="lazy" decoding="async" />
                <figcaption><span>{title}</span>{body}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="bridge section-shell" aria-label="Skin to space transition">
          <motion.div className="bridge__content" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.45 }}>
            <p>FROM SKIN TO SPACE</p>
            <h2>
              The day begins with water
              <span>and settles into stone.</span>
            </h2>
          </motion.div>
        </section>

        <section className="diffuser section-shell" id="diffuser">
          <div className="section-inner section-inner--wide">
            <div className="section-heading">
              <p>02 · SCENT</p>
              <h2>
                A quieter way
                <span>to scent a room.</span>
              </h2>
              <p className="section-copy">Jeju volcanic stone slowly carries a light citrus scent, without flame or electricity.</p>
            </div>
            <div className="product-grid product-grid--two">
              {diffuserProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} tone="sand" location="diffuser" />
              ))}
            </div>
          </div>
        </section>

        <section className="how-to section-shell">
          <div className="section-inner section-inner--wide how-to__grid">
            <div>
              <p className="eyebrow">HOW TO USE</p>
              <h2>No flame. No electricity. Scent when you choose.</h2>
            </div>
            {["Place the volcanic stones in the pot.", "Add 10–12 drops of citrus oil onto the stones.", "Allow the oil to absorb naturally.", "Add a few more drops whenever you want to refresh the scent."].map((text, index) => (
              <p key={text}><span>{String(index + 1).padStart(2, "0")}</span>{text}</p>
            ))}
          </div>
        </section>

        <section className="jeju-preview section-shell" id="explore">
          <div className="section-inner section-inner--wide jeju-preview__grid">
            <figure><img src="/images/jeju-sea-stone.png" alt="Jeju sea and volcanic stone." width="1200" height="900" loading="lazy" decoding="async" /></figure>
            <div className="section-heading">
              <p>OUR JEJU</p>
              <h2>Sea, wind and stone.</h2>
              <p className="section-copy">hondit began with the textures and quiet contrasts of Jeju: clear water, dark volcanic rock and landscapes shaped by wind.</p>
              <Link className="button button--primary" to="/jeju" onClick={() => trackJejuPreview("home_preview")}>Discover Our Jeju</Link>
            </div>
            <figure><img src="/images/jeju-canola-sea-stonewall.png" alt="Jeju canola flowers, sea and stone wall." width="1200" height="900" loading="lazy" decoding="async" /></figure>
          </div>
        </section>

        <section className="trust section-shell">
          <div className="section-inner section-inner--wide">
            <div className="trust-grid">
              {trustItems.map(([title, body]) => (
                <div key={title}><span /> <strong>{title}</strong><p>{body}</p></div>
              ))}
            </div>
            <p className="trust-note">Estimated delivery times may vary depending on order date and logistics.</p>
          </div>
        </section>

        <section className="faq section-shell" id="faq">
          <div className="section-inner section-inner--narrow">
            <div className="section-heading">
              <p>FAQ</p>
              <h2>Before you shop.</h2>
            </div>
            <FAQAccordion />
          </div>
        </section>

        <About />
      </main>
      <Footer />
    </>
  );
}
