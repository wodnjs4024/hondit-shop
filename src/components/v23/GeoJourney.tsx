import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatPlaceCoordinates, ourJejuBounds, ourJejuPlaces, type OurJejuPlace } from "../../data/v23JejuData";
import { marketText, useMarket } from "../../lib/market";
import { trackEvent } from "../../lib/analytics";

type MapStage = "asia" | "korea" | "jeju";
type SvgLocation = { id: string; path: string; name?: string };
type SvgMap = { viewBox: string; locations: SvgLocation[] };

const marketRoutes = {
  SG: { mapId: "sg", x: 768, y: 457, curve: "M 768 457 C 790 430, 820 397, 842 357" },
  HK: { mapId: "hk", x: 795.3, y: 398.8, curve: "M 795.3 398.8 C 812 385, 829 368, 842 357" },
  TW: { mapId: "tw", x: 839, y: 385, curve: "M 839 385 C 841 375, 842 366, 842 357" },
  JP: { mapId: "jp", x: 873, y: 344, curve: "M 873 344 C 862 345, 851 350, 842 357" },
} as const;

const asiaIds = new Set([
  "kr", "kp", "jp", "cn", "mn", "kz", "in", "bd", "mm", "th", "vn", "my", "sg", "hk", "id", "ph", "tw", "la", "kh", "np", "bt", "pk", "af", "lk",
]);

const asiaLabels = [
  { name: "Kazakhstan", x: 690, y: 304 },
  { name: "Mongolia", x: 793, y: 306 },
  { name: "China", x: 779, y: 360 },
  { name: "India", x: 720, y: 408 },
  { name: "Thailand", x: 779, y: 444 },
  { name: "Vietnam", x: 798, y: 437 },
  { name: "Malaysia", x: 777, y: 467 },
  { name: "Singapore", x: 768, y: 457 },
  { name: "Hong Kong", x: 786, y: 407 },
  { name: "Taiwan", x: 842, y: 398 },
  { name: "Indonesia", x: 818, y: 502 },
  { name: "Philippines", x: 829, y: 420 },
  { name: "Japan", x: 873, y: 344 },
] as const;

const koreaHighlights = [
  {
    title: "K-Beauty",
    label: "DAILY RITUAL",
    description: "Layered cleansing and gentle skincare made Korea globally recognisable.",
    image: "/images/korea/kbeauty.jpg",
    alt: "Hands applying face cream as part of a daily skincare ritual.",
  },
  {
    title: "Korean Food",
    label: "MARKET ENERGY",
    description: "Street markets and shared tables make food immediate and social.",
    image: "/images/korea/korean-food.webp",
    alt: "Fresh mandu served at a busy Korean street-food stall in Seoul.",
  },
  {
    title: "Seoul",
    label: "CITY",
    description: "A fast capital where older places meet new culture.",
    image: "/images/korea/seoul-night.webp",
    alt: "Seoul skyline and Namsan Tower illuminated after sunset.",
  },
  {
    title: "Heritage",
    label: "PLACE",
    description: "Hanbok and historic palaces remain visible in everyday Seoul.",
    image: "/images/korea/hanbok.webp",
    alt: "People wearing hanbok beside a historic palace wall in Seoul.",
  },
] as const;

const jejuViewBox = { x: 65, y: 584, width: 96, height: 52 };
const jejuPathBox = { x: 73.744286, y: 588.55884, width: 76.780004, height: 41.73 };

