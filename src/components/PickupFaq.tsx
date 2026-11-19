import {useMarket} from '../lib/market';
import {pickupFaq,pickupFaqHeading} from '../../shared/pickup-faq.js';
// Same questions as the server-rendered page and its FAQPage JSON-LD (api/_seo-pages.js), so markup matches what people see.
export function PickupFaq(){
 const {language}=useMarket();const faq=pickupFaq(language);
 if(!faq)return null;
 return <section className="pickup-faq" aria-labelledby="pickup-faq-title"><h2 id="pickup-faq-title">{pickupFaqHeading[faq.language]}</h2>
  {faq.items.map(([q,a])=><details key={q} open><summary>{q}</summary><p>{a}</p></details>)}
 </section>;
}
