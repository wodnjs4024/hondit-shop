import { Link } from "react-router-dom";
import { CampusVisual } from "../components/CampusVisual";
import { JejuJourney } from "../components/JejuJourney";
import { honditImages } from "../data/siteData";
import { Footer } from "../sections/Footer";

const jejuElements = [
  [honditImages.jejuSea, "Sea", "Clear, quiet and open. The feeling behind hondit's fresh cleansing ritual."],
  [honditImages.jejuStone, "Stone", "Dark volcanic texture, connected to the scent object we selected."],
  [honditImages.jejuWind, "Wind", "A soft movement that keeps the brand calm rather than loud."],
  [honditImages.fullLineReal, "Everyday Rituals", "Real care and scent products arranged for simple daily use."],
];

export function JejuPage() {
  return (
    <>
      <main className="editorial-page jeju-page-v2">
        <section className="editorial-hero editorial-hero--jeju">
          <img className="editorial-hero__image" src={honditImages.jejuHero} alt="" width="1920" height="1080" loading="eager" decoding="async" />
          <div className="editorial-hero__copy">
            <p className="eyebrow">OUR JEJU</p>
            <h1>Our Jeju</h1>
            <p>
              From Jeju's sea, volcanic stone and quiet rhythm, hondit brings selected Korean care and scent into everyday rituals.
            </p>
          </div>
        </section>

        <JejuJourney />

        <section className="jeju-origin-banner">
          <div>
            <p className="eyebrow">PROJECT ORIGIN</p>
            <h2>Created from Jeju, built for Singapore.</h2>
            <p>
              hondit is connected to Jeju National University through a student-led global trade project. The site keeps that origin visible while guiding buyers to Shopee retail and direct bulk ordering.
            </p>
          </div>
          <CampusVisual />
        </section>

        <section className="editorial-section jeju-elements">
          <div className="editorial-container">
            <div className="center-heading">
              <h2>Four references that shape hondit.</h2>
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
            <p>Jeju is not loud. It is the feeling of wind on your skin, the scent of the sea and the warmth of sunlight on stone.</p>
            <p>We believe that feeling can live in everyday moments.</p>
            <p>hondit curates real care and scent products through this point of view: simple, calm and useful enough for daily life.</p>
          </div>
          <figure>
            <img src={honditImages.diffuser350Stone} alt="hondit volcanic diffuser and Jeju volcanic stones styled on warm stone." loading="lazy" decoding="async" />
          </figure>
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
