import { Link } from "react-router-dom";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { ABOUT_PAGE, FAQ_PAGE, SITE_FACTS, infoPageFor, type InfoPageContent } from "../../shared/info-content.js";
import { useMarket } from "../lib/market";

type Info = InfoPageContent;

const LABELS_JA: Record<string, string> = {
  "Jeju National University Ara Campus.": "済州大学校アラキャンパス",
  "Volcanic Diffuser 500g by a sunlit window.": "日の当たる窓辺に置いたボルカニックディフューザー 500g",
  "Maker pages": "メーカーページ", "Our channels": "運営チャンネル", "Questions and answers": "よくある質問",
  Products: "製品一覧", "Order conditions": "注文条件", Contact: "お問い合わせ", FAQ: "よくある質問", "About HONDIT": "HONDITについて",
};
const LABELS_ZH: Record<string, string> = {
  "Jeju National University Ara Campus.": "濟州大學 Ara 校園",
  "Volcanic Diffuser 500g by a sunlit window.": "放在陽光窗邊的火山石擴香 500g",
  "Maker pages": "製造商頁面", "Our channels": "官方渠道", "Questions and answers": "常見問題",
  Products: "產品", "Order conditions": "訂購條件", Contact: "聯絡我們", FAQ: "常見問題", "About HONDIT": "關於 HONDIT",
};

function InfoPage({ info: english, kind }: { info: Info; kind: "about" | "faq" }) {
  const { language } = useMarket();
  const ko = language === "ko";
  const ja = language === "ja";
  const zh = language === "zh-HK" || language === "zh-TW";
  const info = ko || ja || zh ? infoPageFor(kind, language) : english;
  const label = (en: string, kr: string) => (ko ? kr : ja ? (LABELS_JA[en] ?? en) : zh ? (LABELS_ZH[en] ?? en) : en);
  return (
    <V23Page>
      <main className="info-page">
        <V23PageHero
          eyebrow={kind === "about" ? "ABOUT HONDIT" : "QUESTIONS AND ANSWERS"}
          title={info.h1}
          description={info.intro[0]}
          image={kind === "about" ? "/images/jeju-field-university.webp" : "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/07_diffuser_500_window.webp"}
          imageAlt={kind === "about" ? label("Jeju National University Ara Campus.", "제주대학교 아라캠퍼스") : label("Volcanic Diffuser 500g by a sunlit window.", "창가에 둔 볼캐닉 디퓨저 500g")}
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
                <ul>{SITE_FACTS.makerPages.map(([label, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{ko ? `StoneJeju 볼캐닉 디퓨저 ${label.match(/\d+g/)?.[0] ?? ""} (제조사 페이지)` : ja ? `StoneJeju ボルカニックディフューザー ${label.match(/\d+g/)?.[0] ?? ""}（メーカーページ）` : zh ? `StoneJeju 火山石擴香 ${label.match(/\d+g/)?.[0] ?? ""}（製造商頁面）` : label}</a></li>)}</ul>
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
