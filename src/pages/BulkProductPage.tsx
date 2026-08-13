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
import {
  formatCurrency,
  formatMarketUnitMoney,
  getMarketLineTotal,
  isBulkProductAllowedForMarket,
  marketCountryName,
  marketProductText,
  marketText,
  useMarket,
} from "../lib/market";

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

  const apiMatch = products.find((entry) => entry.slug === slug && entry.active && isBulkProductAllowedForMarket(entry, market));
  const fallbackProduct = getBulkProduct(slug);
  const fallbackMatch = fallbackProduct?.active && isBulkProductAllowedForMarket(fallbackProduct, market) ? fallbackProduct : undefined;
  const firstAllowedProduct =
    products.find((entry) => entry.active && isBulkProductAllowedForMarket(entry, market)) ||
    bulkProducts.find((entry) => entry.active && isBulkProductAllowedForMarket(entry, market)) ||
    bulkProducts[0];
  const matchedProduct = apiMatch || fallbackMatch;
  const product = matchedProduct || firstAllowedProduct;
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
  const errorId = "bulk-checkout-error";
  const requiredFieldInvalid = (value: string) => Boolean(error && !value.trim());
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
    if (soldOut) return marketText(language, "This product is currently sold out.", "?꾩옱 ?덉젅???곹뭹?낅땲??");
    if (checkoutDisabled) {
      return marketText(language, "Direct PayPal checkout is temporarily closed. Please contact hondit.", "PayPal 吏곸젒 寃곗젣媛 ?좎떆 ?ロ? ?덉뒿?덈떎. hondit??臾몄쓽?댁＜?몄슂.");
    }
    if (
      !currentForm.customerName ||
      !currentForm.customerEmail ||
      !currentForm.customerPhone ||
      !currentForm.addressLine1 ||
      !currentForm.city ||
      !currentForm.postalCode
    ) {
      return marketText(language, "Please complete all required shipping fields before payment.", "寃곗젣 ???꾩닔 諛곗넚 ?뺣낫瑜?紐⑤몢 ?낅젰?댁＜?몄슂.");
    }
    if (!currentForm.reviewed) {
      return marketText(language, "Please confirm the quantity, address and final payment amount.", "?섎웾, 二쇱냼, 理쒖쥌 寃곗젣 湲덉븸???뺤씤?댁＜?몄슂.");
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
              "寃곗젣媛 ?꾨즺?섏? ?딆븯?듬땲?? 援щℓ 議곌굔??hondit??硫붿씪濡?蹂대궡二쇱떆硫?吏곸젒 寃곗젣 媛?ν븳 PayPal 留곹겕瑜??듭옣?쒕━寃좎뒿?덈떎.",
            ),
          );
        },
      })
      .render("#direct-paypal-buttons");
  }, [checkoutDisabled, language, market, navigate, paypalClientId, ready, soldOut]);

  if (!matchedProduct && firstAllowedProduct?.slug && slug !== firstAllowedProduct.slug) {
    return <Navigate to={`/bulk-orders/${firstAllowedProduct.slug}`} replace />;
  }

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
                      "??됱＜臾멸???Shopee 留덉폆 ?섏닔猷뚮? ?쒖쇅??援ъ꽦?⑸땲?? 吏곸젒 二쇰Ц?섎㈃ 洹?李⑥븸??怨좉컼 媛寃⑹뿉 諛섏쁺?⑸땲??",
                    )
                  : marketText(
                      language,
                      `This market uses direct bulk checkout only. The displayed price is the fixed ${market.currency} bulk unit price.`,
                      `???먮ℓ 吏??? 吏곸젒 ??됱＜臾몃쭔 ?댁쁺?⑸땲?? ?쒖떆 湲덉븸? 怨좎젙 ${market.currency} ??됱＜臾??④??낅땲??`,
                    )}
              </p>

              <dl className="bulk-price-list bulk-price-list--detail">
                <div>
                  <dt>{marketText(language, "Unit price", "개당 가격")}</dt>
                  <dd>{formatMarketUnitMoney(product, market)}</dd>
                </div>
                <div>
                  <dt>{marketText(language, "Minimum", "理쒖냼 ?섎웾")}</dt>
                  <dd>
                    {moq} {marketText(language, "units", "개")}
                  </dd>
                </div>
                <div>
                  <dt>{marketText(language, "Step", "二쇰Ц ?⑥쐞")}</dt>
                  <dd>
                    {BULK_QTY_STEP} {marketText(language, "units", "개")}
                  </dd>
                </div>
                <div>
                  <dt>{marketText(language, "Shipping", "諛곗넚")}</dt>
                  <dd>{marketText(language, market.checkoutNote, market.checkoutNoteKo)}</dd>
                </div>
              </dl>

              <p className={`stock-pill stock-pill--${stockStatus.toLowerCase().replaceAll(" ", "-")}`}>{localizedStockStatus}</p>
              <p className="shipping-pill">
                {marketText(
                  language,
                  `Order from ${moq} units, in steps of ${BULK_QTY_STEP}.${maxUnits ? ` Available up to ${maxUnits} units.` : ""}`,
                  `理쒖냼 ${moq}媛쒕???${BULK_QTY_STEP}媛??⑥쐞濡?二쇰Ц?⑸땲??${maxUnits ? ` 理쒕? ${maxUnits}媛쒓퉴吏 媛?ν빀?덈떎.` : ""}`,
                )}
              </p>

              <section className="direct-order-box" aria-label="Direct bulk order">
                <div className="pack-stepper" aria-label="Order quantity">
                  <span>{marketText(language, "Order quantity", "二쇰Ц ?섎웾")}</span>
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
                      `理쒖냼 ${moq}媛? ${BULK_QTY_STEP}媛??⑥쐞濡??섎┫ ???덉뒿?덈떎.`,
                    )}
                  </em>
                </div>

                <div className="bulk-total-box">
                  <span>{marketText(language, "Total units", "珥??섎웾")}</span>
                  <strong>{quantity}</strong>
                  <span>{marketText(language, "Total payment", "총 결제액")}</span>
                  <strong>{formatCurrency(marketTotal, market.currency, market.locale)}</strong>
                  <p>{marketText(language, market.checkoutNote, market.checkoutNoteKo)}</p>
                </div>

                <form className="checkout-form direct-order-form" aria-describedby={error ? errorId : undefined}>
                  <label htmlFor="bulk-customer-name">
                    {marketText(language, "Full name", "이름")} *
                    <input
                      id="bulk-customer-name"
                      name="customerName"
                      autoComplete="name"
                      required
                      aria-required="true"
                      aria-invalid={requiredFieldInvalid(form.customerName)}
                      aria-describedby={error ? errorId : undefined}
                      value={form.customerName}
                      onChange={(event) => update("customerName", event.target.value)}
                    />
                  </label>
                  <label htmlFor="bulk-customer-email">
                    {marketText(language, "Email", "이메일")} *
                    <input
                      id="bulk-customer-email"
                      name="customerEmail"
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      aria-invalid={requiredFieldInvalid(form.customerEmail)}
                      aria-describedby={error ? errorId : undefined}
                      value={form.customerEmail}
                      onChange={(event) => update("customerEmail", event.target.value)}
                    />
                  </label>
                  <label htmlFor="bulk-customer-phone">
                    {marketText(language, "Phone / WhatsApp", "전화 / WhatsApp")} *
                    <input
                      id="bulk-customer-phone"
                      name="customerPhone"
                      autoComplete="tel"
                      required
                      aria-required="true"
                      aria-invalid={requiredFieldInvalid(form.customerPhone)}
                      aria-describedby={error ? errorId : undefined}
                      value={form.customerPhone}
                      onChange={(event) => update("customerPhone", event.target.value)}
                    />
                  </label>
                  <label htmlFor="bulk-company-name">
                    {marketText(language, "Company name", "회사명")}
                    <input
                      id="bulk-company-name"
                      name="companyName"
                      autoComplete="organization"
                      value={form.companyName}
                      onChange={(event) => update("companyName", event.target.value)}
                    />
                  </label>
                  <label htmlFor="bulk-country">
                    {marketText(language, "Country", "배송 국가")}
                    <input id="bulk-country" name="country" autoComplete="country-name" value={countryName} readOnly />
                  </label>
                  <label htmlFor="bulk-address-line1">
                    {marketText(language, "Address line 1", "주소 1")} *
                    <input
                      id="bulk-address-line1"
                      name="addressLine1"
                      autoComplete="address-line1"
                      required
                      aria-required="true"
                      aria-invalid={requiredFieldInvalid(form.addressLine1)}
                      aria-describedby={error ? errorId : undefined}
                      value={form.addressLine1}
                      onChange={(event) => update("addressLine1", event.target.value)}
                    />
                  </label>
                  <label htmlFor="bulk-address-line2">
                    {marketText(language, "Address line 2", "주소 2")}
                    <input
                      id="bulk-address-line2"
                      name="addressLine2"
                      autoComplete="address-line2"
                      value={form.addressLine2}
                      onChange={(event) => update("addressLine2", event.target.value)}
                    />
                  </label>
                  <label htmlFor="bulk-city">
                    {marketText(language, "City / District", "도시 / 지역")} *
                    <input
                      id="bulk-city"
                      name="city"
                      autoComplete="address-level2"
                      required
                      aria-required="true"
                      aria-invalid={requiredFieldInvalid(form.city)}
                      aria-describedby={error ? errorId : undefined}
                      value={form.city}
                      onChange={(event) => update("city", event.target.value)}
                    />
                  </label>
                  <label htmlFor="bulk-postal-code">
                    {marketText(language, "Postal code", "우편번호")} *
                    <input
                      id="bulk-postal-code"
                      name="postalCode"
                      autoComplete="postal-code"
                      required
                      aria-required="true"
                      aria-invalid={requiredFieldInvalid(form.postalCode)}
                      aria-describedby={error ? errorId : undefined}
                      value={form.postalCode}
                      onChange={(event) => update("postalCode", event.target.value)}
                    />
                  </label>
                  <label className="checkout-form__wide" htmlFor="bulk-customer-note">
                    {marketText(language, "Order note", "주문 메모")}
                    <textarea
                      id="bulk-customer-note"
                      name="customerNote"
                      value={form.customerNote}
                      onChange={(event) => update("customerNote", event.target.value)}
                      placeholder={marketText(
                        language,
                        "For receipt, company delivery name or special handling requests, write here.",
                        "영수증, 회사 배송명, 별도 요청사항이 있으면 적어주세요.",
                      )}
                    />
                  </label>
                  <label className="checkout-confirm checkout-form__wide" htmlFor="bulk-reviewed">
                    <input
                      id="bulk-reviewed"
                      name="reviewed"
                      type="checkbox"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(error && !form.reviewed)}
                      aria-describedby={error ? errorId : undefined}
                      checked={form.reviewed}
                      onChange={(event) => update("reviewed", event.target.checked)}
                    />
                    {marketText(
                      language,
                      "I confirm that my email, phone number, shipping address, product quantity and final payment amount are correct.",
                      "이메일, 전화번호, 배송 주소, 상품 수량, 최종 결제 금액이 정확한 것을 확인했습니다.",
                    )}
                  </label>
                </form>

                <div className="direct-payment-summary">
                  <div className="direct-payment-summary__header">
                    <span>{marketText(language, "Review before payment", "寃곗젣 ???뺤씤")}</span>
                    <h2>{marketText(language, "Final payment check", "理쒖쥌 寃곗젣 ?뺤씤")}</h2>
                    <p>{marketText(language, "Please confirm these details before opening PayPal or card checkout.", "PayPal ?먮뒗 移대뱶 寃곗젣李쎌쓣 ?닿린 ?꾩뿉 ?꾨옒 ?뺣낫瑜??뺤씤?댁＜?몄슂.")}</p>
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
                      <dt>{marketText(language, "Phone / WhatsApp", "?꾪솕 / WhatsApp")}</dt>
                      <dd>{form.customerPhone || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Company", "회사명")}</dt>
                      <dd>{form.companyName || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Shipping address", "諛곗넚 二쇱냼")}</dt>
                      <dd>{[form.addressLine1, form.addressLine2, form.city, countryName, form.postalCode].filter(Boolean).join(", ") || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Order note", "二쇰Ц 硫붾え")}</dt>
                      <dd>{form.customerNote || marketText(language, "No note", "硫붾え ?놁쓬")}</dd>
                    </div>
                  </dl>
                  <div className="direct-payment-summary__notice">
                    <strong>{marketText(language, "Pay with PayPal or credit/debit card.", "PayPal ?먮뒗 ?좎슜/吏곷텋移대뱶濡?寃곗젣?⑸땲??")}</strong>
                    <span>{marketText(language, "For direct checkout, please use PayPal or an international card.", "吏곸젒 寃곗젣??PayPal ?먮뒗 ?댁쇅 寃곗젣媛 媛?ν븳 移대뱶濡?吏꾪뻾?댁＜?몄슂.")}</span>
                    <span>
                      {marketText(
                        language,
                        "If checkout does not complete, email these purchase conditions to hondit. We will reply with a direct PayPal payment link.",
                        "寃곗젣媛 ?꾨즺?섏? ?딆쑝硫??꾩옱 援щℓ 議곌굔??hondit 硫붿씪濡?蹂대궡二쇱꽭?? ?뺤씤 ??吏곸젒 寃곗젣 媛?ν븳 PayPal 留곹겕瑜??듭옣?쒕┰?덈떎.",
                      )}
                    </span>
                    {paypalMode === "sandbox" && (
                      <span>{marketText(language, `PayPal Sandbox payment. Currency: ${market.currency}.`, `PayPal Sandbox 寃곗젣?낅땲?? ?듯솕: ${market.currency}.`)}</span>
                    )}
                  </div>
                  <div className="manual-payment-fallback">
                    <strong>{marketText(language, "If PayPal/card checkout fails", "PayPal/카드 결제가 안 될 때")}</strong>
                    <p>
                      {marketText(
                        language,
                        "Send the product, quantity, payment total and delivery details by email. hondit will check the order and reply with a direct PayPal link.",
                        "?곹뭹, ?섎웾, 寃곗젣湲덉븸, 諛곗넚?뺣낫瑜?硫붿씪濡?蹂대궡二쇱꽭?? hondit??二쇰Ц ?댁슜???뺤씤????吏곸젒 寃곗젣 媛?ν븳 PayPal 留곹겕瑜??듭옣?쒕┰?덈떎.",
                      )}
                    </p>
                    <a className="button button--ghost" href={manualPaymentHref}>
                      {marketText(language, "Email purchase conditions", "구매조건 메일 보내기")}
                    </a>
                  </div>
                </div>

                {error && (
                  <p id={errorId} className="form-error" role="alert">
                    {error}
                  </p>
                )}
                {soldOut ? (
                  <a className="button button--primary" href={`/contact?type=restock&product=${product.slug}`}>
                    {marketText(language, "Notify me", "?낃퀬 臾몄쓽")}
                  </a>
                ) : checkoutDisabled ? (
                  <p className="setup-warning">
                    {marketText(language, "Direct PayPal checkout is temporarily closed. Please contact hondit for this order.", "PayPal 吏곸젒 寃곗젣媛 ?좎떆 ?ロ? ?덉뒿?덈떎. ??二쇰Ц? hondit??臾몄쓽?댁＜?몄슂.")}
                  </p>
                ) : !paypalClientId ? (
                  <p className="setup-warning">
                    {marketText(
                      language,
                      "Direct PayPal checkout is temporarily unavailable. Please email your purchase conditions so hondit can reply with a payment link.",
                      "PayPal 직접 결제를 일시적으로 사용할 수 없습니다. 구매 조건을 이메일로 보내주시면 결제 링크로 답장드리겠습니다.",
                    )}
                  </p>
                ) : (
                  <div id="direct-paypal-buttons" className="paypal-buttons" />
                )}
              </section>

              <section className="bulk-product-info">
                <h2>{marketText(language, "Product composition", "?곹뭹 援ъ꽦")}</h2>
                <div className="product-card__chips">
                  {product.features.map((feature) => (
                    <span key={feature}>{marketProductText(language, feature)}</span>
                  ))}
                </div>
                <h2>{marketText(language, "Use and order notes", "?ъ슜 諛?二쇰Ц ?덈궡")}</h2>
                <ul>
                  {product.usage.map((item) => (
                    <li key={item}>{marketProductText(language, item)}</li>
                  ))}
                  <li>{marketText(language, `Orders are currently available for delivery within ${countryName}.`, `?꾩옱 ${countryName} 諛곗넚 二쇰Ц留?媛?ν빀?덈떎.`)}</li>
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
