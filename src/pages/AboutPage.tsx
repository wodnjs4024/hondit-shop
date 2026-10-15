import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { StoneJejuFilm } from "../components/StoneJejuMedia";
import { aboutCopy } from "../data/aboutCopy";
import { discoveryText } from "../data/discoveryCopy";
import { homeMediaCopy } from "../data/homeMediaCopy";
import { stonejejuMediaCopy } from "../data/stonejejuMediaCopy";
import { v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { isStorefrontProductAllowedForMarket, marketCountryName, marketProductText, marketText, markets, useMarket } from "../lib/market";
import { loadStorefrontProducts } from "../lib/storefrontApi";
import "../styles/about.css";

const pack = "/images/hondit-pack/hondit_codex_image_pack/";
const originals = `${pack}01_product_originals/`;
const places = `${pack}03_jeju_real_photos/`;

/* Three portrait product photographs crossfade in the hero print: one per range. */
const heroStills = [
  { src: "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/01_diffuser_350_package.webp", slug: "diffuser-500g", w: 1081, h: 1440 },
  { src: "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/10_foaming_cleanser_pack.webp", slug: "foaming-cleanser", w: 648, h: 930 },
  { src: "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/13_cleansing_water_pack.webp", slug: "cleansing-water", w: 532, h: 736 },
];

const credits = [
  "Jeju National University — imagejeju, CC BY-SA 4.0, Wikimedia Commons",
  "Daepo Jusangjeolli Cliff 01 — Bernard Gagnon, CC0, Wikimedia Commons",
  "Hamdeok Beach — Hong Da Hyeon, CC0, Wikimedia Commons",
  "Jeju traditional stone walls, Woljeong-ri — Sgroey, CC BY-SA 4.0, Wikimedia Commons",
];

export function AboutPage() {
  const { market, language } = useMarket();
  const t = (text: string) => marketText(language, text);
  const copy = aboutCopy(language);
  const film = homeMediaCopy(language);
  const media = stonejejuMediaCopy(language);
  const query = `?market=${market.code}&lang=${language}`;
  const [catalog, setCatalog] = useState<StorefrontProduct[]>(v23Products);
  const [still, setStill] = useState(0);

  useEffect(() => { loadStorefrontProducts().then(setCatalog).catch(() => undefined); }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = () => { if (!document.hidden) setStill((value) => (value + 1) % heroStills.length); };
    const timer = window.setInterval(tick, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const byslug = useMemo(() => Object.fromEntries(catalog.map((product) => [product.slug, product])), [catalog]);
  const name = (slug: string) => (byslug[slug] ? marketProductText(language, byslug[slug].name) : slug);

  const gallery = [
    { slug: "diffuser-350g", src: `${originals}03_diffuser_350_window.webp`, w: 1256, h: 1114, shape: "portrait" },
    { slug: "diffuser-500g", src: `${originals}07_diffuser_500_window.webp`, w: 1138, h: 874, shape: "wide" },
    { slug: "foaming-cleanser", src: `${originals}11_foaming_cleanser_lifestyle.webp`, w: 602, h: 756, shape: "landscape" },
    { slug: "cleansing-water", src: `${originals}14_cleansing_water_cutout.webp`, w: 522, h: 886, shape: "small" },
    { slug: "foam-oil", src: `${originals}12_foam_oil_cleanser.webp`, w: 544, h: 800, shape: "portrait-right" },
  ];

  const marketRows = Object.values(markets).map((option) => {
    const sold = catalog.filter((product) => isStorefrontProductAllowedForMarket(product, option));
    const care = sold.some((product) => product.category === "CARE");
    return { option, count: sold.length, range: t(care ? "Care and scent products" : "Jeju volcanic-stone diffusers") };
  });

  return (
    <V23Page>
      <main className="hd-about">
        {/* Hero: two prints on a dark field, the headline low on the left. */}
        <section className="ab-hero" aria-labelledby="ab-hero-title">
          <figure className="ab-hero__large">
            {heroStills.map((item, index) => (
              <img key={item.src} src={item.src} alt={index === still ? name(item.slug) : ""} aria-hidden={index !== still} width={item.w} height={item.h}
                className={index === still ? "is-on" : undefined} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
            ))}
          </figure>
          <figure className="ab-hero__small">
            <img src={`${originals}04_diffuser_350_stone.webp`} alt={name("diffuser-350g")} width={1266} height={1186} decoding="async" />
          </figure>
          <h1 id="ab-hero-title">{discoveryText(language, "intro")}</h1>
          <p className="ab-hero__line">{copy.heroLine}</p>
          <Link className="hd-btn hd-btn--light ab-hero__action" to={`/products${query}`}>{film.products}</Link>
        </section>

        {/* Origin: the campus print beside the account of who runs HONDIT. */}
        <section className="ab-origin" aria-labelledby="ab-origin-title">
          <figure className="ab-origin__photo">
            <img src={`${places}01_jeju_national_university.webp`} alt={copy.altCampus} width={1600} height={1067} loading="lazy" decoding="async" />
            <figcaption>{t("JEJU NATIONAL UNIVERSITY - ARA CAMPUS")}</figcaption>
          </figure>
          <div className="ab-origin__text">
            <h2 id="ab-origin-title">{t("Built by students,")} {t("grounded in Jeju.")}</h2>
            <p>{t("hondit is an independent student-led cross-border commerce project based at Jeju National University. The campus is our working origin, not a product endorsement, and we make that relationship clear rather than borrowing the university name as decoration.")}</p>
            <a className="hd-textlink" href="https://www.jejunu.ac.kr/eng/intro/guide/directions/aracampus.htm" target="_blank" rel="noreferrer">{t("Verify on the official JNU website ->").replace(/\s*->$/, "")} ↗</a>
          </div>
        </section>

        {/* Materials: one band of unequal panels, sea / stone / forest / product. */}
        <section className="ab-band" aria-labelledby="ab-band-title">
          <h2 id="ab-band-title">{copy.materials}</h2>
          <div className="ab-band__row">
            <figure className="ab-band__panel" style={{ flexGrow: 5 }}>
              <img src={`${places}08_hamdeok_beach.webp`} alt={copy.altSea} loading="lazy" decoding="async" />
              <figcaption><b>{t("Sea")}</b><span>{t("Open light and clean water give hondit's care selection its fresh, uncomplicated mood.")}</span></figcaption>
            </figure>
            <figure className="ab-band__panel" style={{ flexGrow: 2 }}>
              <img src={`${places}11_jusangjeolli_cliff.webp`} alt={copy.altStone} loading="lazy" decoding="async" />
              <figcaption><b>{t("Stone")}</b><span>{t("Jeju scoria is not just decoration: it is the reusable scent object at the centre of our diffuser.")}</span></figcaption>
            </figure>
            <figure className="ab-band__panel" style={{ flexGrow: 3 }}>
              <StoneJejuFilm kind="forest" />
              <figcaption><b>{t("Forest")}</b><span>{t("Shaded paths and slow movement shape a brand language that feels calm, useful and lived-in.")}</span></figcaption>
            </figure>
            <figure className="ab-band__panel" style={{ flexGrow: 2 }}>
              <img src={`${places}14_jeju_stone_wall.webp`} alt={copy.altWall} loading="lazy" decoding="async" />
            </figure>
          </div>
          <p className="ab-band__caption">{copy.materialsCaption}</p>
        </section>

        {/* Products: staggered prints in open ground, each named. */}
        <section className="ab-gallery" aria-labelledby="ab-gallery-title">
          <h2 id="ab-gallery-title">{copy.products}</h2>
          {gallery.map((item) => (
            <figure key={item.slug} className={`ab-gallery__item ab-gallery__item--${item.shape}`}>
              <Link to={`/products/${item.slug}${query}`}>
                <img src={item.src} alt={name(item.slug)} width={item.w} height={item.h} loading="lazy" decoding="async" />
              </Link>
              <figcaption><Link to={`/products/${item.slug}${query}`}>{name(item.slug)}</Link></figcaption>
            </figure>
          ))}
        </section>

        {/* Markets: statement on the left, the real market list pushed right. */}
        <section className="ab-markets" aria-labelledby="ab-markets-title">
          <h2 id="ab-markets-title">{copy.markets}</h2>
          <p className="ab-markets__note">{t("International delivery is offered as MOQ bundles, not individual small-quantity shipping. Group purchases are welcome.")}</p>
          <figure className="ab-markets__photo">
            <img src={`${originals}15_full_product_line_real.webp`} alt={copy.altLine} width={1672} height={941} loading="lazy" decoding="async" />
          </figure>
          <table className="ab-markets__table">
            <caption className="hd-visually-hidden">{copy.marketsLabel}</caption>
            <tbody>
              {marketRows.map(({ option, count, range }) => (
                <tr key={option.code} className={option.code === market.code ? "is-current" : undefined}>
                  <th scope="row">
                    <Link to={`/products?market=${option.code}&lang=${language}`}>{marketCountryName(option, language)}</Link>
                    {option.code === market.code && <span className="ab-markets__here">{copy.yourMarket}</span>}
                  </th>
                  <td>{range} · {count}</td>
                  <td>{option.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Close: last photograph full-bleed, words in its calm half. */}
        <section className="ab-close" aria-labelledby="ab-close-title">
          <img src="/media/stonejeju/05_product_stone.webp" alt={media.detailStoneAlt} loading="lazy" decoding="async" />
          <div className="ab-close__text">
            <h2 id="ab-close-title">{t("Bring a quieter piece")} {t("of Jeju into everyday life.")}</h2>
            <p>{t("Explore the care and scent collection, or review direct PayPal checkout for larger orders.")}</p>
            <div className="ab-close__actions">
              <Link className="hd-btn hd-btn--light" to={`/products${query}`}>{film.products}</Link>
              <Link className="hd-textlink" to={`/jeju${query}`}>{t("Explore our Jeju ->").replace(/\s*->$/, "")}</Link>
            </div>
          </div>
        </section>

        <aside className="ab-credits" aria-label={copy.credits}>
          <h2>{copy.credits}</h2>
          <ul>{credits.map((line) => <li key={line}>{line}</li>)}</ul>
        </aside>
      </main>
    </V23Page>
  );
}
