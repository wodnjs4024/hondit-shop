import { Link } from "react-router-dom";
import { Footer } from "../sections/Footer";

const jejuElements = [
  ["/images/jeju-sea-stone.png", "Sea", "Pure and vast. The origin of life and clarity in every breath."],
  ["/images/jeju-wind-field.png", "Breeze", "Soft and constant. Carrying the scent of Jeju across the island."],
  ["/images/jeju-volcanic-rock.png", "Stone", "Ancient and enduring. Shaped by time, grounding and strong."],
  ["/images/jeju-tangerine-stonewall.png", "Plants", "Resilient and generous. Nourishing, healing and full of quiet power."],
  ["/images/singapore-bedroom-desk.png", "Quiet Living", "Slow and intentional. The beauty of less, and living with meaning."],
];

const scentCare = [
  ["Scents from Jeju", "/images/jeju-tangerine-stonewall.png", "Citrus & Green", "Bright, refreshing notes inspired by Jeju's sunlight and green forests."],
  ["Scents from Jeju", "/images/jeju-sea-detail.png", "Sea & Mineral", "Clean mineral accords echoing the vast Jeju ocean."],
  ["Scents from Jeju", "/images/jeju-wind-mountain.png", "Herbal & Woody", "Earthy, calming aromas rooted in Jeju's native herbs and woods."],
  ["Care from Jeju", "/images/jeju-volcanic-rock.png", "Jeju Volcanic Stone", "Rich in minerals, known for purifying and balancing."],
  ["Care from Jeju", "/images/jeju-tangerine-stonewall.png", "Jeju Plants", "Harvested with care, full of antioxidants and gentle energy."],
  ["Care from Jeju", "/images/jeju-clear-water.png", "Deep Sea Water", "Clean mineral water that nourishes and revitalizes the skin."],
];

export function JejuPage() {
  return (
    <>
      <main className="editorial-page jeju-page-v2">
        <section className="editorial-hero editorial-hero--jeju">
          <div className="editorial-hero__copy">
            <p className="eyebrow">OUR JEJU</p>
            <h1>Our Jeju</h1>
            <p>
              From the sea, wind, stone and plants of Jeju, hondit brings the island's quiet energy into your everyday rituals.
            </p>
          </div>
        </section>

        <section className="editorial-section jeju-elements">
          <div className="editorial-container">
            <div className="center-heading">
              <h2>Five elements that shape our everyday.</h2>
            </div>
            <div className="jeju-elements__grid">
              {jejuElements.map(([src, title, body]) => (
                <article key={title}>
                  <img src={src} alt={`${title} from Jeju island.`} loading="lazy" decoding="async" />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="jeju-belief">
          <div className="jeju-belief__copy">
            <h2>Why hondit. exists</h2>
            <p>Jeju is not loud. It is the feeling of wind on your skin, the scent of the sea, the warmth of sunlight on stone.</p>
            <p>We believe that feeling can live in everyday moments.</p>
            <p>hondit. curates Jeju's raw materials and stories, transforming them into scent and care products that bring balance, comfort and calm to your life.</p>
          </div>
          <figure>
            <img src="/images/singapore-bathroom.png" alt="hondit care product in a quiet lifestyle setting." loading="lazy" decoding="async" />
          </figure>
        </section>

        <section className="editorial-section jeju-sources">
          <div className="editorial-container">
            <div className="center-heading">
              <h2>Inspired by Jeju. Created for everyday care.</h2>
            </div>
            <div className="jeju-sources__grid">
              {scentCare.map(([group, src, title, body]) => (
                <article key={`${group}-${title}`}>
                  <p>{group}</p>
                  <img src={src} alt={title} loading="lazy" decoding="async" />
                  <h3>{title}</h3>
                  <span>{body}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="soft-cta soft-cta--image">
          <div>
            <h2>Bring the feeling of Jeju into your everyday rituals.</h2>
          </div>
          <Link className="button button--dark" to="/products">Explore Products</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
