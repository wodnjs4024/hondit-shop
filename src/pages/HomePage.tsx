import {salesPresentationCopy} from '../data/salesPresentationCopy';
import { homeMediaCopy } from "../data/homeMediaCopy";
import { StoneJejuFilm } from "../components/StoneJejuMedia";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { ProductComparison } from "../components/SalesDiscovery";
import { discoveryText } from "../data/discoveryCopy";
import { productFacts } from "../data/productFacts";
import { shippingSummary } from "../../shared/shipping-summary.js";
import { trackEvent } from "../lib/analytics";
import { formatMarketUnitMoney, isStorefrontProductAllowedForMarket, marketCountryName, marketProductText, marketText, useMarket, type DisplayLanguage } from "../lib/market";
import { loadStorefrontProducts } from "../lib/storefrontApi";
import { ProductTile } from "../components/home/ProductTile";

const pick = (copy: Record<string, string>, language: DisplayLanguage) =>
  copy[language === "zh-HK" || language === "zh-TW" ? "zh" : language] ?? copy.en;
const shippingAlt = { ko: "HONDIT 전 제품과 해외 배송 상자", en: "The full HONDIT line with an overseas shipping box", ja: "HONDITの全商品と海外配送用の箱", zh: "HONDIT 全系列產品與海外配送箱", ms: "Rangkaian penuh HONDIT bersama kotak penghantaran luar negara", th: "ผลิตภัณฑ์ HONDIT ทั้งหมดพร้อมกล่องจัดส่งต่างประเทศ" };
const usageHeading = { ko: "사용 방법", en: "How to use", ja: "使い方", zh: "使用方法", ms: "Cara guna", th: "วิธีใช้" };

/* Real product photographs for the size comparison: each shot shows only the named size. */
const sizePhotos: Record<string, { src: string; width: number; height: number }> = {
  "diffuser-350g": { src: "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/03_diffuser_350_window.webp", width: 1256, height: 1114 },
  "diffuser-500g": { src: "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/07_diffuser_500_window.webp", width: 1138, height: 874 },
};
const shippingPhoto = "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/15_full_product_line_real.webp";
const stonePhoto = "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/04_diffuser_350_stone.webp";

