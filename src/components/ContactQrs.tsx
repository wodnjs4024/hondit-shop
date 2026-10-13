import {INSTAGRAM} from '../data/v23SiteData';
import {marketText,useMarket} from '../lib/market';
export const contactQrs=[
 {name:'WhatsApp',file:'hondit_whatsapp_qr.png',href:'https://wa.me/qr/JEM3ZMXANDWUL1'},
 {name:'Telegram',file:'hondit_telegram_qr.png',href:'https://t.me/+821033382694'},
 {name:'WeChat',file:'hondit_wechat_qr.png',href:'https://u.wechat.com/kHt8bwuQNBpT5UVpbenp3Ok?s=2'},
 {name:'Instagram',file:'hondit_instagram_qr.png',href:INSTAGRAM},
];
export function ContactQrs(){const {language}=useMarket();return <section className="contact-qr-section"><h2>{marketText(language,'Provided contact QR')}</h2><p>{marketText(language,'App scanning and account availability still need confirmation. Opening an app does not send a message.')}</p><div className="contact-qr-grid">{contactQrs.map(q=><article key={q.name}><h3>{q.name}</h3><img src={`/images/contact/${q.file}`} alt={`${q.name} QR`} width="800" height="800" loading="lazy"/><a href={q.href} target="_blank" rel="noreferrer">{q.name} ↗</a></article>)}</div></section>}
