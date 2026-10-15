const rows = {
 'Select product':['상품 선택','選擇商品','商品を選択','Pilih produk','เลือกสินค้า'],
 'Quantity':['수량','數量','数量','Kuantiti','จำนวน'],
 '350g total':['350g 총액','350g 總額','350g 合計','Jumlah 350g','ยอดรวม 350g'],
 '500g total':['500g 총액','500g 總額','500g 合計','Jumlah 500g','ยอดรวม 500g'],
 'Awaiting price approval':['가격 승인 대기','價格待批准','価格承認待ち','Menunggu kelulusan harga','รออนุมัติราคา'],
 'Local review only · proposed price · ordering unavailable':['로컬 검토 전용 · 제안가격 · 주문 불가','僅限本機檢視 · 建議價格 · 無法下單','ローカル確認専用 · 提案価格 · 注文不可','Semakan tempatan sahaja · harga cadangan · pesanan tidak tersedia','ตรวจสอบในเครื่องเท่านั้น · ราคาเสนอ · ยังสั่งซื้อไม่ได้'],
 'Product amount only. No quantity discount.':['상품금액 기준입니다. 수량 할인은 적용하지 않습니다.','僅商品金額，無數量折扣。','商品代金のみ。数量割引はありません。','Jumlah produk sahaja. Tiada diskaun kuantiti.','เฉพาะมูลค่าสินค้า ไม่มีส่วนลดตามจำนวน'],

 'Store & business purchase guide':['매장·사업자 구매 안내','商店及企業採購指南','店舗・事業者向け購入案内','Panduan pembelian kedai dan perniagaan','คู่มือซื้อสำหรับร้านค้าและธุรกิจ'],
 'Contact for additional requests':['추가 요청 연락하기','聯絡提出額外要求','追加のご要望はこちら','Hubungi untuk permintaan tambahan','ติดต่อสำหรับคำขอเพิ่มเติม'],
 'Check products, approved prices and support materials. Order eligible bundles directly; contact us only for additional requests.':['상품·승인 가격·지원자료를 확인하세요. 조건에 맞는 묶음은 바로 주문하고 추가 요청이 있을 때 연락해주세요.','查看產品、已確認價格及支援資料。符合條件的組合可直接下單，額外要求請聯絡我們。','商品・承認済み価格・資料をご確認ください。条件に合うセットは直接注文でき、追加のご要望のみご連絡ください。','Semak produk, harga diluluskan dan bahan sokongan. Pesan pakej yang layak terus; hubungi untuk permintaan tambahan sahaja.','ตรวจสอบสินค้า ราคาที่อนุมัติและสื่อสนับสนุน สั่งชุดที่ตรงเงื่อนไขได้โดยตรง ติดต่อเมื่อมีคำขอเพิ่มเติม'],
 'View Shopee store ↗':['Shopee 스토어 보기 ↗','查看 Shopee 商店 ↗','Shopeeストアを見る ↗','Lihat kedai Shopee ↗','ดูร้าน Shopee ↗'],
 'You can also view HONDIT products and sales activity on our Singapore Shopee store.':['싱가포르 Shopee에서도 HONDIT의 상품과 판매 활동을 확인할 수 있습니다.','您也可在新加坡 Shopee 商店查看 HONDIT 商品與銷售活動。','シンガポールのShopeeストアでもHONDITの商品と販売活動をご覧いただけます。','Lihat juga produk dan aktiviti jualan HONDIT di kedai Shopee Singapura kami.','ดูสินค้าและกิจกรรมการขาย HONDIT ได้ที่ร้าน Shopee สิงคโปร์'],
 'Jeju pickup by message':['메시지로 제주 수령 요청','以訊息申請濟州取貨','メッセージで済州受取を依頼','Minta pengambilan Jeju melalui mesej','ขอรับสินค้าที่เชจูทางข้อความ'],
 "StoneJeju 350g · Jeju Airport pickup":["StoneJeju 디퓨저 350g · 제주공항 수령","StoneJeju 350g · 濟州機場交收","StoneJeju 350g · 済州空港受取","StoneJeju 350g · Pengambilan di Lapangan Terbang Jeju","StoneJeju 350g · รับที่สนามบินเชจู"],
 "Collect at Jeju Airport on arrival or departure day. Arrange the time and airport meeting point by message in advance.":["도착일 또는 출국일에 제주공항에서 전달합니다. 전달 시간과 공항 안의 만남 지점은 미리 메시지로 조율해주세요.","抵達或離境當天於濟州機場交收。請提前以訊息協調時間及機場內會面地點。","到着日または出発日に済州空港でお渡しします。時間と空港内の待合せ場所は事前にメッセージでご相談ください。","Ambil di Lapangan Terbang Jeju pada hari ketibaan atau berlepas. Aturkan masa dan tempat pertemuan dalam lapangan terbang melalui mesej terlebih dahulu.","รับที่สนามบินเชจูในวันมาถึงหรือวันเดินทางออก โปรดตกลงเวลาและจุดพบภายในสนามบินล่วงหน้าทางข้อความ"],
 "Select quantity → add our contact → send the template → confirm airport handover → collect.":["수량 선택 → 친구 추가 → 양식 전송 → 공항 전달 일정 확인 → 수령","選擇數量 → 新增聯絡人 → 傳送範本 → 確認機場交收安排 → 領取","数量選択 → 友だち追加 → テンプレート送信 → 空港受取日程確認 → 受取","Pilih kuantiti → tambah kenalan → hantar templat → sahkan serahan lapangan terbang → ambil.","เลือกจำนวน → เพิ่มเพื่อน → ส่งแบบฟอร์มข้อความ → ยืนยันการส่งมอบที่สนามบิน → รับสินค้า"],
 'Copying a request or opening an app does not confirm an order. Review and send the message yourself.':['문구 복사나 메신저 열기만으로 주문이 확정되지는 않습니다. 내용을 확인하고 직접 전송해주세요.','複製要求或開啟應用程式不代表訂單已確認。請自行核對並傳送。','文面のコピーやアプリを開くだけでは注文は確定しません。確認してご自身で送信してください。','Menyalin permintaan atau membuka aplikasi tidak mengesahkan pesanan. Semak dan hantar mesej sendiri.','การคัดลอกข้อความหรือเปิดแอปไม่ถือว่ายืนยันคำสั่งซื้อ โปรดตรวจสอบและส่งข้อความด้วยตนเอง'],
 'Copy purchase request':['구매 요청 문구 복사','複製購買要求','購入依頼文をコピー','Salin permintaan pembelian','คัดลอกคำขอซื้อ'],
 'Copy request text':['요청 문구 복사','複製要求文案','依頼文をコピー','Salin teks permintaan','คัดลอกข้อความคำขอ'],
 'Copy contact link':['연락 링크 복사','複製聯絡連結','連絡先リンクをコピー','Salin pautan hubungan','คัดลอกลิงก์ติดต่อ'],
 'Copy account / contact':['계정·연락처 복사','複製帳號／聯絡資料','アカウント・連絡先をコピー','Salin akaun / hubungan','คัดลอกบัญชี / ช่องทางติดต่อ'],
 'Open messenger / add contact':['메신저 열기·친구 추가','開啟通訊軟件／新增聯絡人','メッセンジャーを開く・友だち追加','Buka aplikasi / tambah kenalan','เปิดแอปข้อความ / เพิ่มเพื่อน'],
 'Other contact channels':['다른 연락 채널','其他聯絡方式','その他の連絡方法','Saluran hubungan lain','ช่องทางติดต่ออื่น'],
 'QR for desktop or print':['QR 보기 · PC·인쇄용','查看 QR · 電腦／列印用','QRを見る・PC／印刷用','QR untuk komputer atau cetakan','ดู QR สำหรับคอมพิวเตอร์หรือพิมพ์'],
 'Product amount':['상품금액','商品金額','商品代金','Jumlah produk','มูลค่าสินค้า'],
 'No consultation is required for an eligible direct order. Additional quantities, combinations or support requests can be sent by message.':['직접 주문 조건에 맞으면 상담 없이 구매할 수 있습니다. 추가 수량·구성·지원 요청만 메시지로 보내주세요.','符合直接訂購條件便可免諮詢購買。額外數量、組合或支援要求可透過訊息提出。','直接注文の条件に合えば相談なしで購入できます。追加数量・組み合わせ・支援のご要望のみメッセージでお知らせください。','Pesanan terus yang layak tidak memerlukan rundingan. Hantar permintaan kuantiti tambahan, gabungan atau sokongan melalui mesej.','ซื้อโดยตรงได้โดยไม่ต้องปรึกษาหากตรงเงื่อนไข ส่งข้อความเฉพาะคำขอจำนวนเพิ่มเติม การจัดชุดหรือการสนับสนุน'],
 'Choose your contact channel.':['연락 방법을 선택하세요.','選擇聯絡方式。','連絡方法をお選びください。','Pilih saluran hubungan anda.','เลือกช่องทางติดต่อ'],
};
export const contactCopy=Object.fromEntries(Object.entries(rows).map(([en,values])=>[en,Object.fromEntries(['ko','zh-HK','ja','ms','th'].map((lang,i)=>[lang,values[i]]))]));
const templates={
  "en": [
    "Hello. I would like to purchase for pickup at Jeju Airport.",
    "Product: StoneJeju diffuser 350g",
    "Quantity",
    "units",
    "Product amount",
    "Preferred pickup date / time:",
    "Pickup location: Jeju Airport",
    "Pickup day: arrival / departure"
  ],
  "ko": [
    "안녕하세요. 제주공항 수령으로 구매하고 싶습니다.",
    "상품: StoneJeju 디퓨저 350g",
    "수량",
    "개",
    "상품금액",
    "희망 수령일·시간:",
    "수령 장소: 제주공항",
    "수령 구분: 도착일 / 출국일"
  ],
  "zh-HK": [
    "您好，我想購買並於濟州機場交收。",
    "商品：StoneJeju 擴香 350g",
    "數量",
    "件",
    "商品金額",
    "希望取貨日期及時間：",
    "交收地點：濟州機場",
    "交收日期類型：抵達日／離境日"
  ],
  "ja": [
    "こんにちは。済州空港での受取で購入を希望します。",
    "商品：StoneJeju ディフューザー 350g",
    "数量",
    "個",
    "商品代金",
    "希望受取日・時間：",
    "受取場所：済州空港",
    "受取日区分：到着日／出発日"
  ],
  "ms": [
    "Helo. Saya ingin membeli untuk pengambilan di Lapangan Terbang Jeju.",
    "Produk: penyebar StoneJeju 350g",
    "Kuantiti",
    "unit",
    "Jumlah produk",
    "Tarikh / masa pengambilan pilihan:",
    "Lokasi pengambilan: Lapangan Terbang Jeju",
    "Hari pengambilan: ketibaan / berlepas"
  ],
  "th": [
    "สวัสดี ต้องการซื้อเพื่อรับสินค้าที่สนามบินเชจู",
    "สินค้า: StoneJeju หินกระจายกลิ่น 350g",
    "จำนวน",
    "ชิ้น",
    "มูลค่าสินค้า",
    "วันและเวลารับสินค้าที่ต้องการ:",
    "จุดรับสินค้า: สนามบินเชจู",
    "วันรับสินค้า: วันมาถึง / วันเดินทางออก"
  ]
};
export function pickupRequestTotal(quantity,product='350g'){if(!Number.isInteger(quantity)||quantity<1||quantity>3)throw Error('Pickup quantity must be 1–3');if(!['350g','500g'].includes(product))throw Error('Unknown pickup product');return quantity*(product==='500g'?40000:18000);}
export function pickupRequestMessage(quantity,language='en',product='350g'){
 const total=pickupRequestTotal(quantity,product);const lang=language.startsWith('zh')?'zh-HK':language;const l=templates[lang]||templates.en;
 return [l[0],'',l[1].replace('350g',product),`${l[2]}: ${quantity}${lang==='ko'||lang==='ja'?'':' '}${lang==='en'&&quantity===1?'unit':l[3]}`,`${l[4]}: ${total.toLocaleString('en-US')}${lang==='ko'?'원':' KRW'}`,l[6],l[7],l[5]].join('\n');
}
