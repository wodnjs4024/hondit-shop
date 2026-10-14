import {useState} from 'react';
import {pickupRequestTotal,pickupRequestMessage} from '../../shared/contact-copy.js';
import {marketText,useMarket} from '../lib/market';
import {RequestActions} from './RequestActions';
export function PickupRequestPanel({initialQuantity=1}:{initialQuantity?:number}){
 const {language}=useMarket();const t=(s:string)=>marketText(language,s);const [quantity,setQuantity]=useState([1,2,3].includes(initialQuantity)?initialQuantity:1);
 const money=(n:number)=>n.toLocaleString('en-US')+(language==='ko'?'원':' KRW');
 return <section className="pickup-message-panel"><div className="pickup-price-table"><table><caption>{t('StoneJeju 350g · Jeju designated-location pickup')}</caption><thead><tr><th>{t('Order quantity')}</th><th>{t('Unit price')}</th><th>{t('Product amount')}</th></tr></thead><tbody>{[1,2,3].map(q=><tr key={q} className={quantity===q?'is-selected':''}><th>{q} {t('units')}</th><td>{money(18000)}</td><td>{money(pickupRequestTotal(q))}</td></tr>)}</tbody></table></div><label className="pickup-quantity">{t('Order quantity')}<select value={quantity} onChange={e=>{const q=Number(e.target.value);if([1,2,3].includes(q))setQuantity(q)}}>{[1,2,3].map(q=><option key={q} value={q}>{q} {t('units')}</option>)}</select></label><output className="pickup-request-total" aria-live="polite">{money(pickupRequestTotal(quantity))}</output><p>{t('Select quantity → send your request → confirm time, place and payment method → collect.')}</p><RequestActions body={pickupRequestMessage(quantity,language)} purchase channels/><p>{t('Handover is at a designated place in Jeju. Confirm airport availability, time, exact location and payment method by message. No island-wide delivery or international individual shipping.')}</p></section>;
}
