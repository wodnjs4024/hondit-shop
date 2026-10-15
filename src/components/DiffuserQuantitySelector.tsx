import {useEffect,useId,useState} from 'react';
import {diffuserQuantity} from '../../shared/diffuser-quantity.js';
import {marketText,useMarket} from '../lib/market';

export function usePurchaseQuantity(slug:string,initial:string) {
 const [quantity,setQuantity]=useState(()=>typeof window==='undefined'?initial:new URLSearchParams(window.location.search).get('quantity')??initial);
 useEffect(()=>{
  const url=new URL(window.location.href);
  url.searchParams.set('product',slug);url.searchParams.set('quantity',quantity);
  window.history.replaceState(window.history.state,'',url);
 },[slug,quantity]);
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
