import {marketText,marketCountryName,marketProductText,useMarket} from '../lib/market';
import {consultationBody} from '../../shared/consultation.js';
import {RequestActions} from './RequestActions';
export function ConsultationPanel({lines,reason='quantity',country,presetPurpose='',summaryDetails='',heading=true,channels=false}:{lines:{name:string;quantity?:number}[];reason?:string;country?:string;presetPurpose?:string;summaryDetails?:string;heading?:boolean;channels?:boolean}){
 const {market,language}=useMarket();const t=(s:string)=>marketText(language,s);
 const body=consultationBody({lines:lines.map(line=>({...line,name:marketProductText(language,line.name)})),market:country||marketCountryName(market,language)+' ('+market.code+')',language,reason,purpose:presetPurpose,additional:summaryDetails});
 return <section className="consultation-panel request-panel" aria-label={t('Contact for additional requests')}>{heading&&<h2>{t('Contact for additional requests')}</h2>}<RequestActions body={body} channels={channels}/></section>;
}
