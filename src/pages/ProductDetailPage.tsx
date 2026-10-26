import { withoutUnverifiedPh } from "../../shared/product-claims.js";
import { StoneJejuSceneGallery } from "../components/StoneJejuMedia";
import {DiffuserComparison,ProductCare} from "../components/ProductFactsDisplay";
import {QuantityReview} from "../components/QuantityReview";
import {productFacts} from "../data/productFacts";
import { cleanProductUsage } from "../../shared/page-sales.js";
import { termsFor } from "../../shared/market-overrides.js";
import { ProductSalesSummary } from "../components/ProductSalesSummary";
import { orderPanelCopy } from "../data/orderPanelCopy";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { trackEvent } from "../lib/analytics";
import {
  formatMarketUnitMoney,
  getMarketUnitPrice,
  isStorefrontProductAllowedForMarket,
  marketProductText,
  marketText,
  useMarket,
} from "../lib/market";
import { composeStorefrontProducts, loadStorefrontProduct } from "../lib/storefrontApi";
import { getAdminToken } from "../lib/bulkApi";
import { catalogCopy } from "../data/catalogCopy";
import { productDescription as describeProduct, productGallery, productList, productMainImage, productName as nameOf, productPriceLabel } from "../lib/productText";
import { NotFoundPage } from "./NotFoundPage";
import { productPhotoRoot, productPhotos } from "../data/productPhotos";

const originals = productPhotoRoot;

const singaporeDiffuser350Details = Array.from(
  { length: 9 },
  (_, index) => `/images/product-details/diffuser-350g-sg/${index + 1}.jpeg`,
);