function projectJeju(place: OurJejuPlace) {
  const x = jejuPathBox.x + ((place.lon - ourJejuBounds.west) / (ourJejuBounds.east - ourJejuBounds.west)) * jejuPathBox.width;
  const y = jejuPathBox.y + ((ourJejuBounds.north - place.lat) / (ourJejuBounds.north - ourJejuBounds.south)) * jejuPathBox.height;
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

function onActivate(event: KeyboardEvent, action: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

export function V23GeoJourney({ initialStage = "asia", compact = false }: { initialStage?: MapStage; compact?: boolean }) {
  const [stage, setStage] = useState<MapStage>(initialStage);
  const [selectedId, setSelectedId] = useState(ourJejuPlaces[0].id);
  const [worldMap, setWorldMap] = useState<SvgMap | null>(null);
  const [southKoreaMap, setSouthKoreaMap] = useState<SvgMap | null>(null);
  const { language, market } = useMarket();
  const t = (text: string) => marketText(language, text);
  const marketRoute = marketRoutes[market.code];
  const active = useMemo(() => ourJejuPlaces.find((place) => place.id === selectedId) || ourJejuPlaces[0], [selectedId]);
  const activeIndex = ourJejuPlaces.findIndex((place) => place.id === active.id);
  const selectStage = (nextStage: MapStage, source: string) => {
    setStage(nextStage);
    trackEvent("map_stage_select", { map_stage: nextStage, interaction_source: source });
  };
  const selectPlace = (place: OurJejuPlace, source: string) => {
    setSelectedId(place.id);
    trackEvent("map_place_select", { place_id: place.id, place_name: place.name, interaction_source: source });
  };
  const asiaLocations = useMemo(
    () => (worldMap?.locations || []).filter((location) => asiaIds.has(location.id)),
    [worldMap],
  );
  const jejuShape = useMemo(
    () => southKoreaMap?.locations.find((location) => location.id === "jeju"),
    [southKoreaMap],
  );

  useEffect(() => {
    if (stage !== "asia" || worldMap) return;
    import("@svg-maps/world").then((module) => setWorldMap(module.default as SvgMap)).catch(() => undefined);
  }, [stage, worldMap]);

  useEffect(() => {
    if ((stage !== "korea" && stage !== "jeju") || southKoreaMap) return;
    import("@svg-maps/south-korea").then((module) => setSouthKoreaMap(module.default as SvgMap)).catch(() => undefined);
  }, [southKoreaMap, stage]);

  return (
    <section className={compact ? "v23-journey is-compact" : "v23-journey"} id="discover">
      {!compact && (
        <div className="v23-section-heading">
          <div>
            <p className="v23-eyebrow is-light"><span /> {t("A REAL ROUTE TO OUR ORIGIN")}</p>
            <h2>{t("Asia to Korea.")}<br /><em>{t("Korea to Jeju.")}</em></h2>
          </div>
          <p>{t("Three clear geographic views locate hondit without covering the map: accurate country boundaries, South Korea as the only highlighted country, then real coordinates on Jeju.")}</p>
        </div>
      )}

      {!compact && (
        <div className="v23-map-tabs" aria-label={t("Map navigation")}>
          <button data-stage="asia" className={stage === "asia" ? "is-active" : ""} type="button" onClick={() => selectStage("asia", "map_tabs")}><span>01</span><b>{t("Asia")}</b><small>{t("Regional context")}</small></button>
          <button data-stage="korea" className={stage === "korea" ? "is-active" : ""} type="button" onClick={() => selectStage("korea", "map_tabs")}><span>02</span><b>{t("South Korea")}</b><small>{t("Find Jeju below")}</small></button>
          <button data-stage="jeju" className={stage === "jeju" ? "is-active" : ""} type="button" onClick={() => selectStage("jeju", "map_tabs")}><span>03</span><b>{t("Jeju Island")}</b><small>{t("Explore six places")}</small></button>
        </div>
      )}

      <div className="v23-map-shell">
        {stage === "asia" && (
          <div className="v23-map-stage">
            <aside className="v23-map-copy">
              <span>01</span>
              <p>{t("REGIONAL CONTEXT")}</p>
              <h3>{t("Find South Korea without losing Asia.")}</h3>
              <p>{t("Country boundaries remain neutral. South Korea is the only highlighted country and is selectable.")}</p>
            </aside>
            <div className="v23-asia-panel">
              <div className="v23-map-canvas">
                <svg viewBox="675 270 235 250" role="img" aria-label={`Map of East and Southeast Asia with the route from ${market.countryName} to South Korea highlighted`}>
                  <rect x="675" y="270" width="235" height="250" className="v23-map-water" />
                  {!worldMap && <text className="v23-map-loading-label" x="792" y="392">{t("Loading map...")}</text>}
                  {asiaLocations.map((location) => {
                    const isKorea = location.id === "kr";
                    const isMarket = location.id === marketRoute.mapId;
                    return (
                      <path
                        key={location.id}
                        d={location.path}
                        className={isKorea ? "is-korea" : isMarket ? "is-market" : ""}
                        role={isKorea ? "button" : undefined}
                        tabIndex={isKorea ? 0 : undefined}
                        onClick={isKorea ? () => selectStage("korea", "asia_map") : undefined}
                        onKeyDown={isKorea ? (event) => onActivate(event, () => selectStage("korea", "asia_map_keyboard")) : undefined}
                        aria-label={isKorea ? t("Open South Korea map") : undefined}
                      />
                    );
                  })}
                  <path className="v23-asia-route" d={marketRoute.curve} />
                  <circle className="v23-route-origin" cx={marketRoute.x} cy={marketRoute.y} r="3.4" />
                  <circle className="v23-route-destination" cx="842" cy="357" r="4.2" />
                  {asiaLabels.map((label) => <text key={label.name} x={label.x} y={label.y}>{label.name}</text>)}
                </svg>
              </div>
              <aside className="v23-asia-route-card">
                <small>{t("ROUTE TO ORIGIN")}</small>
                <h3>{market.countryName} {t("to Jeju")}</h3>
                <ol>
                  <li><span>01</span><div><b>{market.countryName}</b><small>{t("Market connection")}</small></div></li>
                  <li><span>02</span><div><b>{t("South Korea")}</b><small>{t("Country context")}</small></div></li>
                  <li><span>03</span><div><b>{t("Jeju Island")}</b><small>{t("hondit origin")}</small></div></li>
                </ol>
                <button type="button" onClick={() => selectStage("korea", "asia_continue_button")}>{t("Continue to South Korea")}</button>
              </aside>
            </div>
          </div>
        )}

        {stage === "korea" && (
          <div className="v23-map-stage is-korea">
            <aside className="v23-map-copy">
              <span>02</span>
              <p>{t("A CLOSER VIEW")}</p>
              <h3>{t("Jeju sits below the peninsula.")}</h3>
              <p>{t("The province outline is real map data. Select the orange Jeju Island shape to continue.")}</p>
              <button type="button" onClick={() => selectStage("asia", "korea_back_button")}>{t("Back to Asia")}</button>
            </aside>
            <div className="v23-korea-panel">
              <div className="v23-korea-map">
                <svg viewBox={southKoreaMap?.viewBox || "0 0 524 631"} role="img" aria-label={t("Map of South Korea with Jeju highlighted")}>
                  <rect width="524" height="631" className="v23-map-water" />
                  {!southKoreaMap && <text className="v23-map-loading-label" x="262" y="315">{t("Loading map...")}</text>}
                  {(southKoreaMap?.locations || []).map((location) => {
                    const isJeju = location.id === "jeju";
                    return (
                      <path
                        key={location.id}
                        d={location.path}
                        className={isJeju ? "is-jeju" : "is-province"}
                        role={isJeju ? "button" : undefined}
                        tabIndex={isJeju ? 0 : undefined}
                        onClick={isJeju ? () => selectStage("jeju", "korea_map") : undefined}
                        onKeyDown={isJeju ? (event) => onActivate(event, () => selectStage("jeju", "korea_map_keyboard")) : undefined}
                        aria-label={isJeju ? t("Open Jeju Island map") : undefined}
                      />
                    );
                  })}
                  <text x="260" y="95">{t("SOUTH KOREA")}</text>
                  <text x="118" y="579">{t("JEJU STRAIT")}</text>
                </svg>
              </div>
              <aside className="v23-korea-cards" aria-label={t("What Korea is known for")}>
                <header><small>{t("BEYOND THE MAP")}</small><h3>{t("What the world knows Korea for.")}</h3></header>
                <div>
                  {koreaHighlights.map((item) => (
                    <article key={item.title}>
                      <img src={item.image} alt={item.alt} loading="lazy" />
                      <span>{t(item.label)}</span>
                      <h4>{t(item.title)}</h4>
                      <p>{t(item.description)}</p>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        )}

        {stage === "jeju" && (
          <div className="v23-jeju-stage">
            <div className="v23-jeju-toolbar">
              {compact ? <span /> : <button type="button" onClick={() => selectStage("korea", "jeju_back_button")}>{t("Back to South Korea")}</button>}
              <div><small>{t("JEJU ISLAND FIELD GUIDE")}</small><b>{t("Six places, one clear origin")}</b></div>
              <span>{t("REAL COORDINATES")}</span>
            </div>
            <div className="v23-jeju-layout">
              <div className="v23-jeju-map" aria-label={t("Interactive map of Jeju Island")}>
                <svg viewBox={`${jejuViewBox.x} ${jejuViewBox.y} ${jejuViewBox.width} ${jejuViewBox.height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("Jeju Island outline")}>
                  <rect x={jejuViewBox.x} y={jejuViewBox.y} width={jejuViewBox.width} height={jejuViewBox.height} className="v23-map-water" />
                  {jejuShape && <path d={jejuShape.path} className="v23-jeju-shape" />}
                  {ourJejuPlaces.map((place, index) => {
                    const position = projectJeju(place);
                    const markerLabel = place.featured ? "H" : String(index).padStart(2, "0");
                    const activeMarker = active.id === place.id;
                    return (
                      <g
                        key={place.id}
                        className={activeMarker ? "v23-jeju-marker is-active" : "v23-jeju-marker"}
                        transform={`translate(${position.x} ${position.y})`}
                        role="button"
                        tabIndex={0}
                        onClick={() => selectPlace(place, "map_marker")}
                        onKeyDown={(event) => onActivate(event, () => selectPlace(place, "map_marker_keyboard"))}
                        aria-label={`${t("View")} ${t(place.name)}`}
                      >
                        <circle r={activeMarker ? "2.9" : "2.35"} />
                        <text x="0" y="0.9">{markerLabel}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <article className="v23-place-card" aria-live="polite">
                <img src={active.image} alt={active.alt} loading="lazy" />
                <div>
                  <span>{t(active.category)}</span>
                  <small>{formatPlaceCoordinates(active)} - {String(activeIndex + 1).padStart(2, "0")} / {String(ourJejuPlaces.length).padStart(2, "0")}</small>
                  <h3>{t(active.name)}</h3>
                  <p>{t(active.description)}</p>
                  <address>{t(active.location)}</address>
                  <a href={active.officialUrl} target="_blank" rel="noreferrer">{t(active.officialLabel)}</a>
                  {active.featured && <Link to="/jeju">{t("Our Jeju story")}</Link>}
                </div>
              </article>
            </div>
            <nav className="v23-jeju-tabs" aria-label={t("Choose a Jeju place")}>
              {ourJejuPlaces.map((place, index) => (
                <button key={place.id} type="button" className={active.id === place.id ? "is-active" : ""} onClick={() => selectPlace(place, "place_tabs")}>
                  <span aria-hidden="true">{place.featured ? "H" : String(index).padStart(2, "0")}</span>
                  <strong>{t(place.shortName)}</strong>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
