import { useMarket } from '../lib/market';
import { checkoutFlowCopy } from '../data/checkoutFlowCopy';
export function CheckoutAvailability({status,reason}:{status:string;reason?:string}){
 const {language}=useMarket();const c=checkoutFlowCopy(language);
 if(status==='unavailable')return null;
 return <div className={`checkout-availability checkout-availability--${status}`} role="status"><strong>{status==='direct'?c.direct:c.request}</strong><p>{status==='direct'?c.directBody:reason==='quantity_shipping_scope'?c.quantityBody:c.requestBody}</p></div>;
}
