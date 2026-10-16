import { Link } from "react-router-dom";
import {
  diffuserFacts,
  diffuserCare,
  productFacts,
} from "../data/productFacts";
import { marketText, useMarket } from "../lib/market";
export function DiffuserComparison() {
  const { language } = useMarket();
  const t = (s: string) => marketText(language, s);
  return (
    <section className="sales-tools-section">
      <h2>{t("Compare the diffusers")}</h2>
      <div className="sales-tools-table">
        <table>
          <thead>
            <tr>
              <th>{t("Product specifications")}</th>
              {Object.entries(diffuserFacts).map(([slug, f]) => (
                <th key={slug}>
                  <Link to={`/products/${slug}`}>{f.content}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{t("Container")}</th>
              {Object.values(diffuserFacts).map((f) => (
                <td key={f.content}>{t(f.container)}</td>
              ))}
            </tr>
            <tr>
              <th>{t("Dimensions (W × H × D)")}</th>
              {Object.values(diffuserFacts).map((f) => (
                <td key={f.content}>{f.dimensions}</td>
              ))}
            </tr>
            <tr>
              <th>{t("Declared content")}</th>
              {Object.values(diffuserFacts).map((f) => (
                <td key={f.content}>{f.content}</td>
              ))}
            </tr>
            <tr>
              <th>{t("Product composition")}</th>
              {Object.values(diffuserFacts).map((f) => (
                <td key={f.content}>{t("Jeju volcanic scoria")}</td>
              ))}
            </tr>
            <tr>
              <th>{t("Citrus fragrance oil")}</th>
              {Object.values(diffuserFacts).map((f) => (
                <td key={f.content}>{f.oil}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        {t(
          "Product dimensions are not shipping box dimensions or packed weight.",
        )}
      </p>
      <p>
        {Object.entries(diffuserFacts).map(([slug, f]) => (
          <a key={slug} href={f.source} target="_blank" rel="noreferrer">
            {t("Supplier product source")} · {language==="ko"?f.officialName:f.content} ↗{" "}
          </a>
        ))}
      </p>
    </section>
  );
}
export function ProductCare({ slug }: { slug: string }) {
  const { language } = useMarket();
  if (!productFacts(slug)) return null;
  return (
    <section className="sales-tools-section">
      <h2>{marketText(language, "Product care & follow-up")}</h2>
      <ul>
        {diffuserCare.map((s) => (
          <li key={s}>{marketText(language, s)}</li>
        ))}
      </ul>
    </section>
  );
}
