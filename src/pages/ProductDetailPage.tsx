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
  const productDescription = marketProductText(language, product.description);
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
      <main className="v23-product-detail">
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <section className="v23-product-detail-hero">
          <figure>
            <img
              src={product.image}
              alt={productName}
              width={900}
              height={900}
              sizes="(max-width: 900px) 100vw, 48vw"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            {outOfStock && <span>{marketText(language, "Out of stock", "품절")}</span>}
          </figure>
          <div>
            <p className="v23-eyebrow"><span /> {productCategory}</p>
            <h1>{productName}</h1>
            <p>{productDescription}</p>
            <strong>{formatMarketUnitMoney(product, market)}</strong>
            <dl>
              <div>
                <dt>{marketText(language, "Minimum bulk order", "대량주문 최소 수량")}</dt>
                <dd>{product.bulkMoq} {marketText(language, "units", "개")}</dd>
              </div>
              <div>
                <dt>{marketText(language, "Bulk unit", "대량주문 단가")}</dt>
                <dd>{formatMarketUnitMoney(product, market)}</dd>
              </div>
              <div>
                <dt>{marketText(language, "Route", "구매 방식")}</dt>
                <dd>
                  {market.hasShopee
                    ? marketText(language, "Shopee retail or PayPal bulk checkout", "Shopee 개별구매 또는 PayPal 대량주문")
                    : marketText(language, "PayPal bulk checkout only", "PayPal 대량주문 전용")}
                </dd>
              </div>
            </dl>
            <div className="v23-actions">
              {market.hasShopee && (
                <a href={product.shopee} target="_blank" rel="noreferrer">
                  {marketText(language, "Buy on Shopee ->", "Shopee 구매 ->")}
                </a>
              )}
              <Link to={`/bulk-orders?product=${product.slug}`}>{marketText(language, "Bulk checkout ->", "대량주문 ->")}</Link>
              {!market.hasShopee && <Link to={`/contact?product=${product.slug}`}>{marketText(language, "Ask hondit ->", "문의하기 ->")}</Link>}
            </div>
          </div>
        </section>

        <section className="v23-product-detail-grid">
          <article>
            <p className="v23-eyebrow"><span /> {marketText(language, "GOOD FOR", "추천 용도")}</p>
            <h2>{productGoodFor}</h2>
          </article>
          <article>
            <p className="v23-eyebrow"><span /> {marketText(language, "HIGHLIGHTS", "특징")}</p>
            <ul>{product.highlights.map((item) => <li key={item}>{marketProductText(language, item)}</li>)}</ul>
          </article>
          <article>
            <p className="v23-eyebrow"><span /> {marketText(language, "HOW TO USE", "사용 방법")}</p>
            <ol>{product.howTo.map((item) => <li key={item}>{marketProductText(language, item)}</li>)}</ol>
          </article>
        </section>

        {showSingaporeDiffuserDetails && (
          <section className="v23-product-story" aria-label={marketText(language, "Product details", "상품 상세 설명")}>
            <header>
              <p className="v23-eyebrow"><span /> {marketText(language, "PRODUCT DETAILS", "상품 상세 설명")}</p>
              <h2>{productName}</h2>
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
