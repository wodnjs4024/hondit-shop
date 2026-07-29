import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type MarketCode = "SG" | "HK";
export type DisplayLanguage = "en" | "ko" | "zh" | "zh-HK" | "zh-TW" | "ja";
export type CurrencyCode = "SGD" | "HKD";

export type MarketConfig = {
  code: MarketCode;
  label: string;
  koreanLabel: string;
  shortLabel: string;
  countryCode: MarketCode;
  countryName: string;
  countryNameKo: string;
  currency: CurrencyCode;
  locale: string;
  sgdRate: number;
  hasShopee: boolean;
  checkoutNote: string;
  checkoutNoteKo: string;
  footerLine: string;
  footerLineKo: string;
  announcement: string;
  announcementKo: string;
};

export type MarketPricedItem = {
  bulkUnitPrice?: number;
  unitPriceSgd?: number;
  marketUnitPrices?: Partial<Record<MarketCode, number>>;
};

export const markets: Record<MarketCode, MarketConfig> = {
  SG: {
    code: "SG",
    label: "Singapore",
    koreanLabel: "싱가포르",
    shortLabel: "SG",
    countryCode: "SG",
    countryName: "Singapore",
    countryNameKo: "싱가포르",
    currency: "SGD",
    locale: "en-SG",
    sgdRate: 1,
    hasShopee: true,
    checkoutNote: "Singapore EMS shipping is included in the displayed bulk unit price.",
    checkoutNoteKo: "표시된 대량주문 단가에는 싱가포르 EMS 배송비가 포함되어 있습니다.",
    footerLine: "Pieces of Jeju Island,\narriving in Singapore.",
    footerLineKo: "제주의 조각이\n싱가포르에 도착합니다.",
    announcement: "SINGAPORE BULK ORDER - PAYPAL SGD - SHOPEE RETAIL AVAILABLE",
    announcementKo: "싱가포르 대량주문 - PayPal SGD 결제 - Shopee 개별구매 가능",
  },
  HK: {
    code: "HK",
    label: "Hong Kong",
    koreanLabel: "홍콩",
    shortLabel: "HK",
    countryCode: "HK",
    countryName: "Hong Kong",
    countryNameKo: "홍콩",
    currency: "HKD",
    locale: "en-HK",
    sgdRate: 6.08,
    hasShopee: false,
    checkoutNote: "Hong Kong delivery is included in the displayed bulk unit price.",
    checkoutNoteKo: "표시된 대량주문 단가에는 홍콩 배송비가 포함되어 있습니다.",
    footerLine: "Pieces of Jeju Island,\narriving in Hong Kong.",
    footerLineKo: "제주의 조각이\n홍콩에 도착합니다.",
    announcement: "HONG KONG BULK ORDER ONLY - PAYPAL HKD - SHIPS FROM KOREA",
    announcementKo: "홍콩 대량주문 전용 - PayPal HKD 결제 - 한국에서 발송",
  },
};

const marketStorageKey = "hondit_market";
const languageStorageKey = "hondit_language";

