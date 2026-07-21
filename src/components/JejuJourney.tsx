import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "../lib/analytics";
import { allJejuPoints, jejuMapBounds, university, type JejuPlace } from "../data/jejuJourneyData";

type MapStage = "asia" | "korea" | "jeju";

const stageOrder: MapStage[] = ["asia", "korea", "jeju"];

const stageCopy: Record<MapStage, { eyebrow: string; title: string; body: string }> = {
  asia: {
    eyebrow: "01 ASIA",
    title: "Start with the wider region.",
    body: "A soft travel map shows Korea in Asia without adding extra markers to Singapore, Japan or other countries.",
  },
  korea: {
    eyebrow: "02 SOUTH KOREA",
    title: "Move down to Jeju.",
    body: "Jeju is marked from its real position south of the Korean peninsula, with the label kept outside the island.",
  },
  jeju: {
    eyebrow: "03 JEJU ISLAND",
    title: "Meet Jeju, one landscape at a time.",
    body: "Each point is projected from latitude and longitude, so the field guide stays aligned on desktop and mobile.",
  },
};

function stageLabel(stage: MapStage) {
  if (stage === "asia") return "Asia";
  if (stage === "korea") return "South Korea";
  return "Jeju Island";
}

function projectJeju(place: JejuPlace) {
  const x = ((place.lon - jejuMapBounds.west) / (jejuMapBounds.east - jejuMapBounds.west)) * 100;
  const y = ((jejuMapBounds.north - place.lat) / (jejuMapBounds.north - jejuMapBounds.south)) * 100;
  return {
    pointX: Number(x.toFixed(2)),
    pointY: Number(y.toFixed(2)),
    markerX: Number((x + (place.labelOffsetX || 0)).toFixed(2)),
    markerY: Number((y + (place.labelOffsetY || 0)).toFixed(2)),
  };
}

function coords(place: JejuPlace) {
  return `${place.lat.toFixed(4)} N, ${place.lon.toFixed(4)} E`;
}

