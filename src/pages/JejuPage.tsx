import { stonejejuMediaCopy } from "../data/stonejejuMediaCopy";
import { marketText, useMarket } from "../lib/market";
import { Link } from "react-router-dom";
import { V23GeoJourney } from "../components/v23/GeoJourney";
import { V23Page } from "../components/v23/SiteChrome";
import { MaterialBand } from "../components/MaterialBand";


export function JejuPage() {
  const { language } = useMarket();
  const mediaCopy = stonejejuMediaCopy(language);
  return (
    <V23Page>
      <main className="v23-jeju-page">
        <section className="v23-our-jeju-hero">
          <div>
            <p className="v23-eyebrow"><span />{marketText(language,"OUR JEJU - PROJECT ORIGIN")}</p>
            <h1>{marketText(language,"Not a theme.")}<br /><em>{marketText(language,"A real place.")}</em></h1>
            <p>{marketText(language,"hondit began in Jeju. This page shows the campus, coast, forest and volcanic landscapes behind the way we select and present everyday care and scent.")}</p>
            <a href="#field-guide">{marketText(language,"Open the Jeju field guide ->")}</a>
          </div>
          <figure>
            <video autoPlay muted loop playsInline preload="metadata" poster="/images/jeju-field-seongsan.webp" aria-label="Gentle sea movement along the Jeju coast">
              <source src="/images/jeju-sea-motion.mp4" type="video/mp4" />
            </video>
            <figcaption><span>33.4580 N - 126.9425 E</span><strong>{marketText(language,"Sea rhythm, Jeju Island")}</strong></figcaption>
          </figure>
        </section>

        <div id="field-guide">
          <V23GeoJourney />
        </div>

        <section className="v23-our-jeju-origin">
          <div>
            <p className="v23-eyebrow"><span />{marketText(language,"HONDIT HOME - ARA CAMPUS")}</p>
            <h2>{marketText(language,"Built by students,")}<br /><em>{marketText(language,"grounded in Jeju.")}</em></h2>
            <p>{marketText(language,"hondit is an independent student-led cross-border commerce project based at Jeju National University. The campus is our working origin, not a product endorsement, and we make that relationship clear rather than borrowing the university name as decoration.")}</p>
            <address><span>{marketText(language,"JEJU NATIONAL UNIVERSITY - ARA CAMPUS")}</span>102 Jejudaehak-ro, Jeju-si, Jeju 63243, Republic of Korea</address>
            <a href="https://www.jejunu.ac.kr/eng/intro/guide/directions/aracampus.htm" target="_blank" rel="noreferrer">{marketText(language,"Verify on the official JNU website ->")}</a>
          </div>
          <figure>
            <img src="/images/jeju-field-university.webp" alt="Jeju National University Ara Campus." />
            <figcaption><b>hondit.</b><span>{marketText(language,"JEJU NATIONAL UNIVERSITY-BASED")}<br />{marketText(language,"Independent student project")}</span></figcaption>
          </figure>
        </section>

        <section className="v23-jeju-notes v23-jeju-notes--band">
          <header>
            <p className="v23-eyebrow"><span />{marketText(language,"THREE REFERENCES")}</p>
            <h2>{marketText(language,"What Jeju contributes")}<br /><em>{marketText(language,"to the hondit language.")}</em></h2>
          </header>
          <MaterialBand />
        </section>

        <section className="v23-soft-cta">
          <div>
            <p className="v23-eyebrow"><span />{marketText(language,"FROM PLACE TO RITUAL")}</p>
            <h2>{marketText(language,"Bring a quieter piece")}<br /><em>{marketText(language,"of Jeju into everyday life.")}</em></h2>
          </div>
          <div>
            <p>{marketText(language,"Explore the care and scent collection, or review direct PayPal checkout for larger orders.")}</p>
            <Link to="/products">{marketText(language,"Explore products")}</Link>
            <Link to="/bulk-orders">{marketText(language,"Bulk orders")}</Link>
          </div>
        </section>
      </main>
    </V23Page>
  );
}