export const displayLanguages: Array<{
  code: DisplayLanguage;
  label: string;
  nativeLabel: string;
  shortLabel: string;
}> = [
  { code: "en", label: "English", nativeLabel: "English", shortLabel: "EN" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", shortLabel: "KO" },
  { code: "zh", label: "Chinese", nativeLabel: "简体中文", shortLabel: "简" },
  { code: "zh-HK", label: "Hong Kong Chinese", nativeLabel: "繁體中文（香港）", shortLabel: "港" },
  { code: "zh-TW", label: "Taiwan Chinese", nativeLabel: "繁體中文（台灣）", shortLabel: "台" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", shortLabel: "日" },
];

type LocalizedText = Partial<Record<DisplayLanguage, string>>;

const marketPhraseTranslations: Record<string, LocalizedText> = {
  "Home": { ko: "홈", zh: "首页", "zh-HK": "首頁", "zh-TW": "首頁", ja: "ホーム" },
  "Explore Jeju": { ko: "제주 보기", zh: "探索济州", "zh-HK": "探索濟州", "zh-TW": "探索濟州", ja: "済州を見る" },
  "Products": { ko: "상품", zh: "商品", "zh-HK": "商品", "zh-TW": "商品", ja: "商品" },
  "Bulk Orders": { ko: "대량 주문", zh: "批量订购", "zh-HK": "大量訂購", "zh-TW": "大量訂購", ja: "まとめ注文" },
  "Shipping": { ko: "배송", zh: "配送", "zh-HK": "配送", "zh-TW": "配送", ja: "配送" },
  "Contact": { ko: "문의", zh: "联系", "zh-HK": "聯絡", "zh-TW": "聯絡", ja: "お問い合わせ" },
  "Market": { ko: "판매 지역", zh: "市场", "zh-HK": "市場", "zh-TW": "市場", ja: "販売地域" },
  "Language": { ko: "언어", zh: "语言", "zh-HK": "語言", "zh-TW": "語言", ja: "言語" },
  "Menu": { ko: "메뉴", zh: "菜单", "zh-HK": "選單", "zh-TW": "選單", ja: "メニュー" },
  "CHOOSE YOUR MARKET": { ko: "판매 지역 선택", zh: "选择销售地区", "zh-HK": "選擇銷售地區", "zh-TW": "選擇銷售地區", ja: "販売地域を選択" },
  "Where should hondit ship?": { ko: "어느 지역으로 배송할까요?", zh: "hondit 应配送到哪里？", "zh-HK": "hondit 應送往哪個地區？", "zh-TW": "hondit 應送往哪個地區？", ja: "hondit はどの地域へ配送しますか？" },
  "Prices, payment currency and available buying routes are fixed by market.": {
    ko: "가격, 결제 통화, 구매 방식은 선택한 판매 지역 기준으로 고정됩니다.",
    zh: "价格、付款货币和购买方式会按销售地区固定。",
    "zh-HK": "價格、付款貨幣和購買方式會按銷售地區固定。",
    "zh-TW": "價格、付款貨幣和購買方式會按銷售地區固定。",
    ja: "価格、決済通貨、購入方法は販売地域ごとに固定されます。",
  },
  "Display language": { ko: "표시 언어", zh: "显示语言", "zh-HK": "顯示語言", "zh-TW": "顯示語言", ja: "表示言語" },
  "Continue": { ko: "계속하기", zh: "继续", "zh-HK": "繼續", "zh-TW": "繼續", ja: "続ける" },
  "Singapore": { ko: "싱가포르", zh: "新加坡", "zh-HK": "新加坡", "zh-TW": "新加坡", ja: "シンガポール" },
  "Hong Kong": { ko: "홍콩", zh: "香港", "zh-HK": "香港", "zh-TW": "香港", ja: "香港" },
  "Shop on Shopee ->": { ko: "Shopee에서 구매 ->", zh: "前往 Shopee 购买 ->", "zh-HK": "前往 Shopee 購買 ->", "zh-TW": "前往 Shopee 購買 ->", ja: "Shopeeで購入 ->" },
  "Buy on Shopee": { ko: "Shopee 구매", zh: "Shopee 购买", "zh-HK": "Shopee 購買", "zh-TW": "Shopee 購買", ja: "Shopeeで購入" },
  "Buy on Shopee ->": { ko: "Shopee 구매 ->", zh: "Shopee 购买 ->", "zh-HK": "Shopee 購買 ->", "zh-TW": "Shopee 購買 ->", ja: "Shopeeで購入 ->" },
  "Bulk checkout": { ko: "대량 주문", zh: "批量结账", "zh-HK": "大量結帳", "zh-TW": "大量結帳", ja: "まとめ注文" },
  "Bulk checkout ->": { ko: "대량 주문 ->", zh: "批量结账 ->", "zh-HK": "大量結帳 ->", "zh-TW": "大量結帳 ->", ja: "まとめ注文 ->" },
  "Open bulk checkout": { ko: "대량주문 열기", zh: "打开批量结账", "zh-HK": "開啟大量結帳", "zh-TW": "開啟大量結帳", ja: "まとめ注文を開く" },
  "Start bulk checkout": { ko: "대량주문 시작", zh: "开始批量结账", "zh-HK": "開始大量結帳", "zh-TW": "開始大量結帳", ja: "まとめ注文を始める" },
  "View details": { ko: "상세 보기", zh: "查看详情", "zh-HK": "查看詳情", "zh-TW": "查看詳情", ja: "詳細を見る" },
  "Back to products": { ko: "상품 목록으로", zh: "返回商品列表", "zh-HK": "返回商品列表", "zh-TW": "返回商品列表", ja: "商品一覧へ戻る" },
  "Back to Bulk Orders": { ko: "대량주문으로 돌아가기", zh: "返回批量订购", "zh-HK": "返回大量訂購", "zh-TW": "返回大量訂購", ja: "まとめ注文へ戻る" },
  "Return to Bulk Orders": { ko: "대량주문으로 돌아가기", zh: "返回批量订购", "zh-HK": "返回大量訂購", "zh-TW": "返回大量訂購", ja: "まとめ注文へ戻る" },
  "Ask hondit": { ko: "문의하기", zh: "咨询 hondit", "zh-HK": "查詢 hondit", "zh-TW": "詢問 hondit", ja: "honditに問い合わせ" },
  "Ask hondit ->": { ko: "문의하기 ->", zh: "咨询 hondit ->", "zh-HK": "查詢 hondit ->", "zh-TW": "詢問 hondit ->", ja: "honditに問い合わせ ->" },
  "OUT OF STOCK": { ko: "품절", zh: "缺货", "zh-HK": "缺貨", "zh-TW": "缺貨", ja: "在庫切れ" },
  "Out of stock": { ko: "품절", zh: "缺货", "zh-HK": "缺貨", "zh-TW": "缺貨", ja: "在庫切れ" },
  "Bulk unavailable": { ko: "대량 주문 불가", zh: "不可批量订购", "zh-HK": "不可大量訂購", "zh-TW": "不可大量訂購", ja: "まとめ注文不可" },
  "DIRECT BULK CHECKOUT": { ko: "직접 대량주문", zh: "直接批量结账", "zh-HK": "直接大量結帳", "zh-TW": "直接大量結帳", ja: "直接まとめ注文" },
  "Choose one product": { ko: "상품 선택", zh: "选择一个商品", "zh-HK": "選擇一項商品", "zh-TW": "選擇一項商品", ja: "商品を選択" },
  "Add delivery details": { ko: "배송 정보 입력", zh: "填写配送信息", "zh-HK": "填寫配送資料", "zh-TW": "填寫配送資料", ja: "配送情報を入力" },
  "Pay with PayPal": { ko: "PayPal 결제", zh: "使用 PayPal 付款", "zh-HK": "使用 PayPal 付款", "zh-TW": "使用 PayPal 付款", ja: "PayPalで支払う" },
  "Manage the order": { ko: "관리자 확인", zh: "管理订单", "zh-HK": "管理訂單", "zh-TW": "管理訂單", ja: "注文を管理" },
  "Only completed paid orders appear in the protected admin console.": {
    ko: "결제 완료 주문만 관리자 페이지에 표시됩니다.",
    zh: "只有已完成付款的订单会显示在受保护的管理员页面。",
    "zh-HK": "只有已完成付款的訂單會顯示在受保護的管理員頁面。",
    "zh-TW": "只有已完成付款的訂單會顯示在受保護的管理員頁面。",
    ja: "支払い完了済みの注文だけが管理画面に表示されます。",
  },
  "Full name": { ko: "이름", zh: "姓名", "zh-HK": "姓名", "zh-TW": "姓名", ja: "氏名" },
  "Company name": { ko: "회사명", zh: "公司名称", "zh-HK": "公司名稱", "zh-TW": "公司名稱", ja: "会社名" },
  "Company": { ko: "회사명", zh: "公司", "zh-HK": "公司", "zh-TW": "公司", ja: "会社" },
  "Country": { ko: "배송 지역", zh: "配送地区", "zh-HK": "配送地區", "zh-TW": "配送地區", ja: "配送地域" },
  "Address line 1": { ko: "주소 1", zh: "地址 1", "zh-HK": "地址 1", "zh-TW": "地址 1", ja: "住所 1" },
  "Address line 2": { ko: "주소 2", zh: "地址 2", "zh-HK": "地址 2", "zh-TW": "地址 2", ja: "住所 2" },
  "City / District": { ko: "도시 / 지역", zh: "城市 / 区", "zh-HK": "城市 / 地區", "zh-TW": "城市 / 地區", ja: "市区町村" },
  "Postal code": { ko: "우편번호", zh: "邮政编码", "zh-HK": "郵政編碼", "zh-TW": "郵遞區號", ja: "郵便番号" },
  "Order note": { ko: "주문 메모", zh: "订单备注", "zh-HK": "訂單備註", "zh-TW": "訂單備註", ja: "注文メモ" },
  "Shipping address": { ko: "배송 주소", zh: "配送地址", "zh-HK": "配送地址", "zh-TW": "配送地址", ja: "配送先住所" },
  "Order quantity": { ko: "주문 수량", zh: "订购数量", "zh-HK": "訂購數量", "zh-TW": "訂購數量", ja: "注文数量" },
  "Total units": { ko: "총 수량", zh: "总数量", "zh-HK": "總數量", "zh-TW": "總數量", ja: "合計数量" },
  "Total payment": { ko: "총 결제액", zh: "付款总额", "zh-HK": "付款總額", "zh-TW": "付款總額", ja: "合計金額" },
  "Final payment check": { ko: "최종 결제 확인", zh: "最终付款确认", "zh-HK": "最終付款確認", "zh-TW": "最終付款確認", ja: "最終支払い確認" },
  "Please confirm these details before opening PayPal or card checkout.": {
    ko: "PayPal 또는 카드 결제창을 열기 전에 아래 정보를 확인해주세요.",
    zh: "打开 PayPal 或银行卡结账前，请确认以下信息。",
    "zh-HK": "開啟 PayPal 或卡付款前，請確認以下資料。",
    "zh-TW": "開啟 PayPal 或卡片付款前，請確認以下資料。",
    ja: "PayPalまたはカード決済を開く前に、以下の内容を確認してください。",
  },
  "Not entered": { ko: "미입력", zh: "未填写", "zh-HK": "未填寫", "zh-TW": "未填寫", ja: "未入力" },
  "No note": { ko: "메모 없음", zh: "无备注", "zh-HK": "沒有備註", "zh-TW": "沒有備註", ja: "メモなし" },
  "Pay with PayPal or credit/debit card.": { ko: "PayPal 또는 신용/직불카드로 결제합니다.", zh: "使用 PayPal 或信用卡/借记卡付款。", "zh-HK": "使用 PayPal 或信用卡/扣帳卡付款。", "zh-TW": "使用 PayPal 或信用卡/金融卡付款。", ja: "PayPalまたはクレジット/デビットカードで支払います。" },
  "For direct checkout, please use PayPal or an international card.": { ko: "직접 결제는 PayPal 또는 해외 결제가 가능한 카드로 진행해주세요.", zh: "直接结账请使用 PayPal 或国际银行卡。", "zh-HK": "直接結帳請使用 PayPal 或國際卡。", "zh-TW": "直接結帳請使用 PayPal 或國際卡。", ja: "直接決済にはPayPalまたは国際カードをご利用ください。" },
  "If PayPal/card checkout fails": { ko: "PayPal/카드 결제가 안 될 때", zh: "如果 PayPal/银行卡付款失败", "zh-HK": "如果 PayPal/卡付款失敗", "zh-TW": "如果 PayPal/卡片付款失敗", ja: "PayPal/カード決済に失敗した場合" },
  "Email purchase conditions": { ko: "구매조건 메일 보내기", zh: "通过邮件发送购买条件", "zh-HK": "以電郵傳送購買條件", "zh-TW": "以電子郵件傳送購買條件", ja: "購入条件をメールで送る" },
  "Notify me": { ko: "입고 문의", zh: "到货通知", "zh-HK": "到貨通知", "zh-TW": "到貨通知", ja: "入荷通知" },
  "Product composition": { ko: "상품 구성", zh: "商品组成", "zh-HK": "商品組成", "zh-TW": "商品組成", ja: "商品構成" },
  "Use and order notes": { ko: "사용 및 주문 안내", zh: "使用和订购说明", "zh-HK": "使用及訂購說明", "zh-TW": "使用與訂購說明", ja: "使用・注文メモ" },
  "CONTACT HONDIT": { ko: "HONDIT 문의", zh: "联系 HONDIT", "zh-HK": "聯絡 HONDIT", "zh-TW": "聯絡 HONDIT", ja: "HONDITへ問い合わせ" },
  "SEND A MESSAGE": { ko: "문의 보내기", zh: "发送消息", "zh-HK": "傳送訊息", "zh-TW": "傳送訊息", ja: "メッセージを送信" },
  "Tell us what you need.": { ko: "필요한 내용을 알려주세요.", zh: "请告诉我们您需要什么。", "zh-HK": "請告訴我們你的需要。", "zh-TW": "請告訴我們你的需求。", ja: "必要な内容をお知らせください。" },
  "Name": { ko: "이름", zh: "姓名", "zh-HK": "姓名", "zh-TW": "姓名", ja: "名前" },
  "Email": { ko: "이메일", zh: "电子邮件", "zh-HK": "電郵", "zh-TW": "電子郵件", ja: "メール" },
  "Optional": { ko: "선택", zh: "可选", "zh-HK": "選填", "zh-TW": "選填", ja: "任意" },
  "Order number": { ko: "주문번호", zh: "订单编号", "zh-HK": "訂單編號", "zh-TW": "訂單編號", ja: "注文番号" },
  "Enquiry type": { ko: "문의 유형", zh: "咨询类型", "zh-HK": "查詢類型", "zh-TW": "詢問類型", ja: "問い合わせ種別" },
  "Message": { ko: "문의 내용", zh: "消息", "zh-HK": "訊息", "zh-TW": "訊息", ja: "メッセージ" },
  "Sending...": { ko: "전송 중...", zh: "发送中...", "zh-HK": "傳送中...", "zh-TW": "傳送中...", ja: "送信中..." },
  "Send to hondit": { ko: "hondit에 보내기", zh: "发送给 hondit", "zh-HK": "傳送給 hondit", "zh-TW": "傳送給 hondit", ja: "honditへ送信" },
  "QUICK ROUTES": { ko: "빠른 경로", zh: "快速渠道", "zh-HK": "快速渠道", "zh-TW": "快速渠道", ja: "クイックルート" },
  "Use the right channel.": { ko: "상황에 맞는 채널을 선택하세요.", zh: "请选择合适的渠道。", "zh-HK": "請選擇合適的渠道。", "zh-TW": "請選擇合適的管道。", ja: "適切な連絡先を選んでください。" },
  "Need help with an order?": { ko: "주문 도움이 필요하신가요?", zh: "订单需要帮助吗？", "zh-HK": "訂單需要協助嗎？", "zh-TW": "訂單需要協助嗎？", ja: "注文についてお困りですか？" },
  "Go to contact ->": { ko: "문의하기 ->", zh: "前往联系 ->", "zh-HK": "前往聯絡 ->", "zh-TW": "前往聯絡 ->", ja: "お問い合わせへ ->" },
  "EXPLORE": { ko: "둘러보기", zh: "探索", "zh-HK": "探索", "zh-TW": "探索", ja: "見る" },
  "CONNECT": { ko: "연결", zh: "联系", "zh-HK": "聯絡", "zh-TW": "聯絡", ja: "連絡" },
  "TRUST & SUPPORT": { ko: "안내", zh: "信任与支持", "zh-HK": "信任與支援", "zh-TW": "信任與支援", ja: "信頼とサポート" },
  "Delivery guide": { ko: "배송 안내", zh: "配送指南", "zh-HK": "配送指南", "zh-TW": "配送指南", ja: "配送ガイド" },
  "Refund support": { ko: "환불 안내", zh: "退款支持", "zh-HK": "退款支援", "zh-TW": "退款支援", ja: "返金サポート" },
  "Asia to Jeju": { ko: "아시아에서 제주까지", zh: "从亚洲到济州", "zh-HK": "從亞洲到濟州", "zh-TW": "從亞洲到濟州", ja: "アジアから済州へ" },
  "Payment could not be completed.": { ko: "결제가 완료되지 않았습니다.", zh: "付款未能完成。", "zh-HK": "付款未能完成。", "zh-TW": "付款未能完成。", ja: "支払いを完了できませんでした。" },
  "Try Payment Again": { ko: "결제 다시 시도", zh: "重新尝试付款", "zh-HK": "重新嘗試付款", "zh-TW": "重新嘗試付款", ja: "支払いを再試行" },
  "Email Purchase Conditions": { ko: "구매조건 메일 보내기", zh: "发送购买条件邮件", "zh-HK": "傳送購買條件電郵", "zh-TW": "寄送購買條件電子郵件", ja: "購入条件をメール送信" },
  "Contact hondit": { ko: "hondit 문의", zh: "联系 hondit", "zh-HK": "聯絡 hondit", "zh-TW": "聯絡 hondit", ja: "honditへ問い合わせ" },
};

const marketCountryTranslations: Record<MarketCode, LocalizedText> = {
  SG: { ko: "싱가포르", zh: "新加坡", "zh-HK": "新加坡", "zh-TW": "新加坡", ja: "シンガポール" },
  HK: { ko: "홍콩", zh: "香港", "zh-HK": "香港", "zh-TW": "香港", ja: "香港" },
};

export function normalizeMarketCode(value?: string | null): MarketCode | null {
  const normalized = String(value || "").trim().toLowerCase();
  if (["sg", "singapore", "en-sg", "ko-sg"].includes(normalized)) return "SG";
  if (["hk", "hongkong", "hong-kong", "hong kong", "en-hk", "ko-hk"].includes(normalized)) return "HK";
  return null;
}

export function normalizeLanguage(value?: string | null): DisplayLanguage | null {
  const normalized = String(value || "").trim().toLowerCase();
  if (["ko", "kr", "korean", "ko-kr"].includes(normalized)) return "ko";
  if (["zh", "cn", "zh-cn", "chinese", "mandarin"].includes(normalized)) return "zh";
  if (["hk", "zh-hk", "zh_hk", "hongkong", "hong-kong", "traditional-hk"].includes(normalized)) return "zh-HK";
  if (["tw", "zh-tw", "zh_tw", "taiwan", "traditional-tw"].includes(normalized)) return "zh-TW";
  if (["ja", "jp", "japanese"].includes(normalized)) return "ja";
  if (["en", "english"].includes(normalized)) return "en";
  return null;
}

export function convertSgdToMarketAmount(value: number, market: MarketConfig) {
  return Number((Number(value || 0) * market.sgdRate).toFixed(2));
}

export function getMarketUnitPrice(item: MarketPricedItem, market: MarketConfig) {
  const fixed = item.marketUnitPrices?.[market.code];
  if (Number.isFinite(Number(fixed))) return Number(fixed);
  const base = item.bulkUnitPrice ?? item.unitPriceSgd ?? 0;
  return convertSgdToMarketAmount(base, market);
}

export function getMarketLineTotal(item: MarketPricedItem, units: number, market: MarketConfig) {
  return Number((getMarketUnitPrice(item, market) * Number(units || 0)).toFixed(2));
}

export function formatCurrency(value: number, currency: CurrencyCode | string = "SGD", locale = "en-SG") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatMarketMoney(valueInSgd: number, market: MarketConfig) {
  return formatCurrency(convertSgdToMarketAmount(valueInSgd, market), market.currency, market.locale);
}

export function formatMarketUnitMoney(item: MarketPricedItem, market: MarketConfig) {
  return formatCurrency(getMarketUnitPrice(item, market), market.currency, market.locale);
}

export function formatMarketLineMoney(item: MarketPricedItem, units: number, market: MarketConfig) {
  return formatCurrency(getMarketLineTotal(item, units, market), market.currency, market.locale);
}

export function marketText(language: DisplayLanguage, english: string, korean: string, localized: LocalizedText = {}) {
  if (localized[language]) return localized[language] as string;
  const translated = marketPhraseTranslations[english]?.[language];
  if (translated) return translated;
  return language === "ko" ? korean : english;
}

export function marketCountryName(market: MarketConfig, language: DisplayLanguage) {
  return marketText(language, market.countryName, market.countryNameKo, marketCountryTranslations[market.code]);
}

type MarketContextValue = {
  market: MarketConfig;
  setMarket: (code: MarketCode) => void;
  language: DisplayLanguage;
  setLanguage: (language: DisplayLanguage) => void;
  showMarketDialog: boolean;
  closeMarketDialog: () => void;
  openMarketDialog: () => void;
};

const MarketContext = createContext<MarketContextValue | null>(null);

function readStoredMarket() {
  if (typeof window === "undefined") return null;
  return normalizeMarketCode(window.localStorage.getItem(marketStorageKey));
}

function readStoredLanguage() {
  if (typeof window === "undefined") return null;
  return normalizeLanguage(window.localStorage.getItem(languageStorageKey));
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const queryMarket = normalizeMarketCode(query.get("market") || query.get("country"));
  const queryLanguage = normalizeLanguage(query.get("lang"));

  const [marketCode, setMarketCode] = useState<MarketCode>(() => queryMarket || readStoredMarket() || "SG");
  const [language, setLanguageState] = useState<DisplayLanguage>(() => queryLanguage || readStoredLanguage() || "en");
  const [showMarketDialog, setShowMarketDialog] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem(marketStorageKey);
  });

  useEffect(() => {
    if (queryMarket) setMarketCode(queryMarket);
  }, [queryMarket]);

  useEffect(() => {
    if (queryLanguage) setLanguageState(queryLanguage);
  }, [queryLanguage]);

  useEffect(() => {
    window.localStorage.setItem(marketStorageKey, marketCode);
  }, [marketCode]);

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
  }, [language]);

  const value = useMemo<MarketContextValue>(
    () => ({
      market: markets[marketCode],
      setMarket: (code) => {
        setMarketCode(code);
        setShowMarketDialog(false);
      },
      language,
      setLanguage: setLanguageState,
      showMarketDialog,
      closeMarketDialog: () => setShowMarketDialog(false),
      openMarketDialog: () => setShowMarketDialog(true),
    }),
    [language, marketCode, showMarketDialog],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarket must be used inside MarketProvider");
  return context;
}

