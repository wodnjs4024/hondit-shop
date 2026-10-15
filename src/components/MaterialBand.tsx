import { useEffect, useRef, useState } from "react";
import { homeMediaCopy } from "../data/homeMediaCopy";
import { stonejejuMediaCopy } from "../data/stonejejuMediaCopy";
import { marketText, useMarket } from "../lib/market";

type Panel = {
  title: string;
  text?: string;
  poster: string;
  alt: string;
  film?: string;
  /** Where the subject sits, so narrow slices keep it in frame. */
  focus?: string;
  grow: number;
};

const PlayIcon = () => <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" /></svg>;

/*
 * Sea · Stone · Forest · Wind as one band of unequal panels.
 * The active panel (hovered, focused or tapped) widens and moves: a real film plays where one exists,
 * a still drifts slowly otherwise. Only the active panel moves; films pause off-screen, in a hidden tab,
 * under reduced motion and when the visitor pauses them.
 */
export function MaterialBand() {
  const { language } = useMarket();
  const t = (text: string) => marketText(language, text);
  const film = homeMediaCopy(language);
  const media = stonejejuMediaCopy(language);
  const [wind] = t("SEA - STONE - WIND").split(/\s*·\s*/).slice(2);
  const panels: Panel[] = [
    { title: t("Sea"), text: t("Open light and clean water give hondit's care selection its fresh, uncomplicated mood."), poster: "/images/jeju-water-basalt-v2.webp", alt: t("Clear Jeju water flowing across dark volcanic basalt."), grow: 5 },
    { title: t("Stone"), text: t("Jeju scoria is not just decoration: it is the reusable scent object at the centre of our diffuser."), poster: "/media/stonejeju/05_product_stone.webp", alt: media.detailStoneAlt, film: "/media/stonejeju/detail_product.mp4", focus: "36% 55%", grow: 2 },
    { title: t("Forest"), text: t("Shaded paths and slow movement shape a brand language that feels calm, useful and lived-in."), poster: "/media/stonejeju/04_forest.jpg", alt: media.forestAlt, film: "/media/stonejeju/our_jeju_forest.mp4", grow: 3 },
    { title: wind || "Wind", poster: "/images/jeju-wind-coast-v2.webp", alt: wind || "", grow: 2 },
  ];

  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState<Record<number, boolean>>({});
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const bandRef = useRef<HTMLDivElement>(null);
  const videos = useRef<Record<number, HTMLVideoElement | null>>({});

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(motion.matches);
    const onVisibility = () => setHidden(document.hidden);
    onMotion(); onVisibility();
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35), { threshold: [0, 0.35, 0.6] });
    if (bandRef.current) observer.observe(bandRef.current);
    return () => { observer.disconnect(); motion.removeEventListener("change", onMotion); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  useEffect(() => {
    panels.forEach((panel, index) => {
      const video = videos.current[index];
      if (!panel.film || !video) return;
      const shouldPlay = index === active && inView && !hidden && !reduced && !paused[index];
      if (shouldPlay) {
        if (!video.getAttribute("src")) video.setAttribute("src", panel.film);
        if (video.paused) video.play().catch(() => setPaused((state) => ({ ...state, [index]: true })));
      } else if (!video.paused) video.pause();
    });
  });

  return <div className="material-band" ref={bandRef} data-moving={!reduced && inView && !hidden ? "true" : undefined}>
    {panels.map((panel, index) => {
      const isActive = index === active;
      return <figure key={panel.poster} className={`material-band__panel${isActive ? " is-active" : ""}`}
        style={{ flexGrow: isActive ? Math.max(panel.grow, 5) + 1 : panel.grow }}
        onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
        {panel.film
          ? <video ref={(element) => { videos.current[index] = element; }} poster={panel.poster} style={panel.focus ? { objectPosition: panel.focus } : undefined} muted loop playsInline preload="none" aria-label={panel.alt} />
          : <img src={panel.poster} alt={panel.alt} loading="lazy" decoding="async" />}
        <figcaption>
          <button type="button" className="material-band__select" aria-pressed={isActive} onClick={() => setActive(index)}><b>{panel.title}</b></button>
          {panel.text && <span>{panel.text}</span>}
        </figcaption>
        {panel.film && <button type="button" className="material-band__toggle"
          aria-label={`${paused[index] || !isActive ? film.play : film.pause} · ${panel.title}`}
          onClick={(event) => { event.stopPropagation(); setActive(index); setPaused((state) => ({ ...state, [index]: isActive ? !state[index] : false })); }}>
          {isActive && !paused[index] && !reduced ? <PauseIcon /> : <PlayIcon />}
        </button>}
      </figure>;
    })}
  </div>;
}
