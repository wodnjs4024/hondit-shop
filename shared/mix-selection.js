const skus=['foam-oil','foaming-cleanser','cleansing-water'];
export function readMixSelection(value=''){
 const selected={};
 for(const part of String(value).split(',')){
  const [sku,text]=part.split(':');
  if(skus.includes(sku)&&/^\d{1,4}$/.test(text)&&Number(text)%10===0)selected[sku]=Number(text);
 }
 return selected;
}
export function writeMixSelection(selection){return skus.filter(sku=>Number.isSafeInteger(selection[sku])&&selection[sku]>0&&selection[sku]%10===0).map(sku=>`${sku}:${selection[sku]}`).join(',');}
