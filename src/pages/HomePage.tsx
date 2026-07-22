import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { V23CatalogGrid } from "../components/v23/CatalogGrid";
import { V23GeoJourney } from "../components/v23/GeoJourney";
import { V23Page } from "../components/v23/SiteChrome";
import { SHOPEE } from "../data/v23SiteData";

export function HomePage() {
  const diffuserVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = diffuserVideoRef.current;
    if (!video) return;

    const keepPlaying = () => {
      video.muted = true;
      video.defaultMuted = true;
      if (document.visibilityState === "hidden") return;
      const playRequest = video.play();
      if (playRequest) {
        playRequest.catch(() => undefined);
      }
    };

    keepPlaying();
    document.addEventListener("visibilitychange", keepPlaying);
    window.addEventListener("focus", keepPlaying);
    window.addEventListener("pageshow", keepPlaying);

    return () => {
      document.removeEventListener("visibilitychange", keepPlaying);
      window.removeEventListener("focus", keepPlaying);
      window.removeEventListener("pageshow", keepPlaying);
    };
  }, []);

  return (
    <V23Page>
      <main className="v23-home">
        <section className="v23-home-hero">
          <div className="v23-home-hero-copy">
            <p className="v23-eyebrow"><span /> JEJU NATIONAL UNIVERSITY - STUDENT-LED</p>
            <h1>Jeju, held in<br /><em>everyday ritual.</em></h1>
            <p>Vegan Korean cleansing care and volcanic-stone scent, selected in Jeju and delivered to Singapore with a clear way to buy.</p>
            <div className="v23-route-cards">
              <a href={SHOPEE} target="_blank" rel="noreferrer">
                <small>FOR INDIVIDUALS</small>
                <b>Buy on Shopee</b>
                <span>Live prices, vouchers and secure Singapore checkout.</span>
              </a>
              <Link to="/bulk-orders">
                <small>FOR BUSINESSES AND GROUPS</small>
                <b>Bulk Checkout</b>
                <span>Review MOQ, then pay securely through PayPal.</span>
              </Link>
            </div>
            <div className="v23-trust-row">
              <span>Jeju-based student team</span>
              <span>Official Shopee SG</span>
              <span>PayPal direct checkout</span>
            </div>
          </div>
          <figure className="v23-home-hero-media">
            <img src="/images/hondit-tidal-ritual-hero.webp" alt="hondit cleansing care and volcanic diffuser products on Jeju-inspired stone and water." />
          </figure>
        </section>

        <section className="v23-confidence">
          <article><small>ORIGIN</small><b>Jeju National University</b><p>Student-led and based in Jeju City.</p></article>
          <article><small>RETAIL</small><b>Official Shopee SG</b><p>Live price, vouchers and protected checkout.</p></article>
          <article><small>DELIVERY</small><b>Clear windows</b><p>Shopee 5-10 days - Bulk 3-5 days after dispatch.</p></article>
          <article><small>PAYMENT</small><b>Two clear routes</b><p>Shopee retail or secure PayPal direct checkout.</p></article>
        </section>

        <section className="v23-editorial-breeze">
          <img src="/images/hondit-jeju-dawn-hero-v2.webp" alt="Wind moving across a Jeju coastal field at dawn." />
          <div>
            <p className="v23-eyebrow is-light"><span /> SEA - STONE - WIND</p>
            <h2>A place you can feel,<br />before it becomes a ritual.</h2>
            <p>Our edit begins with Jeju's quiet materials: moving water, porous volcanic stone and air that never quite stands still.</p>
            <Link to="/jeju">Explore our Jeju -&gt;</Link>
          </div>
        </section>

        <V23GeoJourney />

        <section className="v23-products-section">
          <div className="v23-section-heading is-cream">
            <div>
              <p className="v23-eyebrow"><span /> SHOP BY RITUAL</p>
              <h2>Find your<br /><em>everyday fit.</em></h2>
            </div>
          </div>
          <V23CatalogGrid featuredOnly />
        </section>

        <section className="v23-diffuser-guide" aria-labelledby="v23-diffuser-title">
          <div className="v23-diffuser-guide__inner">
            <div className="v23-diffuser-guide__copy">
              <p className="v23-eyebrow is-light"><span /> VOLCANIC DIFFUSER</p>
              <h2 id="v23-diffuser-title">No flame. No electricity.<br />Refresh the scent whenever you choose.</h2>
              <p>Apply the citrus fragrance oil directly to the porous Jeju volcanic stone. The stone absorbs the oil and releases the scent naturally-without reed sticks, heat or electricity.</p>
            </div>

            <figure className="v23-diffuser-guide__video">
              <video
                ref={diffuserVideoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/images/stonejeju-diffuser-product.png"
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback"
                aria-label="Fragrance oil being applied directly to volcanic stone"
              >
                <source src="/videos/stonejeju-use-loop.mp4" type="video/mp4" />
              </video>
            </figure>

            <figure className="v23-diffuser-guide__product">
              <img src="/images/stonejeju-diffuser-product.png" alt="Jeju Volcanic Stone Diffuser with citrus fragrance oil, ceramic bowl and volcanic stones." />
              <figcaption>
                <strong>Jeju Volcanic Stone Diffuser</strong>
                <span>Volcanic stone / Citrus fragrance oil / Ceramic bowl</span>
                <span>Flameless / No electricity / Refreshable scent</span>
              </figcaption>
            </figure>
          </div>

          <div className="v23-diffuser-guide__steps" aria-label="How to use the volcanic diffuser">
            <article>
              <span>01</span>
              <b>ADD 10-12 DROPS</b>
              <p>Apply the fragrance oil directly onto the volcanic stone.</p>
            </article>
            <article>
              <span>02</span>
              <b>LET IT ABSORB</b>
              <p>Allow the porous stone to absorb the oil naturally.</p>
            </article>
            <article>
              <span>03</span>
              <b>REFRESH AS NEEDED</b>
              <p>Add a few more drops when the scent becomes lighter.</p>
            </article>
          </div>
        </section>
      </main>
    </V23Page>
  );
}
