import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ProductReviews } from "../components/ProductReviews";
import { V23Page } from "../components/v23/SiteChrome";
import {
  BULK_QTY_STEP,
  bulkProducts,
  getBulkMaxUnits,
  getBulkMoq,
  getBulkProduct,
  getStockStatus,
  normalizeBulkQuantity,
  type BulkProduct,
} from "../data/bulkProducts";
import { EMAIL } from "../data/v23SiteData";
import { trackEvent } from "../lib/analytics";
import {
  capturePayPalOrder,
  createPayPalOrder,
  fetchBulkProducts,
  fetchPayPalConfig,
  updatePaymentAttempt,
  type CheckoutPayload,
} from "../lib/bulkApi";
import { formatCurrency, formatMarketUnitMoney, getMarketLineTotal, marketCountryName, marketProductText, marketText, useMarket } from "../lib/market";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onCancel?: (data: { orderID: string }) => Promise<void>;
        onError?: (error: unknown) => void;
      }) => { render: (selector: string) => Promise<void> };
    };
  }
}

type OrderForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  customerNote: string;
  reviewed: boolean;
};

const fallbackPayPalClientId = (import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined) || "";
const fallbackPayPalMode = ((import.meta.env.VITE_PAYPAL_MODE || import.meta.env.VITE_PAYPAL_ENV || "sandbox") as string).toLowerCase();

const initialForm: OrderForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  companyName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  customerNote: "",
  reviewed: false,
};

function readAttribution() {
  try {
    const stored = JSON.parse(window.localStorage.getItem("hondit_attribution") || "{}");
    const analyticsStored = JSON.parse(window.sessionStorage.getItem("hondit_attribution_v1") || "{}");
    return {
      utm_source: stored.utm_source || analyticsStored.traffic_source || "",
      utm_medium: stored.utm_medium || analyticsStored.traffic_medium || "",
      utm_campaign: stored.utm_campaign || analyticsStored.traffic_campaign || "",
      utm_content: stored.utm_content || analyticsStored.traffic_content || "",
      utm_term: stored.utm_term || analyticsStored.traffic_term || "",
      landing_page: stored.landing_page || analyticsStored.landing_page || "",
      referrer: stored.referrer || analyticsStored.referrer || "",
    };
  } catch {
    return {};
  }
}