export function HomePage() {
  const { market, language } = useMarket();
  const location = useLocation();
  const selectionParams = new URLSearchParams(location.search);
  selectionParams.set("market", market.code);
  selectionParams.set("lang", language);
  const pageQuery = `?${selectionParams.toString()}`;
  const t = (text: string, fallback?: string) => marketText(language, text, fallback);
  const filmCopy = homeMediaCopy(language);
  const countryName = marketCountryName(market, language);
  const [catalog, setCatalog] = useState<StorefrontProduct[]>(v23Products);
  const marketProducts = useMemo(
    () => catalog.filter((product) => isStorefrontProductAllowedForMarket(product, market)),
    [catalog, market],
  );
  const diffusers = marketProducts.filter((product) => product.category === "SCENT" && productFacts(product.slug));
  const collection = (() => {
    if (language === "ko") return { title: "제주에서 고른 컬렉션", description: `${countryName}에서 구매 가능한 제품을 확인하세요.` };
    if (language === "ja") return { title: "済州から選んだコレクション", description: `${countryName}で購入できる商品をご覧ください。` };
    if (language === "zh-HK" || language === "zh-TW" || language === "zh") return { title: "濟州精選系列", description: `查看可配送至${countryName}的產品。` };
    if (language === "ms") return { title: "Koleksi pilihan Jeju", description: `Terokai produk yang tersedia untuk ${countryName}.` };
    if (language === "th") return { title: "คอลเลกชันจากเชจู", description: `ดูสินค้าที่มีสำหรับ${countryName}` };
    return { title: "The Jeju-selected collection", description: `Explore the products available for ${countryName}.` };
  })();

  useEffect(() => {
    loadStorefrontProducts().then(setCatalog).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!marketProducts.length) return;
    trackEvent("view_item_list", {
      item_list_name: "home_product_rail",
      items: marketProducts.map((product, index) => ({
        item_id: product.slug,
        item_name: product.name,
        item_category: product.category,
        index,
        price: product.marketUnitPrices?.[market.code] ?? product.bulkUnitPrice,
        currency: market.currency,
      })),
    });
  }, [market, marketProducts]);

  return (
    <V23Page chrome="home">
      <main className="v23-home hd-home">
        {/* Hero: the product film fills the first screen; copy and the shop action sit on it. */}
        <section className="hd-hero" aria-labelledby="hd-hero-title">
          <StoneJejuFilm kind="product" priority />
          <div className="hd-hero__copy">
            <h1 id="hd-hero-title">{discoveryText(language, "intro")}</h1>
            <p>{filmCopy.intro}</p>
            <div className="hd-hero__actions">
              <Link className="hd-btn hd-btn--light" to={`/products${pageQuery}`}>{filmCopy.products}</Link>
              <Link className="hd-textlink" to={`/bulk-orders${pageQuery}`}>{t("Overseas bundle orders")}</Link>
            </div>
          </div>
        </section>

        {/* Collection: what this market can buy, directly under the film. */}
        <section className="hd-collection" aria-labelledby="hd-collection-title">
          <header className="hd-bar">
            <h2 id="hd-collection-title">{collection.title}</h2>
            <p>{collection.description} {t("{count} products").replace("{count}", String(marketProducts.length))}</p>
            <Link className="hd-textlink" to={`/products${pageQuery}`}>{t("View all products ->", "전체 상품 보기 ->").replace(/\s*->$/, "")}</Link>
          </header>
          <ul className="hd-collection__rail" data-count={marketProducts.length}>
            {marketProducts.map((product) => <ProductTile key={product.slug} product={product} query={pageQuery} />)}
          </ul>
        </section>

        {/* Jeju: forest film beside a real StoneJeju photograph. */}
        <section className="hd-jeju" aria-labelledby="hd-jeju-title">
          <div className="hd-jeju__film">
            <StoneJejuFilm kind="forest" />
            <div className="hd-overlay">
              <h2 id="hd-jeju-title">{filmCopy.forest}</h2>
              <p>{filmCopy.forestText}</p>
              <Link className="hd-textlink" to={`/jeju${pageQuery}`}>{t("Explore our Jeju ->").replace(/\s*->$/, "")}</Link>
            </div>
          </div>
          <figure className="hd-jeju__photo">
            <img src={stonePhoto} alt={marketProductText(language, "Volcanic Diffuser 350g")} width={1266} height={1186} loading="lazy" decoding="async" />
            <figcaption>StoneJeju 350g</figcaption>
          </figure>
        </section>

        {/* Material: the close-up film, then how the stone is used. */}
        <section className="hd-material" aria-labelledby="hd-material-title">
          <div className="hd-material__film">
            <StoneJejuFilm kind="detail" />
            <div className="hd-overlay hd-overlay--material">
              <h2 id="hd-material-title">{t("No flame. No electricity.")}</h2>
              <p>{t("Apply the citrus fragrance oil directly to the porous Jeju volcanic stone. The stone absorbs the oil and releases the scent naturally-without reed sticks, heat or electricity.")}</p>
            </div>
          </div>
          <div className="hd-use">
            <div className="hd-use__head">
              <h3>{pick(usageHeading, language)}</h3>
              <p className="hd-use__guides">
                <Link className="hd-textlink" to={`/guide/diffuser-350g${pageQuery}`}>350g · {t("HOW TO USE")}</Link>
                <Link className="hd-textlink" to={`/guide/diffuser-500g${pageQuery}`}>500g · {t("HOW TO USE")}</Link>
              </p>
            </div>
            <ol>
              <li><b>{t("ADD 10-12 DROPS")}</b><span>{t("Apply the fragrance oil directly onto the volcanic stone.")}</span></li>
              <li><b>{t("LET IT ABSORB")}</b><span>{t("Allow the porous stone to absorb the oil naturally.")}</span></li>
              <li><b>{t("REFRESH AS NEEDED")}</b><span>{t("Add a few more drops when the scent becomes lighter.")}</span></li>
            </ol>
          </div>
        </section>

        {/* Sizes: one comparison table, each column a real photograph of that size with its approved spec and price. */}
        {diffusers.length > 0 && <section className="hd-sizes" aria-labelledby="hd-sizes-title">
          <header className="hd-bar">
            <h2 id="hd-sizes-title">{t("Compare the diffusers")}</h2>
          </header>
          <table className="hd-compare" data-count={diffusers.length}>
            <caption className="hd-visually-hidden">{t("Compare the diffusers")}</caption>
            <thead>
              <tr>
                <td />
                {diffusers.map((product) => {
                  const size = product.slug === "diffuser-350g" ? "350g" : "500g";
                  const photo = sizePhotos[product.slug] ?? { src: product.image, width: 880, height: 1100 };
                  return <th key={product.slug} scope="col">
                    <img src={photo.src} alt={marketProductText(language, product.name)} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
                    <span className="hd-compare__name">StoneJeju {size}</span>
                    <span className="hd-compare__detail">{marketProductText(language, product.detail)}</span>
                  </th>;
                })}
              </tr>
            </thead>
            <tbody>
              {([["Container", (f: NonNullable<ReturnType<typeof productFacts>>) => t(f.container)], ["Declared content", (f: NonNullable<ReturnType<typeof productFacts>>) => f.content], ["Dimensions (W × H × D)", (f: NonNullable<ReturnType<typeof productFacts>>) => f.dimensions], ["Citrus fragrance oil", (f: NonNullable<ReturnType<typeof productFacts>>) => f.oil]] as const).map(([label, value]) =>
                <tr key={label}><th scope="row">{t(label)}</th>{diffusers.map((product) => <td key={product.slug}>{value(productFacts(product.slug)!)}</td>)}</tr>)}
              <tr className="hd-compare__price"><th scope="row">{t(`${market.currency} BULK UNIT PRICE`, `${market.currency} BULK UNIT PRICE`)}</th>{diffusers.map((product) => <td key={product.slug}>{formatMarketUnitMoney(product, market)}</td>)}</tr>
              <tr><th scope="row">{t("Minimum")}</th>{diffusers.map((product) => <td key={product.slug}>{product.bulkMoq} {t("units")}</td>)}</tr>
              <tr className="hd-compare__actions"><td />{diffusers.map((product) => <td key={product.slug}>
                <Link className="hd-btn hd-btn--solid" to={`/bulk-orders?product=${product.slug}`}>{t("Overseas bundle orders")}</Link>
                <Link className="hd-textlink" to={`/products/${product.slug}${pageQuery}`}>{t("Product details", "상품 상세 설명")}</Link>
              </td>)}</tr>
            </tbody>
          </table>
        </section>}

        {/* Buying: delivery paths beside the real shipment photograph, then the market price table. */}
        <section className="hd-buy" aria-labelledby="hd-buy-title">
          <figure className="hd-buy__photo">
            <img src={shippingPhoto} alt={pick(shippingAlt, language)} width={1672} height={941} loading="lazy" decoding="async" />
          </figure>
          <div className="hd-buy__copy">
            <h2 id="hd-buy-title">{t("Choose delivery separately from your purchase purpose.")}</h2>
            <p>{t("International delivery is offered as MOQ bundles, not individual small-quantity shipping. Group purchases are welcome.")}</p>
            <p>{t(shippingSummary(market.code))}</p>
            <ul className="hd-paths">
              <li><Link to={`/bulk-orders${pageQuery}`}><span>{t("Overseas bundle orders")}</span><span aria-hidden="true">→</span></Link></li>
              <li className="hd-paths__pickup"><Link to={`/jeju/pickup?market=${market.code}&lang=${language}`}><span>{salesPresentationCopy(language).pickupNav}</span><span aria-hidden="true">→</span></Link><p>{salesPresentationCopy(language).pickupShort}</p></li>
              <li><Link to={`/partners${pageQuery}`}><span>{t("Store & business purchase guide")}</span><span aria-hidden="true">→</span></Link></li>
            </ul>
            <p className="hd-note">{t("Reorders require a new check of current prices, availability and delivery conditions.")}</p>
          </div>
        </section>
        <ProductComparison products={marketProducts} eyebrow={false} />
      </main>
    </V23Page>
  );
}
