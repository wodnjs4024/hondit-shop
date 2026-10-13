import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import locations from "../data/jejuStockists.json";
import { ourJejuBounds } from "../data/v23JejuData";
import { marketText, useMarket } from "../lib/market";
type Outline = { viewBox: string; locations: { id: string; path: string }[] };
export function JejuStoresPage() {
  const { language } = useMarket();
  const t = (s: string) => marketText(language, s);
  const stores = locations.filter((s) => s.published);
  const [selected, setSelected] = useState(stores[0].id);
  const [outline, setOutline] = useState<Outline | null>(null);
  useEffect(() => {
    let alive = true;
    import("@svg-maps/south-korea")
      .then((m) => {
        if (alive) setOutline(m.default as Outline);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  const active = stores.find((s) => s.id === selected)!;
  const name = (s: typeof active) =>
    language === "ko" ? s.name : `${s.nameEn} · ${s.name}`;
  const shape = outline?.locations.find((l) => l.id === "jeju");
  return (
    <V23Page>
      <main className="stockist-page">
        <header>
          <p className="v23-eyebrow">STONEJEJU · JEJU</p>
          <h1>{t("Meet StoneJeju in Jeju")}</h1>
          <p>
            {t(
              "Supplier-listed locations, not HONDIT partners. Check opening hours and stock before visiting.",
            )}
          </p>
          <p>{t("Location cross-checked; current stock and product range unconfirmed.")}</p><Link to="/jeju/pickup">{t("Jeju pickup information")} →</Link><Link to="/products">{t("Products")} →</Link>
        </header>
        <div className="stockist-layout">
          <section
            className="stockist-map"
            aria-label={t("Meet StoneJeju in Jeju")}
          >
            {shape ? (
              <svg
                viewBox="65 584 96 52"
                role="group"
                aria-label={t("Open map")}
              >
                <path
                  d={shape.path}
                  fill="#d9dfcf"
                  stroke="#74816a"
                  strokeWidth=".2"
                />
                {stores
                  .filter((s) => s.lat !== null && s.lon !== null)
                  .map((s) => {
                    const x =
                      73.744286 +
                      ((s.lon! - ourJejuBounds.west) /
                        (ourJejuBounds.east - ourJejuBounds.west)) *
                        76.780004;
                    const y =
                      588.55884 +
                      ((ourJejuBounds.north - s.lat!) /
                        (ourJejuBounds.north - ourJejuBounds.south)) *
                        41.73;
                    return (
                      <g
                        key={s.id}
                        role="button"
                        tabIndex={0}
                        aria-label={name(s)}
                        aria-pressed={s.id === selected}
                        transform={`translate(${x} ${y})`}
                        onClick={() => setSelected(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelected(s.id);
                          }
                        }}
                      >
                        <circle
                          r={s.id === selected ? 2.3 : 1.8}
                          fill={s.id === selected ? "#8a4d28" : "#23483f"}
                          stroke="#fff"
                          strokeWidth=".3"
                        />
                        <text
                          y=".7"
                          textAnchor="middle"
                          fill="white"
                          fontSize="2"
                        >
                          {stores.indexOf(s) + 1}
                        </text>
                      </g>
                    );
                  })}
              </svg>
            ) : (
              <p role="status">
                {t("List remains available if the map cannot load.")}
              </p>
            )}
            <article className="stockist-selected" aria-live="polite">
              <h2>{name(active)}</h2>
              <address>{active.address}</address>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(active.name + " " + active.address)}`}
                target="_blank"
                rel="noreferrer"
              >
                {t("Open map")} ↗
              </a>
            </article>
          </section>
          <ol className="stockist-list">
            {stores.map((s, i) => (
              <li key={s.id} className={s.id === selected ? "is-selected" : ""}>
                <button
                  type="button"
                  aria-pressed={s.id === selected}
                  onClick={() => setSelected(s.id)}
                >
                  {i + 1}. {name(s)}
                </button>
                <address>{s.address}</address>
                <small>
                  {t("Checked on")}: <time>{s.checkedOn}</time>
                </small>
                <div>
                  {s.officialUrl && (
                    <a href={s.officialUrl} target="_blank" rel="noreferrer">
                      {t("Official website")} ↗
                    </a>
                  )}{" "}
                  {s.locationSourceUrl && (
                    <a
                      href={s.locationSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("Location source")} ↗
                    </a>
                  )}{" "}
                  <a href={s.sourceUrl} target="_blank" rel="noreferrer">
                    StoneJeju ↗
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </V23Page>
  );
}
