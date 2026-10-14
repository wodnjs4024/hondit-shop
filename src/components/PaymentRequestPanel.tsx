import {resolveCheckoutTerms} from '../../shared/checkout-terms.js';
import {ConsultationPanel} from './ConsultationPanel';
import {formatCurrency,marketText,useMarket} from '../lib/market';
export function PaymentRequestPanel({lines,purpose='',heading=true}:{lines:{product:any;quantity:number}[];purpose?:string;heading?:boolean}){
 const {market,language}=useMarket();const t=(s:string)=>marketText(language,s);
 if(lines.some(l=>resolveCheckoutTerms(l.product,market.code,l.quantity).status==='unavailable'))return <p role="alert">{t('Choose 10 for a trial, or enter a whole number from 20 to 9999.')}</p>;
 const decisions=lines.map(l=>resolveCheckoutTerms(l.product,market.code,l.quantity));
 const first=decisions[0];
 const combined=first&&decisions.every(d=>d.referenceTotalMinor!==null&&d.displayCurrency===first.displayCurrency)?t('Selected product amount')+': '+first.displayCurrency+' '+formatCurrency(decisions.reduce((n,d)=>n+d.referenceTotalMinor!,0)/10**first.referenceDigits,first.displayCurrency,market.locale)+'\n\n':'';
 const summaries=combined+lines.map(({product,quantity})=>{
  const d=resolveCheckoutTerms(product,market.code,quantity);
  const money=(value:number)=>d.displayCurrency+' '+formatCurrency(value/10**d.referenceDigits,d.displayCurrency,market.locale);
  const name=product.volumeLabel&&!product.name.includes(product.volumeLabel)?product.name+' '+product.volumeLabel:product.name;
  return [name,t(d.priceApproval==='approved'?'Approved product price':'Proposed or legacy reference price — confirmation required'),`${t('Unit price')}: ${d.referenceUnitMinor===null?t('No confirmed amount'):money(d.referenceUnitMinor)}`,`${t('Reference product amount')}: ${d.referenceTotalMinor===null?t('No confirmed amount'):money(d.referenceTotalMinor)}`].join('\n');
 }).join('\n\n');
 return <section className="payment-request-panel">{heading&&<h2>{t('Request payment with these selections')}</h2>}<ConsultationPanel heading={false} channels lines={lines.map(l=>({name:l.product.volumeLabel&&!l.product.name.includes(l.product.volumeLabel)?l.product.name+' '+l.product.volumeLabel:l.product.name,quantity:l.quantity}))} presetPurpose={purpose} reason="payment_request" summaryDetails={summaries+'\n\n'+t('Please confirm the billing currency, final amount and shipping terms, and send me a PayPal payment link.')}/></section>;
}
