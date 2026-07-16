import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "../lib/analytics";
import { allJejuPoints, asiaCountryLabels, university, type JejuPlace } from "../data/jejuJourneyData";

type MapStage = "asia" | "korea" | "jeju";

function stageLabel(stage: MapStage) {
  if (stage === "asia") return "Asia";
  if (stage === "korea") return "South Korea";
  return "Jeju Island";
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
      await navigator.clipboard.writeText(selected.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="journey-section" aria-labelledby="jeju-journey-title">
      <div className="editorial-container journey-section__inner">
        <div className="journey-heading">
          <p className="eyebrow">FROM ASIA TO JEJU</p>
          <h2 id="jeju-journey-title">Find Korea in Asia. Follow hondit to Jeju.</h2>
          <p>
            This map journey connects the market we serve with the island and university where hondit's project began.
          </p>
        </div>

        <div className="map-breadcrumbs" aria-label="Map journey steps">
          {(["asia", "korea", "jeju"] as MapStage[]).map((item, index) => (
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
            <span>04</span>
            Jeju National University
          </button>
        </div>

        <div className="map-shell" data-stage={stage}>
          {stage === "asia" && (
            <div className="map-stage asia-canvas">
              <div className="map-side-copy">
                <span>01 Asia</span>
                <strong>Start from the wider region.</strong>
                <p>hondit is built for Singapore buyers, but its origin sits northeast in Korea.</p>
              </div>
              <div className="map-canvas">
                <img src="/images/map-asia.webp" alt="Illustrated map of Asia highlighting Korea." loading="lazy" decoding="async" />
                {asiaCountryLabels.map((label) => (
                  <span key={label.name} className="country-label" style={{ left: `${label.x}%`, top: `${label.y}%` }}>
                    {label.name}
                  </span>
                ))}
                <button
                  type="button"
                  className="journey-pin journey-pin--korea"
                  style={{ left: "68%", top: "32%" }}
                  onClick={() => moveStage("korea", "asia_pin")}
                  aria-label="Open South Korea map"
                >
                  Korea
                </button>
              </div>
            </div>
          )}

          {stage === "korea" && (
            <div className="map-stage korea-canvas">
              <div className="map-side-copy">
                <span>02 South Korea</span>
                <strong>Move down to Jeju.</strong>
                <p>Jeju sits south of the Korean peninsula, where sea air and volcanic stone shape the island's identity.</p>
              </div>
              <div className="map-canvas">
                <img src="/images/map-korea-friendly.webp" alt="Illustrated map of Korea with Jeju Island highlighted." loading="lazy" decoding="async" />
                <button
                  type="button"
                  className="journey-pin journey-pin--jeju"
                  style={{ left: "31%", top: "78%" }}
                  onClick={() => moveStage("jeju", "korea_pin")}
                  aria-label="Open Jeju Island map"
                >
                  Jeju
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
                <span>{allJejuPoints.length} Jeju references</span>
              </div>

              <div className="jeju-layout">
                <div className="jeju-map" aria-label="Jeju reference map">
                  <img src="/images/map-jeju.webp" alt="Illustrated map of Jeju with hondit reference points." loading="lazy" decoding="async" />
                  {allJejuPoints.map((point, index) => (
                    <button
                      key={point.id}
                      type="button"
                      className={`marker ${point.featured ? "marker--featured" : ""} ${selected.id === point.id ? "is-active" : ""}`}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      onClick={() => choosePlace(point)}
                      aria-label={`Show ${point.name}`}
                    >
                      {point.featured ? "H" : index}
                    </button>
                  ))}
                </div>

                <article className="place-card">
                  <img src={selected.image} alt={`${selected.name} in Jeju.`} loading="lazy" decoding="async" />
                  <div className="place-card__body">
                    <span>{selected.tag}</span>
                    <h3>{selected.name}</h3>
                    <p>{selected.note}</p>
                    <address>{selected.address}</address>
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
