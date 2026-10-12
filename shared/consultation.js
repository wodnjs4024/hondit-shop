const markets=['SG','HK','JP','TW','TH','MY','BN','MO'];
const languages=['en','ko','zh','zh-HK','zh-TW','ja','ms','th'];
const reasons=['partner','quantity','combination','product'];
export function consultationContext(params,products,defaultMarket='SG',defaultLanguage='en') {
 const product=products.find(p=>p.slug===params.get('product')||p.apiSlug===params.get('product'));
 const raw=params.get('quantity');const quantity=raw&&/^\d{1,6}$/.test(raw)&&Number(raw)>0?Number(raw):undefined;
 return {product:product?{slug:product.slug,name:product.name}:undefined,quantity:product?quantity:undefined,market:markets.includes(params.get('market'))?params.get('market'):defaultMarket,language:languages.includes(params.get('lang'))?params.get('lang'):defaultLanguage,reason:reasons.includes(params.get('reason'))?params.get('reason'):'product'};
}
const labels={
 en:['HONDIT consultation','Market / country','Language','Reason','units','to confirm','Business type (optional)','Purpose (optional)','Preferred timing (optional)','Additional information (optional)','Please confirm applicable conditions. This is not a confirmed quotation.','Product','Quantity','Combination','Partner'],
 ko:['HONDIT 상담','시장·국가','언어','상담 이유','개','문의 후 확인','사업장 유형 (선택)','도입 목적 (선택)','희망 일정 (선택)','추가 정보 (선택)','적용 조건을 확인해주세요. 확정 견적이 아닙니다.','상품 문의','추가 수량','다품목·혼합','파트너 도입'],
 zh:['HONDIT 諮詢','市場／國家','語言','諮詢原因','件','待確認','業務類型（選填）','導入目的（選填）','希望時間（選填）','補充資料（選填）','請確認適用條件。這不是已確認報價。','產品','數量','組合','合作導入'],
 ja:['HONDIT 相談','市場・国','言語','相談理由','個','要確認','事業の種類（任意）','導入目的（任意）','希望時期（任意）','追加情報（任意）','適用条件を確認してください。確定見積ではありません。','商品','数量','組み合わせ','パートナー導入'],
 ms:['Rundingan HONDIT','Pasaran / negara','Bahasa','Sebab','unit','untuk disahkan','Jenis perniagaan (pilihan)','Tujuan (pilihan)','Masa pilihan','Maklumat tambahan (pilihan)','Sila sahkan syarat berkenaan. Ini bukan sebut harga disahkan.','Produk','Kuantiti','Gabungan','Rakan niaga'],
 th:['ปรึกษา HONDIT','ตลาด / ประเทศ','ภาษา','เหตุผล','ชิ้น','รอยืนยัน','ประเภทธุรกิจ (ไม่บังคับ)','วัตถุประสงค์ (ไม่บังคับ)','ช่วงเวลาที่ต้องการ','ข้อมูลเพิ่มเติม (ไม่บังคับ)','โปรดยืนยันเงื่อนไขที่ใช้ นี่ไม่ใช่ใบเสนอราคาที่ยืนยันแล้ว','สินค้า','จำนวน','รวมสินค้า','พันธมิตร']};
export function consultationBody({lines=[],market,language,reason='product',business='',purpose='',timing='',additional=''}) {
 const l=labels[language.startsWith('zh')?'zh':language]||labels.en;
 return [l[0],`${l[1]}: ${market}`,`${l[2]}: ${language}`,`${l[3]}: ${l[11+['product','quantity','combination','partner'].indexOf(reason)]||l[11]}`,...lines.map(line=>`${line.name}: ${line.quantity??l[5]} ${l[4]}`),'',`${l[6]}: ${business}`,`${l[7]}: ${purpose}`,`${l[8]}: ${timing}`,`${l[9]}: ${additional}`,'',l[10]].join('\n');
}
export function consultationMailto(email,body) {return `mailto:${email}?subject=${encodeURIComponent('[HONDIT] Consultation')}&body=${encodeURIComponent(body)}`;}
