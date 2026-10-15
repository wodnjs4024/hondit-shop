import { homeMediaCopy } from "../data/homeMediaCopy";
import { StoneJejuFilm } from "../components/StoneJejuMedia";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { V23Page, V23ProductCard } from "../components/v23/SiteChrome";
import { EMAIL, SHOPEE, v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { ProductComparison } from "../components/SalesDiscovery";
import { discoveryText } from "../data/discoveryCopy";
import { productFacts } from "../data/productFacts";
import { shippingSummary } from "../../shared/shipping-summary.js";
import { trackEvent } from "../lib/analytics";
import { isStorefrontProductAllowedForMarket, marketCountryName, marketProductText, marketText, useMarket, type DisplayLanguage } from "../lib/market";
import { loadStorefrontProducts } from "../lib/storefrontApi";
import "../styles/home-redesign.css";

const usageHeading: Record<string, string> = { ko: "사용 방법", en: "How to use", ja: "使い方", zh: "使用方法", ms: "Cara guna", th: "วิธีใช้" };
const headingFor = (copy: Record<string, string>, language: DisplayLanguage) =>
  copy[language === "zh-HK" || language === "zh-TW" ? "zh" : language] ?? copy.en;

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
  const homeProductCopy = (() => {
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
    <V23Page>
      <main className="v23-home hd-home">
        {/* 1. Hero: one sentence, the 6-second product film, one primary action. */}
        <section className="hd-hero" aria-labelledby="hd-hero-title">
          <div className="hd-hero__copy">
            <h1 id="hd-hero-title">{discoveryText(language, "intro")}</h1>
            <p>{filmCopy.intro}</p>
            <div className="hd-hero__actions">
              <Link className="hd-button" to={`/products${pageQuery}`}>{filmCopy.products}</Link>
              <Link className="hd-link" to={`/bulk-orders${pageQuery}`}>{t("Overseas bundle orders")} →</Link>
            </div>
          </div>
          <StoneJejuFilm kind="product" priority />
        </section>

        {/* 2. Collection: the products this market can buy, straight after the hero. */}
        <section className="hd-collection" aria-labelledby="hd-collection-title">
          <header className="hd-section-head">
            <h2 id="hd-collection-title">{homeProductCopy.title}</h2>
            <p>{homeProductCopy.description}</p>
          </header>
          <div className="hd-collection__grid" data-count={marketProducts.length}>
            {marketProducts.map((product) => <V23ProductCard key={product.slug} product={product} />)}
          </div>
          <footer className="hd-collection__foot">
            <p>
              <span>{t("Jeju-based student team", "제주 기반 학생 운영팀")}</span>
              <span>{t(`${countryName} delivery`, `${countryName} 배송`)}</span>
              <span>{t(`PayPal ${market.currency} checkout`, `PayPal ${market.currency} 결제`)}</span>
            </p>
            <Link className="hd-link" to={`/products${pageQuery}`}>{t("View all products ->", "전체 상품 보기 ->")}</Link>
          </footer>
        </section>

        {/* 3. Nature: the forest film leads into OUR JEJU. */}
        <section className="hd-split hd-split--forest" aria-labelledby="hd-forest-title">
          <StoneJejuFilm kind="forest" />
          <div className="hd-split__copy">
            <h2 id="hd-forest-title">{filmCopy.forest}</h2>
            <p>{filmCopy.forestText}</p>
            <Link className="hd-link" to={`/jeju${pageQuery}`}>{t("Explore our Jeju ->")}</Link>
          </div>
        </section>

        {/* 4. StoneJeju material: vessel and volcanic stone up close. */}
        <section className="hd-split hd-split--material" aria-labelledby="hd-material-title">
          <div className="hd-split__copy">
            <h2 id="hd-material-title">{t("No flame. No electricity.")}</h2>
            <p>{t("Apply the citrus fragrance oil directly to the porous Jeju volcanic stone. The stone absorbs the oil and releases the scent naturally-without reed sticks, heat or electricity.")}</p>
          </div>
          <StoneJejuFilm kind="detail" />
        </section>

        {/* 5. 350g and 500g: each real product photo with its own specification. */}
        {diffusers.length > 0 && <section className="hd-sizes" aria-labelledby="hd-sizes-title">
          <header className="hd-section-head">
            <h2 id="hd-sizes-title">{t("Compare the diffusers")}</h2>
          </header>
          <div className="hd-sizes__pair">
            {diffusers.map((product) => {
              const facts = productFacts(product.slug)!;
              const size = product.slug === "diffuser-350g" ? "350g" : "500g";
              return <article key={product.slug} className="hd-size">
                <Link to={`/products/${product.slug}${pageQuery}`} className="hd-size__media">
                  <img src={product.image} alt={marketProductText(language, product.name)} width={880} height={1100} loading="lazy" decoding="async" />
                </Link>
                <div className="hd-size__body">
                  <h3>StoneJeju {size}</h3>
                  <p>{marketProductText(language, product.detail)}</p>
                  <dl>
                    <div><dt>{t("Container")}</dt><dd>{t(facts.container)}</dd></div>
                    <div><dt>{t("Declared content")}</dt><dd>{facts.content}</dd></div>
                    <div><dt>{t("Dimensions (W × H × D)")}</dt><dd>{facts.dimensions}</dd></div>
                    <div><dt>{t("Citrus fragrance oil")}</dt><dd>{facts.oil}</dd></div>
                  </dl>
                  <Link className="hd-link" to={`/products/${product.slug}${pageQuery}`}>{t("Product details", "상품 상세 설명")} →</Link>
                </div>
              </article>;
            })}
          </div>
        </section>}
        <ProductComparison products={marketProducts} eyebrow={false} />

        {/* 6. Use, how to buy, and who sells it. */}
        <section className="hd-close" aria-label={t("TRUST & SUPPORT")}>
          <div className="hd-close__use">
            <h2>{headingFor(usageHeading, language)}</h2>
            <ol>
              <li><b>{t("ADD 10-12 DROPS")}</b><p>{t("Apply the fragrance oil directly onto the volcanic stone.")}</p></li>
              <li><b>{t("LET IT ABSORB")}</b><p>{t("Allow the porous stone to absorb the oil naturally.")}</p></li>
              <li><b>{t("REFRESH AS NEEDED")}</b><p>{t("Add a few more drops when the scent becomes lighter.")}</p></li>
            </ol>
            <p className="hd-close__guides">
              <Link className="hd-link" to={`/guide/diffuser-350g${pageQuery}`}>350g · {t("HOW TO USE")} →</Link>
              <Link className="hd-link" to={`/guide/diffuser-500g${pageQuery}`}>500g · {t("HOW TO USE")} →</Link>
            </p>
          </div>
          <div className="hd-close__paths">
            <h2>{t("Choose delivery separately from your purchase purpose.")}</h2>
            <p>{t("International delivery is offered as MOQ bundles, not individual small-quantity shipping. Group purchases are welcome.")}</p>
            <p>{t(shippingSummary(market.code))}</p>
            <ul>
              <li><Link className="hd-link" to={`/bulk-orders${pageQuery}`}>{t("Overseas bundle orders")} →</Link></li>
              <li><Link className="hd-link" to="/jeju/pickup">{t("Jeju pickup information")} →</Link></li>
              <li><Link className="hd-link" to={`/partners${pageQuery}`}>{t("Store & business purchase guide")} →</Link></li>
            </ul>
            <p className="hd-note">{t("Reorders require a new check of current prices, availability and delivery conditions.")}</p>
          </div>
          <div className="hd-close__trust">
            <h2>{t("TRUST & SUPPORT")}</h2>
            <p>{t("Jeju-based student team")}</p>
            <p>{t("Business registration no.")} 637-12-03059</p>
            <p><a className="hd-link" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            <p>{t("You can also view HONDIT products and sales activity on our Singapore Shopee store.")}</p>
            <p><a className="hd-link" href={SHOPEE} target="_blank" rel="noreferrer">{t("View Shopee store ↗")}</a></p>
            <p><Link className="hd-link" to={`/jeju${pageQuery}`}>{t("About HONDIT")} →</Link></p>
          </div>
        </section>
      </main>
    </V23Page>
  );
}
