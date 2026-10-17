import {trackEvent} from '../lib/analytics';
import {currentLinkId} from '../lib/attribution';
import {ContactQrs} from './ContactQrs';
import {useState} from 'react';
import {EMAIL} from '../data/v23SiteData';
import {marketText,useMarket} from '../lib/market';
import {consultationMailto} from '../../shared/consultation.js';
export function RequestActions({body,purchase=false,notice=true,channels=false}:{body:string;purchase?:boolean;notice?:boolean;channels?:boolean}){
 const linkId=currentLinkId();const requestBody=linkId?body+'\n\nReference: '+linkId:body;
 const {language}=useMarket();const t=(s:string)=>marketText(language,s);const [status,setStatus]=useState('');
 const copy=async(value:string)=>{try{await navigator.clipboard.writeText(value);trackEvent('request_copy',{copy_type:value===requestBody?'request':'email',placement_id:'request_actions'});setStatus('Copied.')}catch{setStatus('Copy unavailable. Select the text below to copy.')}};
return <div className="request-actions">{purchase&&channels&&<ContactQrs email={{address:EMAIL,draft:consultationMailto(EMAIL,requestBody)}}/>}<pre className="request-message" tabIndex={0}>{requestBody}</pre><div className="v23-email-actions"><button className="button button--primary" type="button" onClick={()=>copy(requestBody)}>{t(purchase?'Copy purchase request':'Copy request text')}</button></div><p role="status">{t(status)}</p>{channels?(purchase?null:<ContactQrs email={{address:EMAIL,draft:consultationMailto(EMAIL,requestBody)}}/>):<><a className="button button--ghost" href={consultationMailto(EMAIL,requestBody)}>{t("Open email draft")}</a><div className="request-email"><a href={'mailto:'+EMAIL}>{EMAIL}</a><button type="button" onClick={()=>copy(EMAIL)}>{t('Copy email address')}</button></div></>}{notice&&<p className="request-notice">{t('Copying a request or opening an app does not confirm an order. Review and send the message yourself.')}</p>}</div>;
}
