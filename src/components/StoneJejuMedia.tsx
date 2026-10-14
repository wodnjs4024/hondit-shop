import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMarket } from "../lib/market";
import { stonejejuMediaCopy } from "../data/stonejejuMediaCopy";
import { homeMediaCopy } from "../data/homeMediaCopy";

type FilmKind = "product" | "forest" | "detail";
const films = {
  product: { file: "home_product.mp4", poster: "02_product_moss.jpg" },
  forest: { file: "our_jeju_forest.mp4", poster: "04_forest.jpg" },
  detail: { file: "detail_product.mp4", poster: "05_product_stone.webp" },
};

/** Each film downloads on first visible playback, remembers user pause and never loops. */
export function StoneJejuFilm({ kind, children }: { kind: FilmKind; children?: ReactNode }) {
  const { language } = useMarket();
  const copy = homeMediaCopy(language), mediaCopy = stonejejuMediaCopy(language);
  const videoRef = useRef<HTMLVideoElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const visible = useRef(false), reduced = useRef(false), userPaused = useRef(false);
  const finished = useRef(false), manual = useRef(false);
  const [loaded, setLoaded] = useState(false), [failed, setFailed] = useState(false), [playing, setPlaying] = useState(false);
  const syncRef = useRef<() => void>(() => {});
  syncRef.current = () => {
    const video = videoRef.current;
    if (!video) return;
    const shouldPlay = visible.current && !document.hidden && !userPaused.current && !finished.current && (!reduced.current || manual.current);
    if (!shouldPlay) { video.pause(); return; }
    if (!loaded) { setLoaded(true); return; }
    if (video.paused) video.play().catch(() => setPlaying(false));
  };
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = motion.matches;
    const onMotion = () => { reduced.current = motion.matches; if (motion.matches) manual.current = false; syncRef.current(); };
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting && entry.intersectionRatio >= .25; syncRef.current(); }, { threshold: [0, .25] });
    if (figureRef.current) observer.observe(figureRef.current);
    const onVisibility = () => syncRef.current();
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); motion.removeEventListener("change", onMotion); videoRef.current?.pause(); };
  }, []);
  useEffect(() => { syncRef.current(); }, [loaded]);
  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) { userPaused.current = true; manual.current = false; video.pause(); }
    else { userPaused.current = false; manual.current = true; if (finished.current) video.currentTime = 0; finished.current = false; syncRef.current(); }
  };
  const caption = kind === "product" ? copy.product : kind === "forest" ? copy.forest : copy.detail;
  const alt = kind === "forest" ? mediaCopy.forestAlt : kind === "detail" ? mediaCopy.detailStoneAlt : mediaCopy.homeAlt;
  return <figure ref={figureRef} className={`stonejeju-film stonejeju-film--${kind}`}>
    {failed ? <img src={`/media/stonejeju/${films[kind].poster}`} alt={alt} width={1920} height={1080} /> :
      <video ref={videoRef} src={loaded ? `/media/stonejeju/${films[kind].file}` : undefined}
        poster={`/media/stonejeju/${films[kind].poster}`} muted playsInline preload="none" width={1280} height={720}
        aria-label={caption} aria-describedby={`stonejeju-${kind}-caption`}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onEnded={() => { finished.current = true; manual.current = false; setPlaying(false); }}
        onError={() => setFailed(true)} />}
    <figcaption id={`stonejeju-${kind}-caption`}><span>{caption}</span>
      {!failed && <button type="button" onClick={toggle} aria-label={`${playing ? copy.pause : copy.play} · ${caption}`}>{playing ? copy.pause : copy.play} {playing ? "Ⅱ" : "▷"}</button>}
      {failed && <span role="status">{mediaCopy.videoFallback}</span>}
    </figcaption>
    {children}
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

