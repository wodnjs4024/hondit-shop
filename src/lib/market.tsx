import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type MarketCode = "SG" | "HK";
export type DisplayLanguage = "en" | "ko";
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
    sgdRate: 5.8,
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

export function normalizeMarketCode(value?: string | null): MarketCode | null {
  const normalized = String(value || "").trim().toLowerCase();
  if (["sg", "singapore", "en-sg", "ko-sg"].includes(normalized)) return "SG";
  if (["hk", "hongkong", "hong-kong", "hong kong", "en-hk", "ko-hk"].includes(normalized)) return "HK";
  return null;
}

export function normalizeLanguage(value?: string | null): DisplayLanguage | null {
  const normalized = String(value || "").trim().toLowerCase();
  if (["ko", "kr", "korean", "ko-kr"].includes(normalized)) return "ko";
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

export function marketText(language: DisplayLanguage, english: string, korean: string) {
  return language === "ko" ? korean : english;
}

export function marketCountryName(market: MarketConfig, language: DisplayLanguage) {
  return marketText(language, market.countryName, market.countryNameKo);
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
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
        </label>
        <button type="button" className="button button--primary" onClick={closeMarketDialog}>
          {marketText(language, "Continue", "계속하기")}
        </button>
      </div>
    </div>
  );
}
