import { useEffect, useRef, useState } from "react";
import { useMarket } from "../lib/market";
import { stonejejuMediaCopy } from "../data/stonejejuMediaCopy";
import { homeMediaCopy } from "../data/homeMediaCopy";

type FilmKind = "product" | "forest" | "detail";
const films = {
  product: { file: "home_product.mp4", poster: "02_product_moss.jpg" },
  forest: { file: "our_jeju_forest.mp4", poster: "04_forest.jpg" },
  detail: { file: "detail_product.mp4", poster: "05_product_stone.webp" },
};

/*
 * Only one film plays at a time: the most visible film (at least 35% in view) is elected.
 * The current film keeps playing until another is clearly more visible, so sections that
 * share the viewport do not flip back and forth. Off-screen pauses never count as user pauses.
 */
const PLAY_RATIO = 0.35, SWITCH_MARGIN = 0.2;
type FilmEntry = { ratio: number; eligible: () => boolean; manual: () => boolean; sync: () => void };
const filmRegistry = new Map<symbol, FilmEntry>();
let activeFilm: symbol | null = null;
function electFilm() {
  const score = (entry: FilmEntry) => entry.ratio + (entry.manual() ? 1 : 0);
  let best: symbol | null = null, bestScore = 0;
  filmRegistry.forEach((entry, id) => {
    if (entry.ratio >= PLAY_RATIO && entry.eligible() && score(entry) > bestScore) { best = id; bestScore = score(entry); }
  });
  const current = activeFilm ? filmRegistry.get(activeFilm) : undefined;
  if (current && best !== activeFilm && current.ratio >= PLAY_RATIO && current.eligible() && bestScore < score(current) + SWITCH_MARGIN) best = activeFilm;
  activeFilm = best;
  filmRegistry.forEach((entry) => entry.sync());
}

const PlayIcon = () => <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" /></svg>;

/** Each film downloads on first elected playback, remembers user pause and loops only while visible. */
export function StoneJejuFilm({ kind, priority = false }: { kind: FilmKind; priority?: boolean }) {
  const { language } = useMarket();
  const copy = homeMediaCopy(language), mediaCopy = stonejejuMediaCopy(language);
  const videoRef = useRef<HTMLVideoElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const id = useRef(Symbol(kind)).current;
  const reduced = useRef(false), userPaused = useRef(false), manual = useRef(false), blocked = useRef(false);
  const [loaded, setLoaded] = useState(false), [failed, setFailed] = useState(false), [posterFailed, setPosterFailed] = useState(false);
  const [playing, setPlaying] = useState(false), [attempt, setAttempt] = useState(0);
  const loadedRef = useRef(false), failedRef = useRef(false);
  loadedRef.current = loaded; failedRef.current = failed;
  const sync = () => {
    const video = videoRef.current;
    if (!video) return;
    const shouldPlay = activeFilm === id && !document.hidden;
    if (!shouldPlay) { if (!video.paused) video.pause(); return; }
    if (!loadedRef.current) { setLoaded(true); return; }
    if (video.paused) video.play().catch(() => {
      // Autoplay refused: show the play button and leave the film alone until the visitor presses it.
      blocked.current = true; setPlaying(false); electFilm();
    });
  };
  const syncRef = useRef(sync);
  syncRef.current = sync;
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = motion.matches;
    const entry: FilmEntry = {
      ratio: 0,
      eligible: () => !failedRef.current && !userPaused.current && (manual.current || (!reduced.current && !blocked.current)),
      manual: () => manual.current,
      sync: () => syncRef.current(),
    };
    filmRegistry.set(id, entry);
    const onMotion = () => { reduced.current = motion.matches; if (motion.matches) manual.current = false; electFilm(); };
    const observer = new IntersectionObserver(([observed]) => {
      entry.ratio = observed.isIntersecting ? observed.intersectionRatio : 0;
      electFilm();
    }, { threshold: [0, .2, .35, .5, .65, .8, 1] });
    if (figureRef.current) observer.observe(figureRef.current);
    const onVisibility = () => syncRef.current();
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    return () => {
      observer.disconnect(); filmRegistry.delete(id); if (activeFilm === id) activeFilm = null;
      document.removeEventListener("visibilitychange", onVisibility); motion.removeEventListener("change", onMotion);
      videoRef.current?.pause(); electFilm();
    };
  }, [id]);
  useEffect(() => { if (loaded) syncRef.current(); }, [loaded, attempt]);
  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) { userPaused.current = true; manual.current = false; video.pause(); electFilm(); return; }
    userPaused.current = false; manual.current = true; blocked.current = false;
    activeFilm = id; filmRegistry.forEach((entry) => entry.sync());
  };
  const retry = () => { failedRef.current = false; setFailed(false); setPosterFailed(false); blocked.current = false; setAttempt((value) => value + 1); electFilm(); };
  const caption = kind === "product" ? copy.product : kind === "forest" ? copy.forest : copy.detail;
  const alt = kind === "forest" ? mediaCopy.forestAlt : kind === "detail" ? mediaCopy.detailStoneAlt : mediaCopy.homeAlt;
  const poster = `/media/stonejeju/${films[kind].poster}`;
  return <figure ref={figureRef} className={`stonejeju-film stonejeju-film--${kind}`} data-playing={playing || undefined}>
    {failed ? (posterFailed ? <div className="stonejeju-film__missing" role="img" aria-label={alt} /> :
      <img src={poster} alt={alt} width={1920} height={1080} onError={() => setPosterFailed(true)} />) :
      <video key={attempt} ref={videoRef} src={loaded ? `/media/stonejeju/${films[kind].file}` : undefined}
        poster={poster} muted playsInline loop preload="none" width={1280} height={720}
        aria-label={caption} aria-describedby={`stonejeju-${kind}-caption`}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onError={() => { failedRef.current = true; setFailed(true); setPlaying(false); electFilm(); }} />}
    {priority && !failed && <link rel="preload" as="image" href={poster} />}
    <figcaption id={`stonejeju-${kind}-caption`}><span>{caption}</span>
      {!failed && <button type="button" className="stonejeju-film__toggle" onClick={toggle} aria-label={`${playing ? copy.pause : copy.play} · ${caption}`} title={playing ? copy.pause : copy.play}>{playing ? <PauseIcon /> : <PlayIcon />}</button>}
      {failed && <><span role="status">{mediaCopy.videoFallback}</span><button type="button" className="stonejeju-film__retry" onClick={retry}>{copy.retry}</button></>}
    </figcaption>
  </figure>;
}

export function StoneJejuSceneGallery() {
  const { language } = useMarket();
  const copy = stonejejuMediaCopy(language);
  return <section className="v23-product-story stonejeju-scene-gallery" aria-label={copy.homeTitle}>
    <header><h2>{copy.homeTitle}</h2></header>
    <div>{[["03_product_light.webp", copy.detailLightAlt], ["05_product_stone.webp", copy.detailStoneAlt]].map(([file, alt]) =>
      <figure key={file}><img src={`/media/stonejeju/${file}`} alt={alt} width={1920} height={1080}
        loading="lazy" decoding="async" onError={(event) => { if (!event.currentTarget.src.endsWith("/images/diffuser-500g.webp")) event.currentTarget.src = "/images/diffuser-500g.webp"; }} /></figure>)}
    </div>
  </section>;
}

