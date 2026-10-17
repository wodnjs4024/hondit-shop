import {useSearchParams} from 'react-router-dom';
import {functionalParams} from '../../shared/tracking-policy.js';
import {pickupRequestTotal,pickupRequestMessage} from '../../shared/contact-copy.js';
import {marketText,marketProductText,useMarket} from '../lib/market';
import {RequestActions} from './RequestActions';
export function PickupRequestPanel({initialQuantity=1,initialProduct='350g'}:{initialQuantity?:number;initialProduct?:'350g'|'500g'}){
 const {language}=useMarket();const t=(s:string)=>marketText(language,s);
 const [params,setParams]=useSearchParams();
 const product=params.get('product')==='diffuser-500g'?'500g':params.get('product')==='diffuser-350g'?'350g':initialProduct;
 const raw=Number(params.get('quantity')??initialQuantity);const quantity=[1,2,3].includes(raw)?raw:1;
 const update=(size:'350g'|'500g',q:number)=>setParams(current=>{const next=functionalParams(current);next.set('product','diffuser-'+size);next.set('quantity',String(q));next.set('fulfillment','jeju_pickup');return next;},{replace:true});
 const setProduct=(size:'350g'|'500g')=>update(size,quantity);
 const setQuantity=(q:number)=>update(product,q);
 const flow={en:'Send your request → agree on the date and meeting place → receive a PayPal payment link → payment confirmed → collect your products.',ko:'문의 → 일정·장소 협의 → PayPal 결제 링크 수신 → 결제 확인 → 상품 인도',ja:'お問い合わせ → 日時・場所の相談 → PayPal決済リンクの受信 → 入金確認 → 商品のお渡し',zh:'提出查詢 → 協商日期及地點 → 收取 PayPal 付款連結 → 確認付款 → 領取商品',ms:'Hantar pertanyaan → persetujui masa dan tempat → terima pautan PayPal → pengesahan bayaran → ambil produk.',th:'สอบถาม → ตกลงวันเวลาและสถานที่ → รับลิงก์ PayPal → ยืนยันการชำระเงิน → รับสินค้า'};
 const flowText=flow[language.startsWith('zh')?'zh':language as keyof typeof flow]||flow.en;
 const money=(n:number)=>n.toLocaleString('en-US')+(language==='ko'?'원':' KRW');
 const name=(size:string)=>marketProductText(language,`Volcanic Diffuser ${size}`);
 const total=pickupRequestTotal(quantity,product);
 return <section className="pickup-message-panel">
 <fieldset className="pickup-product-options"><legend>{t('Select product')}</legend>
 {(['350g','500g'] as const).map(size=><label key={size} className={product===size?'is-selected':''}>
 <input type="radio" name="pickup-product" value={size} checked={product===size} onChange={()=>setProduct(size)}/>
 <img src={`/images/diffuser-${size}.webp`} width="160" height="160" alt={name(size)}/>
 <span><strong>{name(size)}</strong><small>{money(pickupRequestTotal(1,size))}</small></span>
 </label>)}
 </fieldset>
 <label className="pickup-quantity">{t('Order quantity')}<select value={quantity} onChange={e=>{const q=Number(e.target.value);if([1,2,3].includes(q))setQuantity(q)}}>{[1,2,3].map(q=><option key={q} value={q}>{q} {language==='en'&&q===1?'unit':t('units')} · {money(pickupRequestTotal(q,product))}</option>)}</select></label>
 <div className="pickup-total-summary"><span>{name(product)} · {quantity} {language==='en'&&quantity===1?'unit':t('units')}<small>{t('Product amount only. No quantity discount.')}</small></span><output className="pickup-request-total" aria-live="polite">{money(total)}</output></div>
 <><p>{flowText}</p><RequestActions body={pickupRequestMessage(quantity,language,product)} purchase channels/></>
 <p>{t('Collect at Jeju Airport on arrival or departure day. Arrange the time and airport meeting point by message in advance.')}</p>
 </section>;
}
