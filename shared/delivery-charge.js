// Customer-facing delivery charges only. Carrier costs and margin assumptions stay private.
export function resolveDeliveryCharge(condition, quantity) {
  if(!Number.isSafeInteger(quantity)||quantity<1)return {confirmed:false,reason:'invalid_quantity'};
  const rules = condition.deliveryRules || [{minimum:condition.minimum,maximum:condition.maximum,approval:condition.shippingApproval,mode:condition.shippingIncluded===true?'included':'unconfirmed',currency:condition.billingCurrency}];
  const matches = rules.filter(r=>Number.isSafeInteger(r.minimum)&&Number.isSafeInteger(r.maximum)&&quantity>=r.minimum&&quantity<=r.maximum);
  if(matches.length!==1)return {confirmed:false,reason:matches.length?'duplicate_delivery_rules':'delivery_scope_missing'};
  const rule=matches[0];
  if(!['confirmed','existing-moq-scope'].includes(rule.approval)||rule.currency!==condition.billingCurrency)return {confirmed:false,reason:'delivery_unconfirmed'};
  if(rule.mode==='included')return {confirmed:true,mode:'included',chargeMinor:0,version:rule.version||condition.version};
  if(rule.mode!=='fixed'&&rule.mode!=='per-unit')return {confirmed:false,reason:'delivery_unconfirmed'};
  if(rule.mode==='per-unit'&&(!Number.isSafeInteger(rule.includedQuantity)||rule.includedQuantity<0))return {confirmed:false,reason:'invalid_delivery_rule'};
  const base=rule.chargeMinor,increment=rule.mode==='per-unit'?rule.incrementMinor:0;
  if(!Number.isSafeInteger(base)||base<0||!Number.isSafeInteger(increment)||increment<0)return {confirmed:false,reason:'invalid_delivery_rule'};
  const chargeMinor=base+increment*(rule.mode==='per-unit'?Math.max(0,quantity-rule.includedQuantity):0);
  if(!Number.isSafeInteger(chargeMinor))return {confirmed:false,reason:'amount_overflow'};
  return {confirmed:true,mode:rule.mode,chargeMinor,version:rule.version||condition.version};
}
