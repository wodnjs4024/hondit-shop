import worldMap from "@svg-maps/world";
import southKoreaMap from "@svg-maps/south-korea";
import { KeyboardEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatPlaceCoordinates, ourJejuBounds, ourJejuPlaces, type OurJejuPlace } from "../../data/v23JejuData";

type MapStage = "asia" | "korea" | "jeju";
type SvgLocation = { id: string; path: string; name?: string };

const asiaIds = new Set([
  "kr", "kp", "jp", "cn", "mn", "kz", "in", "bd", "mm", "th", "vn", "my", "sg", "id", "ph", "tw", "la", "kh", "np", "bt", "pk", "af", "lk",
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

const jejuShape = (southKoreaMap.locations as SvgLocation[]).find((location) => location.id === "jeju");
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
  const active = useMemo(() => ourJejuPlaces.find((place) => place.id === selectedId) || ourJejuPlaces[0], [selectedId]);
  const activeIndex = ourJejuPlaces.findIndex((place) => place.id === active.id);
  const asiaLocations = (worldMap.locations as SvgLocation[]).filter((location) => asiaIds.has(location.id));

  return (
    <section className={compact ? "v23-journey is-compact" : "v23-journey"} id="discover">
      {!compact && (
        <div className="v23-section-heading">
          <div>
            <p className="v23-eyebrow is-light"><span /> A REAL ROUTE TO OUR ORIGIN</p>
            <h2>Asia to Korea.<br /><em>Korea to Jeju.</em></h2>
          </div>
          <p>Three clear geographic views locate hondit without covering the map: accurate country boundaries, South Korea as the only highlighted country, then real coordinates on Jeju.</p>
        </div>
      )}

      {!compact && (
        <div className="v23-map-tabs" aria-label="Map navigation">
          <button data-stage="asia" className={stage === "asia" ? "is-active" : ""} type="button" onClick={() => setStage("asia")}><span>01</span><b>Asia</b><small>Regional context</small></button>
          <button data-stage="korea" className={stage === "korea" ? "is-active" : ""} type="button" onClick={() => setStage("korea")}><span>02</span><b>South Korea</b><small>Find Jeju below</small></button>
          <button data-stage="jeju" className={stage === "jeju" ? "is-active" : ""} type="button" onClick={() => setStage("jeju")}><span>03</span><b>Jeju Island</b><small>Explore six places</small></button>
        </div>
      )}

      <div className="v23-map-shell">
        {stage === "asia" && (
          <div className="v23-map-stage">
            <aside className="v23-map-copy">
              <span>01</span>
              <p>REGIONAL CONTEXT</p>
              <h3>Find South Korea without losing Asia.</h3>
              <p>Country boundaries remain neutral. South Korea is the only highlighted country and is selectable.</p>
            </aside>
            <div className="v23-map-canvas">
              <svg viewBox="650 245 290 285" role="img" aria-label="Map of Asia with South Korea highlighted">
                <rect x="650" y="245" width="290" height="285" className="v23-map-water" />
                {asiaLocations.map((location) => {
                  const isKorea = location.id === "kr";
                  return (
                    <path
                      key={location.id}
                      d={location.path}
                      className={isKorea ? "is-korea" : ""}
                      role={isKorea ? "button" : undefined}
                      tabIndex={isKorea ? 0 : undefined}
                      onClick={isKorea ? () => setStage("korea") : undefined}
                      onKeyDown={isKorea ? (event) => onActivate(event, () => setStage("korea")) : undefined}
                      aria-label={isKorea ? "Open South Korea map" : undefined}
                    />
                  );
                })}
                {asiaLabels.map((label) => <text key={label.name} x={label.x} y={label.y}>{label.name}</text>)}
              </svg>
            </div>
          </div>
        )}

        {stage === "korea" && (
          <div className="v23-map-stage is-korea">
            <aside className="v23-map-copy">
              <span>02</span>
              <p>A CLOSER VIEW</p>
              <h3>Jeju sits below the peninsula.</h3>
              <p>The province outline is real map data. Select the orange Jeju Island shape to continue.</p>
              <button type="button" onClick={() => setStage("asia")}>Back to Asia</button>
            </aside>
            <div className="v23-korea-panel">
              <div className="v23-korea-map">
                <svg viewBox={southKoreaMap.viewBox} role="img" aria-label="Map of South Korea with Jeju highlighted">
                  <rect width="524" height="631" className="v23-map-water" />
                  {(southKoreaMap.locations as SvgLocation[]).map((location) => {
                    const isJeju = location.id === "jeju";
                    return (
                      <path
                        key={location.id}
                        d={location.path}
                        className={isJeju ? "is-jeju" : "is-province"}
                        role={isJeju ? "button" : undefined}
                        tabIndex={isJeju ? 0 : undefined}
                        onClick={isJeju ? () => setStage("jeju") : undefined}
                        onKeyDown={isJeju ? (event) => onActivate(event, () => setStage("jeju")) : undefined}
                        aria-label={isJeju ? "Open Jeju Island map" : undefined}
                      />
                    );
                  })}
                  <text x="260" y="95">SOUTH KOREA</text>
                  <text x="118" y="579">JEJU STRAIT</text>
                </svg>
              </div>
              <aside className="v23-korea-cards" aria-label="What Korea is known for">
                <header><small>BEYOND THE MAP</small><h3>What the world knows Korea for.</h3></header>
                <div>
                  {koreaHighlights.map((item) => (
                    <article key={item.title}>
                      <img src={item.image} alt={item.alt} loading="lazy" />
                      <span>{item.label}</span>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
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
              {compact ? <span /> : <button type="button" onClick={() => setStage("korea")}>Back to South Korea</button>}
              <div><small>JEJU ISLAND FIELD GUIDE</small><b>Six places, one clear origin</b></div>
              <span>REAL COORDINATES</span>
            </div>
            <div className="v23-jeju-layout">
              <div className="v23-jeju-map" aria-label="Interactive map of Jeju Island">
                <svg viewBox={`${jejuViewBox.x} ${jejuViewBox.y} ${jejuViewBox.width} ${jejuViewBox.height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Jeju Island outline">
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
                        onClick={() => setSelectedId(place.id)}
                        onKeyDown={(event) => onActivate(event, () => setSelectedId(place.id))}
                        aria-label={`View ${place.name}`}
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
                  <span>{active.category}</span>
                  <small>{formatPlaceCoordinates(active)} - {String(activeIndex + 1).padStart(2, "0")} / {String(ourJejuPlaces.length).padStart(2, "0")}</small>
                  <h3>{active.name}</h3>
                  <p>{active.description}</p>
                  <address>{active.location}</address>
                  <a href={active.officialUrl} target="_blank" rel="noreferrer">{active.officialLabel}</a>
                  {active.featured && <Link to="/jeju">Our Jeju story</Link>}
                </div>
              </article>
            </div>
            <nav className="v23-jeju-tabs" aria-label="Choose a Jeju place">
              {ourJejuPlaces.map((place, index) => (
                <button key={place.id} type="button" className={active.id === place.id ? "is-active" : ""} onClick={() => setSelectedId(place.id)}>
                  <span>{place.featured ? "H" : String(index).padStart(2, "0")}</span>{place.shortName}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
