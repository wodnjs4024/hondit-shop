import {sgCheckoutNeedsInquiry,sgTerms} from './page-sales.js';
export const purchasePurposes=['personal_gift','resale','business_use','group_purchase'];
export const purposeLabels={personal_gift:'Personal / gifts',resale:'Resale',business_use:'Business use',group_purchase:'Group purchase',unspecified:'Purpose'};
export function purchaseContext(input={}) {
 const fulfillment=input.fulfillment??'international_bundle';
 if(!['international_bundle','jeju_pickup'].includes(fulfillment))throw Error('Unknown fulfillment');
 const purpose=input.purpose??'unspecified';
 if(purpose!=='unspecified'&&!purchasePurposes.includes(purpose))throw Error('Unknown purchase purpose');
 return {fulfillment,purpose};
}
export function purchaseRoute(lines,marketCode) {
 if(!lines.length||lines.some((l,i)=>!l.product||!Number.isSafeInteger(Number(l.quantity))||Number(l.quantity)<1||l.product.active===false||l.product.purchaseEnabled===false||lines.findIndex(x=>x.product?.slug===l.product?.slug)!==i))return 'confirmation';
 if(lines.some(({product:p,quantity:q})=>{const stock=p.stockQuantity??(Number(p.inventoryPacks)>0?p.inventoryPacks*p.packQuantity:undefined);return stock!==undefined&&Number(q)>stock}))return 'confirmation';
 if(sgCheckoutNeedsInquiry(lines,marketCode))return 'consultation';
 if(lines.length>1)return ['HK','MO'].includes(marketCode)&&lines.every(l=>['cleansing','CARE'].includes(l.product.category)&&Number(l.quantity)%10===0)&&lines.reduce((s,l)=>s+Number(l.quantity),0)>=30?'direct':'consultation';
 const {product:p,quantity}=lines[0],q=Number(quantity),sg=marketCode==='SG'?sgTerms(p):null;
 const moq=sg?.moq??p.bulkMoq??p.packQuantity,step=p.bulkStep??10;
 const stock=p.stockQuantity??(Number.isFinite(p.inventoryPacks)?p.inventoryPacks*p.packQuantity:undefined);
 if(stock!==undefined&&q>stock)return 'confirmation';
 return q>=moq&&(q-moq)%step===0?'direct':'consultation';
}
