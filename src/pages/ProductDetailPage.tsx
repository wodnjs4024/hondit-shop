import { StoneJejuSceneGallery } from "../components/StoneJejuMedia";
import {DiffuserComparison,ProductCare} from "../components/ProductFactsDisplay";
import {QuantityReview} from "../components/QuantityReview";
import {productFacts} from "../data/productFacts";
import { cleanProductUsage } from "../../shared/page-sales.js";
import { ProductSalesSummary } from "../components/ProductSalesSummary";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
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
import { loadStorefrontProduct } from "../lib/storefrontApi";
import { NotFoundPage } from "./NotFoundPage";

/* Supplied real product photographs (01_product_originals), shown under the main shot. */
const originals = "/images/hondit-pack/hondit_codex_image_pack/01_product_originals/";
const productPhotos: Record<string, { file: string; width: number; height: number }[]> = {
  "diffuser-350g": [{ file: "03_diffuser_350_window.webp", width: 1256, height: 1114 }, { file: "04_diffuser_350_stone.webp", width: 1266, height: 1186 }, { file: "01_diffuser_350_package.webp", width: 1081, height: 1440 }, { file: "05_diffuser_350_shelf.webp", width: 1214, height: 1004 }],
  "diffuser-500g": [{ file: "07_diffuser_500_window.webp", width: 1138, height: 874 }, { file: "08_diffuser_500_wood.webp", width: 1126, height: 842 }],
  "foaming-cleanser": [{ file: "10_foaming_cleanser_pack.webp", width: 648, height: 930 }, { file: "11_foaming_cleanser_lifestyle.webp", width: 602, height: 756 }],
  "foam-oil": [{ file: "12_foam_oil_cleanser.webp", width: 544, height: 800 }],
  "cleansing-water": [{ file: "13_cleansing_water_pack.webp", width: 532, height: 736 }, { file: "14_cleansing_water_cutout.webp", width: 522, height: 886 }],
};

const singaporeDiffuser350Details = Array.from(
  { length: 9 },
  (_, index) => `/images/product-details/diffuser-350g-sg/${index + 1}.jpeg`,
);

export function ProductDetailPage() {
  const { market, language } = useMarket();
  const { productId = "" } = useParams();
  const [product, setProduct] = useState<StorefrontProduct | undefined>(() => v23Products.find((item) => item.slug === productId));
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  useEffect(() => {
    loadStorefrontProduct(productId).then(setProduct).catch(() => undefined);
  }, [productId]);

  useEffect(() => {
    setDetailImageIndex(0);
  }, [market.code, productId]);

  if (!productId) return <Navigate to="/products" replace />;
  if (!product) return <NotFoundPage />;
  if (!isStorefrontProductAllowedForMarket(product, market)) return <Navigate to="/products" replace />;

  const outOfStock = typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq;
  const productName = marketProductText(language, product.name);
  const productCategory = marketProductText(language, product.category);
  const productDescription = marketProductText(language, productFacts(product.slug)?.description||product.description);
  const productGoodFor = marketProductText(language, product.goodFor);
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
  const absoluteImage = product.image.startsWith("http") ? product.image : `https://hondit-shop.vercel.app${product.image}`;
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
    description: productDescription,
    brand: { "@type": "Brand", name: "hondit" },
    sku: product.apiSlug || product.slug,
    offers: {
      "@type": "Offer",
      price: getMarketUnitPrice(product, market).toFixed(2),
      priceCurrency: market.currency,
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: productUrl,
    },
  };

  return (
    <V23Page>
      <main className="v23-product-detail hd-page hd-pdp">
        <nav className="hd-crumbs" aria-label="Breadcrumb"><Link to="/products">{marketText(language,"Collection","제품 목록")}</Link><span aria-hidden="true">/</span><span>{productName}</span></nav>
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <section className="hd-pdp__hero">
          <div className="hd-pdp__gallery" aria-label={productName}>
            <figure className="hd-pdp__media">
              <img
                src={product.image}
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
            {(productPhotos[product.slug] ?? []).map((photo) => <figure className="hd-pdp__photo" key={photo.file}>
              <img src={originals + photo.file} alt={productName} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
            </figure>)}
          </div>
          <div className="hd-pdp__info">
            <p className="hd-pdp__category">{productCategory}</p>
            <h1>{productName}</h1>
            <p className="hd-pdp__lead">{productDescription}</p>
            <p className="hd-pdp__price"><strong>{formatMarketUnitMoney(product, market)}</strong>{productFacts(product.slug)&&<small>{marketText(language,"General order unit price (20+)")}</small>}</p>
            <ProductSalesSummary product={product} showContact={false}/>
            <QuantityReview key={product.slug} product={product}/>
            {market.hasShopee&&product.shopee&&<a className="hd-textlink" href={product.shopee} target="_blank" rel="noreferrer">{marketText(language,"View Shopee store ↗")}</a>}
          </div>
        </section>

        <section className="hd-pdp__about" aria-label={marketText(language, "Product details", "상품 상세 설명")}>
          <article>
            <h2>{marketText(language, "GOOD FOR", "추천 용도")}</h2>
            <p className="hd-pdp__goodfor">{productGoodFor}</p>
          </article>
          <article>
            <h2>{marketText(language, "HIGHLIGHTS", "특징")}</h2>
            <ul>{cleanProductUsage(product.highlights).map((item) => <li key={item}>{marketProductText(language, item)}</li>)}</ul>
          </article>
          <article>
            <h2>{marketText(language, "HOW TO USE", "사용 방법")}</h2>
            <p className="product-label-note">{marketText(language,"Follow the product label. Supplier-approved precautions are required before use.","제품 라벨을 우선 확인해주세요. 공급사 승인 주의사항 확인이 필요합니다.")}</p>
            <ol>{cleanProductUsage(product.howTo).map((item) => <li key={item}>{marketProductText(language, item)}</li>)}</ol>
          </article>
        </section>

        <div className="hd-pdp__specs">
          {productFacts(product.slug)&&<DiffuserComparison/>}
          <ProductCare slug={product.slug}/>
          <Link className="hd-textlink" to={`/guide/${product.slug}`}>{marketText(language,"Product care & follow-up")} →</Link>
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
