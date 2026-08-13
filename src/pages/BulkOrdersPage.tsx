import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { V23Page, V23PageHero } from "../components/v23/SiteChrome";
import { v23Products, type StorefrontProduct } from "../data/v23SiteData";
import {
  formatMarketLineMoney,
  formatMarketUnitMoney,
  isStorefrontProductAllowedForMarket,
  marketCountryName,
  marketProductText,
  marketText,
  useMarket,
} from "../lib/market";
import { loadStorefrontProducts } from "../lib/storefrontApi";

export function BulkOrdersPage() {
  const { market, language } = useMarket();
  const countryName = marketCountryName(market, language);
  const [params] = useSearchParams();
  const [products, setProducts] = useState<StorefrontProduct[]>(v23Products);
  const marketProducts = useMemo(
    () => products.filter((product) => isStorefrontProductAllowedForMarket(product, market)),
    [products, market],
  );
  const requested = params.get("product");
  const [selectedSlug, setSelectedSlug] = useState(
    () => requested || marketProducts[0]?.slug || "",
  );

  useEffect(() => {
    loadStorefrontProducts()
      .then(setProducts)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setSelectedSlug((currentSlug) => {
      if (requested && marketProducts.some((product) => product.slug === requested)) {
        return requested;
      }
      if (marketProducts.some((product) => product.slug === currentSlug)) {
        return currentSlug;
      }
      return marketProducts[0]?.slug || "";
    });
  }, [marketProducts, requested]);

  const selected = useMemo(
    () => marketProducts.find((product) => product.slug === selectedSlug) || marketProducts[0],
    [marketProducts, selectedSlug],
  );

  return (
    <V23Page>
      <main className="v23-bulk-page">
        <V23PageHero
          eyebrow={marketText(language, "DIRECT BULK CHECKOUT", "직접 대량주문")}
          title={marketText(language, "Build the order. Pay securely with PayPal.", "주문을 구성하고 PayPal로 결제하세요.")}
          description={marketText(
            language,
            `Choose a product, review its MOQ and fixed ${market.currency} total, add ${countryName} delivery details and continue to PayPal. Pay securely through PayPal.`,
            `상품과 MOQ, 고정 ${market.currency} 결제 금액을 확인한 뒤 ${countryName} 배송 정보를 입력하고 PayPal로 안전하게 결제합니다.`,
          )}
          image="/images/hondit-collection-hero.webp"
          imageAlt={marketText(
            language,
            "hondit care and volcanic diffuser collection prepared for ordering.",
            "주문을 위해 준비된 hondit 케어와 화산석 디퓨저 제품.",
          )}
        />

        <section className="v23-bulk-steps">
          <article>
            <span>01</span>
            <b>{marketText(language, "Choose one product", "상품 선택")}</b>
            <p>{marketText(language, "MOQ and approved quantity increments are checked automatically.", "MOQ와 주문 단위가 자동으로 확인됩니다.")}</p>
          </article>
          <article>
            <span>02</span>
            <b>{marketText(language, "Add delivery details", "배송 정보 입력")}</b>
            <p>
              {marketText(
                language,
                `Required ${countryName} delivery information is saved only with the order.`,
                `${countryName} 배송 정보는 주문 기록에만 저장됩니다.`,
              )}
            </p>
          </article>
          <article>
            <span>03</span>
            <b>{marketText(language, "Pay with PayPal", "PayPal 결제")}</b>
            <p>
              {marketText(
                language,
                `PayPal checkout confirms the final ${market.currency} amount before the order is recorded.`,
                `주문이 기록되기 전에 PayPal 결제에서 최종 ${market.currency} 금액을 확인합니다.`,
              )}
            </p>
          </article>
          <article>
            <span>04</span>
            <b>{marketText(language, "Order confirmed", "주문 확정")}</b>
            <p>{marketText(language, "Your order is confirmed after payment is completed.", "결제가 완료된 주문만 배송 준비 단계로 넘어갑니다.")}</p>
          </article>
        </section>

        <section className="v23-bulk-checkout">
          <div className="v23-bulk-list">
            <p className="v23-eyebrow">
              <span /> {marketText(language, "01 - PRODUCT", "01 - 상품")}
            </p>
            <h2>{marketText(language, "Choose a bulk product.", "대량주문 상품을 선택하세요.")}</h2>
            {marketProducts.map((product) => {
              const productName = marketProductText(language, product.name);
              const shortName = marketProductText(language, product.shortName);
              const category = marketProductText(language, product.category);
              return (
                <button
                  key={product.slug}
                  type="button"
                  className={selected?.slug === product.slug ? "is-selected" : ""}
                  aria-pressed={selected?.slug === product.slug}
                  onClick={() => setSelectedSlug(product.slug)}
                >
                  <img src={product.image} alt="" />
                  <span>
                    <small>{category}</small>
                    <b>{shortName || productName}</b>
                    <em>
                      {marketText(
                        language,
                        `${formatMarketUnitMoney(product, market)} each - MOQ ${product.bulkMoq}`,
                        `개당 ${formatMarketUnitMoney(product, market)} - MOQ ${product.bulkMoq}`,
                      )}
                    </em>
                  </span>
                </button>
              );
            })}
          </div>

          <aside className="v23-bulk-summary">
            {selected && (
              <>
                <p className="v23-eyebrow">
                  <span /> {marketText(language, "PAYPAL CHECKOUT", "PAYPAL 결제")}
                </p>
                <img src={selected.image} alt={marketProductText(language, selected.name)} />
                <h2>{marketProductText(language, selected.name)}</h2>
                <dl>
                  <div>
                    <dt>{marketText(language, "Minimum", "최소 수량")}</dt>
                    <dd>
                      {selected.bulkMoq} {marketText(language, "units", "개")}
                    </dd>
                  </div>
                  <div>
                    <dt>{marketText(language, "Unit price", "개당 가격")}</dt>
                    <dd>{formatMarketUnitMoney(selected, market)}</dd>
                  </div>
                  <div>
                    <dt>{marketText(language, "Minimum total", "최소 결제액")}</dt>
                    <dd>{formatMarketLineMoney(selected, selected.bulkMoq, market)}</dd>
                  </div>
                  <div>
                    <dt>{marketText(language, "Delivery", "배송")}</dt>
                    <dd>{marketText(language, market.checkoutNote, market.checkoutNoteKo)}</dd>
                  </div>
                </dl>
                <Link to={`/bulk-orders/${selected.apiSlug}`}>
                  {marketText(language, "Continue to delivery and PayPal ->", "배송 입력 및 PayPal 결제로 ->")}
                </Link>
              </>
            )}
          </aside>
        </section>

        <section className="v23-route-banner">
          <h2>{marketText(language, "Need a mixed commercial order?", "여러 상품을 묶어 주문해야 하나요?")}</h2>
          <p>
            {marketText(
              language,
              "Use Contact for mixed quantities, special delivery instructions or a formal invoice request.",
              "혼합 수량, 특수 배송 요청, 인보이스 요청은 문의 페이지로 보내주세요.",
            )}
          </p>
          <Link to="/contact">{marketText(language, "Go to contact ->", "문의하기 ->")}</Link>
        </section>
      </main>
    </V23Page>
  );
}