function buildMailto(to: string, subject: string, lines: string[]) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export function BulkProductPage() {
  const { market, language } = useMarket();
  const countryName = marketCountryName(market, language);
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [packCount, setPackCount] = useState(0);
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [payPalConfig, setPayPalConfig] = useState({
    checkoutEnabled: true,
    clientId: fallbackPayPalClientId,
    mode: fallbackPayPalMode,
  });
  const formRef = useRef(initialForm);
  const quantityRef = useRef(0);
  const productRef = useRef<BulkProduct | null>(null);
  const createdOrderNumber = useRef("");

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
    fetchPayPalConfig()
      .then((config) =>
        setPayPalConfig({
          checkoutEnabled: config.checkoutEnabled !== false,
          clientId: config.clientId || fallbackPayPalClientId,
          mode: (config.mode || fallbackPayPalMode).toLowerCase(),
        }),
      )
      .catch(() => undefined);
  }, []);

  const matchedProduct = products.find((entry) => entry.slug === slug && entry.active) || getBulkProduct(slug);
  const product = matchedProduct || bulkProducts[0];
  const isLivePaymentTest = product.slug === "live-payment-test";
  const moq = getBulkMoq(product);
  const maxUnits = getBulkMaxUnits(product);
  const quantity = normalizeBulkQuantity(product, packCount || moq);
  const marketTotal = getMarketLineTotal(product, quantity, market);
  const stockStatus = getStockStatus(product);
  const soldOut = stockStatus === "Sold out";
  const productName = marketProductText(language, product.name);
  const productCategory = marketProductText(language, product.category);
  const productDescription = marketProductText(language, product.description);
  const productVolume = product.volumeLabel ? marketProductText(language, product.volumeLabel) : "";
  const localizedStockStatus = marketText(language, stockStatus);
  const paypalClientId = payPalConfig.clientId;
  const paypalMode = payPalConfig.mode;
  const checkoutDisabled = !payPalConfig.checkoutEnabled;
  const manualPaymentHref = buildMailto(EMAIL, `[hondit] Manual PayPal link request - ${product.name}`, [
    "Hello hondit,",
    "",
    "PayPal/card checkout did not complete. Please send me a direct PayPal payment link for this order.",
    "",
    `Market: ${market.label} / ${market.currency}`,
    `Product: ${product.name} ${product.volumeLabel || ""}`,
    `Quantity: ${quantity} units`,
    `Total payment: ${formatCurrency(marketTotal, market.currency, market.locale)}`,
    `Name: ${form.customerName || "-"}`,
    `Email: ${form.customerEmail || "-"}`,
    `Phone / WhatsApp: ${form.customerPhone || "-"}`,
    `Company: ${form.companyName || "-"}`,
    `Shipping address: ${[form.addressLine1, form.addressLine2, form.city, countryName, form.postalCode].filter(Boolean).join(", ") || "-"}`,
    `Order note: ${form.customerNote || "-"}`,
    "",
    "Please reply with the PayPal payment link and next steps.",
  ]);

  useEffect(() => {
    formRef.current = form;
    quantityRef.current = quantity;
    productRef.current = product;
  }, [form, product, quantity]);

  useEffect(() => {
    if (!paypalClientId || soldOut || checkoutDisabled) return;
    const container = document.getElementById("direct-paypal-buttons");
    if (container) container.innerHTML = "";
    document.querySelectorAll('script[id^="paypal-sdk-"]').forEach((script) => script.remove());
    window.paypal = undefined;
    setReady(false);

    const script = document.createElement("script");
    script.id = `paypal-sdk-${market.currency.toLowerCase()}`;
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${market.currency}&intent=capture`;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, [checkoutDisabled, market.currency, paypalClientId, soldOut]);

  const update = (key: keyof OrderForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const validate = (currentForm: OrderForm) => {
    if (soldOut) return marketText(language, "This product is currently sold out.", "현재 품절된 상품입니다.");
    if (checkoutDisabled) {
      return marketText(language, "Direct PayPal checkout is temporarily closed. Please contact hondit.", "PayPal 직접 결제가 잠시 닫혀 있습니다. hondit에 문의해주세요.");
    }
    if (
      !currentForm.customerName ||
      !currentForm.customerEmail ||
      !currentForm.customerPhone ||
      !currentForm.addressLine1 ||
      !currentForm.city ||
      !currentForm.postalCode
    ) {
      return marketText(language, "Please complete all required shipping fields before payment.", "결제 전 필수 배송 정보를 모두 입력해주세요.");
    }
    if (!currentForm.reviewed) {
      return marketText(language, "Please confirm the quantity, address and final payment amount.", "수량, 주소, 최종 결제 금액을 확인해주세요.");
    }
    return "";
  };

  const buildPayload = (currentProduct: BulkProduct, currentQuantity: number, currentForm: OrderForm): CheckoutPayload => ({
    orderType: "Direct bulk order",
    customerName: currentForm.customerName.trim(),
    customerEmail: currentForm.customerEmail.trim(),
    customerPhone: currentForm.customerPhone.trim(),
    companyName: currentForm.companyName.trim() || undefined,
    market: market.code,
    countryCode: market.countryCode,
    addressLine1: currentForm.addressLine1.trim(),
    addressLine2: currentForm.addressLine2.trim() || undefined,
    city: currentForm.city.trim(),
    postalCode: currentForm.postalCode.trim(),
    customerNote: currentForm.customerNote.trim() || undefined,
    attribution: readAttribution(),
    cart: [{ slug: currentProduct.slug, packCount: currentQuantity }],
  });

  useEffect(() => {
    const container = document.getElementById("direct-paypal-buttons");
    if (!ready || !window.paypal || !paypalClientId || !container || container.childElementCount > 0 || soldOut || checkoutDisabled) return;

    window.paypal
      .Buttons({
        createOrder: async () => {
          const currentForm = formRef.current;
          const currentProduct = productRef.current;
          const currentQuantity = quantityRef.current;
          if (!currentProduct) throw new Error("Product is not ready.");

          const validationError = validate(currentForm);
          if (validationError) {
            setError(validationError);
            throw new Error(validationError);
          }

          setError("");
          trackEvent("begin_checkout", {
            product_id: currentProduct.slug,
            quantity: currentQuantity,
            value: getMarketLineTotal(currentProduct, currentQuantity, market),
            currency: market.currency,
            market: market.code,
          });
          const response = await createPayPalOrder(buildPayload(currentProduct, currentQuantity, currentForm));
          createdOrderNumber.current = response.orderNumber;
          return response.paypalOrderId;
        },
        onApprove: async (data) => {
          try {
            const response = await capturePayPalOrder(data.orderID, createdOrderNumber.current);
            navigate(`/order-complete/${response.orderNumber}`);
          } catch (captureError) {
            const reason = captureError instanceof Error ? captureError.message : "Payment could not be completed.";
            await updatePaymentAttempt({
              orderNumber: createdOrderNumber.current,
              paypalOrderId: data.orderID,
              status: "payment_failed",
              reason,
            }).catch(() => undefined);
            navigate(`/payment-failed/${createdOrderNumber.current}`);
          }
        },
        onCancel: async (data) => {
          await updatePaymentAttempt({
            orderNumber: createdOrderNumber.current,
            paypalOrderId: data.orderID,
            status: "payment_cancelled",
            reason: "Customer cancelled PayPal checkout",
          }).catch(() => undefined);
          navigate(`/payment-failed/${createdOrderNumber.current}?status=cancelled`);
        },
        onError: (paypalError) => {
          console.error(paypalError);
          const reason = paypalError instanceof Error ? paypalError.message : "PayPal payment could not be completed.";
          if (createdOrderNumber.current) {
            updatePaymentAttempt({
              orderNumber: createdOrderNumber.current,
              status: "payment_failed",
              reason,
            }).catch(() => undefined);
            navigate(`/payment-failed/${createdOrderNumber.current}`);
            return;
          }
          setError(
            marketText(
              language,
              "Payment could not be completed. Please email your purchase conditions to hondit so we can reply with a direct PayPal payment link.",
              "결제가 완료되지 않았습니다. 구매 조건을 hondit에 메일로 보내주시면 직접 결제 가능한 PayPal 링크를 답장드리겠습니다.",
            ),
          );
        },
      })
      .render("#direct-paypal-buttons");
  }, [checkoutDisabled, language, market, navigate, paypalClientId, ready, soldOut]);

  if (!matchedProduct) return <Navigate to="/bulk-orders" replace />;

  return (
    <V23Page>
      <main className="bulk-page v23-operational-page">
        <section className="bulk-detail section-shell">
          <div className="section-inner section-inner--wide bulk-detail__grid">
            <figure className="bulk-detail__image">
              <img src={product.imageUrl} alt={productName} />
            </figure>

            <div className="bulk-detail__content">
              <Link className="text-link" to="/bulk-orders">
                {marketText(language, "Back to Bulk Orders", "대량주문으로 돌아가기")}
              </Link>
              <p className="eyebrow">
                {productCategory.toUpperCase()} {marketText(language, "BULK ORDER", "대량주문")}
              </p>
              <h1>{productName}</h1>
              {productVolume && <p className="bulk-detail__volume">{productVolume}</p>}

              {isLivePaymentTest && (
                <p className="setup-warning">
                  Hidden Live PayPal verification URL. Do not share this page with customers. Refund this test order after the admin check.
                </p>
              )}

              <p>{productDescription}</p>
              <p className="bulk-price-explainer">
                {market.hasShopee
                  ? marketText(
                      language,
                      "Bulk prices are lower because they exclude marketplace fees applied on Shopee. Ordering directly here passes those savings on to you.",
                      "대량주문가는 Shopee 마켓 수수료를 제외해 구성합니다. 직접 주문하면 그 차액을 고객 가격에 반영합니다.",
                    )
                  : marketText(
                      language,
                      `This market uses direct bulk checkout only. The displayed price is the fixed ${market.currency} bulk unit price.`,
                      `이 판매 지역은 직접 대량주문만 운영합니다. 표시 금액은 고정 ${market.currency} 대량주문 단가입니다.`,
                    )}
              </p>

              <dl className="bulk-price-list bulk-price-list--detail">
                <div>
                  <dt>{marketText(language, "Unit price", "개당 가격")}</dt>
                  <dd>{formatMarketUnitMoney(product, market)}</dd>
                </div>
                <div>
                  <dt>{marketText(language, "Minimum", "최소 수량")}</dt>
                  <dd>
                    {moq} {marketText(language, "units", "개")}
                  </dd>
                </div>
                <div>
                  <dt>{marketText(language, "Step", "주문 단위")}</dt>
                  <dd>
                    {BULK_QTY_STEP} {marketText(language, "units", "개")}
                  </dd>
                </div>
                <div>
                  <dt>{marketText(language, "Shipping", "배송")}</dt>
                  <dd>{marketText(language, market.checkoutNote, market.checkoutNoteKo)}</dd>
                </div>
              </dl>

              <p className={`stock-pill stock-pill--${stockStatus.toLowerCase().replaceAll(" ", "-")}`}>{localizedStockStatus}</p>
              <p className="shipping-pill">
                {marketText(
                  language,
                  `Order from ${moq} units, in steps of ${BULK_QTY_STEP}.${maxUnits ? ` Available up to ${maxUnits} units.` : ""}`,
                  `최소 ${moq}개부터 ${BULK_QTY_STEP}개 단위로 주문합니다.${maxUnits ? ` 최대 ${maxUnits}개까지 가능합니다.` : ""}`,
                )}
              </p>

              <section className="direct-order-box" aria-label="Direct bulk order">
                <div className="pack-stepper" aria-label="Order quantity">
                  <span>{marketText(language, "Order quantity", "주문 수량")}</span>
                  <div>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => setPackCount((value) => normalizeBulkQuantity(product, (value || moq) - BULK_QTY_STEP))}
                    >
                      -
                    </button>
                    <input
                      aria-label="Units"
                      disabled={soldOut}
                      inputMode="numeric"
                      value={quantity}
                      onChange={(event) => setPackCount(normalizeBulkQuantity(product, Number(event.target.value)))}
                    />
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => setPackCount((value) => normalizeBulkQuantity(product, (value || moq) + BULK_QTY_STEP))}
                    >
                      +
                    </button>
                  </div>
                  <em>
                    {marketText(
                      language,
                      `Minimum ${moq}. Increase in steps of ${BULK_QTY_STEP}.`,
                      `최소 ${moq}개. ${BULK_QTY_STEP}개 단위로 늘릴 수 있습니다.`,
                    )}
                  </em>
                </div>

                <div className="bulk-total-box">
                  <span>{marketText(language, "Total units", "총 수량")}</span>
                  <strong>{quantity}</strong>
                  <span>{marketText(language, "Total payment", "총 결제액")}</span>
                  <strong>{formatCurrency(marketTotal, market.currency, market.locale)}</strong>
                  <p>{marketText(language, market.checkoutNote, market.checkoutNoteKo)}</p>
                </div>

                <form className="checkout-form direct-order-form">
                  <label>
                    {marketText(language, "Full name", "이름")} *
                    <input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} />
                  </label>
                  <label>
                    {marketText(language, "Email", "이메일")} *
                    <input type="email" value={form.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} />
                  </label>
                  <label>
                    {marketText(language, "Phone / WhatsApp", "전화 / WhatsApp")} *
                    <input value={form.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} />
                  </label>
                  <label>
                    {marketText(language, "Company name", "회사명")}
                    <input value={form.companyName} onChange={(event) => update("companyName", event.target.value)} />
                  </label>
                  <label>
                    {marketText(language, "Country", "배송 지역")}
                    <input value={countryName} readOnly />
                  </label>
                  <label>
                    {marketText(language, "Address line 1", "주소 1")} *
                    <input value={form.addressLine1} onChange={(event) => update("addressLine1", event.target.value)} />
                  </label>
                  <label>
                    {marketText(language, "Address line 2", "주소 2")}
                    <input value={form.addressLine2} onChange={(event) => update("addressLine2", event.target.value)} />
                  </label>
                  <label>
                    {marketText(language, "City / District", "도시 / 지역")} *
                    <input value={form.city} onChange={(event) => update("city", event.target.value)} />
                  </label>
                  <label>
                    {marketText(language, "Postal code", "우편번호")} *
                    <input value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} />
                  </label>
                  <label className="checkout-form__wide">
                    {marketText(language, "Order note", "주문 메모")}
                    <textarea
                      value={form.customerNote}
                      onChange={(event) => update("customerNote", event.target.value)}
                      placeholder={marketText(
                        language,
                        "For receipt, company delivery name or special handling requests, write here.",
                        "영수증명, 회사 배송명, 별도 요청사항이 있으면 적어주세요.",
                      )}
                    />
                  </label>
                  <label className="checkout-confirm checkout-form__wide">
                    <input type="checkbox" checked={form.reviewed} onChange={(event) => update("reviewed", event.target.checked)} />
                    {marketText(
                      language,
                      "I confirm that my email, phone number, shipping address, product quantity and final payment amount are correct.",
                      "이메일, 전화번호, 배송 주소, 상품 수량, 최종 결제 금액이 정확한 것을 확인했습니다.",
                    )}
                  </label>
                </form>

                <div className="direct-payment-summary">
                  <div className="direct-payment-summary__header">
                    <span>{marketText(language, "Review before payment", "결제 전 확인")}</span>
                    <h2>{marketText(language, "Final payment check", "최종 결제 확인")}</h2>
                    <p>{marketText(language, "Please confirm these details before opening PayPal or card checkout.", "PayPal 또는 카드 결제창을 열기 전에 아래 정보를 확인해주세요.")}</p>
                  </div>
                  <div className="direct-payment-summary__total">
                    <span>{productName}</span>
                    <strong>
                      {quantity} {marketText(language, "units", "개")} / {formatCurrency(marketTotal, market.currency, market.locale)}
                    </strong>
                  </div>
                  <dl className="direct-payment-summary__details">
                    <div>
                      <dt>{marketText(language, "Full name", "이름")}</dt>
                      <dd>{form.customerName || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Email", "이메일")}</dt>
                      <dd>{form.customerEmail || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Phone / WhatsApp", "전화 / WhatsApp")}</dt>
                      <dd>{form.customerPhone || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Company", "회사명")}</dt>
                      <dd>{form.companyName || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Shipping address", "배송 주소")}</dt>
                      <dd>{[form.addressLine1, form.addressLine2, form.city, countryName, form.postalCode].filter(Boolean).join(", ") || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Order note", "주문 메모")}</dt>
                      <dd>{form.customerNote || marketText(language, "No note", "메모 없음")}</dd>
                    </div>
                  </dl>
                  <div className="direct-payment-summary__notice">
                    <strong>{marketText(language, "Pay with PayPal or credit/debit card.", "PayPal 또는 신용/직불카드로 결제합니다.")}</strong>
                    <span>{marketText(language, "For direct checkout, please use PayPal or an international card.", "직접 결제는 PayPal 또는 해외 결제가 가능한 카드로 진행해주세요.")}</span>
                    <span>
                      {marketText(
                        language,
                        "If checkout does not complete, email these purchase conditions to hondit. We will reply with a direct PayPal payment link.",
                        "결제가 완료되지 않으면 현재 구매 조건을 hondit 메일로 보내주세요. 확인 후 직접 결제 가능한 PayPal 링크를 답장드립니다.",
                      )}
                    </span>
                    {paypalMode === "sandbox" && (
                      <span>{marketText(language, `PayPal Sandbox payment. Currency: ${market.currency}.`, `PayPal Sandbox 결제입니다. 통화: ${market.currency}.`)}</span>
                    )}
                  </div>
                  <div className="manual-payment-fallback">
                    <strong>{marketText(language, "If PayPal/card checkout fails", "PayPal/카드 결제가 안 될 때")}</strong>
                    <p>
                      {marketText(
                        language,
                        "Send the product, quantity, payment total and delivery details by email. hondit will check the order and reply with a direct PayPal link.",
                        "상품, 수량, 결제금액, 배송정보를 메일로 보내주세요. hondit이 주문 내용을 확인한 뒤 직접 결제 가능한 PayPal 링크를 답장드립니다.",
                      )}
                    </p>
                    <a className="button button--ghost" href={manualPaymentHref}>
                      {marketText(language, "Email purchase conditions", "구매조건 메일 보내기")}
                    </a>
                  </div>
                </div>

                {error && <p className="form-error">{error}</p>}
                {soldOut ? (
                  <a className="button button--primary" href={`/contact?type=restock&product=${product.slug}`}>
                    {marketText(language, "Notify me", "입고 문의")}
                  </a>
                ) : checkoutDisabled ? (
                  <p className="setup-warning">
                    {marketText(language, "Direct PayPal checkout is temporarily closed. Please contact hondit for this order.", "PayPal 직접 결제가 잠시 닫혀 있습니다. 이 주문은 hondit에 문의해주세요.")}
                  </p>
                ) : !paypalClientId ? (
                  <p className="setup-warning">
                    {marketText(language, "Add PAYPAL_CLIENT_ID in Vercel to enable PayPal buttons.", "Vercel에 PAYPAL_CLIENT_ID를 추가하면 PayPal 버튼이 활성화됩니다.")}
                  </p>
                ) : (
                  <div id="direct-paypal-buttons" className="paypal-buttons" />
                )}
              </section>

              <section className="bulk-product-info">
                <h2>{marketText(language, "Product composition", "상품 구성")}</h2>
                <div className="product-card__chips">
                  {product.features.map((feature) => (
                    <span key={feature}>{marketProductText(language, feature)}</span>
                  ))}
                </div>
                <h2>{marketText(language, "Use and order notes", "사용 및 주문 안내")}</h2>
                <ul>
                  {product.usage.map((item) => (
                    <li key={item}>{marketProductText(language, item)}</li>
                  ))}
                  <li>{marketText(language, `Orders are currently available for delivery within ${countryName}.`, `현재 ${countryName} 배송 주문만 가능합니다.`)}</li>
                  <li>{marketText(language, market.checkoutNote, market.checkoutNoteKo)}</li>
                </ul>
              </section>
            </div>
          </div>
          <div className="section-inner section-inner--wide">
            <ProductReviews product={product} />
          </div>
        </section>
      </main>
    </V23Page>
  );
}
