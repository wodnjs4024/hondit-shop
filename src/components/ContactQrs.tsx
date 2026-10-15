import {useState} from 'react';
import {INSTAGRAM} from '../data/v23SiteData';
import {marketText,useMarket} from '../lib/market';
type ContactChannel={name:string;file:string;href:string;account?:string;display?:string};
export const contactQrs:ContactChannel[]=[
 {name:'WhatsApp',account:'+821033382694',display:'+82 10-3338-2694',file:'hondit_whatsapp_qr.png',href:'https://wa.me/821033382694'},
 {name:'Telegram',account:'+821033382694',display:'+82 10-3338-2694',file:'hondit_telegram_qr.png',href:'https://t.me/+821033382694'},
 {name:'WeChat',account:'hondit_jeju',file:'hondit_wechat_qr.png',href:'https://u.wechat.com/kHt8bwuQNBpT5UVpbenp3Ok?s=2'},
 {name:'Instagram',account:'@hondit.office',file:'hondit_instagram_qr.png',href:INSTAGRAM},
];
function Channel({channel,primary=false}:{channel:typeof contactQrs[number];primary?:boolean}){
 const {language}=useMarket();const t=(s:string)=>marketText(language,s);const [status,setStatus]=useState('');
 return <article className={primary?'contact-channel is-primary':'contact-channel'}><h2 className="contact-channel__name">{channel.name}</h2>{channel.account&&<p className="contact-account">{channel.display||channel.account}</p>}<a className={primary?'button button--primary':'text-link'} href={channel.href} target="_blank" rel="noreferrer">{t('Open messenger / add contact')} ↗</a><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(channel.account||channel.href);setStatus('Copied.')}catch{setStatus('Copy unavailable. Select the text below to copy.')}}}>{t(channel.account?'Copy account / contact':'Copy contact link')}</button><p role="status">{t(status)}</p>{status.startsWith('Copy unavailable')&&<a href={channel.href}>{channel.href}</a>}<details><summary>{t('QR for desktop or print')}</summary><img src={'/images/contact/'+channel.file} alt={channel.name+' QR'} width="800" height="800" loading="lazy"/></details></article>;
}
export function ContactQrs(){const {language}=useMarket();return <section className="compact-contact-channels"><Channel channel={contactQrs[0]} primary/><details className="other-channels"><summary>{marketText(language,'Other contact channels')}</summary>{contactQrs.slice(1).map(channel=><Channel key={channel.name} channel={channel}/>)}</details></section>}

