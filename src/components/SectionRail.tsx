import { sections, type SectionId } from "../data/siteData";
import { trackSectionNav } from "../lib/analytics";

type SectionRailProps = {
  activeSection: SectionId;
  progress: number;
};

export function SectionRail({ activeSection, progress }: SectionRailProps) {
  const active = sections.find((section) => section.id === activeSection);
  const railTone = activeSection === "diffuser" || activeSection === "explore" ? " section-rail--dark" : "";
  const homeTone = activeSection === "home" ? " section-rail--home" : "";

  const handleClick = (id: SectionId, label: string) => {
    const target = document.getElementById(id);
    trackSectionNav(id, label);

    if (!target) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    history.pushState(null, "", `#${id}`);
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav className={`section-rail${railTone}${homeTone}`} aria-label="Section navigation">
      <div className="section-rail__progress" aria-hidden="true">
        <span style={{ transform: `scaleY(${progress})` }} />
      </div>
      <div className="section-rail__items">
        {sections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              className="section-rail__item"
              type="button"
              aria-label={`Go to ${section.label}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => handleClick(section.id, section.label)}
            >
              <span className="section-rail__dot" />
              <span className="section-rail__line" />
              <span className="section-rail__label">{section.label}</span>
            </button>
          );
        })}
      </div>
      {active && <span className="section-rail__mobile-label">{active.label}</span>}
    </nav>
  );
}
