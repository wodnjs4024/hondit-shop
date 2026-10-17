import {useMarket} from '../lib/market';
import {orderSupportCopy} from '../data/orderSupportCopy';
import {EMAIL} from '../data/v23SiteData';
export function OrderLookupNotice({orderNumber,loading=false}:{orderNumber:string;loading?:boolean}){
 const {language}=useMarket(),c=orderSupportCopy(language);
 const href=`mailto:${EMAIL}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(c.reference+': '+orderNumber+'\n\n'+c.request)}`;
 return <main className="product-guide-page"><h1>{loading?c.loading:c.unavailable}</h1><p role={loading?'status':'alert'}>{loading?c.loadingBody:c.access}</p><p>{c.reference}: <strong>{orderNumber}</strong></p>{!loading&&<a className="button button--primary" href={href}>{c.contact}</a>}</main>;
}
