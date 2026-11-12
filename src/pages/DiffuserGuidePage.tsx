import { Link, useLocation } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { diffuserGuide } from "../../shared/diffuser-guide.js";
import { diffuserGuideMarket } from "../../shared/diffuser-search-routes.js";
import { NotFoundPage } from "./NotFoundPage";

export function DiffuserGuidePage() {
  const option = diffuserGuideMarket(useLocation().pathname);
  if (!option) return <NotFoundPage />;
  const content = diffuserGuide(option);
  return (
    <V23Page>
      <main className="diffuser-guide" lang={option.lang}>
        <header className="diffuser-guide__intro">
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </header>
        <section className="diffuser-guide__comparison" aria-labelledby="diffuser-guide-comparison">
          <h2 id="diffuser-guide-comparison">{content.compare}</h2>
          <div className="diffuser-guide__models">
            {content.products.map((product) => (
              <article key={product.slug}>
                <img src={product.image} alt={product.name} width="880" height="1100" decoding="async" />
                <h3>{product.name}</h3>
                <p>{product.useCase}</p>
                <dl>
                  <div><dt>{content.specs}</dt><dd>{product.dimensions}</dd></div>
                  <div><dt>{content.included}</dt><dd>{content.oil}</dd></div>
                </dl>
                <p className="diffuser-guide__links">
                  <Link className="hd-textlink" to={product.detailsPath}>{content.details}</Link>
                  <Link className="hd-textlink" to={product.orderPath}>{content.order}</Link>
                  <a className="hd-textlink" href={product.source}>{content.source}</a>
                </p>
              </article>
            ))}
          </div>
          <p>{content.maker}</p>
        </section>
        <div className="diffuser-guide__answers">
          <section><h2>{content.how}</h2><p>{content.use}</p></section>
          <section><h2>{content.buy}</h2><p>{content.buying}</p></section>
          <section><h2>{content.pickup}</h2><p>{content.pickupNote}</p><Link className="hd-textlink" to={content.pickupPath}>{content.pickup}</Link></section>
        </div>
        <nav className="diffuser-guide__markets" aria-label={content.other}>
          {content.otherMarkets.map((market) => <Link key={market.market} className="hd-textlink" to={market.path} hrefLang={market.hreflang} lang={market.lang}>{market.label}</Link>)}
        </nav>
      </main>
    </V23Page>
  );
}
