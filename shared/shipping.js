// Structural validation only; not postal deliverability or seller-protection verification.
export function postalRequired(country) { return !['HK','MO'].includes(country); }
export function normalizeShipping(body, market) {
 if (body.countryCode !== market.countryCode) throw new Error('Shipping country does not match market');
 const fail=field=>{const error=new Error('Invalid shipping field');error.field=field;throw error;};
 const text=(value,max,required=false,field='addressLine1')=>{if(value!=null&&typeof value!=='string')fail(field); const s=(value||'').normalize('NFC').trim().replace(/\s+/gu,' ');if((required&&!s)||s.length>max||/[\u0000-\u001f\u007f]/u.test(s))fail(field);return s;};
 const postal=text(body.postalCode,60,postalRequired(market.countryCode),'postalCode');
 // HK/MO do not need a postal code: do not transmit synthetic substitutes.
 if(['HK','MO'].includes(market.countryCode)&&postal)fail('postalCode');
 if(market.countryCode==='SG'&&!/^\d{6}$/.test(postal))fail('postalCode');
 if(market.countryCode==='JP'&&!/^\d{3}-?\d{4}$/.test(postal))fail('postalCode');
 return {name:text(body.customerName,140,true,'customerName'),line1:text(body.addressLine1,300,true),line2:text(body.addressLine2,300,false,'addressLine2'),city:text(body.city,120,true,'city'),postal,country:market.countryCode};
}
export function shippingFromOrder(order) { return {name:order.customer_name,line1:order.address_line_1,line2:order.address_line_2||'',city:order.city,postal:order.postal_code||'',country:order.country_code}; }
export function paypalShipping(s) {return {name:{full_name:s.name},address:{address_line_1:s.line1,...(s.line2?{address_line_2:s.line2}:{}),admin_area_2:s.city,...(s.postal?{postal_code:s.postal}:{}),country_code:s.country}};}
export function assertShippingMatches(order, paypalOrder) {
 const unit=paypalOrder?.purchase_units?.find(u=>u.custom_id===order.id || u.reference_id===order.order_number);
 if(!unit)throw new Error('Shipping verification failed: order reference');
 const actual=unit.shipping;const expected=paypalShipping(shippingFromOrder(order));
 const canonical=v=>String(v||'').normalize('NFC').trim().replace(/\s+/gu,' ').toUpperCase();
 if(!actual?.address || canonical(actual.name?.full_name)!==canonical(expected.name.full_name))throw new Error('Shipping verification failed: recipient');
 for(const key of ['address_line_1','address_line_2','admin_area_2','postal_code','country_code']){
  const a=key==='postal_code'?canonical(actual.address[key]).replace(/[- ]/g,''):canonical(actual.address[key]);
  const b=key==='postal_code'?canonical(expected.address[key]).replace(/[- ]/g,''):canonical(expected.address[key]);
  if(a!==b)throw new Error('Shipping verification failed: address');
 }
}
