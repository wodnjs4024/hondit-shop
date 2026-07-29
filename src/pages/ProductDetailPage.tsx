import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { formatMarketUnitMoney, marketText, useMarket } from "../lib/market";
import { loadStorefrontProduct } from "../lib/storefrontApi";

export function ProductDetailPage() {
  const { market, language } = useMarket();
  const { productId = "" } = useParams();
  const [product, setProduct] = useState<StorefrontProduct | undefined>(() => v23Products.find((item) => item.slug === productId));

  useEffect(() => {
    loadStorefrontProduct(productId).then(setProduct).catch(() => undefined);
  }, [productId]);

  if (!productId) return <Navigate to="/products" replace />;
  if (!product) {
    return (
      <V23Page>
        <main className="v23-not-found">
          <p className="v23-eyebrow"><span /> PRODUCTS</p>
          <h1>{marketText(language, "Product not found.", "상품을 찾을 수 없습니다.")}</h1>
          <Link to="/products">{marketText(language, "Back to products", "상품 목록으로")}</Link>
        </main>
      </V23Page>
    );
  }

  const outOfStock = typeof product.stockQuantity === "number" && product.stockQuantity < product.bulkMoq;

  return (
    <V23Page>
      <main className="v23-product-detail">
        <section className="v23-product-detail-hero">
          <figure>
            <img src={product.image} alt={product.name} />
            {outOfStock && <span>{marketText(language, "Out of stock", "품절")}</span>}
          </figure>
          <div>
            <p className="v23-eyebrow"><span /> {product.category}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <strong>{formatMarketUnitMoney(product, market)}</strong>
            <dl>
              <div><dt>{marketText(language, "Bulk MOQ", "대량주문 MOQ")}</dt><dd>{product.bulkMoq} {marketText(language, "units", "개")}</dd></div>
              <div><dt>{marketText(language, "Bulk unit", "대량주문 단가")}</dt><dd>{formatMarketUnitMoney(product, market)}</dd></div>
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
                <a href={product.shopee} target="_blank" rel="noreferrer">{marketText(language, "Buy on Shopee ->", "Shopee 구매 ->")}</a>
              )}
              <Link to={`/bulk-orders?product=${product.slug}`}>{marketText(language, "Bulk checkout ->", "대량주문 ->")}</Link>
              {!market.hasShopee && <Link to={`/contact?product=${product.slug}`}>{marketText(language, "Ask hondit ->", "문의하기 ->")}</Link>}
            </div>
          </div>
        </section>

        <section className="v23-product-detail-grid">
          <article>
            <p className="v23-eyebrow"><span /> {marketText(language, "GOOD FOR", "추천 용도")}</p>
            <h2>{product.goodFor}</h2>
          </article>
          <article>
            <p className="v23-eyebrow"><span /> {marketText(language, "HIGHLIGHTS", "특징")}</p>
            <ul>{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <p className="v23-eyebrow"><span /> {marketText(language, "HOW TO USE", "사용 방법")}</p>
            <ol>{product.howTo.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        </section>
      </main>
    </V23Page>
  );
}
