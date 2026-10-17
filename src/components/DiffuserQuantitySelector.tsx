import {trackEvent} from '../lib/analytics';
import {useSearchParams} from 'react-router-dom';
import {functionalParams} from '../../shared/tracking-policy.js';
import {useEffect,useId,useRef} from 'react';
import {diffuserQuantity} from '../../shared/diffuser-quantity.js';
import {marketText,useMarket} from '../lib/market';

export function usePurchaseQuantity(slug:string,initial:string) {
 const [params,setParams]=useSearchParams();
 const quantity=(!params.get('product')||params.get('product')===slug)?params.get('quantity')??initial:initial;
 const previous=useRef({slug,quantity});
 useEffect(()=>{
  const old=previous.current;previous.current={slug,quantity};
  const valid=slug.startsWith('diffuser-')?diffuserQuantity(quantity).valid:/^[1-9]\d{0,3}$/.test(quantity);
  if(old.slug!==slug||old.quantity===quantity||!valid)return;
  const timer=window.setTimeout(()=>trackEvent('select_quantity',{item_id:slug,quantity:Number(quantity)}),400);
  return ()=>window.clearTimeout(timer);
 },[slug,quantity]);
 const setQuantity=(value:string)=>setParams(current=>{
  const next=functionalParams(current);next.set('product',slug);next.set('quantity',/^\d{0,5}$/.test(value)?value:'');return next;
 },{replace:true});
 return [quantity,setQuantity] as const;
}

export function DiffuserQuantitySelector({value,onChange,disabled=false,optionPrices}:{value:string;onChange:(value:string)=>void;disabled?:boolean;optionPrices?:{trial?:string;general?:string}}) {
 const {language}=useMarket();const t=(s:string)=>marketText(language,s);const id=useId();
 const selection=diffuserQuantity(value),trial=selection.mode==='trial';
 const change=(step:number)=>{if(selection.valid&&selection.quantity!==null)onChange(String(selection.quantity+step));};
 return <fieldset className="diffuser-quantity" disabled={disabled}>
  <legend>{t('Choose your order option')}</legend>
  <div className="diffuser-order-options">
   <label className={trial?'is-selected':undefined}><input type="radio" name={id} checked={trial} onChange={()=>onChange('10')}/><span>{t('10-unit trial order')}</span>{optionPrices?.trial&&<small>{optionPrices.trial}</small>}</label>
   <label className={!trial?'is-selected':undefined}><input type="radio" name={id} checked={!trial} onChange={()=>onChange('20')}/><span>{t('General order: 20 or more')}</span>{optionPrices?.general&&<small>{optionPrices.general}</small>}</label>
  </div>
  {trial?<p>{t('Trial quantity is fixed at 10 units.')}</p>:<>
   <label htmlFor={id}>{t('Order quantity')}</label>
   <div className="diffuser-quantity__stepper">
    <button type="button" aria-label={t('Decrease quantity by one')} disabled={!selection.valid||Number(value)<=20} onClick={()=>change(-1)}>−</button>
    <input id={id} aria-label={t('Order quantity')} type="text" inputMode="numeric" autoComplete="off" value={value} aria-invalid={!selection.valid} aria-describedby={id+'-help'} onChange={e=>onChange(e.target.value)}/>
    <button type="button" aria-label={t('Increase quantity by one')} disabled={!selection.valid||Number(value)>=9999} onClick={()=>change(1)}>+</button>
   </div>
   <p id={id+'-help'} role={selection.valid?undefined:'alert'}>{t(selection.valid?'Add units one at a time, or type the quantity.':'Choose 10 for a trial, or enter a whole number from 20 to 9999.')}</p>
  </>}
 </fieldset>;
}
