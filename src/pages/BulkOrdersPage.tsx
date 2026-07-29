import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { v23Products, type StorefrontProduct } from "../data/v23SiteData";
import { formatMarketLineMoney, formatMarketUnitMoney, marketCountryName, marketText, useMarket } from "../lib/market";
import { loadStorefrontProducts } from "../lib/storefrontApi";

export function BulkOrdersPage() {
  const { market, language } = useMarket();
  const countryName = marketCountryName(market, language);
  const [params] = useSearchParams();
  const [products, setProducts] = useState<StorefrontProduct[]>(v23Products);
  const requested = params.get("product") || products[0]?.slug || "";
  const [selectedSlug, setSelectedSlug] = useState(requested);

  useEffect(() => {
    loadStorefrontProducts()
      .then((items) => {
        setProducts(items);
        if (!selectedSlug && items[0]) setSelectedSlug(items[0].slug);
      })
      .catch(() => undefined);
  }, [selectedSlug]);

  useEffect(() => {
    if (requested) setSelectedSlug(requested);
  }, [requested]);

  const selected = useMemo(() => products.find((product) => product.slug === selectedSlug) || products[0], [products, selectedSlug]);

  return (
    <V23Page>
      <main className="v23-bulk-page">
        <V23PageHero
          eyebrow={marketText(language, "DIRECT BULK CHECKOUT", "직접 대량주문")}
          title={marketText(language, "Build the order. Pay securely with PayPal.", "주문을 구성하고 PayPal로 결제하세요.")}
          description={marketText(
            language,
            `Choose a product, review its MOQ and fixed ${market.currency} total, add ${countryName} delivery details and continue to PayPal. Secret keys stay on the server.`,
            `상품과 MOQ, 고정 ${market.currency} 결제 금액을 확인한 뒤 ${countryName} 배송 정보를 입력하고 PayPal로 결제합니다. 비밀키는 서버에만 보관됩니다.`,
          )}
          image="/images/hondit-collection-hero.webp"
          imageAlt="hondit care and volcanic diffuser collection prepared for ordering."
        />

        <section className="v23-bulk-steps">
          <article><span>01</span><b>{marketText(language, "Choose one product", "상품 선택")}</b><p>{marketText(language, "MOQ and approved quantity increments are checked automatically.", "MOQ와 주문 단위가 자동으로 확인됩니다.")}</p></article>
          <article><span>02</span><b>{marketText(language, "Add delivery details", "배송 정보 입력")}</b><p>{marketText(language, `Required ${countryName} delivery information is saved only with the order.`, `${countryName} 배송 정보는 주문 기록에만 저장됩니다.`)}</p></article>
          <article><span>03</span><b>{marketText(language, "Pay with PayPal", "PayPal 결제")}</b><p>{marketText(language, `The server creates and captures ${market.currency} PayPal orders.`, `서버가 ${market.currency} PayPal 주문을 생성하고 결제 완료를 기록합니다.`)}</p></article>
          <article><span>04</span><b>{marketText(language, "Manage the order", "관리자 확인")}</b><p>{marketText(language, "Only completed paid orders appear in the protected admin console.", "결제 완료 주문만 관리자 페이지에 표시됩니다.")}</p></article>
        </section>

        <section className="v23-bulk-checkout">
          <div className="v23-bulk-list">
            <p className="v23-eyebrow"><span /> {marketText(language, "01 - PRODUCT", "01 - 상품")}</p>
            <h2>{marketText(language, "Choose a bulk product.", "대량주문 상품을 선택하세요.")}</h2>
            {products.map((product) => (
              <button key={product.slug} type="button" className={selected?.slug === product.slug ? "is-selected" : ""} onClick={() => setSelectedSlug(product.slug)}>
                <img src={product.image} alt="" />
                <span>
                  <small>{product.category}</small>
                  <b>{product.shortName}</b>
                  <em>{marketText(language, `${formatMarketUnitMoney(product, market)} each - MOQ ${product.bulkMoq}`, `개당 ${formatMarketUnitMoney(product, market)} - MOQ ${product.bulkMoq}`)}</em>
                </span>
              </button>
            ))}
          </div>

          <aside className="v23-bulk-summary">
            {selected && (
              <>
                <p className="v23-eyebrow"><span /> {marketText(language, "PAYPAL CHECKOUT", "PAYPAL 결제")}</p>
                <img src={selected.image} alt={selected.name} />
                <h2>{selected.name}</h2>
                <dl>
                  <div><dt>{marketText(language, "Minimum", "최소 수량")}</dt><dd>{selected.bulkMoq} {marketText(language, "units", "개")}</dd></div>
                  <div><dt>{marketText(language, "Unit price", "개당 가격")}</dt><dd>{formatMarketUnitMoney(selected, market)}</dd></div>
                  <div><dt>{marketText(language, "Minimum total", "최소 결제액")}</dt><dd>{formatMarketLineMoney(selected, selected.bulkMoq, market)}</dd></div>
                  <div><dt>{marketText(language, "Delivery", "배송")}</dt><dd>{marketText(language, market.checkoutNote, market.checkoutNoteKo)}</dd></div>
                </dl>
                <Link to={`/bulk-orders/${selected.apiSlug}`}>{marketText(language, "Continue to delivery and PayPal ->", "배송 입력 및 PayPal 결제로 ->")}</Link>
              </>
            )}
          </aside>
        </section>

        <section className="v23-route-banner">
          <h2>{marketText(language, "Need a mixed commercial order?", "여러 상품을 묶어 주문해야 하나요?")}</h2>
          <p>{marketText(language, "Use Contact for mixed quantities, special delivery instructions or a formal invoice request.", "혼합 수량, 특수 배송 요청, 인보이스 요청은 문의 페이지로 보내주세요.")}</p>
          <Link to="/contact">{marketText(language, "Go to contact ->", "문의하기 ->")}</Link>
        </section>
      </main>
    </V23Page>
  );
}
