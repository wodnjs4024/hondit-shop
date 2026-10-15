import {useState,type ReactNode} from 'react';
import {INSTAGRAM} from '../data/v23SiteData';
import {contactChannelCopy} from '../data/contactChannelCopy';
import {marketText,useMarket} from '../lib/market';
type ChannelKey='whatsapp'|'telegram'|'wechat'|'instagram';
type ContactChannel={key:ChannelKey;name:string;file:string;href:string;account?:string;display?:string};
export const contactQrs:ContactChannel[]=[
 {key:'whatsapp',name:'WhatsApp',account:'+821033382694',display:'+82 10-3338-2694',file:'hondit_whatsapp_qr.png',href:'https://wa.me/821033382694'},
 {key:'telegram',name:'Telegram',account:'+821033382694',display:'+82 10-3338-2694',file:'hondit_telegram_qr.png',href:'https://t.me/+821033382694'},
 {key:'wechat',name:'WeChat',account:'hondit_jeju',file:'hondit_wechat_qr.png',href:'https://u.wechat.com/kHt8bwuQNBpT5UVpbenp3Ok?s=2'},
 {key:'instagram',name:'Instagram',account:'@hondit.office',file:'hondit_instagram_qr.png',href:INSTAGRAM},
];

/* Simplified channel marks drawn on each service's own colour, so a channel is recognised before it is read. */
const icons:Record<ChannelKey|'email',ReactNode>={
 whatsapp:<><path d="M12 3.6a8.4 8.4 0 0 0-7.2 12.7L3.6 20.4l4.2-1.1A8.4 8.4 0 1 0 12 3.6Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9.3 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .4-.1.6l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.1.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .2-.1.5-.4.7-.5.3-1.3.5-2.3.2-2.4-.7-4.4-2.7-5.1-5.1-.3-1-.1-1.8.2-2.3Z" fill="currentColor"/></>,
 telegram:<><path d="M20.4 4.3 3.7 10.7c-.9.4-.9 1 0 1.3l4.2 1.3 1.6 5c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.1-2 4.3 3.2c.8.4 1.4.2 1.6-.7l2.9-13.5c.3-1.2-.4-1.7-1.8-1.4Z" fill="currentColor"/><path d="m8.2 13.2 9-5.6-6.8 6.4-.3 3.4" fill="none" stroke="var(--channel-tone)" strokeWidth="1.2" strokeLinejoin="round"/></>,
 wechat:<><ellipse cx="9.6" cy="9.4" rx="6.6" ry="5.3" fill="currentColor"/><path d="m5.6 13.4-.9 2.5 2.9-1.4Z" fill="currentColor"/><ellipse cx="15.6" cy="14.6" rx="5.4" ry="4.4" fill="currentColor" stroke="var(--channel-tone)" strokeWidth="1.3"/><path d="m18.6 18-.1 2.2-2.2-1.4Z" fill="currentColor"/><circle cx="7.4" cy="8.4" r=".9" fill="var(--channel-tone)"/><circle cx="11.8" cy="8.4" r=".9" fill="var(--channel-tone)"/><circle cx="13.8" cy="13.8" r=".75" fill="var(--channel-tone)"/><circle cx="17.4" cy="13.8" r=".75" fill="var(--channel-tone)"/></>,
 instagram:<><rect x="4" y="4" width="16" height="16" rx="4.6" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3.7" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="16.7" cy="7.3" r="1.1" fill="currentColor"/></>,
 email:<><rect x="3.6" y="6" width="16.8" height="12" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="m4.2 7 7.8 6 7.8-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></>,
};
const Mark=({channel}:{channel:ChannelKey|'email'})=><span className="contact-channel__mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26">{icons[channel]}</svg></span>;

function useCopy(){
 const [status,setStatus]=useState<''|'copied'|'failed'>('');
 return [status,async(value:string)=>{try{await navigator.clipboard.writeText(value);setStatus('copied')}catch{setStatus('failed')}}] as const;
}

function Channel({channel}:{channel:ContactChannel}){
 const {language}=useMarket();const c=contactChannelCopy(language);const [status,copy]=useCopy();
 return <article className={`contact-channel contact-channel--${channel.key}`}>
  <header className="contact-channel__head"><Mark channel={channel.key}/><div><h2 className="contact-channel__name">{channel.name}</h2>{channel.account&&<p className="contact-account">{channel.display||channel.account}</p>}</div></header>
  <p className="contact-channel__desc">{c[channel.key]}</p>
  <div className="contact-channel__actions">
   <a className="button button--primary" href={channel.href} target="_blank" rel="noreferrer">{c.open} <span aria-hidden="true">↗</span></a>
   <button type="button" className="button button--ghost" onClick={()=>copy(channel.account||channel.href)}>{c.copy}</button>
  </div>
  <p role="status" className="contact-channel__status">{status&&c[status]}</p>
  {status==='failed'&&<a className="contact-channel__fallback" href={channel.href}>{channel.href}</a>}
  <figure className="contact-channel__qr"><img src={'/images/contact/'+channel.file} alt={channel.name+' QR'} width="800" height="800" loading="lazy"/><figcaption>{c.scan}</figcaption></figure>
 </article>;
}

function EmailChannel({address,draft}:{address:string;draft:string}){
 const {language}=useMarket();const t=(s:string)=>marketText(language,s);const c=contactChannelCopy(language);const [status,copy]=useCopy();
 return <article className="contact-channel contact-channel--email">
  <header className="contact-channel__head"><Mark channel="email"/><div><h2 className="contact-channel__name">Email</h2><p className="contact-account"><a href={'mailto:'+address}>{address}</a></p></div></header>
  <p className="contact-channel__desc">{c.email}</p>
  <div className="contact-channel__actions">
   <a className="button button--primary" href={draft}>{t('Open email draft')}</a>
   <button type="button" className="button button--ghost" onClick={()=>copy(address)}>{t('Copy email address')}</button>
  </div>
  <p role="status" className="contact-channel__status">{status&&c[status]}</p>
 </article>;
}

/* Every channel is a card with its mark, account, one line on how to use it, two actions and an open QR. */
export function ContactQrs({email}:{email?:{address:string;draft:string}}){
 return <section className="contact-channels">{contactQrs.map(channel=><Channel key={channel.key} channel={channel}/>)}{email&&<EmailChannel {...email}/>}</section>;
}
