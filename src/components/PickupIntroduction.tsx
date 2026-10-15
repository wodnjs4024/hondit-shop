import {Link} from 'react-router-dom';
import {useMarket,marketText} from '../lib/market';
import {salesPresentationCopy} from '../data/salesPresentationCopy';
import {pickupRequestTotal} from '../../shared/contact-copy.js';
export function PickupIntroduction(){
 const {language,market}=useMarket();const c=salesPresentationCopy(language);
 return <section className="pickup-introduction" aria-labelledby="pickup-intro-title">
  <div><h1 id="pickup-intro-title">{c.pickupTitle}</h1><p>{c.pickupBody}</p><a className="hd-btn hd-btn--solid" href="#pickup-selection">{c.pickupAction}</a><Link className="hd-textlink" to={`/bulk-orders?market=${market.code}&lang=${language}`}>{marketText(language,'Overseas bundle orders')}</Link></div>
  <figure><img src="/images/jeju-airport-2024.jpg" alt={c.pickupImageAlt} width="1280" height="960" fetchPriority="high"/><figcaption>{c.pickupShort}<span className="pickup-photo-credit"><a href="https://commons.wikimedia.org/wiki/File:Jejuairport2024.jpg" target="_blank" rel="noreferrer">© Kimhs5400 · Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></span></figcaption></figure>
  <dl className="pickup-intro-facts"><div><dt>{marketText(language,'Products')}</dt><dd>StoneJeju 350g · KRW {pickupRequestTotal(1).toLocaleString('en-US')} / {marketText(language,'unit')}</dd></div><div><dt>{c.pickupAudience}</dt><dd>{c.pickupMethod}</dd></div></dl>
  <div className="pickup-arrangements"><article><h2>{c.pickupSchedule}</h2><p>{c.pickupScheduleBody}</p></article><article><h2>{c.pickupMethod}</h2><p>{c.pickupMethodBody}</p></article></div>
 </section>;
}
