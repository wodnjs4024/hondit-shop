import type { DisplayLanguage } from "../lib/market";

/* Storefront labels for products managed in the admin (new products are enquiry-only until phase-2 pricing). */
const copy = {
  ko: { priceOnRequest: "가격 문의", quoteTitle: "견적 문의", quoteNote: "가격과 배송 조건은 문의를 보내 주시면 안내해 드립니다.", quoteCta: "이 수량으로 견적 문의", soldOut: "품절", previewBanner: "미리보기: 아직 게시되지 않은 내용입니다. 고객에게는 보이지 않습니다.", previewMissing: "미리보기를 불러오지 못했습니다. 관리자 로그인 상태를 확인하세요." },
  en: { priceOnRequest: "Price on request", quoteTitle: "Request a quote", quoteNote: "Send an enquiry and we will reply with price and delivery terms.", quoteCta: "Request a quote for this quantity", soldOut: "Sold out", previewBanner: "Preview: this content is not published yet and customers cannot see it.", previewMissing: "The preview could not be loaded. Check that you are signed in to the admin." },
  ja: { priceOnRequest: "価格はお問い合わせ", quoteTitle: "見積もり依頼", quoteNote: "お問い合わせいただくと、価格と配送条件をご案内します。", quoteCta: "この数量で見積もりを依頼", soldOut: "売り切れ", previewBanner: "プレビュー：未公開の内容です。お客様には表示されません。", previewMissing: "プレビューを読み込めませんでした。管理画面のログイン状態をご確認ください。" },
  zh: { priceOnRequest: "價格請洽詢", quoteTitle: "索取報價", quoteNote: "送出詢問後，我們會回覆價格與配送條件。", quoteCta: "以此數量索取報價", soldOut: "售罄", previewBanner: "預覽：此內容尚未發布，顧客看不到。", previewMissing: "無法載入預覽，請確認管理後台的登入狀態。" },
  ms: { priceOnRequest: "Harga atas permintaan", quoteTitle: "Minta sebut harga", quoteNote: "Hantar pertanyaan dan kami akan membalas dengan harga dan syarat penghantaran.", quoteCta: "Minta sebut harga untuk kuantiti ini", soldOut: "Habis dijual", previewBanner: "Pratonton: kandungan ini belum diterbitkan dan pelanggan tidak dapat melihatnya.", previewMissing: "Pratonton tidak dapat dimuatkan. Semak log masuk pentadbir anda." },
  th: { priceOnRequest: "สอบถามราคา", quoteTitle: "ขอใบเสนอราคา", quoteNote: "ส่งคำถามมา แล้วเราจะแจ้งราคาและเงื่อนไขการจัดส่ง", quoteCta: "ขอใบเสนอราคาสำหรับจำนวนนี้", soldOut: "สินค้าหมด", previewBanner: "ตัวอย่าง: เนื้อหานี้ยังไม่เผยแพร่ ลูกค้ายังมองไม่เห็น", previewMissing: "โหลดตัวอย่างไม่ได้ โปรดตรวจสอบการเข้าสู่ระบบผู้ดูแล" },
};

export function catalogCopy(language: DisplayLanguage) {
  return copy[language === "zh" || language === "zh-HK" || language === "zh-TW" ? "zh" : language];
}
