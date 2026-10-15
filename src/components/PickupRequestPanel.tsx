import {useState} from 'react';
import {pickupRequestTotal,pickupRequestMessage} from '../../shared/contact-copy.js';
import {marketText,marketProductText,useMarket} from '../lib/market';
import {RequestActions} from './RequestActions';
export function PickupRequestPanel({initialQuantity=1}:{initialQuantity?:number}){
 const {language}=useMarket();const t=(s:string)=>marketText(language,s);
 const [quantity,setQuantity]=useState([1,2,3].includes(initialQuantity)?initialQuantity:1);
 const [product,setProduct]=useState<'350g'|'500g'>('350g');
 const money=(n:number)=>n.toLocaleString('en-US')+(language==='ko'?'원':' KRW');
 const name=(size:string)=>marketProductText(language,`Volcanic Diffuser ${size}`);
 const total=pickupRequestTotal(quantity,product);
 return <section className="pickup-message-panel">
 <fieldset className="pickup-product-options"><legend>{t('Select product')}</legend>
 {(['350g','500g'] as const).map(size=><label key={size} className={product===size?'is-selected':''}>
 <input type="radio" name="pickup-product" value={size} checked={product===size} onChange={()=>setProduct(size)}/>
 <img src={`/images/diffuser-${size}.webp`} width="160" height="160" alt={name(size)}/>
 <span><strong>{name(size)}</strong><small>{money(pickupRequestTotal(1,size))}</small></span>
 </label>)}
 </fieldset>
 <div className="pickup-price-table"><table><caption>{t('Product amount only. No quantity discount.')}</caption>
 <thead><tr><th scope="col">{t('Quantity')}</th><th scope="col">{t('350g total')}</th><th scope="col">{t('500g total')}</th></tr></thead>
 <tbody>{[1,2,3].map(q=><tr key={q} className={quantity===q?'is-selected':''}><th scope="row">{q} {language==='en'&&q===1?'unit':t('units')}</th><td>{money(pickupRequestTotal(q,'350g'))}</td><td>{money(pickupRequestTotal(q,'500g'))}</td></tr>)}</tbody></table></div>
 <label className="pickup-quantity">{t('Order quantity')}<select value={quantity} onChange={e=>{const q=Number(e.target.value);if([1,2,3].includes(q))setQuantity(q)}}>{[1,2,3].map(q=><option key={q} value={q}>{q} {language==='en'&&q===1?'unit':t('units')}</option>)}</select></label>
 <div className="pickup-total-summary"><span>{name(product)} · {t('Product amount')}</span><output className="pickup-request-total" aria-live="polite">{money(total)}</output></div>
 <><p>{t('Select quantity → add our contact → send the template → confirm airport handover → collect.')}</p><RequestActions body={pickupRequestMessage(quantity,language,product)} purchase channels/></>
 <p>{t('Collect at Jeju Airport on arrival or departure day. Arrange the time and airport meeting point by message in advance.')}</p>
 </section>;
}
