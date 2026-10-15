import { useEffect, useMemo, useState } from "react";
import { aboutCopy } from "../data/aboutCopy";
import { formatPlaceCoordinates, ourJejuPlaces } from "../data/v23JejuData";
import { marketCountryName, marketText, useMarket } from "../lib/market";
import { asiaIds, jejuViewBox, marketRoutes, projectJeju } from "./v23/GeoJourney";

type SvgMap = { viewBox: string; locations: { id: string; path: string }[] };

/* Jeju on the same projection the market markers were verified against (@svg-maps/world). */
const jejuPoint = { x: 829.3, y: 367.4 };
/* Reference city coordinates for the straight-line distance shown under the route. */
const marketCities: Record<string, [number, number]> = { SG: [1.29, 103.85], MY: [3.14, 101.69], TH: [13.76, 100.5], HK: [22.32, 114.17], MO: [22.2, 113.54], TW: [25.03, 121.56], JP: [35.68, 139.69], BN: [4.94, 114.95] };
const JEJU: [number, number] = [33.5, 126.53];

function kilometres([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const r = Math.PI / 180, a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return Math.round((6371 * 2 * Math.asin(Math.sqrt(a))) / 50) * 50;
}

/** One map from the visitor's market to Jeju: no tabs, no side panels, only the three places that matter. */
export function OriginRoute() {
  const { market, language } = useMarket();
  const t = (s: string) => marketText(language, s);
  const c = aboutCopy(language);
  const [world, setWorld] = useState<SvgMap | null>(null);
  useEffect(() => { import("@svg-maps/world").then((m) => setWorld(m.default as SvgMap)).catch(() => undefined); }, []);
  const route = marketRoutes[market.code];
  const country = marketCountryName(market, language);
  const km = kilometres(marketCities[market.code] ?? marketCities.SG, JEJU);
  const mid = { x: (route.x + jejuPoint.x) / 2 + 26, y: (route.y + jejuPoint.y) / 2 + 6 };
  const asia = useMemo(() => (world?.locations || []).filter((l) => asiaIds.has(l.id)), [world]);
  return <section className="about-route" aria-labelledby="about-route-title">
    <div className="about-route__copy">
      <h2 id="about-route-title">{c.route(country)}</h2>
      <p>{c.routeBody}</p>
      <ol className="about-route__steps">
        <li><span>01</span><b>{country}</b><small>{t("Market connection")}</small></li>
        <li><span>02</span><b>{c.korea}</b><small>{t("Country context")}</small></li>
        <li><span>03</span><b>{c.jeju}</b><small>{c.origin}</small></li>
      </ol>
      <p className="about-route__distance">{c.distance} <strong>{km.toLocaleString("en-US")} km</strong></p>
    </div>
    <figure className="about-route__map">
      <svg viewBox="700 290 190 190" role="img" aria-label={c.route(country)}>
        <rect x="700" y="290" width="190" height="190" className="about-map__sea" />
        {asia.map((l) => <path key={l.id} d={l.path} className={l.id === "kr" ? "is-korea" : l.id === route.mapId ? "is-market" : ""} />)}
        <path className="about-map__route" d={`M ${route.x} ${route.y} Q ${mid.x} ${mid.y} ${jejuPoint.x} ${jejuPoint.y}`} />
        <circle className="about-map__market" cx={route.x} cy={route.y} r="2.6" />
        <circle className="about-map__jeju" cx={jejuPoint.x} cy={jejuPoint.y} r="3.2" />
        <text className="about-map__label" x={route.x - 4} y={route.y + 9} textAnchor="end">{country}</text>
        <text className="about-map__label is-strong" x={jejuPoint.x + 5} y={jejuPoint.y + 4}>{c.jeju}</text>
        <text className="about-map__label is-quiet" x="836" y="343">{c.korea}</text>
      </svg>
    </figure>
  </section>;
}

/** The six real places on Jeju, as a numbered map beside a list. Choosing either opens the place. */
export function JejuFieldGuide() {
  const { language } = useMarket();
  const t = (s: string) => marketText(language, s);
  const c = aboutCopy(language);
  const [korea, setKorea] = useState<SvgMap | null>(null);
  const [activeId, setActiveId] = useState(ourJejuPlaces[0].id);
  useEffect(() => { import("@svg-maps/south-korea").then((m) => setKorea(m.default as SvgMap)).catch(() => undefined); }, []);
  const shape = korea?.locations.find((l) => l.id === "jeju");
  const active = ourJejuPlaces.find((p) => p.id === activeId) ?? ourJejuPlaces[0];
  const mark = (index: number) => String(index + 1).padStart(2, "0");
  return <section className="about-field" aria-labelledby="about-field-title">
    <header className="about-field__head">
      <h2 id="about-field-title">{c.field}</h2>
      <p>{c.fieldBody}</p>
    </header>
    <div className="about-field__grid">
      <figure className="about-field__map">
        <svg viewBox={`${jejuViewBox.x + 6} ${jejuViewBox.y + 3} ${jejuViewBox.width - 12} ${jejuViewBox.height - 12}`} role="group" aria-label={t("Jeju Island outline")}>
          {shape && <path d={shape.path} className="about-field__island" />}
          {ourJejuPlaces.map((place, index) => {
            const p = projectJeju(place), on = place.id === active.id;
            return <g key={place.id} className={on ? "about-field__pin is-active" : "about-field__pin"} transform={`translate(${p.x} ${p.y})`}
              role="button" tabIndex={0} aria-pressed={on} aria-label={t(place.name)}
              onClick={() => setActiveId(place.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveId(place.id); } }}>
              <circle r={on ? 3.1 : 2.4} /><text y="0.95">{mark(index)}</text>
            </g>;
          })}
        </svg>
      </figure>
      <ol className="about-field__list">
        {ourJejuPlaces.map((place, index) => <li key={place.id}>
          <button type="button" aria-pressed={place.id === active.id} onClick={() => setActiveId(place.id)}>
            <span>{mark(index)}</span><b>{t(place.name)}</b><small>{t(place.category)}</small>
          </button>
        </li>)}
      </ol>
      <article className="about-field__place" aria-live="polite">
        <img src={active.image} alt={t(active.alt)} loading="lazy" />
        <div>
          <small>{formatPlaceCoordinates(active)}</small>
          <h3>{t(active.name)}</h3>
          <p>{t(active.description)}</p>
          <address>{t(active.location)}</address>
          <p className="about-field__links"><a href={active.officialUrl} target="_blank" rel="noreferrer">{c.official} ↗</a><a href={active.photoUrl} target="_blank" rel="noreferrer">{c.credit}: {active.photoCredit}</a></p>
        </div>
      </article>
    </div>
  </section>;
}
