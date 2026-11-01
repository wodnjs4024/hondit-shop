// User-approved NEW order totals, 2026-10-20. No carrier costs, FX or margin data.
// Price approval alone never grants shipping, regulatory or payment approval.
const rows = {
 SG:['SGD',[129,230,420],[269,500,920]],
 JP:['JPY',[17800,30000,53000],[34400,62600,113500]],
 HK:['HKD',[860,1450,2600],[1680,3060,5600]],
 TW:['TWD',[3650,6300,11300],[7150,13200,24200]],
 TH:['THB',[3550,6200,11300],[7150,13250,24500]],
 MY:['MYR',[440,790,1420],[895,1660,3050]],
 BN:['BND',[150,262,485],[295,548,1040]],
 MO:['MOP',[920,1590,2850],[1805,3295,6050]],
};
const fixedBilling={
 MY:{currency:'SGD',localPerBilling:3.193,totals:[[13781,24742,44473],[28031,51989,95522]]},
 BN:{currency:'SGD',localPerBilling:1,totals:[[15000,26200,48500],[29500,54800,104000]]},
 MO:{currency:'HKD',localPerBilling:1.03,totals:[[89321,154369,276700],[175243,319903,587379]]},
};
// Review only: no automatic repricing, rate lookup or checkout activation.
export function fixedBillingReview(pack,currentLocalPerBilling){
 if(!pack?.fixedBilling)return {status:'not_applicable'};
 if(!Number.isFinite(currentLocalPerBilling)||currentLocalPerBilling<=0)return {status:'unverified'};
 const local=pack.totalMinor/10**pack.digits;
 const difference=Math.abs(pack.fixedBilling.totalMinor/100*currentLocalPerBilling-local)/local;
 return {status:difference+1e-12>=0.02?'operator_review':'within_threshold',difference};
}
export function packBillingSnapshot(pack){
 if(!pack?.fixedBilling)return null;
 return {version:pack.version,market:pack.market,sku:pack.sku,quantity:pack.quantity,
  localCurrency:pack.currency,localTotalMinor:pack.totalMinor,localDigits:pack.digits,...pack.fixedBilling};
}
export const packQuantities=Object.freeze([5,10,20]);
export const packLabels=Object.freeze({5:'Gift & Group Pack',10:'Business Trial Pack',20:'Business Value Pack'});
export const stonejejuPacks=Object.freeze(Object.entries(rows).flatMap(([market,[currency,small,large]])=>[small,large].flatMap((totals,index)=>totals.map((total,i)=>{
 const quantity=packQuantities[i],existing=market==='SG'&&quantity!==5;
 const enabled=true;
 const digits=['JPY','TWD'].includes(currency)?0:2;
 return Object.freeze({sku:index===0?'diffuser-350g':'diffuser-500g',market,quantity,currency,digits,totalMinor:total*10**digits,
  priceApproval:'approved_new_order_price',version:'stonejeju-packs-2026-10-20',shippingIncluded:true,tax:'recipient',
  fixedBilling:fixedBilling[market]?Object.freeze({currency:fixedBilling[market].currency,totalMinor:fixedBilling[market].totals[index][i],digits:2,localPerBilling:fixedBilling[market].localPerBilling,basisDate:'2026-10-20',approval:'approved_fixed_billing_amount',rateReview:'unverified'}):null,
  checkoutEnabled:enabled,verification:existing?'existing_sg_checkout_preserved':enabled?'owner_checkout_authorized_checks_not_verified':'operational_checks_pending',billingCurrency:fixedBilling[market]?.currency??currency});
}))));
export function stonejejuPack(product,market,quantity){
 const sku=product?.apiSlug||product?.slug;
 return stonejejuPacks.find(p=>p.sku===sku&&p.market===market&&String(p.quantity)===String(quantity))??null;
}
