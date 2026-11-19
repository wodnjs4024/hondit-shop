import {V23Page} from '../components/v23/SiteChrome';
import {PickupRequestPanel} from '../components/PickupRequestPanel';
import {PickupIntroduction} from '../components/PickupIntroduction';
import {PickupFaq} from '../components/PickupFaq';
export function JejuPickupPage(){return <V23Page><main className="pickup-page pickup-simple pickup-travel"><PickupIntroduction/><div id="pickup-selection"><PickupRequestPanel/></div><PickupFaq/></main></V23Page>}
