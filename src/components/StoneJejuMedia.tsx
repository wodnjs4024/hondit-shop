import { useState } from "react";
import { useMarket } from "../lib/market";
import { stonejejuMediaCopy } from "../data/stonejejuMediaCopy";

/** User-initiated media only: never inherits the background-video lifecycle. */
export function StoneJejuProductVideo() {
  const { language } = useMarket();
  const copy = stonejejuMediaCopy(language);
  const [failed, setFailed] = useState(false);
  return <figure className="v23-diffuser-guide__video stonejeju-product-film">
    {failed ? <img src="/media/stonejeju/02_product_moss.jpg" alt={copy.homeAlt} width={1920} height={1080} /> :
      <video controls playsInline muted preload="none" poster="/media/stonejeju/02_product_moss.jpg"
        width={1280} height={720} aria-label={copy.homeTitle} aria-describedby="stonejeju-film-caption"
        onError={() => setFailed(true)}>
        <source src="/media/stonejeju/home_product.mp4" type="video/mp4" onError={() => setFailed(true)} />
        {copy.videoFallback}
      </video>}
    <figcaption id="stonejeju-film-caption"><strong>{copy.homeTitle}</strong><span>{copy.homeCaption}</span>
      {failed && <span role="status">{copy.videoFallback}</span>}
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

