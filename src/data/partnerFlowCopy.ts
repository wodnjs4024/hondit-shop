import type { DisplayLanguage } from "../lib/market";

/* How a business order moves, using only steps the shipping and checkout pages already state. */
const copy = {
  ko: { title: "주문 흐름", steps: [["상품·수량 선택", "국가별 직접 주문 조건에 맞는 묶음을 고릅니다."], ["배송정보 입력", "받는 분, 연락처, 주소를 입력합니다."], ["PayPal 결제", "결제가 확인된 주문만 발송을 준비합니다."], ["발송·추적 안내", "발송 후 배송 추적 정보를 보내드립니다."]], other: "조건 밖의 수량·구성·지원은 메시지로 요청해 주세요." },
  en: { title: "How an order moves", steps: [["Choose product & quantity", "Pick a bundle that meets the direct-order terms for your market."], ["Enter delivery details", "Recipient, contact and address."], ["Pay with PayPal", "Only paid orders move to dispatch preparation."], ["Dispatch & tracking", "Tracking details follow once the order ships."]], other: "Send a message for quantities, combinations or support outside these terms." },
  ja: { title: "ご注文の流れ", steps: [["商品・数量を選ぶ", "国別の直接注文条件に合うセットを選びます。"], ["配送情報を入力", "受取人、連絡先、住所を入力します。"], ["PayPalで決済", "決済確認後に発送準備を始めます。"], ["発送・追跡のご案内", "発送後に追跡情報をお送りします。"]], other: "条件外の数量・組み合わせ・サポートはメッセージでご依頼ください。" },
  zh: { title: "訂購流程", steps: [["選擇商品與數量", "選擇符合所在市場直接訂購條件的組合。"], ["填寫配送資料", "收件人、聯絡方式與地址。"], ["PayPal 付款", "確認付款後才開始準備出貨。"], ["出貨與追蹤", "出貨後提供配送追蹤資料。"]], other: "條件以外的數量、組合或支援，請以訊息提出。" },
  ms: { title: "Aliran pesanan", steps: [["Pilih produk & kuantiti", "Pilih set yang memenuhi syarat pesanan terus pasaran anda."], ["Isi maklumat penghantaran", "Penerima, hubungan dan alamat."], ["Bayar dengan PayPal", "Hanya pesanan berbayar disediakan untuk penghantaran."], ["Penghantaran & jejak", "Maklumat jejak dihantar selepas pesanan dihantar."]], other: "Hantar mesej untuk kuantiti, gabungan atau sokongan di luar syarat ini." },
  th: { title: "ขั้นตอนการสั่งซื้อ", steps: [["เลือกสินค้าและจำนวน", "เลือกชุดที่ตรงกับเงื่อนไขสั่งซื้อโดยตรงของตลาดคุณ"], ["กรอกข้อมูลจัดส่ง", "ผู้รับ ช่องทางติดต่อ และที่อยู่"], ["ชำระผ่าน PayPal", "เตรียมจัดส่งเฉพาะคำสั่งซื้อที่ชำระแล้ว"], ["จัดส่งและติดตาม", "ส่งข้อมูลติดตามพัสดุหลังจัดส่ง"]], other: "ส่งข้อความสำหรับจำนวน ชุดสินค้า หรือการสนับสนุนนอกเงื่อนไขนี้" },
};

export function partnerFlowCopy(language: DisplayLanguage) {
  return copy[language === "zh" || language === "zh-HK" || language === "zh-TW" ? "zh" : language];
}
