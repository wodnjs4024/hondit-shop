import {useSearchParams} from 'react-router-dom';
import {V23Page} from '../components/v23/SiteChrome';
import {ConsultationPanel} from '../components/ConsultationPanel';
import {PickupRequestPanel} from '../components/PickupRequestPanel';
import {consultationContext} from '../../shared/consultation.js';
import {purposeLabels} from '../../shared/purchase-context.js';
import {v23Products,SHOPEE} from '../data/v23SiteData';
import {marketText,marketCountryName,useMarket} from '../lib/market';
export function ContactPage(){
 const {market,language}=useMarket();const [params]=useSearchParams();const context=consultationContext(params,v23Products,market.code,language);const t=(s:string)=>marketText(language,s);
 const pickup=context.fulfillment==='jeju_pickup';
 return <V23Page><main className="contact-simple"><header><p className="v23-eyebrow">HONDIT</p><h1>{t(pickup?'Jeju pickup by message':'Contact for additional requests')}</h1><p>{t('Choose your contact channel.')}</p></header>{pickup?<PickupRequestPanel initialQuantity={context.quantity}/>:<><ConsultationPanel heading={false} channels lines={context.product?[{name:context.product.name,quantity:context.quantity}]:[]} country={marketCountryName(market,language)+' ('+market.code+')'} presetPurpose={context.purpose==='unspecified'?'':t(purposeLabels[context.purpose])} reason={context.reason} summaryDetails={t('Overseas bundle orders')}/></>}{market.hasShopee&&<aside className="existing-shopee-contact"><h2>{t('EXISTING SHOPEE ORDER')}</h2><a href={SHOPEE} target="_blank" rel="noreferrer">{t('Shopee Chat')} ↗</a><p>{t('Payment, voucher, delivery tracking or address changes for Shopee orders. ->')}</p></aside>}</main></V23Page>;
}