export function JejuJourney() {
  const [stage, setStage] = useState<MapStage>("asia");
  const [selectedId, setSelectedId] = useState(university.id);
  const [copied, setCopied] = useState(false);

  const selected = useMemo(
    () => allJejuPoints.find((point) => point.id === selectedId) || university,
    [selectedId],
  );

  const moveStage = (nextStage: MapStage, source: string) => {
    setStage(nextStage);
    trackEvent("jeju_map_stage", { stage: nextStage, source });
  };

  const choosePlace = (place: JejuPlace) => {
    setSelectedId(place.id);
    trackEvent("jeju_map_place", { place_id: place.id });
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${selected.address} (${coords(selected)})`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const mapPoints = allJejuPoints.map((point, index) => ({
    point,
    index,
    position: projectJeju(point),
  }));

  return (
    <section className="journey-section" aria-labelledby="jeju-journey-title">
      <div className="editorial-container journey-section__inner">
        <div className="journey-heading">
          <p className="eyebrow">FROM ASIA TO JEJU</p>
          <h2 id="jeju-journey-title">Find Korea in Asia. Follow hondit to Jeju.</h2>
          <p>
            A softer field-guide map connects the market we serve with the island and university where hondit's project began.
          </p>
        </div>

        <div className="map-breadcrumbs" aria-label="Map journey steps">
          {stageOrder.map((item, index) => (
            <button
              key={item}
              type="button"
              className={stage === item ? "is-active" : ""}
              onClick={() => moveStage(item, "breadcrumb")}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {stageLabel(item)}
            </button>
          ))}
          <button
            type="button"
            className={stage === "jeju" && selected.id === university.id ? "is-active" : ""}
            onClick={() => {
              setSelectedId(university.id);
              moveStage("jeju", "university_breadcrumb");
            }}
          >
            <span>H</span>
            hondit home
          </button>
        </div>

        <div className="map-shell" data-stage={stage}>
          {stage === "asia" && (
            <div className="map-stage journey-map-stage">
              <div className="map-side-copy">
                <span>{stageCopy.asia.eyebrow}</span>
                <strong>{stageCopy.asia.title}</strong>
                <p>{stageCopy.asia.body}</p>
              </div>
              <div className="map-canvas map-canvas--region">
                <img src="/images/map-asia.webp" alt="Pastel travel map of Asia with South Korea marked." loading="lazy" decoding="async" />
                <span className="region-dot" style={{ left: "75.3%", top: "28.5%" }} aria-hidden="true" />
                <span className="region-connector" style={{ left: "75.3%", top: "28.5%", width: "10.4%", transform: "rotate(-18deg)" }} aria-hidden="true" />
                <button
                  type="button"
                  className="journey-pin journey-pin--external"
                  style={{ left: "82.6%", top: "23.8%" }}
                  onClick={() => moveStage("korea", "asia_pin")}
                  aria-label="Open South Korea map"
                >
                  South Korea
                </button>
              </div>
            </div>
          )}

          {stage === "korea" && (
            <div className="map-stage journey-map-stage">
              <div className="map-side-copy">
                <span>{stageCopy.korea.eyebrow}</span>
                <strong>{stageCopy.korea.title}</strong>
                <p>{stageCopy.korea.body}</p>
              </div>
              <div className="map-canvas map-canvas--korea">
                <img src="/images/map-korea-friendly.webp" alt="Pastel map of Korea with Jeju Island marked." loading="lazy" decoding="async" />
                <span className="region-dot" style={{ left: "31.9%", top: "82.2%" }} aria-hidden="true" />
                <span className="region-connector" style={{ left: "31.9%", top: "82.2%", width: "12.5%", transform: "rotate(28deg)" }} aria-hidden="true" />
                <button
                  type="button"
                  className="journey-pin journey-pin--external"
                  style={{ left: "43.2%", top: "84.8%" }}
                  onClick={() => moveStage("jeju", "korea_pin")}
                  aria-label="Open Jeju Island field guide"
                >
                  Jeju Island
                </button>
              </div>
            </div>
          )}

          {stage === "jeju" && (
            <div className="map-stage jeju-stage">
              <div className="map-toolbar">
                <button type="button" onClick={() => moveStage("korea", "jeju_back")}>
                  Back to Korea
                </button>
                <span>{allJejuPoints.length} verified Jeju references</span>
              </div>

              <div className="jeju-field-heading">
                <p>JEJU ISLAND FIELD GUIDE</p>
                <h3>Meet Jeju, one landscape at a time.</h3>
                <span>VOLCANIC HEART · FOREST TRAILS · COAST & ISLANDS · HONDIT HOME</span>
              </div>

              <div className="jeju-layout">
                <div className="jeju-map" aria-label="Jeju field guide map">
                  <img src="/images/map-jeju-editorial.svg" alt="Pastel field guide map of Jeju Island." loading="lazy" decoding="async" />
                  <svg className="marker-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    {mapPoints.map(({ point, position }) => (
                      <line
                        key={point.id}
                        x1={position.pointX}
                        y1={position.pointY}
                        x2={position.markerX}
                        y2={position.markerY}
                      />
                    ))}
                  </svg>
                  {mapPoints.map(({ point, index, position }) => (
                    <span
                      key={`${point.id}-origin`}
                      className={`marker-origin ${point.featured ? "marker-origin--featured" : ""}`}
                      style={{ left: `${position.pointX}%`, top: `${position.pointY}%` }}
                      aria-hidden="true"
                    />
                  ))}
                  {mapPoints.map(({ point, index, position }) => (
                    <button
                      key={point.id}
                      type="button"
                      className={`marker ${point.featured ? "marker--featured" : ""} ${selected.id === point.id ? "is-active" : ""}`}
                      style={{ left: `${position.markerX}%`, top: `${position.markerY}%` }}
                      onClick={() => choosePlace(point)}
                      aria-label={`Show ${point.name}`}
                      data-place-id={point.id}
                    >
                      <span>{point.featured ? "H" : index}</span>
                      <small>{point.mapLabel}</small>
                    </button>
                  ))}
                </div>

                <article className="place-card">
                  <img src={selected.image} alt={`${selected.name} in Jeju.`} loading="lazy" decoding="async" />
                  <div className="place-card__body">
                    <span>{selected.tag}</span>
                    <h3>{selected.name}</h3>
                    <p>{selected.note}</p>
                    <dl className="place-meta">
                      <div>
                        <dt>Address</dt>
                        <dd>{selected.address}</dd>
                      </div>
                      <div>
                        <dt>Coordinates</dt>
                        <dd>{coords(selected)}</dd>
                      </div>
                    </dl>
                    <div className="place-card__actions">
                      <button type="button" onClick={copyAddress}>{copied ? "Copied" : "Copy address"}</button>
                      <a href="https://www.jejunu.ac.kr/eng/" target="_blank" rel="noreferrer">JNU website</a>
                      <Link to="/contact">Contact hondit</Link>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
