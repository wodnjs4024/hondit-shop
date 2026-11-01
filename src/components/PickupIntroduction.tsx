import {Link} from 'react-router-dom';
import {useMarket,marketText} from '../lib/market';
import {salesPresentationCopy} from '../data/salesPresentationCopy';
import {pickupRequestTotal} from '../../shared/contact-copy.js';
export function PickupIntroduction(){
 const {language,market}=useMarket();const c=salesPresentationCopy(language);
 return <section className="pickup-introduction" aria-labelledby="pickup-intro-title">
  <div><h1 id="pickup-intro-title">{c.pickupTitle}</h1><p>{c.pickupBody}</p><a className="hd-btn hd-btn--solid" href="#pickup-selection">{c.pickupAction}</a><Link className="hd-textlink" to={`/bulk-orders?market=${market.code}&lang=${language}`}>{marketText(language,'Overseas bundle orders')}</Link></div>
  <figure><div className="pickup-airport-sign-frame"><img src="/images/jeju-airport-sign-reference.webp" alt={c.pickupImageAlt} width="1504" height="418" fetchPriority="high"/></div><figcaption>{c.pickupShort}</figcaption></figure>
  <dl className="pickup-intro-facts"><div><dt>{marketText(language,'Products')}</dt><dd>StoneJeju 350g · KRW {pickupRequestTotal(1).toLocaleString('en-US')} / {marketText(language,'unit')}<br/>StoneJeju 500g · KRW {pickupRequestTotal(1,'500g').toLocaleString('en-US')} / {marketText(language,'unit')}</dd></div><div><dt>{c.pickupAudience}</dt><dd>{c.pickupMethod}</dd></div></dl>
  <div className="pickup-arrangements"><article><h2>{c.pickupSchedule}</h2><p>{c.pickupScheduleBody}</p></article><article><h2>{c.pickupMethod}</h2><p>{c.pickupMethodBody}</p></article></div>
 </section>;
}
