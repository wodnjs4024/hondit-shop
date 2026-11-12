import { Link } from "react-router-dom";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { ABOUT_PAGE, ABOUT_PAGE_KO, FAQ_PAGE, FAQ_PAGE_KO, SITE_FACTS, type InfoPageContent } from "../../shared/info-content.js";
import { useMarket } from "../lib/market";

type Info = InfoPageContent;

function InfoPage({ info: english, kind }: { info: Info; kind: "about" | "faq" }) {
  const { language } = useMarket();
  const ko = language === "ko";
  const info = ko ? (kind === "about" ? ABOUT_PAGE_KO : FAQ_PAGE_KO) : english;
  const label = (en: string, kr: string) => (ko ? kr : en);
  return (
    <V23Page>
      <main className="info-page">
        <V23PageHero
          eyebrow={kind === "about" ? "ABOUT HONDIT" : "QUESTIONS AND ANSWERS"}
          title={info.h1}
          description={info.intro[0]}
          image="/images/jeju-field-university.webp"
          imageAlt={label("Jeju National University Ara Campus.", "제주대학교 아라캠퍼스")}
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
                <h2>{label("Maker pages", "제조사 페이지")}</h2>
                <ul>{SITE_FACTS.makerPages.map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{ko ? `StoneJeju 볼캐닉 디퓨저 ${label.match(/\d+g/)?.[0] ?? ""} (제조사 페이지)` : label}</a></li>)}</ul>
              </section>
              <section>
                <h2>{label("Our channels", "운영 채널")}</h2>
                <ul>{SITE_FACTS.profiles.map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="me noreferrer">{label}</a></li>)}</ul>
              </section>
            </>
          )}
          <section>
            <h2>{label("Questions and answers", "자주 묻는 질문")}</h2>
            {info.faq.map((item) => (
              <div key={item.q} className="info-page__qa">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </section>
          <p className="info-page__links">
            <Link to="/products">{label("Products", "상품")}</Link>
            <Link to="/bulk-orders">{label("Order conditions", "주문 조건")}</Link>
            <Link to="/contact">{label("Contact", "문의")}</Link>
            <Link to={kind === "about" ? "/faq" : "/about"}>{kind === "about" ? label("FAQ", "자주 묻는 질문") : label("About HONDIT", "HONDIT 소개")}</Link>
          </p>
        </article>
      </main>
    </V23Page>
  );
}

export const AboutPage = () => <InfoPage info={ABOUT_PAGE} kind="about" />;
export const FaqPage = () => <InfoPage info={FAQ_PAGE} kind="faq" />;
