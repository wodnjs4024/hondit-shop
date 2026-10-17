import {useState,useSyncExternalStore} from 'react';
import {useMarket} from '../lib/market';
import {getAnalyticsConsent,setAnalyticsConsent,subscribeAnalyticsConsent} from '../lib/analyticsConsent';
const copy={
 ko:{settings:'분석 설정',title:'사이트 이용 분석',body:'상품 조회와 구매 흐름을 분석해 사이트를 개선합니다. 선택하지 않거나 거부해도 구매·결제를 이용할 수 있습니다.',allow:'허용',deny:'거부',withdraw:'동의 철회',close:'닫기',unset:'미선택',granted:'허용됨',denied:'거부됨',withdrawn:'철회됨'},
 en:{settings:'Analytics settings',title:'Site analytics',body:'Optional analytics helps improve product browsing and checkout. You can buy and pay without consenting.',allow:'Allow',deny:'Decline',withdraw:'Withdraw consent',close:'Close',unset:'Not selected',granted:'Allowed',denied:'Declined',withdrawn:'Withdrawn'},
 ja:{settings:'分析設定',title:'サイト利用分析',body:'任意の分析で商品閲覧と購入の流れを改善します。同意しなくても購入・決済できます。',allow:'許可',deny:'拒否',withdraw:'同意を撤回',close:'閉じる',unset:'未選択',granted:'許可済み',denied:'拒否済み',withdrawn:'撤回済み'},
 zh:{settings:'分析設定',title:'網站使用分析',body:'選用分析可改善商品瀏覽及購買流程。不同意亦可購買及付款。',allow:'允許',deny:'拒絕',withdraw:'撤回同意',close:'關閉',unset:'未選擇',granted:'已允許',denied:'已拒絕',withdrawn:'已撤回'},
 ms:{settings:'Tetapan analitik',title:'Analitik laman',body:'Analitik pilihan membantu menambah baik pelayaran produk dan pembelian. Anda boleh membeli dan membayar tanpa persetujuan.',allow:'Benarkan',deny:'Tolak',withdraw:'Tarik balik persetujuan',close:'Tutup',unset:'Belum dipilih',granted:'Dibenarkan',denied:'Ditolak',withdrawn:'Ditarik balik'},
 th:{settings:'ตั้งค่าการวิเคราะห์',title:'การวิเคราะห์การใช้งานเว็บไซต์',body:'การวิเคราะห์เป็นทางเลือกเพื่อปรับปรุงการดูสินค้าและการซื้อ คุณยังซื้อและชำระเงินได้แม้ไม่ยินยอม',allow:'อนุญาต',deny:'ปฏิเสธ',withdraw:'ถอนความยินยอม',close:'ปิด',unset:'ยังไม่เลือก',granted:'อนุญาตแล้ว',denied:'ปฏิเสธแล้ว',withdrawn:'ถอนแล้ว'}
};
export function AnalyticsConsent(){
 const {language}=useMarket();const c=copy[language==='zh-HK'||language==='zh-TW'?'zh':language as keyof typeof copy]||copy.en;
 const state=useSyncExternalStore(subscribeAnalyticsConsent,getAnalyticsConsent,()=> 'unset' as const);
 const [open,setOpen]=useState(false);
 const choose=(value:'granted'|'denied'|'withdrawn')=>{setAnalyticsConsent(value);setOpen(false);};
 return <section className="analytics-consent" aria-label={c.settings}>
 <div className="analytics-consent__summary"><button type="button" onClick={()=>setOpen(!open)} aria-expanded={open||state==='unset'} aria-controls="analytics-consent-panel">{c.settings}</button><span role="status">{c[state]}</span></div>
 {(open||state==='unset')&&<div id="analytics-consent-panel"><h2>{c.title}</h2><p>{c.body}</p><div className="analytics-consent__actions"><button type="button" onClick={()=>choose('granted')}>{c.allow}</button><button type="button" onClick={()=>choose('denied')}>{c.deny}</button>{state==='granted'&&<button type="button" onClick={()=>choose('withdrawn')}>{c.withdraw}</button>}{state!=='unset'&&<button type="button" onClick={()=>setOpen(false)}>{c.close}</button>}</div></div>}
 </section>;
}
