import {purchasePurposes} from "./purchase-context.js";
const markets=['SG','HK','JP','TW','TH','MY','BN','MO'];
const languages=['en','ko','zh','zh-HK','zh-TW','ja','ms','th'];
const reasons=['partner','quantity','combination','product','payment_request'];
export function consultationContext(params,products,defaultMarket='SG',defaultLanguage='en') {
 const product=products.find(p=>p.slug===params.get('product')||p.apiSlug===params.get('product'));
 const raw=params.get('quantity');const quantity=raw&&/^\d{1,6}$/.test(raw)&&Number(raw)>0?Number(raw):undefined;
 return {purpose:purchasePurposes.includes(params.get('purpose'))?params.get('purpose'):'unspecified',fulfillment:params.get('fulfillment')==='jeju_pickup'?'jeju_pickup':'international_bundle',product:product?{slug:product.slug,name:product.name}:undefined,quantity:product?quantity:undefined,market:markets.includes(params.get('market'))?params.get('market'):defaultMarket,language:languages.includes(params.get('lang'))?params.get('lang'):defaultLanguage,reason:reasons.includes(params.get('reason'))?params.get('reason'):'product'};
}
const labels={
 en:['HONDIT request','Market / country','Language','Request type','units','to confirm','Business type (optional)','Purpose (optional)','Preferred timing (optional)','Additional information (optional)','Please confirm applicable conditions. This is not a confirmed quotation.','Product','Quantity','Combination','Partner'],
 ko:['HONDIT 요청','시장·국가','언어','요청 유형','개','문의 후 확인','사업장 유형 (선택)','도입 목적 (선택)','희망 일정 (선택)','추가 정보 (선택)','적용 조건을 확인해주세요. 확정 견적이 아닙니다.','상품 문의','추가 수량','다품목·혼합','파트너 도입'],
 zh:['HONDIT 聯絡要求','市場／國家','語言','諮詢原因','件','待確認','業務類型（選填）','導入目的（選填）','希望時間（選填）','補充資料（選填）','請確認適用條件。這不是已確認報價。','產品','數量','組合','合作導入'],
 ja:['HONDITへの依頼','市場・国','言語','相談理由','個','要確認','事業の種類（任意）','導入目的（任意）','希望時期（任意）','追加情報（任意）','適用条件を確認してください。確定見積ではありません。','商品','数量','組み合わせ','パートナー導入'],
 ms:['Permintaan HONDIT','Pasaran / negara','Bahasa','Sebab','unit','untuk disahkan','Jenis perniagaan (pilihan)','Tujuan (pilihan)','Masa pilihan','Maklumat tambahan (pilihan)','Sila sahkan syarat berkenaan. Ini bukan sebut harga disahkan.','Produk','Kuantiti','Gabungan','Rakan niaga'],
 th:['คำขอถึง HONDIT','ตลาด / ประเทศ','ภาษา','เหตุผล','ชิ้น','รอยืนยัน','ประเภทธุรกิจ (ไม่บังคับ)','วัตถุประสงค์ (ไม่บังคับ)','ช่วงเวลาที่ต้องการ','ข้อมูลเพิ่มเติม (ไม่บังคับ)','โปรดยืนยันเงื่อนไขที่ใช้ นี่ไม่ใช่ใบเสนอราคาที่ยืนยันแล้ว','สินค้า','จำนวน','รวมสินค้า','พันธมิตร']};
export function consultationBody({lines=[],market,language,reason='product',business='',purpose='',timing='',additional=''}) {
 if(['Purpose','unspecified','도입 목적','用途','目的','Tujuan','วัตถุประสงค์'].includes(purpose))purpose='';
 const l=labels[language.startsWith('zh')?'zh':language]||labels.en;
 return [l[0],`${l[1]}: ${market}`,`${l[3]}: ${reason==='payment_request'?({en:'Payment request',ko:'선택 조건 결제 요청',zh:'付款請求',ja:'選択条件での決済依頼',ms:'Permintaan pembayaran',th:'คำขอชำระเงิน'}[language.startsWith('zh')?'zh':language]||'Payment request'):l[11+['product','quantity','combination','partner'].indexOf(reason)]||l[11]}`,...lines.map(line=>`${line.name}: ${line.quantity??l[5]} ${l[4]}`),'',business?`${l[6]}: ${business}`:'',purpose?`${l[7]}: ${purpose}`:'',timing?`${l[8]}: ${timing}`:'',additional?`${l[9]}: ${additional}`:'','',l[10]].filter((line,i,all)=>line||all[i-1]).join('\n');
}
export function consultationMailto(email,body) {return `mailto:${email}?subject=${encodeURIComponent(body.split('\n')[0] || '[HONDIT] Request')}&body=${encodeURIComponent(body)}`;}
