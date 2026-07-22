import { Link } from "react-router-dom";
import { V23GeoJourney } from "../components/v23/GeoJourney";
import { V23Page } from "../components/v23/SiteChrome";

const jejuNotes = [
  { title: "Sea", kicker: "CLEAR COAST", text: "Open light and clean water give hondit's care selection its fresh, uncomplicated mood.", image: "/images/jeju-field-sea.webp", alt: "Clear water and dark volcanic rocks on Jeju's coast." },
  { title: "Stone", kicker: "VOLCANIC TEXTURE", text: "Jeju scoria is not just decoration: it is the reusable scent object at the centre of our diffuser.", image: "/images/jeju-field-jusangjeolli.webp", alt: "Dark volcanic columns at Jusangjeolli Cliff in Jeju." },
  { title: "Forest", kicker: "QUIET RHYTHM", text: "Shaded paths and slow movement shape a brand language that feels calm, useful and lived-in.", image: "/images/jeju-field-bijarim.webp", alt: "A quiet green trail through Bijarim Forest in Jeju." },
];

export function JejuPage() {
  return (
    <V23Page>
      <main className="v23-jeju-page">
        <section className="v23-our-jeju-hero">
          <div>
            <p className="v23-eyebrow"><span /> OUR JEJU - PROJECT ORIGIN</p>
            <h1>Not a theme.<br /><em>A real place.</em></h1>
            <p>hondit began in Jeju. This page shows the campus, coast, forest and volcanic landscapes behind the way we select and present everyday care and scent.</p>
            <a href="#field-guide">Open the Jeju field guide -&gt;</a>
          </div>
          <figure>
            <video autoPlay muted loop playsInline preload="metadata" poster="/images/jeju-field-seongsan.webp" aria-label="Gentle sea movement along the Jeju coast">
              <source src="/images/jeju-sea-motion.mp4" type="video/mp4" />
            </video>
            <figcaption><span>33.4580 N - 126.9425 E</span><strong>Sea rhythm, Jeju Island</strong></figcaption>
          </figure>
        </section>

        <div id="field-guide">
          <V23GeoJourney initialStage="jeju" compact />
        </div>

        <section className="v23-our-jeju-origin">
          <div>
            <p className="v23-eyebrow"><span /> HONDIT HOME - ARA CAMPUS</p>
            <h2>Built by students,<br /><em>grounded in Jeju.</em></h2>
            <p>hondit is an independent student-led cross-border commerce project based at Jeju National University. The campus is our working origin, not a product endorsement, and we make that relationship clear rather than borrowing the university name as decoration.</p>
            <address><span>JEJU NATIONAL UNIVERSITY - ARA CAMPUS</span>102 Jejudaehak-ro, Jeju-si, Jeju 63243, Republic of Korea</address>
            <a href="https://www.jejunu.ac.kr/eng/intro/guide/directions/aracampus.htm" target="_blank" rel="noreferrer">Verify on the official JNU website -&gt;</a>
          </div>
          <figure>
            <img src="/images/jeju-field-university.webp" alt="Jeju National University Ara Campus." />
            <figcaption><b>hondit.</b><span>JEJU NATIONAL UNIVERSITY-BASED<br />Independent student project</span></figcaption>
          </figure>
        </section>

        <section className="v23-jeju-notes">
          <header>
            <p className="v23-eyebrow"><span /> THREE REFERENCES</p>
            <h2>What Jeju contributes<br /><em>to the hondit language.</em></h2>
          </header>
          <div>
            {jejuNotes.map((note) => (
              <article key={note.title}>
                <img src={note.image} alt={note.alt} />
                <div><span>{note.kicker}</span><h3>{note.title}</h3><p>{note.text}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="v23-soft-cta">
          <div>
            <p className="v23-eyebrow"><span /> FROM PLACE TO RITUAL</p>
            <h2>Bring a quieter piece<br /><em>of Jeju into everyday life.</em></h2>
          </div>
          <div>
            <p>Explore the care and scent collection, or review direct PayPal checkout for larger orders.</p>
            <Link to="/products">Explore products</Link>
            <Link to="/bulk-orders">Bulk orders</Link>
          </div>
        </section>
      </main>
    </V23Page>
  );
}
