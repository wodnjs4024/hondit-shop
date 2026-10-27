import {policyTranslation} from '../data/policyTranslations';
import {policyKo} from "../data/policyKo";
import { Link, useParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { getPolicyContent } from "../../shared/policy-content.js";
export { getPolicyContent };
import { marketCountryName, marketText, useMarket } from "../lib/market";
import { NotFoundPage } from "./NotFoundPage";

export function PolicyPage() {
  const { market, language } = useMarket();
  const { policy = "terms" } = useParams();
  const countryName = marketCountryName(market, "en");
  const content = getPolicyContent(policy, countryName, market.currency, market.hasShopee);

  if (!content) return <NotFoundPage />;
  const translate=(text:string)=>language==="ko"?policyKo(text,marketCountryName(market,"ko"),market.currency):language==="ja"||language.startsWith("zh")?policyTranslation(text,language,marketCountryName(market,language),market.currency):text;

  return (
    <V23Page>
      <main className="v23-policy-page">
        <article className="v23-policy-shell">
          <header className="v23-policy-head">
          <p className="v23-eyebrow">
            <span /> {marketText(language,"HONDIT POLICY")}
          </p>
          <h1>{marketText(language,content.title)}</h1>
          {language !== "en" && language!=="ko" && language!=="ja" && !language.startsWith("zh") && <p role="note">{marketText(language,"Policy text is currently available in English. The original wording is shown below.")}</p>}
          <p className="v23-policy-intro" lang={language}>{translate(content.intro)}</p>
          </header>
          {content.sections.map((section) => (
            <section className="v23-policy-section" lang={language} key={translate(section.heading)}>
              <h2>{translate(section.heading)}</h2>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{translate(item)}</li>
                ))}
              </ul>
            </section>
          ))}
          <div className="v23-policy-actions">
            <Link to="/bulk-orders">{marketText(language,"Return to Bulk Orders")}</Link>
            <Link to="/contact">{marketText(language,"Contact hondit")}</Link>
          </div>
        </article>
      </main>
    </V23Page>
  );
}
