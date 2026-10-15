import type {DisplayLanguage} from '../lib/market';
const labels={
  "ko": [
    "국제배송비 포함",
    "예상 상품금액",
    "최종 결제금액",
    "맞춤 견적 요청",
    "상품·수량 선택에 따라 최종금액과 결제 방법을 확인할 수 있습니다."
  ],
  "en": [
    "International shipping included",
    "Estimated product amount",
    "Final payment total",
    "Request a quote",
    "Select product and quantity to see the final amount and checkout options."
  ],
  "ja": [
    "国際送料込み",
    "商品代金の目安",
    "最終決済金額",
    "見積もりを依頼",
    "商品と数量を選択し、最終金額と決済方法をご確認ください。"
  ],
  "zh": [
    "含國際運費",
    "預估商品金額",
    "最終付款金額",
    "申請報價",
    "選擇商品和數量，查看最終金額及付款方式。"
  ],
  "ms": [
    "Penghantaran antarabangsa termasuk",
    "Anggaran jumlah produk",
    "Jumlah bayaran akhir",
    "Minta sebut harga",
    "Pilih produk dan kuantiti untuk melihat jumlah akhir dan pilihan pembayaran."
  ],
  "th": [
    "รวมค่าจัดส่งระหว่างประเทศ",
    "ยอดสินค้าโดยประมาณ",
    "ยอดชำระสุดท้าย",
    "ขอใบเสนอราคา",
    "เลือกสินค้าและจำนวนเพื่อดูยอดสุดท้ายและวิธีชำระเงิน"
  ]
};
export function checkoutChargeCopy(language:DisplayLanguage){const a=labels[language==='zh-HK'||language==='zh-TW'?'zh':language];return {included:a[0],estimated:a[1],final:a[2],quote:a[3],scope:a[4]};}
