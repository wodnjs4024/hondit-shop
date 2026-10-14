import {resolveCheckoutTerms} from '../../shared/checkout-terms.js';
import {useEffect,useState} from 'react';
import {approvedResaleTerms,resaleEconomics} from '../../shared/resale-economics.js';
import {marketText,marketProductText,useMarket,formatCurrency} from '../lib/market';
import type {StorefrontProduct} from '../data/v23SiteData';
export function ResaleCalculator({product,quantity,saleQuantity,onSummary}:{saleQuantity?:number;product:StorefrontProduct;quantity:string;onSummary:(summary:string)=>void}){
 const {market,language}=useMarket();const t=(s:string)=>marketText(language,s);
 const [input,setInput]=useState({price:'',inbound:'0',discount:'0',selling:'0',fixed:'0'});
 const selection=resolveCheckoutTerms(product,market.code,quantity);
 const terms=approvedResaleTerms(product,market.code,quantity),result=resaleEconomics(terms,input,saleQuantity);
 const money=(n:number)=>formatCurrency(n/10**(result?.digits??2),market.currency,market.locale);
 const disclaimer=t('The full purchase outlay is included. Only selected sale units generate revenue; display and reserve units generate none. This is a review, not a quotation or guaranteed income.');
 const fields=[['price','Your resale unit price'],['inbound','Unit inbound cost'],['discount','Consumer discount (%)'],['selling','Unit selling cost'],['fixed','One-time cost']] as const;
 const outputs=result?[
 ['Initial product purchase',money(result.purchase)],['Initial outlay including costs',money(result.initial)],['Discounted consumer price',money(result.revenue)],['Scenario difference per sold unit',result.scenarioUnitDifference===null?t('Not calculable'):money(result.scenarioUnitDifference)],['Difference as a share of selling price',result.scenarioMargin===null?t('Not calculable'):result.scenarioMargin.toFixed(1)+'%'],['Expected difference for selected sale quantity',money(result.totalDifference)],['Simple cash recovery quantity',result.recovery===null?t('Not calculable'):result.recovery+' '+t('units')]
 ]:[];
 const summary=terms&&result?[market.code+' · '+terms.currency,marketProductText(language,product.name)+' · '+quantity+' '+t('units'),t('Unit price')+': '+money(terms.unitMinor),...fields.map(([k,label])=>t(label)+': '+(k==='discount'?input[k]+'%':money(result[k]))),t('Units for sale')+': '+result.saleQuantity, t('Expected sales revenue')+': '+money(result.salesRevenue),...outputs.map(([k,v])=>t(k)+': '+v),disclaimer].join('\n'):'';
 useEffect(()=>{onSummary(summary)},[summary,onSummary]);
 const field=([key,label]:typeof fields[number])=><label key={key}>{t(label)} {key==='discount'?'':`(${market.currency})`}<input type="number" min="0" max={key==='discount'?100:undefined} step={key==='discount'?'0.01':market.currency==='JPY'?'1':'0.01'} value={input[key]} onChange={e=>setInput({...input,[key]:e.target.value})}/></label>;
 return <details className="resale-calculator resale-calculator--simple"><summary>{t('Resale economics review')}</summary>{!terms?<p role="status">{t('Approved terms unavailable for this selection. Contact us to confirm.')}</p>:<>
 <p className="resale-selection">{marketProductText(language,product.name)} · {market.code} / {terms.currency} · {quantity} {t('units')}</p>
 <div className="resale-key-amount"><span>{t('Initial product purchase')}</span><strong>{money(terms.totalMinor)}</strong><small>{t('Unit price')}: {money(terms.unitMinor)} × {quantity} {t('units')}</small></div>
 {selection.status!=='direct'&&<p role="status">{t('Shipping and payment require confirmation. Extra freight may apply; your selection is kept in the payment request.')}</p>}
 <div className="resale-price-input">{field(fields[0])}</div>
 <p className="resale-hint">{t('Enter your own consumer price to calculate; this is not a recommended retail price.')}</p>
 {result?<section className="resale-compact-results" aria-live="polite">
 <div className="resale-key-amount resale-key-amount--difference"><span>{t('Expected difference for selected sale quantity')} · {result.saleQuantity} {t('units')}</span><strong>{money(result.totalDifference)}</strong></div>
 {result.initial!==result.purchase&&<p className="resale-extra-outlay">{t('Additional initial outlay')}: {money(result.initial-result.purchase)} · {t('Initial outlay including costs')}: {money(result.initial)}</p>}
 <p className="resale-hint">{t('Expected sales revenue')}: {money(result.salesRevenue)}</p><dl className="resale-secondary-results"><div><dt>{t('Scenario difference per sold unit')}</dt><dd>{result.scenarioUnitDifference===null?t('Not calculable'):money(result.scenarioUnitDifference)}</dd></div><div><dt>{t('Difference as a share of selling price')}</dt><dd>{result.scenarioMargin===null?t('Not calculable'):result.scenarioMargin.toFixed(1)+'%'}</dd></div></dl>
 {result.exceedsQuantity&&<p role="status">{t('All units sold would not recover the initial outlay.')}</p>}
 </section>:input.price!==''&&<p role="alert">{t('Enter a non-negative amount in the displayed currency.')}</p>}
 <details className="resale-adjustments"><summary>{t('Include additional costs and discounts')}</summary><div className="business-planner__fields">{fields.slice(1).map(field)}</div>
 {result&&<p>{t('Discounted consumer price')}: {money(result.revenue)}</p>}
 <p>{t('Use the same currency and pre-tax basis. Included SG MOQ EMS freight must not be counted twice. Taxes, duties, clearance and overheads may be missing; tax recovery is not assumed.')}</p><p>{disclaimer}</p>{result&&<p>{t('Simple cash recovery quantity')}: {result.recovery===null?t('Not calculable'):result.recovery+' '+t('units')}</p>}
 <p>{t('Samples and costs, import responsibilities, claims, further orders and other terms require agreement. Unsold inventory risk remains with the store; returns, consignment and exclusivity are not promised.')}</p>
 </details><p className="resale-hint">{t('Unentered costs are excluded. Review simulation only, not guaranteed income. Cash recovery is not break-even.')}</p>
 </>}</details>;
}
