import type { DisplayLanguage } from "../lib/market";

/* Labels for the stepped order panel (product detail, bulk-order entry, checkout). Logic stays in shared/checkout-terms.js. */
const copy = {
  ko: { qty: "수량 선택", price: "금액 확인", pay: "결제 방법", unit: "개당 가격", subtotal: "상품금액", shipping: "국제배송비", included: "포함", confirm: "결제 전 확인", tax: "세금·통관비", taxValue: "별도 · 발생 시 수취인 부담", total: "총 결제금액", estimate: "예상 금액", perUnit: "개당", conditions: "국가별 판매 조건", product: "주문 상품", delivery: "배송 정보", payment: "결제", units: "개" },
  en: { qty: "Quantity", price: "Price", pay: "How to pay", unit: "Unit price", subtotal: "Product amount", shipping: "International shipping", included: "Included", confirm: "Confirmed before payment", tax: "Tax & customs", taxValue: "Excluded · payable by the recipient", total: "Total payment", estimate: "Estimated amount", perUnit: "each", conditions: "Sales conditions for your market", product: "Your order", delivery: "Delivery details", payment: "Payment", units: "units" },
  ja: { qty: "数量", price: "金額の確認", pay: "お支払い方法", unit: "単価", subtotal: "商品代金", shipping: "国際送料", included: "込み", confirm: "決済前に確認", tax: "税金・通関費用", taxValue: "別途 · 受取人負担", total: "お支払い合計", estimate: "金額の目安", perUnit: "1個あたり", conditions: "国別の販売条件", product: "ご注文商品", delivery: "配送情報", payment: "お支払い", units: "個" },
  zh: { qty: "選擇數量", price: "確認金額", pay: "付款方式", unit: "單價", subtotal: "商品金額", shipping: "國際運費", included: "已含", confirm: "付款前確認", tax: "稅費·清關費", taxValue: "另計 · 由收件人負擔", total: "付款總額", estimate: "預估金額", perUnit: "每件", conditions: "所選市場的銷售條件", product: "訂購商品", delivery: "配送資料", payment: "付款", units: "件" },
  ms: { qty: "Kuantiti", price: "Semak harga", pay: "Cara bayar", unit: "Harga seunit", subtotal: "Jumlah produk", shipping: "Penghantaran antarabangsa", included: "Termasuk", confirm: "Disahkan sebelum bayaran", tax: "Cukai & kastam", taxValue: "Tidak termasuk · ditanggung penerima", total: "Jumlah bayaran", estimate: "Anggaran jumlah", perUnit: "seunit", conditions: "Syarat jualan pasaran anda", product: "Pesanan anda", delivery: "Maklumat penghantaran", payment: "Pembayaran", units: "unit" },
  th: { qty: "เลือกจำนวน", price: "ตรวจสอบราคา", pay: "วิธีชำระเงิน", unit: "ราคาต่อชิ้น", subtotal: "ราคาสินค้า", shipping: "ค่าจัดส่งระหว่างประเทศ", included: "รวมแล้ว", confirm: "ยืนยันก่อนชำระเงิน", tax: "ภาษีและศุลกากร", taxValue: "ไม่รวม · ผู้รับเป็นผู้ชำระ", total: "ยอดชำระทั้งหมด", estimate: "ยอดประมาณการ", perUnit: "ต่อชิ้น", conditions: "เงื่อนไขการขายของตลาดคุณ", product: "สินค้าที่สั่ง", delivery: "ข้อมูลจัดส่ง", payment: "การชำระเงิน", units: "ชิ้น" },
};

export function orderPanelCopy(language: DisplayLanguage) {
  return copy[language === "zh" || language === "zh-HK" || language === "zh-TW" ? "zh" : language];
}