export function ProductDetailPage() {
  const { market, language } = useMarket();
  const { productId = "" } = useParams();
  const [product, setProduct] = useState<StorefrontProduct | undefined>(() => v23Products.find((item) => item.slug === productId));
  const [loadedId,setLoadedId]=useState("");const viewed=useRef("");
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [params] = useSearchParams();
  const previewMode = params.get("preview") === "1";
  const [loaded, setLoaded] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadedId("");
    setLoaded(false);
    if (previewMode) {
      // Admin preview: the unpublished draft, fetched with the admin session. No customer view event is recorded for it.
      fetch(`/api/products?preview=${encodeURIComponent(productId)}`, { headers: { Authorization: `Bearer ${getAdminToken()}` } })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error("preview"))))
        .then((data) => { if (!active) return; const [draft] = composeStorefrontProducts(data.products || []); if (draft) setProduct(draft); else setPreviewError(true); })
        .catch(() => { if (active) setPreviewError(true); })
        .finally(() => { if (active) setLoaded(true); });
      return () => { active = false; };
    }
    loadStorefrontProduct(productId)
      .then((value) => { if (active) { setProduct(value); setLoadedId(productId); } })
      .catch(() => undefined)
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [productId, previewMode]);

  useEffect(() => {
    setDetailImageIndex(0);
  }, [market.code, productId]);

  useEffect(()=>{
    if(!product||loadedId!==productId||product.slug!==productId||!isStorefrontProductAllowedForMarket(product,market))return;
    const key=productId+':'+market.code;
    if(viewed.current===key)return;viewed.current=key;
    trackEvent('view_item',{interaction_context:'product_detail',items:[{item_id:product.slug,price:getMarketUnitPrice(product,market),currency:market.currency}]});
  },[productId,loadedId,product,market.code]);
  if (!productId) return <Navigate to="/products" replace />;
  if (!product) return loaded ? <NotFoundPage /> : <V23Page><main className="hd-page hd-pdp" aria-busy="true" /></V23Page>;
  if (!previewMode && !isStorefrontProductAllowedForMarket(product, market)) return <Navigate to="/products" replace />;

  const outOfStock = typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq;
  const productName = nameOf(product, language);
  const productCategory = marketProductText(language, product.category);
  const productDescription = describeProduct(product, language, productFacts(product.slug)?.description||product.description);
  const productGoodFor = product.goodFor ? marketProductText(language, product.goodFor) : "";
  const showSingaporeDiffuserDetails = market.code === "SG" && product.slug === "diffuser-350g";
  const selectDetailImage = (nextIndex: number, source: "arrow" | "thumbnail" | "keyboard") => {
    const normalizedIndex = (nextIndex + singaporeDiffuser350Details.length) % singaporeDiffuser350Details.length;
    setDetailImageIndex(normalizedIndex);
    trackEvent("product_gallery_select", {
      product_id: product.slug,
      image_number: normalizedIndex + 1,
      interaction_source: source,
      market_code: market.code,
    });
  };
  const productUrl = `https://hondit-shop.vercel.app/products/${product.slug}`;
  const schemaTerms = termsFor(product, market.code, product.bulkMoq);
  const mainImage = productMainImage(product);
  const adminGallery = productGallery(product);
  const absoluteImage = mainImage.startsWith("http") ? mainImage : `https://hondit-shop.vercel.app${mainImage}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    image: [
      absoluteImage,
      ...(showSingaporeDiffuserDetails
        ? singaporeDiffuser350Details.map((image) => `https://hondit-shop.vercel.app${image}`)
        : []),
    ],
    description: withoutUnverifiedPh(product.slug, productDescription),
    // StoneJeju makes and brands the diffusers; HONDIT sells and curates them. Other products keep HONDIT as the brand.
    // Cleansing care is J’essence, made by 제주리퍼블릭; HONDIT only sells and curates it.
    brand: { "@type": "Brand", name: productFacts(product.slug) ? "StoneJeju" : product.category === "CARE" ? "J’essence" : "HONDIT" },
    ...(productFacts(product.slug) ? { manufacturer: { "@type": "Organization", name: "StoneJeju", url: "https://stonejeju.com" } } : product.category === "CARE" ? { manufacturer: { "@type": "Organization", name: "제주리퍼블릭" } } : {}),
    sku: product.apiSlug || product.slug,
    // Only a price the visitor can actually pay here is published: unit price, minimum quantity, delivery included.
    offers: schemaTerms.status !== "direct" || !schemaTerms.billingCurrency || schemaTerms.unitMinor === null ? undefined : {
      "@type": "Offer",
      price: (schemaTerms.unitMinor / 10 ** schemaTerms.referenceDigits).toFixed(schemaTerms.referenceDigits),
      priceCurrency: schemaTerms.billingCurrency,
      eligibleQuantity: { "@type": "QuantitativeValue", minValue: product.bulkMoq, unitCode: "C62" },
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "HONDIT" },
      url: `${productUrl}?market=${market.code}`,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: schemaTerms.billingCurrency },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: market.code },
      },
    },
  };

  return (
    <V23Page>
      <main className="v23-product-detail hd-page hd-pdp">
        {previewMode && <p className="hd-preview-banner" role="status">{previewError ? catalogCopy(language).previewMissing : catalogCopy(language).previewBanner}</p>}
        <nav className="hd-crumbs" aria-label="Breadcrumb"><Link to="/products">{marketText(language,"Collection","제품 목록")}</Link><span aria-hidden="true">/</span><span>{productName}</span></nav>
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <section className="hd-pdp__hero">
          <div className="hd-pdp__gallery" role="group" aria-label={productName} tabIndex={0}>
            <figure className="hd-pdp__media">
              <img
                src={mainImage}
                alt={productName}
                width={880}
                height={1100}
                sizes="(max-width: 1023px) 100vw, 56vw"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
              {outOfStock && <span className="hd-tile__badge">{marketText(language, "Out of stock", "품절")}</span>}
            </figure>
            {adminGallery.length
              ? adminGallery.map((url) => <figure className="hd-pdp__photo" key={url}><img src={url} alt={productName} loading="lazy" decoding="async" /></figure>)
              : (productPhotos[product.slug] ?? []).map((photo) => <figure className="hd-pdp__photo" key={photo.file}>
              <img src={originals + photo.file} alt={productName} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
            </figure>)}
          </div>
          <div className="hd-pdp__info">
            <p className="hd-pdp__category">{productCategory}</p>
            <h1>{productName}</h1>
            <p className="hd-pdp__lead">{productDescription}</p>
            <p className="hd-pdp__price"><strong>{productPriceLabel(product, market, language)}</strong>{productFacts(product.slug)&&<small>{marketText(language,"General order unit price (20+)")}</small>}</p>
            <QuantityReview key={product.slug} product={product} purpose={new URLSearchParams(window.location.search).get("purpose")??"unspecified"}/>
            <details className="pdp-conditions">
              <summary>{orderPanelCopy(language).conditions}</summary>
              <ProductSalesSummary product={product} showContact={false}/>
            </details>
            {market.hasShopee&&product.shopee&&<a className="hd-textlink" href={product.shopee} target="_blank" rel="noreferrer">{marketText(language,"View Shopee store ↗")}</a>}
          </div>
        </section>

        <section className="hd-pdp__about">
          {productGoodFor && <article>
            <h2>{marketText(language, "GOOD FOR", "추천 용도")}</h2>
            <p className="hd-pdp__goodfor">{productGoodFor}</p>
          </article>}
          <article>
            <h2>{marketText(language, "HIGHLIGHTS", "특징")}</h2>
            <ul>{productList(product, language, "highlights").map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <h2>{marketText(language, "HOW TO USE", "사용 방법")}</h2>
            <p className="product-label-note">{marketText(language,"Follow the product label. Supplier-approved precautions are required before use.","제품 라벨을 우선 확인해주세요. 공급사 승인 주의사항 확인이 필요합니다.")}</p>
            <ol>{productList(product, language, "howTo").map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        </section>

        <div className="hd-pdp__specs">
          {productFacts(product.slug)&&<DiffuserComparison/>}
          <ProductCare slug={product.slug}/>
          {!product.quoteOnly && <Link className="hd-textlink" to={`/guide/${product.slug}`}>{marketText(language,"Product care & follow-up")} →</Link>}
        </div>

        {product.slug === "diffuser-500g" && <StoneJejuSceneGallery />}

        {showSingaporeDiffuserDetails && (
          <section className="v23-product-story" aria-label={marketText(language, "Product details", "상품 상세 설명")}>
            <header>
              <h2>{marketText(language, "Product details", "상품 상세 설명")}</h2>
            </header>
            <div className="v23-product-gallery">
              <div
                className="v23-product-gallery__stage"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    selectDetailImage(detailImageIndex - 1, "keyboard");
                  }
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    selectDetailImage(detailImageIndex + 1, "keyboard");
                  }
                }}
              >
                <img
                  id="v23-diffuser-detail-active"
                  src={singaporeDiffuser350Details[detailImageIndex]}
                  alt={`${productName} — ${marketText(language, "product detail", "상품 상세 이미지")} ${detailImageIndex + 1}`}
                  width={1024}
                  height={1024}
                  decoding="async"
                />
                <button
                  className="is-previous"
                  type="button"
                  aria-label={marketText(language, "Previous image", "이전 이미지")}
                  onClick={() => selectDetailImage(detailImageIndex - 1, "arrow")}
                >
                  ‹
                </button>
                <button
                  className="is-next"
                  type="button"
                  aria-label={marketText(language, "Next image", "다음 이미지")}
                  onClick={() => selectDetailImage(detailImageIndex + 1, "arrow")}
                >
                  ›
                </button>
                <span className="v23-product-gallery__count" aria-live="polite">
                  {detailImageIndex + 1} / {singaporeDiffuser350Details.length}
                </span>
              </div>
              <div className="v23-product-gallery__thumbnails" role="tablist" aria-label={marketText(language, "Product image thumbnails", "상품 이미지 미리보기")}>
                {singaporeDiffuser350Details.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    role="tab"
                    aria-selected={detailImageIndex === index}
                    aria-controls="v23-diffuser-detail-active"
                    aria-label={`${marketText(language, "Show image", "이미지 보기")} ${index + 1}`}
                    className={detailImageIndex === index ? "is-active" : ""}
                    onClick={() => selectDetailImage(index, "thumbnail")}
                  >
                    <img src={image} alt="" width={160} height={160} loading="lazy" decoding="async" />
                    <span>{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </V23Page>
  );
}
