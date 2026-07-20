import { Link } from "react-router-dom";
import { OurJejuFieldGuide } from "../components/OurJejuFieldGuide";
import { Footer } from "../sections/Footer";

const jejuNotes = [
  {
    title: "Sea",
    body: "Clear coastal water informs hondit's cleansing language: fresh, light and easy to return to.",
    image: "/images/jeju-field-sea.webp",
  },
  {
    title: "Stone",
    body: "Volcanic texture gives hondit its scent story: grounded, mineral and quietly enduring.",
    image: "/images/jeju-water-basalt-v2.webp",
  },
  {
    title: "Wind",
    body: "Jeju's shifting breeze keeps the brand calm rather than heavy, sensory rather than loud.",
    image: "/images/jeju-wind-coast-v2.webp",
  },
];

export function JejuPage() {
  return (
    <>
      <main className="editorial-page our-jeju-page">
        <section className="our-jeju-hero" aria-labelledby="our-jeju-title">
          <div className="our-jeju-hero__copy">
            <p className="eyebrow">OUR JEJU</p>
            <h1 id="our-jeju-title">
              Jeju is not a backdrop. It is the way hondit chooses, edits and ships.
            </h1>
            <p>
              We begin with Jeju's sea, stone, forest and campus origin, then translate that quiet landscape into
              care and scent products for Singapore.
            </p>
            <div className="our-jeju-hero__actions">
              <Link className="button button--dark" to="/products">
                Explore products
              </Link>
              <Link className="button button--outline" to="/bulk-orders">
                Open bulk checkout
              </Link>
            </div>
          </div>

          <figure className="our-jeju-hero__motion">
            <video
              src="/images/jeju-sea-motion.mp4"
              poster="/images/jeju-field-sea.webp"
              autoPlay
              muted
              loop
              playsInline
            />
            <figcaption>Jeju sea motion, used as atmosphere only. Product claims stay product-specific.</figcaption>
          </figure>
        </section>

        <OurJejuFieldGuide />

        <section className="our-jeju-origin">
          <div className="our-jeju-origin__copy">
            <p className="eyebrow">OUR ORIGIN · JEJU NATIONAL UNIVERSITY</p>
            <h2>Built by students. Grounded in Jeju.</h2>
            <p>
              hondit is an independent student-led commerce project based at Jeju National University. From our
              campus in Jeju City, we curate Korean care and scent products and make the cross-border buying journey
              clearer for customers in Singapore.
            </p>
            <div className="our-jeju-origin__address">
              <strong>JEJU NATIONAL UNIVERSITY-BASED</strong>
              <span>
                102 Jejudaehak-ro, Jeju-si · Independent student project; university location does not imply product
                endorsement.
              </span>
            </div>
            <div className="our-jeju-origin__columns">
              <div>
                <h3>Selected in Jeju</h3>
                <p>Products chosen with a clear Jeju story and everyday purpose.</p>
              </div>
              <div>
                <h3>Prepared for Singapore</h3>
                <p>English guidance, SGD display prices and familiar Shopee checkout.</p>
              </div>
              <div>
                <h3>Accountable payment</h3>
                <p>
                  Shopee handles retail orders; hondit's server verifies every completed PayPal capture for bulk
                  orders.
                </p>
              </div>
            </div>
            <a href="https://www.jejunu.ac.kr/eng/index.htm" target="_blank" rel="noreferrer">
              Visit the official JNU website ↗
            </a>
          </div>
          <figure className="our-jeju-origin__image">
            <img src="/images/jnu-campus.webp" alt="Jeju National University Ara Campus" loading="lazy" />
            <figcaption>Jeju National University Ara Campus · Photo: imagejeju, CC BY-SA 4.0</figcaption>
            <span aria-hidden="true">h.</span>
          </figure>
        </section>

        <section className="our-jeju-notes">
          <div className="our-jeju-notes__head">
            <p className="eyebrow">THE HONDIT EDIT</p>
            <h2>Three Jeju references we actually use.</h2>
          </div>
          <div className="our-jeju-notes__grid">
            {jejuNotes.map((note) => (
              <article key={note.title} className="our-jeju-note">
                <img src={note.image} alt={`${note.title} reference from Jeju`} loading="lazy" />
                <div>
                  <h3>{note.title}</h3>
                  <p>{note.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="soft-cta soft-cta--dark">
          <p className="eyebrow light">FROM JEJU TO SINGAPORE</p>
          <h2>Choose the route that fits your order.</h2>
          <p>
            Buy individual products on Shopee Singapore, or review MOQ and complete a larger direct order through
            PayPal checkout.
          </p>
          <div className="hero-actions">
            <a
              className="button button--accent"
              href="https://shopee.sg/hondit.office.sg"
              target="_blank"
              rel="noreferrer"
            >
              Shop on Shopee SG
            </a>
            <Link className="button button--ghost-light" to="/bulk-orders">
              Open bulk checkout
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
