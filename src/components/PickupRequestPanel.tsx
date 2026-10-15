import {useState} from 'react';
import {pickupRequestTotal,pickupRequestMessage} from '../../shared/contact-copy.js';
import {marketText,marketProductText,useMarket} from '../lib/market';
import {RequestActions} from './RequestActions';
// Unapproved price is a local development review value, eliminated from public builds.
const proposedUnitPrice = import.meta.env.DEV ? 40_000 : null;
export function PickupRequestPanel({initialQuantity=1}:{initialQuantity?:number}){
 const {language}=useMarket();const t=(s:string)=>marketText(language,s);
 const [quantity,setQuantity]=useState([1,2,3].includes(initialQuantity)?initialQuantity:1);
 const [product,setProduct]=useState<'350g'|'500g'>('350g');
 const proposed=product==='500g';
 const money=(n:number)=>n.toLocaleString('en-US')+(language==='ko'?'원':' KRW');
 const name=(size:string)=>marketProductText(language,`Volcanic Diffuser ${size}`);
 const total=proposed&&proposedUnitPrice!==null?quantity*proposedUnitPrice:pickupRequestTotal(quantity);
 return <section className="pickup-message-panel">
 <fieldset className="pickup-product-options"><legend>{t('Select product')}</legend>
 {(['350g','500g'] as const).map(size=><label key={size} className={product===size?'is-selected':''}>
 <input type="radio" name="pickup-product" value={size} checked={product===size} disabled={size==='500g'&&proposedUnitPrice===null} onChange={()=>setProduct(size)}/>
 <img src={`/images/diffuser-${size}.webp`} width="160" height="160" alt={name(size)}/>
 <span><strong>{name(size)}</strong><small>{size==='350g'?money(pickupRequestTotal(1)):proposedUnitPrice===null?t('Awaiting price approval'):money(proposedUnitPrice)}</small>{size==='500g'&&proposedUnitPrice!==null&&<small>{t(proposedUnitPrice===null?'Awaiting price approval':'Local review only · proposed price · ordering unavailable')}</small>}</span>
 </label>)}
 </fieldset>
 <label className="pickup-quantity">{t('Order quantity')}<select value={quantity} onChange={e=>{const q=Number(e.target.value);if([1,2,3].includes(q))setQuantity(q)}}>{[1,2,3].map(q=><option key={q} value={q}>{q} {language==='en'&&q===1?'unit':t('units')} · {proposed?(proposedUnitPrice===null?t('Awaiting price approval'):money(q*proposedUnitPrice)):money(pickupRequestTotal(q))}</option>)}</select></label>
 <div className="pickup-total-summary"><span>{name(product)} · {quantity} {language==='en'&&quantity===1?'unit':t('units')}<small>{t('Product amount only. No quantity discount.')}</small></span><output className="pickup-request-total" aria-live="polite">{money(total)}</output></div>
 {proposed?<p role="status">{t('Local review only · proposed price · ordering unavailable')}</p>:<><p>{t('Select quantity → send your request → confirm time, place and payment method → collect.')}</p><RequestActions body={pickupRequestMessage(quantity,language)} purchase channels/></>}
 <p>{t('Handover is at a designated place in Jeju. Confirm airport availability, time, exact location and payment method by message. No island-wide delivery or international individual shipping.')}</p>
 </section>;
}
