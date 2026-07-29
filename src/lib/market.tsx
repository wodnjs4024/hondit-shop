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
    footerLineKo: "제주의 조각이\n싱가포르로 도착합니다.",
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
    footerLineKo: "제주의 조각이\n홍콩으로 도착합니다.",
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
  { code: "zh", label: "Chinese", nativeLabel: "中文", shortLabel: "中文" },
  { code: "zh-HK", label: "Hong Kong Chinese", nativeLabel: "香港繁體", shortLabel: "HK" },
  { code: "zh-TW", label: "Taiwan Chinese", nativeLabel: "台灣繁體", shortLabel: "TW" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", shortLabel: "JP" },
];

type LocalizedText = Partial<Record<DisplayLanguage, string>>;

const marketPhraseTranslations: Record<string, LocalizedText> = {
  "Home": { zh: "首页", "zh-HK": "首頁", "zh-TW": "首頁", ja: "ホーム" },
  "Explore Jeju": { zh: "探索济州", "zh-HK": "探索濟州", "zh-TW": "探索濟州", ja: "済州を見る" },
  "Products": { zh: "产品", "zh-HK": "產品", "zh-TW": "產品", ja: "商品" },
  "Bulk Orders": { zh: "批量订单", "zh-HK": "批量訂單", "zh-TW": "批量訂單", ja: "まとめ注文" },
  "Shipping": { zh: "配送", "zh-HK": "配送", "zh-TW": "配送", ja: "配送" },
  "Contact": { zh: "咨询", "zh-HK": "查詢", "zh-TW": "洽詢", ja: "お問い合わせ" },
  "Market": { zh: "销售地区", "zh-HK": "銷售地區", "zh-TW": "銷售地區", ja: "販売地域" },
  "Language": { zh: "语言", "zh-HK": "語言", "zh-TW": "語言", ja: "言語" },
  "Change market": { zh: "更改地区", "zh-HK": "更改地區", "zh-TW": "更改地區", ja: "地域を変更" },
  "Menu": { zh: "菜单", "zh-HK": "選單", "zh-TW": "選單", ja: "メニュー" },
  "CHOOSE YOUR MARKET": { zh: "选择销售地区", "zh-HK": "選擇銷售地區", "zh-TW": "選擇銷售地區", ja: "販売地域を選択" },
  "Where should hondit ship?": { zh: "hondit 应该配送到哪里？", "zh-HK": "hondit 應配送到哪裡？", "zh-TW": "hondit 應配送到哪裡？", ja: "hondit はどこへ配送しますか？" },
  "Prices, payment currency and available buying routes are fixed by market.": {
    zh: "价格、支付货币和可用购买方式会按销售地区固定。",
    "zh-HK": "價格、付款貨幣和可用購買方式會按銷售地區固定。",
    "zh-TW": "價格、付款貨幣和可用購買方式會依銷售地區固定。",
    ja: "価格、決済通貨、購入ルートは販売地域ごとに固定されます。",
  },
  "Display language": { zh: "显示语言", "zh-HK": "顯示語言", "zh-TW": "顯示語言", ja: "表示言語" },
  "Continue": { zh: "继续", "zh-HK": "繼續", "zh-TW": "繼續", ja: "続ける" },
  "Shop on Shopee ->": { zh: "前往 Shopee ->", "zh-HK": "前往 Shopee ->", "zh-TW": "前往 Shopee ->", ja: "Shopee で購入 ->" },
  "Bulk checkout ->": { zh: "批量结账 ->", "zh-HK": "批量結帳 ->", "zh-TW": "批量結帳 ->", ja: "まとめ注文 ->" },
  "Bulk checkout": { zh: "批量结账", "zh-HK": "批量結帳", "zh-TW": "批量結帳", ja: "まとめ注文" },
  "View details": { zh: "查看详情", "zh-HK": "查看詳情", "zh-TW": "查看詳情", ja: "詳細を見る" },
  "Buy on Shopee": { zh: "在 Shopee 购买", "zh-HK": "在 Shopee 購買", "zh-TW": "在 Shopee 購買", ja: "Shopee で購入" },
  "Ask hondit": { zh: "咨询 hondit", "zh-HK": "查詢 hondit", "zh-TW": "洽詢 hondit", ja: "hondit に相談" },
  "OUT OF STOCK": { zh: "缺货", "zh-HK": "缺貨", "zh-TW": "缺貨", ja: "在庫なし" },
  "Bulk unavailable": { zh: "暂不可批量订购", "zh-HK": "暫不可批量訂購", "zh-TW": "暫不可批量訂購", ja: "まとめ注文不可" },
  "EXPLORE": { zh: "探索", "zh-HK": "探索", "zh-TW": "探索", ja: "見る" },
  "CONNECT": { zh: "联系", "zh-HK": "聯絡", "zh-TW": "聯絡", ja: "連絡" },
  "TRUST & SUPPORT": { zh: "信任与支持", "zh-HK": "信任與支援", "zh-TW": "信任與支援", ja: "案内とサポート" },
  "Delivery guide": { zh: "配送指南", "zh-HK": "配送指南", "zh-TW": "配送指南", ja: "配送ガイド" },
  "Refund support": { zh: "退款支持", "zh-HK": "退款支援", "zh-TW": "退款支援", ja: "返金サポート" },
  "Asia to Jeju": { zh: "从亚洲到济州", "zh-HK": "從亞洲到濟州", "zh-TW": "從亞洲到濟州", ja: "アジアから済州へ" },
  "DIRECT BULK CHECKOUT": { zh: "直接批量结账", "zh-HK": "直接批量結帳", "zh-TW": "直接批量結帳", ja: "直接まとめ注文" },
  "Choose one product": { zh: "选择一个产品", "zh-HK": "選擇一款產品", "zh-TW": "選擇一款產品", ja: "商品を選択" },
  "Add delivery details": { zh: "填写配送信息", "zh-HK": "填寫配送資料", "zh-TW": "填寫配送資料", ja: "配送情報を入力" },
  "Pay with PayPal": { zh: "使用 PayPal 支付", "zh-HK": "使用 PayPal 付款", "zh-TW": "使用 PayPal 付款", ja: "PayPal で支払い" },
  "Manage the order": { zh: "管理订单", "zh-HK": "管理訂單", "zh-TW": "管理訂單", ja: "注文を管理" },
  "Full name": { zh: "姓名", "zh-HK": "姓名", "zh-TW": "姓名", ja: "氏名" },
  "Company name": { zh: "公司名称", "zh-HK": "公司名稱", "zh-TW": "公司名稱", ja: "会社名" },
  "Country": { zh: "配送地区", "zh-HK": "配送地區", "zh-TW": "配送地區", ja: "配送地域" },
  "Address line 1": { zh: "地址 1", "zh-HK": "地址 1", "zh-TW": "地址 1", ja: "住所 1" },
  "Address line 2": { zh: "地址 2", "zh-HK": "地址 2", "zh-TW": "地址 2", ja: "住所 2" },
  "City / District": { zh: "城市 / 地区", "zh-HK": "城市 / 地區", "zh-TW": "城市 / 地區", ja: "市区町村" },
  "Postal code": { zh: "邮政编码", "zh-HK": "郵政編碼", "zh-TW": "郵遞區號", ja: "郵便番号" },
  "Order note": { zh: "订单备注", "zh-HK": "訂單備註", "zh-TW": "訂單備註", ja: "注文メモ" },
  "Final payment check": { zh: "最终付款确认", "zh-HK": "最終付款確認", "zh-TW": "最終付款確認", ja: "最終決済確認" },
  "Not entered": { zh: "未填写", "zh-HK": "未填寫", "zh-TW": "未填寫", ja: "未入力" },
  "No note": { zh: "无备注", "zh-HK": "沒有備註", "zh-TW": "沒有備註", ja: "メモなし" },
  "Product composition": { zh: "产品组成", "zh-HK": "產品組成", "zh-TW": "產品組成", ja: "商品構成" },
  "Use and order notes": { zh: "使用与订购说明", "zh-HK": "使用與訂購說明", "zh-TW": "使用與訂購說明", ja: "使用と注文メモ" },
  "Send to hondit": { zh: "发送给 hondit", "zh-HK": "傳送給 hondit", "zh-TW": "傳送給 hondit", ja: "hondit に送信" },
  "Sending...": { zh: "发送中...", "zh-HK": "傳送中...", "zh-TW": "傳送中...", ja: "送信中..." },
  "Name": { zh: "姓名", "zh-HK": "姓名", "zh-TW": "姓名", ja: "名前" },
  "Email": { zh: "电子邮件", "zh-HK": "電郵", "zh-TW": "電子郵件", ja: "メール" },
  "Company": { zh: "公司", "zh-HK": "公司", "zh-TW": "公司", ja: "会社" },
  "Optional": { zh: "选填", "zh-HK": "選填", "zh-TW": "選填", ja: "任意" },
  "Order number": { zh: "订单编号", "zh-HK": "訂單編號", "zh-TW": "訂單編號", ja: "注文番号" },
  "Enquiry type": { zh: "咨询类型", "zh-HK": "查詢類型", "zh-TW": "洽詢類型", ja: "問い合わせ種別" },
  "Message": { zh: "内容", "zh-HK": "內容", "zh-TW": "內容", ja: "メッセージ" },
  "Need help with an order?": { zh: "订单需要帮助吗？", "zh-HK": "訂單需要協助嗎？", "zh-TW": "訂單需要協助嗎？", ja: "注文についてお困りですか？" },
  "Go to contact ->": { zh: "前往咨询 ->", "zh-HK": "前往查詢 ->", "zh-TW": "前往洽詢 ->", ja: "お問い合わせへ ->" },
};

const marketCountryTranslations: Record<MarketCode, LocalizedText> = {
  SG: { zh: "新加坡", "zh-HK": "新加坡", "zh-TW": "新加坡", ja: "シンガポール" },
  HK: { zh: "香港", "zh-HK": "香港", "zh-TW": "香港", ja: "香港" },
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
            "가격, 결제 통화, 구매 경로는 선택한 판매 지역 기준으로 고정됩니다.",
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
