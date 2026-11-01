// Public purchase rules only. Costs, EMS tables and historical margins stay private.
export function isDiffuser(product) {
  return ['diffuser-350g','diffuser-500g'].includes(product?.apiSlug || product?.slug);
}
export function diffuserQuantity(value) {
  const text=String(value);
  if (!/^\d{1,4}$/.test(text)) return {valid:false,mode:'general',quantity:null};
  const quantity=Number(text);
  return {valid:quantity===5 || quantity===10 || quantity>=20,mode:quantity===5?'starter':quantity===10?'trial':'general',quantity};
}
// Approved on 2026-10-14. Price approval does not approve shipping or payment.
export const sgTrialUnitMinor=Object.freeze({'diffuser-350g':2300,'diffuser-500g':5000});
// Unchanged Oct 13 workbook, 01_국가별가격 F10:F23. Proposed, never billable.
export const proposedTrialPrices=Object.freeze({JP:[3200,6700],HK:[150,335],TW:[650,1400],TH:[660,1440],MY:[83,180],BN:[28,61],MO:[170,360]});
