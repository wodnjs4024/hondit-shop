import { Link } from "react-router-dom";
import { Footer } from "../sections/Footer";

const jejuSections = [
  {
    eyebrow: "01 / THE ISLAND",
    title: "An island shaped slowly by water, wind and fire.",
    body: "Jeju carries contrasts within one landscape: clear coastlines, dark volcanic ground, open fields and stone walls built from the island itself.",
    images: ["/images/jeju-sea-stone.png"],
  },
  {
    eyebrow: "02 / THE SEA",
    title: "Clear at the edge, deeper beyond.",
    body: "Along Jeju's coast, pale sand, clear shallows and dark volcanic rock meet under changing light. The same shoreline can appear quiet, bright or deep, depending on the wind and tide.",
    images: ["/images/jeju-sea-detail.png", "/images/jeju-clear-water.png"],
  },
  {
    eyebrow: "03 / THE WIND",
    title: "Seen in the grass, heard along the stone walls.",
    body: "Wind is not a backdrop in Jeju. It draws lines through silver grass, opens the sky above the fields and carries the coast into the island's quieter paths.",
    images: ["/images/jeju-wind-mountain.png", "/images/jeju-wind-field.png", "/images/jeju-wind-coast.png"],
    layout: "wind",
  },
  {
    eyebrow: "04 / THE STONE",
    title: "Dark, porous and shaped by time.",
    body: "Volcanic rock remains across Jeju's coast, fields and villages. Its rough surface holds the history of an island formed through fire and water.",
    images: ["/images/jeju-volcanic-landscape.png", "/images/jeju-volcanic-rock.png"],
    dark: true,
  },
  {
    eyebrow: "05 / STONE WALLS",
    title: "Built from what the island gave.",
    body: "Jeju's stone walls were formed from local volcanic rock, stacked to endure strong winds while leaving space for air to pass. They remain part of the island's fields, coastlines and everyday landscapes.",
    images: ["/images/jeju-canola-sea-stonewall.png", "/images/jeju-stone-detail.png"],
  },
  {
    eyebrow: "06 / CITRUS ORCHARDS",
    title: "Green leaves, dark stone, and fruit under island light.",
    body: "Across Jeju, citrus orchards grow beside volcanic stone walls, bringing warmer colour into the island's quiet landscape.",
    images: ["/images/jeju-tangerine-stonewall.png"],
  },
];

export function JejuPage() {
  return (
    <main className="jeju-page">
      <section className="jeju-hero">
        <Link className="jeju-hero__back" to="/">Back to hondit</Link>
        <div className="jeju-hero__content">
          <p className="eyebrow">JEJU ISLAND</p>
          <h1>
            Where the sea,
            <span>wind and stone meet.</span>
          </h1>
          <p>An island shaped slowly by water, weather and time.</p>
          <span className="jeju-hero__scroll">Scroll to discover</span>
        </div>
      </section>

      {jejuSections.map((section, index) => (
        <section
          className={`jeju-story ${section.dark ? "jeju-story--dark" : ""} ${section.layout ? `jeju-story--${section.layout}` : ""}`}
          key={section.eyebrow}
        >
          <div className="jeju-story__copy">
            <p className="eyebrow">{section.eyebrow}</p>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </div>
          <div className={`jeju-story__images jeju-story__images--${section.images.length}`}>
            {section.images.map((src, imageIndex) => (
              <figure key={src} className="jeju-story__frame">
                <img
                  src={src}
                  alt={`${section.eyebrow.split("/").at(-1)?.trim() ?? "Jeju"} ${imageIndex + 1}`}
                  width="1200"
                  height="900"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </figure>
            ))}
          </div>
        </section>
      ))}

      <section className="jeju-closing">
        <div>
          <h2>From this island, hondit begins.</h2>
          <Link className="button button--primary" to="/">Return to hondit</Link>
        </div>
      </section>
      <Footer minimal />
    </main>
  );
}
