import { useMemo, useState } from "react";
import { ourJejuBounds, ourJejuPlaces } from "../data/ourJejuData";

function projectJejuPoint(latitude: number, longitude: number) {
  const x = ((longitude - ourJejuBounds.west) / (ourJejuBounds.east - ourJejuBounds.west)) * 100;
  const y = ((ourJejuBounds.north - latitude) / (ourJejuBounds.north - ourJejuBounds.south)) * 100;

  return {
    x: Math.min(92, Math.max(8, x)),
    y: Math.min(86, Math.max(12, y)),
  };
}

export function OurJejuFieldGuide() {
  const [activeId, setActiveId] = useState(ourJejuPlaces[0].id);
  const activePlace = ourJejuPlaces.find((place) => place.id === activeId) ?? ourJejuPlaces[0];

  const mappedPlaces = useMemo(
    () =>
      ourJejuPlaces.map((place, index) => {
        const point = projectJejuPoint(place.latitude, place.longitude);
        const label = {
          x: Math.min(94, Math.max(6, point.x + place.markerOffset.x)),
          y: Math.min(90, Math.max(10, point.y + place.markerOffset.y)),
        };

        return {
          ...place,
          index,
          point,
          label,
        };
      }),
    [],
  );

  return (
    <section className="our-jeju-guide" id="field-guide" aria-labelledby="field-guide-title">
      <div className="our-jeju-guide__intro">
        <p className="eyebrow light">JEJU ISLAND FIELD GUIDE</p>
        <h2 id="field-guide-title">Meet Jeju, one landscape at a time.</h2>
        <p>VOLCANIC HEART · FOREST TRAILS · COAST & ISLANDS · HONDIT HOME</p>
      </div>

      <div className="our-jeju-guide__stage">
        <div className="our-jeju-map-card">
          <div className="our-jeju-map" aria-label="Interactive editorial map of Jeju Island">
            <img src="/images/map-jeju-editorial.svg" alt="" aria-hidden="true" loading="lazy" />
            <svg className="our-jeju-map__links" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
              {mappedPlaces.map((place) => (
                <line
                  key={place.id}
                  x1={place.point.x}
                  y1={place.point.y}
                  x2={place.label.x}
                  y2={place.label.y}
                />
              ))}
            </svg>

            {mappedPlaces.map((place) => {
              const isActive = place.id === activePlace.id;
              const label = place.featured ? "H" : String(place.index).padStart(2, "0");

              return (
                <button
                  key={place.id}
                  type="button"
                  className={`our-jeju-map__point ${place.featured ? "is-home" : ""} ${isActive ? "is-active" : ""}`}
                  style={{ left: `${place.point.x}%`, top: `${place.point.y}%` }}
                  aria-label={`Show ${place.name}`}
                  onClick={() => setActiveId(place.id)}
                >
                  {label}
                </button>
              );
            })}

            {mappedPlaces.map((place) => {
              const isActive = place.id === activePlace.id;
              const label = place.featured ? "hondit home" : String(place.index).padStart(2, "0");

              return (
                <button
                  key={`${place.id}-label`}
                  type="button"
                  className={`our-jeju-map__label ${isActive ? "is-active" : ""}`}
                  style={{ left: `${place.label.x}%`, top: `${place.label.y}%` }}
                  onClick={() => setActiveId(place.id)}
                >
                  <span>{label}</span>
                  {isActive ? <strong>{place.shortName}</strong> : null}
                </button>
              );
            })}
          </div>
          <p className="our-jeju-map-card__note">
            Location markers use real latitude and longitude, projected into one consistent map frame.
          </p>
        </div>

        <article className="our-jeju-place-card">
          <img src={activePlace.image} alt={`${activePlace.name} in Jeju`} loading="lazy" />
          <div>
            <p className="eyebrow">{activePlace.category}</p>
            <h3>{activePlace.name}</h3>
            <p>{activePlace.description}</p>
            <dl>
              <div>
                <dt>Address</dt>
                <dd>{activePlace.location}</dd>
              </div>
              <div>
                <dt>Coordinates</dt>
                <dd>
                  {activePlace.latitude.toFixed(4)}, {activePlace.longitude.toFixed(4)}
                </dd>
              </div>
            </dl>
            <div className="our-jeju-place-card__links">
              <a href={activePlace.officialUrl} target="_blank" rel="noreferrer">
                {activePlace.officialLabel} ↗
              </a>
              <a href={activePlace.photoUrl} target="_blank" rel="noreferrer">
                Photo: {activePlace.photoCredit} ↗
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
