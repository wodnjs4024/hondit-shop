import { Link } from "react-router-dom";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { ABOUT_PAGE, FAQ_PAGE, SITE_FACTS, type InfoPageContent } from "../../shared/info-content.js";

type Info = InfoPageContent;

function InfoPage({ info, kind }: { info: Info; kind: "about" | "faq" }) {
  return (
    <V23Page>
      <main className="info-page">
        <V23PageHero
          eyebrow={kind === "about" ? "ABOUT HONDIT" : "QUESTIONS AND ANSWERS"}
          title={info.h1}
          description={info.intro[0]}
          image="/images/jeju-field-university.webp"
          imageAlt="Jeju National University Ara Campus."
        />
        <article className="info-page__body">
          {info.intro.slice(1).map((text) => <p key={text} className="info-page__lead">{text}</p>)}
          {info.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {(section.paragraphs || []).map((text) => <p key={text}>{text}</p>)}
              {section.items && <ul>{section.items.map((text) => <li key={text}>{text}</li>)}</ul>}
              {section.links && (
                <p className="info-page__links">
                  {section.links.map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}
                </p>
              )}
            </section>
          ))}
          {kind === "about" && (
            <>
              <section>
                <h2>Maker pages</h2>
                <ul>{SITE_FACTS.makerPages.map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{label}</a></li>)}</ul>
              </section>
              <section>
                <h2>Our channels</h2>
                <ul>{SITE_FACTS.profiles.map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="me noreferrer">{label}</a></li>)}</ul>
              </section>
            </>
          )}
          <section>
            <h2>Questions and answers</h2>
            {info.faq.map((item) => (
              <div key={item.q} className="info-page__qa">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </section>
          <p className="info-page__links">
            <Link to="/products">Products</Link>
            <Link to="/bulk-orders">Order conditions</Link>
            <Link to="/contact">Contact</Link>
            <Link to={kind === "about" ? "/faq" : "/about"}>{kind === "about" ? "FAQ" : "About HONDIT"}</Link>
          </p>
        </article>
      </main>
    </V23Page>
  );
}

export const AboutPage = () => <InfoPage info={ABOUT_PAGE} kind="about" />;
export const FaqPage = () => <InfoPage info={FAQ_PAGE} kind="faq" />;
