// Customer-facing copy in the six selectable storefront languages.
const copy = {
  intro: ['A piece of Jeju, chosen for your everyday.', '일상과 공간에 들이는, 제주의 한 조각.', '為日常與空間挑選一片濟州。', '日常と空間に、済州のひとかけら。', 'Secebis Jeju untuk rutin dan ruang anda.', 'เลือกส่วนหนึ่งของเชจูสำหรับชีวิตและพื้นที่ของคุณ'],
  lead: ['Explore volcanic-stone diffusers and cleansing care. Choose a product, review the conditions, then buy or discuss your plans.', '화산석 디퓨저와 클렌징 제품을 살펴보세요. 상품과 거래조건을 확인한 뒤 구매하거나 도입을 상담할 수 있습니다.', '探索火山石擴香與潔面產品。確認商品及交易條件，再購買或洽談導入。', '火山石ディフューザーとクレンジングをご紹介。商品と取引条件を確認し、購入または導入をご相談ください。', 'Terokai penyebar batu gunung berapi dan penjagaan pembersihan. Semak syarat sebelum membeli atau berbincang.', 'สำรวจหินกระจายกลิ่นและผลิตภัณฑ์ทำความสะอาด ตรวจสอบเงื่อนไขก่อนซื้อหรือปรึกษา'],
  choose: ['How will you use HONDIT?', '어떤 목적으로 찾으셨나요?', '您想如何使用 HONDIT？', 'HONDITをどのように使いますか？', 'Bagaimana anda ingin menggunakan HONDIT?', 'คุณต้องการใช้ HONDIT อย่างไร'],
  personal: ['For yourself or a gift', '개인 사용·선물', '自用或送禮', '自分用・ギフト', 'Untuk diri atau hadiah', 'ใช้เองหรือเป็นของขวัญ'],
  personalBody: ['Explore product details. In Singapore, individual purchases are available through Shopee.', '상품 구성과 사용법부터 확인하세요. 싱가포르 개별 구매는 Shopee에서 가능합니다.', '先查看商品內容與用法。新加坡可透過 Shopee 單件購買。', '内容と使い方をご確認ください。シンガポールの個別購入はShopeeをご利用いただけます。', 'Lihat kandungan dan cara penggunaan. Pembelian individu di Singapura tersedia di Shopee.', 'ดูรายละเอียดและวิธีใช้ ในสิงคโปร์ซื้อรายชิ้นผ่าน Shopee ได้'],
  bulk: ['For a bulk purchase', '수량을 정한 대량구매', '批量採購', '数量を決めてまとめ買い', 'Untuk pembelian pukal', 'ซื้อจำนวนมาก'],
  bulkBody: ['Compare unit prices and minimum quantities. Additional quantities and combinations need a conditions check.', '단가와 최소 주문수량을 비교하세요. 추가 수량·다품목은 조건 확인 후 진행합니다.', '比較單價及最低訂購量。額外數量與組合需先確認條件。', '単価と最低数量を比較。追加数量や組み合わせは条件確認後に進めます。', 'Bandingkan harga unit dan kuantiti minimum. Kuantiti tambahan atau gabungan memerlukan semakan syarat.', 'เปรียบเทียบราคาต่อชิ้นและขั้นต่ำ จำนวนเพิ่มเติมหรือหลายสินค้าต้องตรวจสอบเงื่อนไข'],
  partner: ['For your business or space', '매장·공간 도입', '商店或空間導入', '店舗・空間への導入', 'Untuk perniagaan atau ruang', 'สำหรับธุรกิจหรือพื้นที่'],
  partnerBody: ['Discuss display, resale or gift planning before deciding on an order.', '공간 배치·재판매·선물 기획의 목적을 바탕으로 주문 전 상담하세요.', '下單前按陳列、轉售或禮品規劃目的洽談。', '設置・再販売・ギフト企画の目的に合わせて、注文前にご相談ください。', 'Bincangkan pameran, jualan semula atau perancangan hadiah sebelum membuat pesanan.', 'ปรึกษาการจัดวาง ขายต่อ หรือวางแผนของขวัญก่อนสั่งซื้อ'],
  compare: ['Compare before you choose', '나에게 맞는 상품과 주문조건 비교', '選購前先比較', '選ぶ前に比較', 'Bandingkan sebelum memilih', 'เปรียบเทียบก่อนเลือก'],
  compareBody: ['Direct bulk prices for your selected market. Shipping and tax conditions are shown separately on each product page.', '선택한 국가의 직접 대량판매 기준입니다. 배송·세금 조건은 상품 상세에서 별도로 확인하세요.', '以下為所選市場的直接批發價格。運費與稅費條件請查看商品詳情。', '選択した国の直接まとめ買い価格です。配送・税金の条件は各商品ページでご確認ください。', 'Harga pukal langsung untuk pasaran dipilih. Syarat penghantaran dan cukai pada halaman produk.', 'ราคาขายส่งโดยตรงสำหรับประเทศที่เลือก ดูเงื่อนไขขนส่งและภาษีในหน้าสินค้า'],
  product: ['Product', '상품', '商品', '商品', 'Produk', 'สินค้า'],
  unit: ['Unit price', '개당 단가', '單價', '単価', 'Harga unit', 'ราคาต่อชิ้น'],
  minimum: ['Minimum quantity', '최소 수량', '最低數量', '最低数量', 'Kuantiti minimum', 'จำนวนขั้นต่ำ'],
  amount: ['Minimum product amount', '최소 상품금액', '最低商品金額', '最低商品代金', 'Jumlah produk minimum', 'มูลค่าสินค้าขั้นต่ำ'],
  view: ['Explore products →', '상품 살펴보기 →', '查看商品 →', '商品を見る →', 'Lihat produk →', 'ดูสินค้า →'],
  order: ['Review bulk options →', '대량구매 조건 확인 →', '查看批量條件 →', 'まとめ買い条件を見る →', 'Lihat pilihan pukal →', 'ดูเงื่อนไขซื้อจำนวนมาก →'],
  talk: ['Discuss an introduction →', '도입 상담 시작 →', '洽談導入 →', '導入を相談する →', 'Bincang pengenalan →', 'ปรึกษาการนำไปใช้ →'],
  spaces: ['Start with your setting', '도입할 공간과 목적부터', '從您的空間與目的開始', '空間と目的から始める', 'Mulakan dengan ruang anda', 'เริ่มจากพื้นที่และจุดประสงค์'],
  shop: ['Shops & resale', '매장·재판매', '商店與轉售', '店舗・再販売', 'Kedai & jualan semula', 'ร้านค้าและขายต่อ'],
  shopBody: ['Tell us your product selection, sales country and intended quantity.', '관심 상품, 판매 국가와 희망 수량을 알려주세요.', '請提供感興趣的商品、銷售國家與預計數量。', 'ご希望の商品、販売国、予定数量をお知らせください。', 'Kongsi produk pilihan, negara jualan dan kuantiti yang dirancang.', 'แจ้งสินค้าที่สนใจ ประเทศที่ขาย และจำนวนที่ต้องการ'],
  stay: ['Hospitality & spaces', '숙박·공간 배치', '住宿與空間陳列', '宿泊施設・空間設置', 'Hospitaliti & ruang', 'ที่พักและการจัดพื้นที่'],
  stayBody: ['Tell us where the products would be placed and how many you are considering.', '배치할 위치와 검토 중인 수량을 바탕으로 상담합니다.', '告訴我們預計擺放位置及考慮的數量。', '設置場所と検討中の数量をもとにご相談いただけます。', 'Beritahu lokasi penempatan dan kuantiti yang dipertimbangkan.', 'แจ้งตำแหน่งที่จะวางและจำนวนที่กำลังพิจารณา'],
  gift: ['Gifts & group purchases', '선물·공동구매', '禮品與團購', 'ギフト・共同購入', 'Hadiah & pembelian kumpulan', 'ของขวัญและการซื้อแบบกลุ่ม'],
  giftBody: ['Share the occasion, destination, quantity and preferred date. Packaging and timing need confirmation.', '용도·배송 국가·수량·희망 일정을 알려주세요. 포장과 납기는 확인 후 확정합니다.', '請提供用途、目的地、數量與希望日期。包裝及交期需確認。', '用途・配送国・数量・希望日をお知らせください。包装と納期は確認後に確定します。', 'Kongsi tujuan, destinasi, kuantiti dan tarikh. Pembungkusan dan masa perlu disahkan.', 'แจ้งโอกาส ประเทศปลายทาง จำนวนและวันที่ต้องการ บรรจุภัณฑ์และกำหนดส่งต้องยืนยัน'],
  process: ['From a conversation to a considered order', '상담에서 실제 도입까지', '從洽談到確認訂單', '相談から導入まで', 'Daripada perbincangan kepada pesanan', 'จากการปรึกษาสู่การสั่งซื้อ'],
  step1: ['Share your plans', '목적·상품·수량 공유', '分享用途、商品與數量', '目的・商品・数量を共有', 'Kongsi rancangan anda', 'แจ้งแผนของคุณ'],
  step2: ['Confirm price, delivery and support', '가격·배송·지원 범위 확인', '確認價格、配送與支援', '価格・配送・支援範囲を確認', 'Sahkan harga, penghantaran dan sokongan', 'ยืนยันราคา ขนส่ง และการสนับสนุน'],
  step3: ['Agree on the order or pilot', '주문·시험 운영 조건 협의', '協議訂單或試行條件', '注文・試験導入条件を相談', 'Persetujui pesanan atau percubaan', 'ตกลงเงื่อนไขสั่งซื้อหรือทดลอง'],
  step4: ['Review use or sales feedback', '사용·판매 반응 검토', '檢視使用或銷售反應', '使用・販売の反応を確認', 'Semak maklum balas penggunaan atau jualan', 'ทบทวนผลตอบรับการใช้หรือขาย'],
  questions: ['Before you get in touch', '상담 전 궁금한 점', '洽談前常見問題', '相談前によくある質問', 'Sebelum menghubungi kami', 'ก่อนติดต่อเรา'],
  q1: ['Can I combine products or request more?', '추가 수량이나 여러 상품을 주문할 수 있나요?', '可以增加數量或組合商品嗎？', '追加数量や複数商品を注文できますか？', 'Bolehkah saya gabungkan produk atau tambah kuantiti?', 'เพิ่มจำนวนหรือรวมหลายสินค้าได้ไหม'],
  a1: ['Send the product names, quantities and destination. Shipping and order eligibility must be confirmed; a consultation is not an order approval.', '상품별 수량과 배송 국가를 보내주세요. 배송 범위와 주문 가능 여부를 확인하며, 상담만으로 주문이 승인되지는 않습니다.', '請提供各商品數量及目的地。需確認配送範圍與訂購資格，諮詢不等於訂單批准。', '商品別数量と配送国をお知らせください。配送範囲と注文可否の確認が必要です。相談だけでは注文承認になりません。', 'Hantar nama produk, kuantiti dan destinasi. Penghantaran dan kelayakan pesanan perlu disahkan; rundingan bukan kelulusan pesanan.', 'แจ้งชื่อสินค้า จำนวน และประเทศปลายทาง ต้องยืนยันการขนส่งและเงื่อนไข การปรึกษาไม่ใช่การอนุมัติคำสั่งซื้อ'],
  q2: ['Is there a confirmed partner package?', '파트너 지원 조건이 정해져 있나요?', '有確定的合作支援方案嗎？', 'パートナー支援条件は決まっていますか？', 'Adakah pakej rakan niaga disahkan?', 'มีแพ็กเกจพันธมิตรที่ยืนยันแล้วหรือไม่'],
  q3: ['How do I send a consultation?', '상담은 어떻게 접수하나요?', '如何提交諮詢？', '相談はどう送りますか？', 'Bagaimana menghantar rundingan?', 'ส่งคำปรึกษาอย่างไร'],
  a3: ['Open the email draft or copy the details below, then send the email yourself. Opening a draft does not submit a request.', '아래에서 이메일 초안을 열거나 내용을 복사한 뒤 직접 발송해주세요. 초안을 여는 것만으로 접수되지는 않습니다.', '在下方開啟電郵草稿或複製內容，然後自行發送。開啟草稿不代表已提交。', '下のメール下書きを開くか内容をコピーし、ご自身で送信してください。下書きを開くだけでは送信されません。', 'Buka draf e-mel atau salin butiran di bawah, kemudian hantar sendiri. Membuka draf tidak menghantar permintaan.', 'เปิดร่างอีเมลหรือคัดลอกรายละเอียดด้านล่างแล้วส่งเอง การเปิดร่างยังไม่ใช่การส่งคำขอ'],
} as const;
export type DiscoveryKey = keyof typeof copy;
export function discoveryText(language: string, key: DiscoveryKey): string {
 const index = language === 'ko' ? 1 : language.startsWith('zh') ? 2 : language === 'ja' ? 3 : language === 'ms' ? 4 : language === 'th' ? 5 : 0;
 return copy[key][index];
}
