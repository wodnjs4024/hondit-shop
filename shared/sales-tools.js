import {functionalParams} from './tracking-policy.js';
import {purchaseRoute} from "./purchase-context.js";
// Review calculations only. Checkout remains validated by the existing server.
import { sgTerms } from "./page-sales.js";
export function currencyDigits(currency) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits;
}
export function parseMinor(value, currency) {
  const digits = currencyDigits(currency),
    text = String(value).trim();
  if (
    !new RegExp(`^\\d{1,9}${digits ? `(\\.\\d{1,${digits}})?` : ""}$`).test(
      text,
    )
  )
    return null;
  const [whole, fraction = ""] = text.split(".");
  const amount =
    Number(whole) * 10 ** digits + Number(fraction.padEnd(digits, "0"));
  return Number.isSafeInteger(amount) ? amount : null;
}
export function validQuantity(value) {
  return /^\d{1,4}$/.test(String(value)) && Number(value) > 0;
}
export function reviewAmount(unit, quantity, currency) {
  const minor = parseMinor(unit, currency);
  if (minor === null || !validQuantity(quantity)) return null;
  return {
    unitMinor: minor,
    totalMinor: minor * Number(quantity),
    digits: currencyDigits(currency),
  };
}
export function allocateQuantity(total, display = 0, reserve = 0) {
  if (!validQuantity(total)) return null;
  const clamp = (n) =>
    Math.max(
      0,
      Math.min(
        Number(total),
        Number.isFinite(Number(n)) ? Math.trunc(Number(n)) : 0,
      ),
    );
  const d = clamp(display),
    r = Math.min(clamp(reserve), Number(total) - d);
  return {
    display: d,
    sale: Number(total) - d - r,
    reserve: r,
    total: Number(total),
  };
}
export function resaleDifference(salePrice, unitMinor, saleQuantity, currency) {
  const minor = parseMinor(salePrice, currency);
  if (
    minor === null ||
    !Number.isSafeInteger(unitMinor) ||
    !Number.isInteger(saleQuantity) ||
    saleQuantity < 0
  )
    return null;
  return {
    unitMinor: minor - unitMinor,
    totalMinor: (minor - unitMinor) * saleQuantity,
  };
}
export function reviewCheckout(product, quantity, marketCode) {
 return purchaseRoute([{product,quantity:Number(quantity)}],marketCode)==='direct';
}
export function selectionUrl(path, input={}) {
 const {slug,quantity,market,language,reason='product',purpose='unspecified',fulfillment='international_bundle'}=input;
 const params=functionalParams(new URLSearchParams(Object.fromEntries(Object.entries({product:slug,quantity:quantity===undefined?undefined:String(quantity),market,lang:language,reason,purpose,fulfillment}).filter(([,v])=>v!==undefined))));
 return path+(params.size?'?'+params:'');
}
