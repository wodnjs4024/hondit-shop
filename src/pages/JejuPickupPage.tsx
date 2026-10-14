import {Link} from 'react-router-dom';
import {V23Page} from '../components/v23/SiteChrome';
import {PickupRequestPanel} from '../components/PickupRequestPanel';
import {marketText,marketProductText,useMarket} from '../lib/market';
export function JejuPickupPage(){const {language}=useMarket();const t=(s:string)=>marketText(language,s);return <V23Page><main className="pickup-page pickup-simple"><header><p className="v23-eyebrow">HONDIT · JEJU</p><h1>{t('Jeju pickup by message')}</h1><Link to="/bulk-orders">{t('Overseas bundle orders')} →</Link></header><section className="pickup-overview"><img src="/images/diffuser-350g.webp" width="360" height="360" alt={marketProductText(language,'Volcanic Diffuser 350g')}/><div><h2>{t('StoneJeju 350g · Jeju designated-location pickup')}</h2></div></section><PickupRequestPanel/></main></V23Page>}
