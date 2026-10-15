import {useEffect,useState,type RefObject} from 'react';
import {Link} from 'react-router-dom';

/*
 * Phone-only order bar: the running total and the next action stay in reach while the visitor scrolls.
 * It steps aside while the full decision block is on screen, so the same button never shows twice.
 */
export function OrderBar({watch,label,amount,detail,cta}:{watch:RefObject<HTMLElement|null>;label:string;amount:string;detail?:string;cta:{label:string;to?:string;href?:string;onClick?:()=>void}}){
 const [hidden,setHidden]=useState(true);
 useEffect(()=>{
  document.body.classList.add('has-order-bar');
  const target=watch.current;
  if(!target||!('IntersectionObserver' in window)){setHidden(false);return()=>document.body.classList.remove('has-order-bar');}
  const observer=new IntersectionObserver(([entry])=>setHidden(entry.isIntersecting),{threshold:0.2});
  observer.observe(target);
  return()=>{observer.disconnect();document.body.classList.remove('has-order-bar');};
 },[watch]);
 const action=cta.to?<Link className="order-bar__cta" to={cta.to} tabIndex={hidden?-1:0}>{cta.label}</Link>:<a className="order-bar__cta" href={cta.href} onClick={cta.onClick} tabIndex={hidden?-1:0}>{cta.label}</a>;
 return <div className={`order-bar${hidden?'':' is-shown'}`} aria-hidden={hidden}>
  <p className="order-bar__sum"><span>{label}{detail&&<small> · {detail}</small>}</span><strong>{amount}</strong></p>
  {action}
 </div>;
}
