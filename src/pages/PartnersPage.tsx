import { Link } from 'react-router-dom';
import { V23Page } from '../components/v23/SiteChrome';
import { ConsultationPanel } from '../components/ConsultationPanel';
import { discoveryText } from '../data/discoveryCopy';
import { marketText, marketProductText, useMarket } from '../lib/market';
export function PartnersPage() {
 const {language}=useMarket();const t=(s:string)=>marketText(language,s);const d=(key:Parameters<typeof discoveryText>[1])=>discoveryText(language,key);
 return <V23Page><main className="partner-discovery">
 <section className="discovery-hero"><div><p className="v23-eyebrow">{marketText(language,"HONDIT / PARTNERS")}</p><h1>{t('Partner introduction and pilot consultation')}</h1><p>{t('For shops, hospitality spaces and gift planners exploring HONDIT products.')}</p><div className="discovery-hero-actions"><a href="#partner-consultation">{d('talk')}</a><Link to="/products">{d('view')}</Link></div></div><figure><img src="/images/diffuser-500g.webp" alt={marketProductText(language,'Volcanic Diffuser 500g')} width="880" height="1100" fetchPriority="high"/><figcaption>STONEJEJU · 500g</figcaption></figure></section>
 <section className="discovery-section"><div className="discovery-heading"><p className="v23-eyebrow">{marketText(language,"01 / PURPOSE")}</p><h2>{d('spaces')}</h2></div><div className="discovery-paths">{(['shop','stay','gift'] as const).map((key,i)=><article className="discovery-path" key={key}><span className="discovery-number">0{i+1}</span><h3>{d(key)}</h3><p>{d(`${key}Body`)}</p></article>)}</div></section>
 <section className="discovery-section partner-process"><div className="discovery-heading"><p className="v23-eyebrow">{marketText(language,"02 / PROCESS")}</p><h2>{d('process')}</h2><p>{t('Display guidance and product information may be discussed. Support scope, frequency, cost and schedule are confirmed after consultation.')}</p></div><ol>{(['step1','step2','step3','step4'] as const).map((key,i)=><li key={key}><span>0{i+1}</span><h3>{d(key)}</h3></li>)}</ol></section>
 <section className="discovery-section partner-faq"><div className="discovery-heading"><p className="v23-eyebrow">{marketText(language,"03 / QUESTIONS")}</p><h2>{d('questions')}</h2></div>{(['q1','q2','q3'] as const).map((key,i)=><details key={key}><summary>{d(key)}</summary><p>{i===1?t('Samples, mixed MOQ, consignment and returns are not confirmed offers. No sales or income is guaranteed.'):d(i===0?'a1':'a3')}</p></details>)}</section>
 <div id="partner-consultation" className="partner-consultation"><ConsultationPanel lines={[]} reason="partner"/></div>
 </main></V23Page>;
}
