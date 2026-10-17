import {checkoutAnalytics} from '../../shared/checkout-analytics.js';
import {readCheckoutAttribution} from '../lib/attribution';
import {orderPanelCopy} from "../data/orderPanelCopy";
import {salesPresentationCopy} from '../data/salesPresentationCopy';
import {checkoutChargeCopy} from '../data/checkoutChargeCopy';
import {CheckoutAvailability} from "../components/CheckoutAvailability";
import {OrderBar} from "../components/OrderBar";
import {checkoutFlowCopy} from "../data/checkoutFlowCopy";
import {consultationBody,consultationMailto} from '../../shared/consultation.js';
import {readMixSelection,writeMixSelection} from '../../shared/mix-selection.js';
import {loadPayPalSdk,type PayPalSdk,type PayPalButtonsInstance} from '../lib/paypalSdk';
import {DiffuserQuantitySelector,usePurchaseQuantity} from '../components/DiffuserQuantitySelector';
import {isDiffuser} from '../../shared/diffuser-quantity.js';
import {PaymentRequestPanel} from "../components/PaymentRequestPanel";
import {paypalCurrencyDigits,resolveCheckoutCart,resolveCheckoutTerms} from "../../shared/checkout-terms.js";
import {checkoutDisplayState} from "../../shared/checkout-display.js";
import {purchasePurposes,purposeLabels} from "../../shared/purchase-context.js";
import {productFacts} from "../data/productFacts";
import {validQuantity} from "../../shared/sales-tools.js";
import {ConsultationPanel} from "../components/ConsultationPanel";
import {normalizeShipping,postalRequired} from "../../shared/shipping.js";
import { cleanProductUsage, sgTerms } from "../../shared/page-sales.js";
import { ProductSalesSummary } from "../components/ProductSalesSummary";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import {
  BULK_QTY_STEP,
  bulkProducts,
  getBulkMaxUnits,
  getBulkMoq,
  getBulkProduct,
  getStockStatus,
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

type OrderLine = { product: BulkProduct; quantity: number };

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

export function BulkProductPage() {
  const { market, language } = useMarket();
  const flowCopy = checkoutFlowCopy(language);
  const countryName = marketCountryName(market, language);
  const { slug = "" } = useParams();
  const isCleansingMixRoute = slug === "cleansing-mix";
  const navigate = useNavigate();
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [selectionParams]=useSearchParams();
  const purpose=purchasePurposes.includes(selectionParams.get("purpose")||"")?selectionParams.get("purpose"):"unspecified";
  const readOnlyPreview=import.meta.env.VITE_VERCEL_ENV==="preview";
  const [quantityText,setQuantityText]=usePurchaseQuantity(slug,String(getBulkProduct(slug)?.packQuantity??20));
  const [mixQuantities, setMixQuantities] = useState<Record<string, number>>(()=>readMixSelection(selectionParams.get("mix")??""));
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [deliveryChecked,setDeliveryChecked] = useState(false);
  const [paymentBusy,setPaymentBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [configState,setConfigState]=useState<"loading"|"ready"|"failed">("loading");
  const [sdkFailed,setSdkFailed]=useState(false);
  const [error, setError] = useState("");
  const [invalidField,setInvalidField]=useState("");
  const [payPalConfig, setPayPalConfig] = useState({
    checkoutEnabled: false,
    clientId: fallbackPayPalClientId,
    mode: fallbackPayPalMode,
  });
  const sdkRef=useRef<PayPalSdk|null>(null);
  const summaryRef=useRef<HTMLElement|null>(null);
  const formRef = useRef(initialForm);
  const orderLinesRef = useRef<OrderLine[]>([]);
  const productRef = useRef<BulkProduct | null>(null);
  const createdOrderNumber = useRef("");

  useEffect(() => {
    fetchBulkProducts().then(setProducts);
    fetchPayPalConfig()
      .then((config) => {
        setConfigState("ready");setPayPalConfig({
          checkoutEnabled: config.checkoutEnabled !== false,
          clientId: config.clientId || fallbackPayPalClientId,
          mode: (config.mode || fallbackPayPalMode).toLowerCase(),
        });
      })
      .catch(() => setConfigState("failed"));
  }, []);

  const apiMatch = products.find((entry) => entry.slug === slug && entry.active && isBulkProductAllowedForMarket(entry, market));
  const fallbackProduct = getBulkProduct(slug);
  const fallbackMatch = fallbackProduct?.active && isBulkProductAllowedForMarket(fallbackProduct, market) ? fallbackProduct : undefined;
  const firstAllowedProduct =
    products.find((entry) => entry.active && isBulkProductAllowedForMarket(entry, market)) ||
    bulkProducts.find((entry) => entry.active && isBulkProductAllowedForMarket(entry, market)) ||
    bulkProducts[0];
  const cleansingFallback =
    products.find((entry) => entry.active && entry.category === "cleansing" && isBulkProductAllowedForMarket(entry, market)) ||
    bulkProducts.find((entry) => entry.active && entry.category === "cleansing" && isBulkProductAllowedForMarket(entry, market));
  const matchedProduct = apiMatch || fallbackMatch || (isCleansingMixRoute ? cleansingFallback : undefined);
  const selectedBase = matchedProduct || firstAllowedProduct;
  const facts=productFacts(selectedBase.slug);
  const baseProduct = facts ? {...selectedBase,description:facts.description,features:[facts.container,"Jeju volcanic scoria","Citrus oil 10ml included","No flame","No electricity"]} : selectedBase;
  const product = market.code === "SG" && sgTerms(baseProduct) ? {...baseProduct,packQuantity:sgTerms(baseProduct)!.moq} : baseProduct;
  const isLivePaymentTest = product.slug === "live-payment-test";
  const moq = getBulkMoq(product);
  const maxUnits = getBulkMaxUnits(product);
  const quantity = Number(quantityText);
  const isCleansingMix = isCleansingMixRoute;
  const cleansingProducts = products.filter(
    (entry) => entry.active && entry.category === "cleansing" && isBulkProductAllowedForMarket(entry, market),
  );
  const orderLines: OrderLine[] = isCleansingMix
    ? cleansingProducts
        .map((entry) => ({ product: entry, quantity: mixQuantities[entry.slug] || 0 }))
        .filter((entry) => entry.quantity > 0)
    : [{ product, quantity }];
  const totalUnits = orderLines.reduce((sum, line) => sum + line.quantity, 0);
  const marketSubtotal = orderLines.reduce((sum, line) => sum + getMarketLineTotal(line.product, line.quantity, market), 0);
  const stockStatus = getStockStatus(product);
  const soldOut = isCleansingMix
    ? orderLines.some((line) => getStockStatus(line.product) === "Sold out")
    : stockStatus === "Sold out";
  const productName = isCleansingMix
    ? marketText(language, "Cleansing Mix Order", "클렌징 MIX 주문")
    : marketProductText(language, product.name);
  const productCategory = marketProductText(language, product.category);
  const productDescription = isCleansingMix
    ? marketText(
        language,
        market.code === "SG" ? "Singapore mixed orders require supplier confirmation. Please enquire before payment." : "Choose any combination of the three cleansing products. Start from 30 units total and add more in 10-unit steps.",
        "클렌징 3종을 원하는 구성으로 선택하세요. 합계 최소 30개부터 10개 단위로 추가할 수 있습니다.",
      )
    : marketProductText(language, product.description);
  const productVolume = product.volumeLabel ? marketProductText(language, product.volumeLabel) : "";
  const localizedStockStatus = marketText(language, stockStatus);
  const paypalClientId = readOnlyPreview ? "" : payPalConfig.clientId;
  const paypalMode = payPalConfig.mode;
  const errorId = "bulk-checkout-error";
  const requiredFieldInvalid = (value: string) => Boolean(error && !value.trim());
  const unitOption=(q:string)=>{const r=resolveCheckoutTerms(product,market.code,q);return r.referenceUnitMinor===null||!r.displayCurrency?undefined:`${orderPanelCopy(language).perUnit} ${formatCurrency(r.referenceUnitMinor/10**r.referenceDigits,r.displayCurrency,market.locale)}`;};
  const selectionDecision=isCleansingMix?resolveCheckoutCart(orderLines,market.code):resolveCheckoutTerms(product,market.code,quantityText);
  const marketTotal = selectionDecision.status === "direct" && "totalMinor" in selectionDecision && selectionDecision.totalMinor!==null ? selectionDecision.totalMinor/10**paypalCurrencyDigits(selectionDecision.billingCurrency!) : "referenceTotalMinor" in selectionDecision && selectionDecision.referenceTotalMinor!==null ? selectionDecision.referenceTotalMinor/10**selectionDecision.referenceDigits : marketSubtotal;
  const billingCurrency=selectionDecision.billingCurrency||market.currency;
  const invalidQuantity=selectionDecision.status==="unavailable";
  const inquiryOnly = invalidQuantity || selectionDecision.status!=="direct";
  const checkoutDisabled = readOnlyPreview || configState!=="ready" || !payPalConfig.checkoutEnabled || inquiryOnly;
  const paymentDisplay=checkoutDisplayState({preview:readOnlyPreview,configuration:configState,enabled:payPalConfig.checkoutEnabled,clientId:paypalClientId,sdkReady:ready,sdkFailed});
  const manualPaymentHref=consultationMailto(EMAIL,consultationBody({
    language,market:`${countryName} (${market.code})`,reason:'payment_request',
    purpose:purpose==='unspecified'?'':marketText(language,purposeLabels[purpose||'unspecified']),
    lines:orderLines.map(line=>({name:marketProductText(language,line.product.name)+' '+line.product.volumeLabel,quantity:line.quantity})),
    additional:[`${marketText(language,'Selected product amount')}: ${formatCurrency(marketTotal,'displayCurrency' in selectionDecision?String(selectionDecision.displayCurrency):market.currency,market.locale)}`,marketText(language,'Please confirm the billing currency, final amount and shipping terms, and send me a PayPal payment link.')].join('\n'),
  }));

  useEffect(()=>{
    if(!isCleansingMix)return;
    const url=new URL(window.location.href);
    const value=writeMixSelection(mixQuantities);
    if(value)url.searchParams.set('mix',value);else url.searchParams.delete('mix');
    url.searchParams.set('quantity',String(totalUnits));
    window.history.replaceState(window.history.state,'',url);
  },[isCleansingMix,mixQuantities,totalUnits]);

  useEffect(() => {
    formRef.current = form;
    orderLinesRef.current = orderLines;
    productRef.current = product;
  }, [form, orderLines, product]);

  useEffect(() => {
    let active=true;setReady(false);
    if (!paypalClientId || soldOut || checkoutDisabled) return;
    setSdkFailed(false);
    loadPayPalSdk(paypalClientId,billingCurrency).then(sdk=>{
      if(active){sdkRef.current=sdk;setReady(true);}
    }).catch(()=>{if(active)setSdkFailed(true)});
    return ()=>{active=false;};
  }, [checkoutDisabled, billingCurrency, paypalClientId, soldOut]);

  const update = (key: keyof OrderForm, value: string | boolean) => {setDeliveryChecked(false);setInvalidField("");setForm((current) => ({ ...current, [key]: value }));};
  const updateMixQuantity = (entry: BulkProduct, requested: number) => {
    const availableUnits = getBulkMaxUnits(entry);
    const stepped = Math.max(0, Math.floor((Number.isFinite(requested) ? requested : 0) / BULK_QTY_STEP) * BULK_QTY_STEP);
    const nextQuantity = availableUnits ? Math.min(stepped, availableUnits) : stepped;
    setMixQuantities((current) => ({ ...current, [entry.slug]: nextQuantity }));
  };

  const validate = (currentForm: OrderForm, currentLines: OrderLine[]) => {
    if (soldOut) return marketText(language, "This product is currently sold out.", "?꾩옱 ?덉젅???곹뭹?낅땲??");
    const cleansingUnits = currentLines
      .filter((line) => line.product.category === "cleansing")
      .reduce((sum, line) => sum + line.quantity, 0);
    if (isCleansingMix && cleansingUnits < moq) {
      return marketText(language, `Please select at least ${moq} cleansing units in total.`, `클렌징 제품을 합계 ${moq}개 이상 선택해 주세요.`);
    }
    if (checkoutDisabled) {
      return marketText(language, "Direct PayPal checkout is temporarily closed. Please contact hondit.", "PayPal 吏곸젒 寃곗젣媛 ?좎떆 ?ロ? ?덉뒿?덈떎. hondit??臾몄쓽?댁＜?몄슂.");
    }
    if (
      !currentForm.customerName ||
      !currentForm.customerEmail ||
      !currentForm.customerPhone ||
      !currentForm.addressLine1 ||
      !currentForm.city ||
      (postalRequired(market.countryCode) && !currentForm.postalCode)
    ) {
      return marketText(language, "Please complete all required shipping fields before payment.", "寃곗젣 ???꾩닔 諛곗넚 ?뺣낫瑜?紐⑤몢 ?낅젰?댁＜?몄슂.");
    }
    try { normalizeShipping({...currentForm,countryCode:market.countryCode},market); }
    catch (issue) { const field=String((issue as {field?:string}).field||'addressLine1');setInvalidField(field);const ids:Record<string,string>={customerName:'bulk-customer-name',addressLine1:'bulk-address-line1',addressLine2:'bulk-address-line2',city:'bulk-city',postalCode:'bulk-postal-code'};document.getElementById(ids[field])?.focus();return marketText(language,'Check this field.'); }
    const invalidInput=document.querySelector<HTMLInputElement>('.direct-order-form input:invalid');
    if(invalidInput){setInvalidField(invalidInput.name);invalidInput.focus();return marketText(language,'Check this field.');}
    if (!currentForm.reviewed) {
      return marketText(language, "Please confirm the quantity, address and final payment amount.", "?섎웾, 二쇱냼, 理쒖쥌 寃곗젣 湲덉븸???뺤씤?댁＜?몄슂.");
    }
    return "";
  };

  const reviewDelivery = () => {
    const issue = validate(formRef.current, orderLinesRef.current);
    if (issue) {
      setDeliveryChecked(false);setError(issue);
      const invalid = document.querySelector<HTMLInputElement>('.direct-order-form input:invalid');
      invalid?.focus();invalid?.scrollIntoView({block:'center'});return false;
    }
    setError("");setDeliveryChecked(true);
    const target = document.getElementById('paypal-payment-step');
    target?.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    target?.focus({preventScroll:true});return true;
  };
  useEffect(()=>{setDeliveryChecked(false);setForm(current=>({...current,reviewed:false}));},[market.code,slug,quantityText]);

  const buildPayload = (currentLines: OrderLine[], currentForm: OrderForm): CheckoutPayload => ({
    orderType: "Direct bulk order",
    language,
    fulfillment:"international_bundle",
    purpose:purpose||"unspecified",
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
    attribution: readCheckoutAttribution(),
    cart: currentLines.map((line) => ({ slug: line.product.slug, packCount: line.quantity })),
  });

  useEffect(() => {
    const container = document.getElementById("direct-paypal-buttons");
    if (!ready || typeof sdkRef.current?.Buttons!=='function' || !paypalClientId || !container || soldOut || checkoutDisabled) return;
    let active=true;let buttons:PayPalButtonsInstance|undefined;
    // Use a fresh child host so async SDK cleanup cannot remove the next instance.
    const host=document.createElement('div');container.appendChild(host);
    try {

    buttons=sdkRef.current.Buttons({
        onClick: (_data:unknown, actions:{resolve:()=>Promise<void>;reject:()=>Promise<void>}) => reviewDelivery()?actions.resolve():actions.reject(),
        createOrder: async () => {
          const currentForm = formRef.current;
          const currentProduct = productRef.current;
          const currentLines = orderLinesRef.current;
          if (!currentProduct) throw new Error("Product is not ready.");

          const validationError = validate(currentForm, currentLines);
          if (validationError) {
            setError(validationError);
            const invalid=document.querySelector<HTMLInputElement>('.direct-order-form input:invalid');
            invalid?.focus(); invalid?.scrollIntoView({block:'center'});
            throw new Error(validationError);
          }

          setError("");
          setPaymentBusy(true);
          trackEvent("begin_checkout", {
            fulfillment:'international_bundle',
            purchase_purpose:purpose,
            product_id: currentProduct.slug,
            product_name: currentLines.length > 1 ? "Mixed cleansing order" : currentProduct.name,
            ...checkoutAnalytics(currentLines,market.code),
            checkout_stage: "checkout_started",
          });
          try {
            const response = await createPayPalOrder(buildPayload(currentLines, currentForm));
            createdOrderNumber.current = response.orderNumber;
            trackEvent("checkout_order_created", {
              checkout_step: "paypal_order_created",
              checkout_stage: "paypal_order_created",
              product_id: currentProduct.slug,
              order_number: response.orderNumber,
              paypal_order_id: response.paypalOrderId,
              market: market.code,
              currency: market.currency,
            });
            return response.paypalOrderId;
          } catch (createError) {
            setPaymentBusy(false);
            const reason = createError instanceof Error ? createError.message : "PayPal order could not be created.";
            trackEvent("checkout_failure", {
              checkout_step: "create_order",
              checkout_stage: "create_order_failed",
              reason_code: "order_creation_failed",
              failure_reason: "order_creation_failed",
              product_id: currentProduct.slug,
              market: market.code,
              currency: market.currency,
              error_message: reason.slice(0, 120),
            });
            throw createError;
          }
        },
        onApprove: async (data:{orderID:string}) => {
          setPaymentBusy(true);
          trackEvent("checkout_approved", {
            checkout_step: "paypal_approval_complete",
            checkout_stage: "paypal_approval_complete",
            order_number: createdOrderNumber.current,
            paypal_order_id: data.orderID,
            product_id: productRef.current?.slug || "unknown",
          });
          try {
            const response = await capturePayPalOrder(data.orderID, createdOrderNumber.current);
            trackEvent("checkout_capture_success", {
              checkout_step: "capture_complete",
              checkout_stage: "capture_complete",
              order_number: response.orderNumber,
              paypal_order_id: data.orderID,
              market: market.code,
              currency: market.currency,
            });
            navigate(`/order-complete/${response.orderNumber}`);
          } catch (captureError) {
            setError(marketText(language,"We could not confirm the payment status. Do not pay again; contact HONDIT with your order reference."));
            navigate('/order-complete/'+createdOrderNumber.current+'?verification=pending');
          }
        },
        onCancel: async (data:{orderID:string}) => {
          setPaymentBusy(false);
          trackEvent("checkout_cancel", {
            checkout_step: "paypal_approval",
            checkout_stage: "buyer_cancelled",
            reason_code: "buyer_closed_paypal",
            failure_reason: "buyer_closed_paypal",
            order_number: createdOrderNumber.current,
            product_id: productRef.current?.slug || "unknown",
            paypal_order_id: data.orderID || "",
          });
          await updatePaymentAttempt({
            orderNumber: createdOrderNumber.current,
            paypalOrderId: data.orderID,
            status: "payment_cancelled",
            reason: "Buyer closed or cancelled the PayPal approval window",
            reasonCode: "buyer_closed_paypal",
            checkoutStep: "paypal_approval",
            clientContext: { page_visibility: document.visibilityState },
          }).catch(() => undefined);
          createdOrderNumber.current = "";
          setError(flowCopy.cancelled);
        },
        onError: (paypalError:unknown) => {
          setPaymentBusy(false);
          console.error("PayPal widget error");
          const reason = paypalError instanceof Error ? paypalError.message : "PayPal payment could not be completed.";
          trackEvent("checkout_error", {
            checkout_step: "paypal_widget",
            checkout_stage: createdOrderNumber.current ? "paypal_sdk_failed" : "paypal_sdk_init_failed",
            reason_code: createdOrderNumber.current ? "paypal_sdk_error" : "paypal_sdk_init_error",
            failure_reason: createdOrderNumber.current ? "paypal_sdk_error" : "paypal_sdk_init_error",
            order_number: createdOrderNumber.current,
            product_id: productRef.current?.slug || "unknown",
            error_message: reason.slice(0, 120),
          });
          if (createdOrderNumber.current) {
            navigate('/order-complete/'+createdOrderNumber.current+'?verification=pending');
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
      });
      buttons.render(host).catch(()=>{if(active)setSdkFailed(true)});
    }catch{setSdkFailed(true);}
    return ()=>{
      active=false;
      try{Promise.resolve(buttons?.close?.()).catch(()=>undefined);}catch{/* Keep SDK cleanup failures inside the payment area. */}
      host.remove();
    };
  }, [checkoutDisabled, isCleansingMix, language, market, moq, navigate, paypalClientId, product.slug, ready, soldOut, purpose]);

  if(isCleansingMix&&cleansingProducts.length===0)return <Navigate to={`/bulk-orders?market=${market.code}&lang=${language}`} replace/>;
  if (!matchedProduct && firstAllowedProduct?.slug && slug !== firstAllowedProduct.slug) {
    return <Navigate to={`/bulk-orders/${firstAllowedProduct.slug}`} replace />;
  }

  const o=orderPanelCopy(language);
  const terms=selectionDecision as {shippingIncluded?:boolean;shippingMinor?:number|null;billingCurrency?:string|null;referenceUnitMinor?:number|null;referenceDigits?:number;displayCurrency?:string|null};
  const displayCurrency=terms.displayCurrency?String(terms.displayCurrency):market.currency;
  const directTerms=selectionDecision.status==="direct"&&"shippingMinor" in selectionDecision;
  const unitsText=Number.isSafeInteger(totalUnits)&&totalUnits>0?`${totalUnits} ${o.units}`:"—";
  const totalText=invalidQuantity?"—":formatCurrency(marketTotal,displayCurrency,market.locale);
  const unitText=!isCleansingMix&&!invalidQuantity&&terms.referenceUnitMinor!=null?formatCurrency(terms.referenceUnitMinor/10**(terms.referenceDigits??2),displayCurrency,market.locale):null;
  const shippingText=directTerms?(terms.shippingIncluded?o.included:formatCurrency(terms.shippingMinor!/10**paypalCurrencyDigits(terms.billingCurrency!),terms.billingCurrency!,market.locale)):o.confirm;
  const summaryCta=soldOut||invalidQuantity?null:inquiryOnly?{href:"#payment-request",label:checkoutChargeCopy(language).quote}:deliveryChecked?{href:"#paypal-payment-step",label:o.toPay}:{href:"#shipping-step",label:o.toShipping};
  /* One order summary: the only place quantity, unit price, shipping and the total are stated together. */
  const summary=<aside className="checkout-summary" ref={summaryRef} aria-label={o.summary}>
    <div className="checkout-summary__core">
      <h2 className="checkout-summary__title">{o.summary}</h2>
      <div className="checkout-summary__product">
        <figure className="bulk-detail__image"><img src={isCleansingMix ? "/images/hondit-pack/hondit_codex_image_pack/02_brand_lifestyle/03_cleansing_trio_ice.webp" : product.imageUrl} alt={productName}/></figure>
        <p><strong>{productName}</strong>{!isCleansingMix&&productVolume&&<span>{productVolume}</span>}</p>
      </div>
      <dl className="order-lines">
        <div><dt>{o.quantity}</dt><dd>{unitsText}</dd></div>
        {unitText&&<div><dt>{o.unit}</dt><dd>{unitText}</dd></div>}
        <div><dt>{o.shipping}</dt><dd className={directTerms&&terms.shippingIncluded?"is-included":"is-pending"}>{shippingText}</dd></div>
        <div><dt>{o.tax}</dt><dd className="is-note">{o.taxValue}</dd></div>
      </dl>
      <Link className="checkout-policy-link" to="/shipping#customs-costs">{salesPresentationCopy(language).taxDetails}</Link>
      <div className="order-total"><span>{inquiryOnly?o.estimate:o.total}{directTerms&&terms.billingCurrency&&<small>{terms.billingCurrency}</small>}</span><output aria-live="polite">{totalText}</output></div>
      <CheckoutAvailability status={selectionDecision.status} reason={selectionDecision.reason}/>
      {summaryCta&&<a className="button button--primary order-cta" href={summaryCta.href}><span>{summaryCta.label}</span><i aria-hidden="true">↓</i></a>}
    </div>
  </aside>;

  return (
    <V23Page>
      <main className="bulk-page v23-operational-page checkout-flow">
        <section className="bulk-detail section-shell">
          <div className="section-inner section-inner--wide bulk-detail__grid checkout-grid">
            <header className="checkout-head">
              <Link className="text-link" to="/bulk-orders">
                {marketText(language, "Back to Bulk Orders", "대량주문으로 돌아가기")}
              </Link>
              <p className="eyebrow">
                {productCategory.toUpperCase()} {marketText(language, "BULK ORDER", "대량주문")}
              </p>
              <h1>{productName}</h1>
              {!isCleansingMix && productVolume && <p className="bulk-detail__volume">{productVolume}</p>}
              {!inquiryOnly&&<nav className="checkout-step-links" aria-label={flowCopy.steps}><a href="#shipping-step">{flowCopy.shipping}</a><a href="#paypal-payment-step">{flowCopy.payment}</a></nav>}
            </header>
            {summary}
            <div className="bulk-detail__content checkout-main">
              {isLivePaymentTest && (
                <p className="setup-warning">
                  Hidden Live PayPal verification URL. Do not share this page with customers. Refund this test order after the admin check.
                </p>
              )}

              {isCleansingMix?<aside className="mix-selection-summary product-sales-summary"><h2>{marketText(language,'Selected mix')}</h2><dl><div><dt>{marketText(language,'Total units')}</dt><dd>{totalUnits}</dd></div><div><dt>{marketText(language,'Selected product amount')}</dt><dd>{formatCurrency(marketTotal,market.currency,market.locale)}</dd></div></dl><p>{marketText(language,'Combined minimum: 30 units. Select each product in 10-unit steps.')}</p><p>{marketText(language,'Shipping and payment require confirmation. Extra freight may apply; your selection is kept in the payment request.')}</p></aside>:null}

              <h2 className="order-step-heading">{orderPanelCopy(language).qty}</h2>
              <p className={`stock-pill stock-pill--${stockStatus.toLowerCase().replaceAll(" ", "-")}`}>{localizedStockStatus}</p>
              <p className="shipping-pill">
                {marketText(
                  language,
                  isDiffuser(product) ? "Trial: 10 units. General order: 20 or more. Shipping scope is confirmed per quantity." : market.code === "SG"
                    ? "Single-product MOQ bundle for direct checkout. Additional quantities and combinations require an enquiry."
                    : isCleansingMix
                    ? `Mix any cleansing products in steps of ${BULK_QTY_STEP}. Combined minimum: ${moq} units.`
                    : `Order from ${moq} units, in steps of ${BULK_QTY_STEP}.${maxUnits ? ` Available up to ${maxUnits} units.` : ""}`,
                  isDiffuser(product) ? "체험 주문 10개 · 일반 주문 20개 이상. 배송 범위는 수량별로 확인합니다." : market.code === "SG"
                    ? "단일 상품 MOQ 묶음만 직접결제 가능합니다. 추가 수량·혼합 구성은 문의해주세요."
                    : isCleansingMix
                    ? `클렌징 3종을 ${BULK_QTY_STEP}개 단위로 자유롭게 섞을 수 있습니다. 합계 최소 ${moq}개입니다.`
                    : `최소 ${moq}개부터 ${BULK_QTY_STEP}개 단위로 주문합니다.${maxUnits ? ` 최대 ${maxUnits}개까지 가능합니다.` : ""}`,
                )}
              </p>

              <section className="direct-order-box" aria-label="Direct bulk order">
                {isCleansingMix ? (
                  <div className="cleansing-mix" aria-label="Cleansing product mix">
                    <div className="cleansing-mix__intro">
                      <strong>{marketText(language, "Build your cleansing mix", "클렌징 구성 선택")}</strong>
                      <span>{marketText(language, "Choose each product in 10-unit steps. The combined order must be at least 30 units.", "제품별로 10개 단위로 선택하세요. 세 제품의 합계가 30개 이상이어야 합니다.")}</span>
                    </div>
                    {cleansingProducts.map((entry) => {
                      const entryQuantity = mixQuantities[entry.slug] || 0;
                      const entrySoldOut = getStockStatus(entry) === "Sold out";
                      return (
                        <div className="cleansing-mix__row" key={entry.slug}>
                          <strong className="cleansing-mix__product">{marketProductText(language, entry.name)}</strong>
                          <div className="cleansing-mix__stepper">
                            <button type="button" aria-label={`Decrease ${entry.name}`} disabled={entrySoldOut || entryQuantity === 0} onClick={() => updateMixQuantity(entry, entryQuantity - BULK_QTY_STEP)}>-</button>
                            <input aria-label={`${entry.name} units`} disabled={entrySoldOut} inputMode="numeric" value={entryQuantity} onChange={(event) => updateMixQuantity(entry, Number(event.target.value))} />
                            <button type="button" aria-label={`Increase ${entry.name}`} disabled={entrySoldOut} onClick={() => updateMixQuantity(entry, entryQuantity + BULK_QTY_STEP)}>+</button>
                          </div>
                        </div>
                      );
                    })}
                    <p className={totalUnits < moq ? "cleansing-mix__minimum cleansing-mix__minimum--warning" : "cleansing-mix__minimum"}>
                      {marketText(language, "Selected", "선택 수량")}: <strong>{Number.isSafeInteger(totalUnits)&&totalUnits>0?totalUnits:"—"}</strong> / {marketText(language, "minimum", "최소")} {moq}
                    </p>
                  </div>
                ) : (
                isDiffuser(product)?<DiffuserQuantitySelector value={quantityText} onChange={setQuantityText} disabled={soldOut} optionPrices={{trial:unitOption("10"),general:unitOption("20")}}/>:<div className="pack-stepper" aria-label="Order quantity">
                  <span>{marketText(language, "Order quantity", "二쇰Ц ?섎웾")}</span>
                  <div>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => setQuantityText(String(Math.max(moq,quantity-BULK_QTY_STEP)))}
                    >
                      -
                    </button>
                    <input
                      aria-label="Units"
                      disabled={soldOut}
                      inputMode="numeric"
                      value={quantityText}
                      onChange={(event) => setQuantityText(event.target.value)}
                    />
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => setQuantityText(String(quantity+BULK_QTY_STEP))}
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
                )}

                <fieldset className="direct-checkout-fields" hidden={inquiryOnly} disabled={inquiryOnly}>
                {error && (
                  <p id={errorId} className="form-error" role="alert">
                    {marketText(language,error)}
                  </p>
                )}
                <form id="shipping-step" className="checkout-form direct-order-form" aria-describedby={error ? errorId : undefined} onSubmit={event=>{event.preventDefault();reviewDelivery();}}>
                  <h2 className="checkout-form__wide order-step-heading">{flowCopy.shipping}</h2>
                  <label htmlFor="bulk-customer-name">
                    {marketText(language, "Delivery recipient")} *
                    <input
                      id="bulk-customer-name"
                      name="customerName"
                      autoComplete="name"
                      required
                      aria-required="true"
                      aria-invalid={(invalidField === "customerName" || requiredFieldInvalid(form.customerName))}
                      aria-describedby={error ? errorId : undefined}
                      value={form.customerName}
                      onChange={(event) => update("customerName", event.target.value)}
                    />{(invalidField === "customerName" || requiredFieldInvalid(form.customerName)) && <small role="alert">{marketText(language,"Check this field.")}</small>}
                  </label>
                  <label htmlFor="bulk-customer-email">
                    {marketText(language, "Email", "이메일")} *<small>{marketText(language,"For order updates.")}</small>
                    <input
                      id="bulk-customer-email"
                      name="customerEmail"
                      type="email" inputMode="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      aria-invalid={(invalidField === "customerEmail" || requiredFieldInvalid(form.customerEmail))}
                      aria-describedby={error ? errorId : undefined}
                      value={form.customerEmail}
                      onChange={(event) => update("customerEmail", event.target.value)}
                    />{(invalidField === "customerEmail" || requiredFieldInvalid(form.customerEmail)) && <small role="alert">{marketText(language,"Check this field.")}</small>}
                  </label>
                  <label htmlFor="bulk-customer-phone">
                    {marketText(language, "Delivery phone")} *
                    <input
                      id="bulk-customer-phone"
                      name="customerPhone"
                      type="tel" inputMode="tel"
                      autoComplete="tel"
                      required
                      aria-required="true"
                      aria-invalid={(invalidField === "customerPhone" || requiredFieldInvalid(form.customerPhone))}
                      aria-describedby={error ? errorId : undefined}
                      value={form.customerPhone}
                      onChange={(event) => update("customerPhone", event.target.value)}
                    />{(invalidField === "customerPhone" || requiredFieldInvalid(form.customerPhone)) && <small role="alert">{marketText(language,"Check this field.")}</small>}
                  </label>

                  <div className="checkout-country">
                    {marketText(language, "Country", "배송 국가")}
                    <strong id="bulk-country">{countryName}</strong>
                  </div>
                  <label htmlFor="bulk-address-line1">
                    {marketText(language, "Address line 1", "주소 1")} *
                    <input
                      id="bulk-address-line1"
                      name="addressLine1"
                      autoComplete="address-line1"
                      required
                      aria-required="true"
                      aria-invalid={(invalidField === "addressLine1" || requiredFieldInvalid(form.addressLine1))}
                      aria-describedby={error ? errorId : undefined}
                      value={form.addressLine1}
                      onChange={(event) => update("addressLine1", event.target.value)}
                    />{(invalidField === "addressLine1" || requiredFieldInvalid(form.addressLine1)) && <small role="alert">{marketText(language,"Check this field.")}</small>}
                  </label>

                  <label htmlFor="bulk-city">
                    {marketText(language, "City / District", "도시 / 지역")} *
                    <input
                      id="bulk-city"
                      name="city"
                      autoComplete="address-level2"
                      required
                      aria-required="true"
                      aria-invalid={(invalidField === "city" || requiredFieldInvalid(form.city))}
                      aria-describedby={error ? errorId : undefined}
                      value={form.city}
                      onChange={(event) => update("city", event.target.value)}
                    />{(invalidField === "city" || requiredFieldInvalid(form.city)) && <small role="alert">{marketText(language,"Check this field.")}</small>}
                  </label>
                  {postalRequired(market.countryCode) ? (
                  <label htmlFor="bulk-postal-code">
                    {marketText(language, "Postal code", "우편번호")} *
                    <input
                      id="bulk-postal-code"
                      name="postalCode"
                      autoComplete="postal-code"
                      inputMode={market.code === "BN" ? "text" : "numeric"}
                      required
                      aria-required="true"
                      aria-invalid={(invalidField === "postalCode" || requiredFieldInvalid(form.postalCode))}
                      aria-describedby={error ? errorId : undefined}
                      value={form.postalCode}
                      onChange={(event) => update("postalCode", event.target.value)}
                    />{(invalidField === "postalCode" || requiredFieldInvalid(form.postalCode)) && <small role="alert">{marketText(language,"Check this field.")}</small>}
                  </label>) : <p>{marketText(language,"No postal code is required for this destination.")}</p>}

                  <details className="checkout-form__wide"><summary>{marketText(language,"Optional delivery details")}</summary>                  <label htmlFor="bulk-company-name">
                    {marketText(language, "Company name", "회사명")}
                    <input
                      id="bulk-company-name"
                      name="companyName"
                      autoComplete="organization"
                      value={form.companyName}
                      onChange={(event) => update("companyName", event.target.value)}
                    />
                  </label>                  <label htmlFor="bulk-address-line2">
                    {marketText(language, "Address line 2", "주소 2")}
                    <input
                      id="bulk-address-line2"
                      name="addressLine2"
                      autoComplete="address-line2"
                      value={form.addressLine2}
                      onChange={(event) => update("addressLine2", event.target.value)}
                    />
                  </label>                  <label className="checkout-form__wide" htmlFor="bulk-customer-note">
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
                  </label></details>
                <div className="direct-payment-summary checkout-form__wide">
                  <div className="direct-payment-summary__header">
                    <span>{marketText(language, "Review before payment", "寃곗젣 ???뺤씤")}</span>
                    <h2>{marketText(language, "Final payment check", "理쒖쥌 寃곗젣 ?뺤씤")}</h2>
                    <p>{marketText(language, "Please confirm these details before opening PayPal or card checkout.", "PayPal ?먮뒗 移대뱶 寃곗젣李쎌쓣 ?닿린 ?꾩뿉 ?꾨옒 ?뺣낫瑜??뺤씤?댁＜?몄슂.")}</p>
                  </div>
                  {isCleansingMix && (
                    <ul className="direct-payment-summary__items">
                      {orderLines.map((line) => (
                        <li key={line.product.slug}>
                          <span>{marketProductText(language, line.product.name)}</span>
                          <strong>{line.quantity} {marketText(language, "units", "개")}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                  <dl className="direct-payment-summary__details">
                    <div>
                      <dt>{marketText(language, "Delivery recipient")}</dt>
                      <dd>{form.customerName || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Email", "이메일")}</dt>
                      <dd>{form.customerEmail || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    <div>
                      <dt>{marketText(language, "Delivery phone", "?꾪솕 / WhatsApp")}</dt>
                      <dd>{form.customerPhone || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    {form.companyName&&<div>
                      <dt>{marketText(language, "Company", "회사명")}</dt>
                      <dd>{form.companyName}</dd>
                    </div>}
                    <div>
                      <dt>{marketText(language, "Shipping address", "諛곗넚 二쇱냼")}</dt>
                      <dd>{[form.addressLine1, form.addressLine2, form.city, countryName, form.postalCode].filter(Boolean).join(", ") || marketText(language, "Not entered", "미입력")}</dd>
                    </div>
                    {form.customerNote&&<div>
                      <dt>{marketText(language, "Order note", "二쇰Ц 硫붾え")}</dt>
                      <dd>{form.customerNote || marketText(language, "No note", "硫붾え ?놁쓬")}</dd>
                    </div>}
                  </dl>
                  {paypalMode === "sandbox" && !readOnlyPreview && <p>{marketText(language, `PayPal Sandbox payment. Currency: ${market.currency}.`)}</p>}
                  <details className="manual-payment-fallback"><summary>{marketText(language,"If PayPal/card checkout fails")}</summary>

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
                  </details>
                </div>

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
                  <button type="submit" className="button button--primary checkout-form__wide checkout-review-button" disabled={checkoutDisabled||soldOut||paymentBusy}>{flowCopy.check}</button>
                </form>

                {soldOut ? (
                  <a className="button button--primary" href={`/contact?type=restock&product=${product.slug}`}>
                    {marketText(language, "Notify me", "?낃퀬 臾몄쓽")}
                  </a>
                ) : inquiryOnly ? (
                  <><a className="button button--primary" href={manualPaymentHref}>{marketText(language, "Open quantity & shipping email draft", "수량·배송 문의 이메일 초안 열기")}</a><p>{marketText(language, "Review and send the email yourself. Opening a draft does not confirm receipt.", "초안을 확인하고 직접 발송해주세요. 이메일 앱 실행은 문의 접수 완료가 아닙니다.")}</p></>
                ) : (
                  <section id="paypal-payment-step" className="checkout-payment-step" tabIndex={-1} aria-busy={paymentBusy}><h2 className="order-step-heading">{flowCopy.payment}</h2>{deliveryChecked&&<p role="status">{flowCopy.checked}</p>}{paymentBusy&&<p role="status">{flowCopy.busy}</p>}<p>{flowCopy.card}</p><p className="payment-status" role="status">{marketText(language,paymentDisplay==='loading'?'Preparing secure payment…':paymentDisplay==='failed'?'Payment could not load. Refresh or contact us.':paymentDisplay==='closed'?'Payment is currently closed. Contact us.':paymentDisplay==='preview'?'Payment is disabled in this read-only preview.':'Secure payment is ready.')}</p><div id="direct-paypal-buttons" className="paypal-buttons" hidden={paymentDisplay!=='ready'}/></section>
                )}                </fieldset>
                <div id="payment-request" hidden={!inquiryOnly||invalidQuantity}><PaymentRequestPanel lines={orderLines} purpose={purpose==='unspecified'?'':marketText(language,purposeLabels[purpose||'unspecified'])}/></div>

              </section>

              {!isCleansingMix&&<section className="checkout-notes" aria-label={o.notes}>
              <h2 className="checkout-notes__title">{o.notes}</h2>
              <details className="pdp-conditions"><summary>{orderPanelCopy(language).conditions}</summary><ProductSalesSummary product={product} quantity={quantityText}/></details>
              <details className="bulk-product-info"><summary>{marketText(language,"Product composition")}</summary>
                <h2>{marketText(language, "Product composition", "?곹뭹 援ъ꽦")}</h2>
                <div className="product-card__chips">
                  {product.features.map((feature) => (
                    <span key={feature}>{marketProductText(language, feature)}</span>
                  ))}
                </div>
                <h2>{marketText(language, "Product guidance", "?ъ슜 諛?二쇰Ц ?덈궡")}</h2>
                <ul>
                  {cleanProductUsage(product.usage).map((item) => (
                    <li key={item}>{marketProductText(language, item)}</li>
                  ))}

                </ul>
              </details>
              </section>}
            </div>
          </div>

        </section>
        {summaryCta&&<OrderBar watch={summaryRef} label={inquiryOnly?o.estimate:o.total} detail={unitsText} amount={totalText} cta={summaryCta}/>}
      </main>
    </V23Page>
  );
}
