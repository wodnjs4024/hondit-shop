import type { DisplayLanguage } from "../lib/market";

/* Labels for the contact channel cards. Descriptions say only how each channel is used. */
const copy = {
  ko: { open: "메신저 열기", copy: "계정 복사", copyEmail: "주소 복사", draft: "이메일 초안 열기", scan: "휴대폰 카메라로 스캔", whatsapp: "이 번호로 WhatsApp 메시지를 보내세요.", telegram: "이 번호로 Telegram 메시지를 보내세요.", wechat: "WeChat ID로 친구 추가 후 메시지를 보내세요.", instagram: "Instagram DM으로 문의하세요.", email: "요청 내용이 담긴 이메일 초안을 열거나 주소를 복사하세요.", copied: "복사했습니다.", failed: "복사할 수 없습니다. 아래 주소를 직접 선택해 주세요." },
  en: { open: "Open messenger", copy: "Copy account", copyEmail: "Copy address", draft: "Open email draft", scan: "Scan with your phone camera", whatsapp: "Message this number on WhatsApp.", telegram: "Message this number on Telegram.", wechat: "Add this WeChat ID, then send a message.", instagram: "Send a direct message on Instagram.", email: "Open a draft with your request, or copy the address.", copied: "Copied.", failed: "Copy unavailable. Select the address below." },
  ja: { open: "メッセンジャーを開く", copy: "アカウントをコピー", copyEmail: "アドレスをコピー", draft: "メール下書きを開く", scan: "スマートフォンのカメラで読み取り", whatsapp: "この番号に WhatsApp でメッセージを送ってください。", telegram: "この番号に Telegram でメッセージを送ってください。", wechat: "WeChat ID を友だち追加してメッセージを送ってください。", instagram: "Instagram の DM でお問い合わせください。", email: "依頼内容入りの下書きを開くか、アドレスをコピーしてください。", copied: "コピーしました。", failed: "コピーできません。下のアドレスを選択してください。" },
  zh: { open: "開啟通訊軟件", copy: "複製帳號", copyEmail: "複製地址", draft: "開啟電郵草稿", scan: "用手機相機掃描", whatsapp: "以 WhatsApp 傳訊息到此號碼。", telegram: "以 Telegram 傳訊息到此號碼。", wechat: "加入此 WeChat ID 後傳送訊息。", instagram: "透過 Instagram 私訊聯絡。", email: "開啟含申請內容的電郵草稿，或複製地址。", copied: "已複製。", failed: "無法複製，請直接選取下方地址。" },
  ms: { open: "Buka aplikasi", copy: "Salin akaun", copyEmail: "Salin alamat", draft: "Buka draf e-mel", scan: "Imbas dengan kamera telefon", whatsapp: "Hantar mesej ke nombor ini melalui WhatsApp.", telegram: "Hantar mesej ke nombor ini melalui Telegram.", wechat: "Tambah ID WeChat ini, kemudian hantar mesej.", instagram: "Hantar mesej terus di Instagram.", email: "Buka draf berisi permintaan anda, atau salin alamat.", copied: "Disalin.", failed: "Tidak dapat menyalin. Pilih alamat di bawah." },
  th: { open: "เปิดแอปแชท", copy: "คัดลอกบัญชี", copyEmail: "คัดลอกอีเมล", draft: "เปิดร่างอีเมล", scan: "สแกนด้วยกล้องโทรศัพท์", whatsapp: "ส่งข้อความถึงหมายเลขนี้ทาง WhatsApp", telegram: "ส่งข้อความถึงหมายเลขนี้ทาง Telegram", wechat: "เพิ่ม WeChat ID นี้แล้วส่งข้อความ", instagram: "ส่งข้อความทาง Instagram DM", email: "เปิดร่างอีเมลที่มีคำขอของคุณ หรือคัดลอกอีเมล", copied: "คัดลอกแล้ว", failed: "คัดลอกไม่ได้ กรุณาเลือกอีเมลด้านล่าง" },
};

export function contactChannelCopy(language: DisplayLanguage) {
  return copy[language === "zh" || language === "zh-HK" || language === "zh-TW" ? "zh" : language];
}
