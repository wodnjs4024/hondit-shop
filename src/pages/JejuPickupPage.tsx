import {Link} from 'react-router-dom';
import {V23Page} from '../components/v23/SiteChrome';
import {PickupRequestPanel} from '../components/PickupRequestPanel';
import {marketText,useMarket} from '../lib/market';
export function JejuPickupPage(){const {language}=useMarket();const t=(s:string)=>marketText(language,s);return <V23Page><main className="pickup-page pickup-simple"><header><p className="v23-eyebrow">HONDIT · JEJU</p><h1>{t('Jeju pickup by message')}</h1><Link to="/bulk-orders">{t('Overseas bundle orders')} →</Link></header><PickupRequestPanel/></main></V23Page>}