export function MarketSelectionDialog({ disabled = false }: { disabled?: boolean }) {
  const { market, setMarket, language, setLanguage, showMarketDialog, closeMarketDialog } = useMarket();
  if (disabled || !showMarketDialog) return null;

  return (
    <div className="market-dialog" role="dialog" aria-modal="true" aria-label="Choose market">
      <div className="market-dialog__panel">
        <p className="v23-eyebrow">
          <span /> {marketText(language, "CHOOSE YOUR MARKET", "판매 지역 선택")}
        </p>
        <h2>{marketText(language, "Where should hondit ship?", "어느 지역으로 배송할까요?")}</h2>
        <p>
          {marketText(
            language,
            "Prices, payment currency and available buying routes are fixed by market.",
            "가격, 결제 통화, 구매 방식은 선택한 판매 지역 기준으로 고정됩니다.",
          )}
        </p>
        <div className="market-dialog__options">
          {Object.values(markets).map((option) => (
            <button
              key={option.code}
              type="button"
              className={option.code === market.code ? "is-active" : ""}
              onClick={() => setMarket(option.code)}
            >
              <strong>{marketText(language, option.label, option.koreanLabel)}</strong>
              <span>
                {marketText(
                  language,
                  option.hasShopee ? `${option.currency} PayPal + Shopee retail` : `${option.currency} PayPal bulk only`,
                  option.hasShopee ? `${option.currency} PayPal + Shopee 개별구매` : `${option.currency} PayPal 대량주문 전용`,
                )}
              </span>
            </button>
          ))}
        </div>
        <label className="market-dialog__language">
          {marketText(language, "Display language", "표시 언어")}
          <select value={language} onChange={(event) => setLanguage(event.target.value as DisplayLanguage)}>
            {displayLanguages.map((option) => (
              <option key={option.code} value={option.code}>
                {option.nativeLabel}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button button--primary" onClick={closeMarketDialog}>
          {marketText(language, "Continue", "계속하기")}
        </button>
      </div>
    </div>
  );
}
