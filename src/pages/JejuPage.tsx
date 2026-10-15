import { stonejejuMediaCopy } from "../data/stonejejuMediaCopy";
import { marketText, useMarket } from "../lib/market";
import { Link } from "react-router-dom";
import { JejuFieldGuide, OriginRoute } from "../components/OriginJourney";
import { V23Page } from "../components/v23/SiteChrome";
import { MaterialBand } from "../components/MaterialBand";


export function JejuPage() {
  const { language } = useMarket();
  const mediaCopy = stonejejuMediaCopy(language);
  return (
    <V23Page>
      <main className="v23-jeju-page about-page">
        <section className="about-hero">
          <video autoPlay muted loop playsInline preload="metadata" poster="/images/jeju-field-seongsan.webp" aria-label="Gentle sea movement along the Jeju coast">
            <source src="/images/jeju-sea-motion.mp4" type="video/mp4" />
          </video>
          <div className="about-hero__copy">
            <p className="about-hero__coords">33.4580 N - 126.9425 E · {marketText(language,"Sea rhythm, Jeju Island")}</p>
            <h1>{marketText(language,"Not a theme.")}<br /><em>{marketText(language,"A real place.")}</em></h1>
            <p>{marketText(language,"hondit began in Jeju. This page shows the campus, coast, forest and volcanic landscapes behind the way we select and present everyday care and scent.")}</p>
            <a href="#field-guide">{marketText(language,"Open the Jeju field guide ->")}</a>
          </div>
        </section>

        <OriginRoute />

        <section className="about-origin">
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

        <div id="field-guide">
          <JejuFieldGuide />
        </div>

        <section className="v23-jeju-notes v23-jeju-notes--band">
          <header>
            <p className="v23-eyebrow"><span />{marketText(language,"THREE REFERENCES")}</p>
            <h2>{marketText(language,"What Jeju contributes")}<br /><em>{marketText(language,"to the hondit language.")}</em></h2>
          </header>
          <MaterialBand />
        </section>

        <section className="v23-soft-cta about-cta">
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
