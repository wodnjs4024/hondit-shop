import {useParams} from 'react-router-dom';
import {V23Page} from '../components/v23/SiteChrome';
import {NotFoundPage} from './NotFoundPage';
import {partnerGuide} from '../data/partners';
import {v23Products} from '../data/v23SiteData';
import {marketText,marketProductText,useMarket} from '../lib/market';
import {cleanProductUsage} from '../../shared/page-sales.js';
export function PartnerGuidePage(){const {slug=''}=useParams();const partner=partnerGuide(slug);const {language}=useMarket();const t=(s:string)=>marketText(language,s);if(!partner)return <NotFoundPage/>;
return <V23Page><main className="sales-program-page"><h1>{t('Partner product guide')}</h1>{partner.demo&&<p role="note">{t('Preview demo — not an approved partner.')}</p>}<p>{partner.name}</p>{v23Products.filter(p=>partner.productSlugs.includes(p.slug)).map(p=><section key={p.slug}><h2>{marketProductText(language,p.name)}</h2><p>{marketProductText(language,p.detail)}</p><p>{marketProductText(language,p.description)}</p><ol>{cleanProductUsage(p.howTo).map(line=><li key={line}>{marketProductText(language,line)}</li>)}</ol><p>{t('Product care: use only the published product guidance; ask HONDIT about unconfirmed precautions.')}</p></section>)}<p>{t('Ask the partner about purchasing at this location.')}</p>{partner.purchaseLocation&&<p>{partner.purchaseLocation}</p>}</main></V23Page>}
