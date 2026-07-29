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
  checkoutNote: string;
  checkoutNoteKo: string;
  footerLine: string;
  footerLineKo: string;
  announcement: string;
  announcementKo: string;
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
    checkoutNote: "Singapore EMS shipping included",
    checkoutNoteKo: "싱가포르 EMS 배송 포함",
    footerLine: "Pieces of Jeju Island,\narriving in Singapore.",
    footerLineKo: "제주의 조각을\n싱가포르로 보냅니다.",
    announcement: "SINGAPORE BULK ORDER - PAYPAL SGD - SHIPS FROM KOREA",
    announcementKo: "싱가포르 주문 - PayPal SGD 결제 - 한국에서 발송",
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
    checkoutNote: "Hong Kong delivery included in the listed bulk price",
    checkoutNoteKo: "홍콩 배송비는 표시된 대량주문 가격에 포함",
    footerLine: "Pieces of Jeju Island,\narriving in Hong Kong.",
    footerLineKo: "제주의 조각을\n홍콩으로 보냅니다.",
    announcement: "HONG KONG BULK ORDER - PAYPAL HKD - SHIPS FROM KOREA",
    announcementKo: "홍콩 주문 - PayPal HKD 결제 - 한국에서 발송",
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
  needsSelection: boolean;
  dismissSelection: () => void;
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

function readQueryMarket(search: string) {
  const params = new URLSearchParams(search);
  return normalizeMarketCode(params.get("market") || params.get("country"));
}

function readQueryLanguage(search: string) {
  const params = new URLSearchParams(search);
  return normalizeLanguage(params.get("lang") || params.get("language"));
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const initialQueryMarket = useMemo(() => readQueryMarket(location.search), [location.search]);
  const initialQueryLanguage = useMemo(() => readQueryLanguage(location.search), [location.search]);
  const [marketCode, setMarketCode] = useState<MarketCode>(() => initialQueryMarket || readStoredMarket() || "SG");
  const [language, setLanguageState] = useState<DisplayLanguage>(() => initialQueryLanguage || readStoredLanguage() || "en");
  const [needsSelection, setNeedsSelection] = useState(() => !initialQueryMarket && !readStoredMarket());

  useEffect(() => {
    const nextMarket = readQueryMarket(location.search);
    const nextLanguage = readQueryLanguage(location.search);
    if (nextMarket) {
      setMarketCode(nextMarket);
      setNeedsSelection(false);
      window.localStorage.setItem(marketStorageKey, nextMarket);
    }
    if (nextLanguage) {
      setLanguageState(nextLanguage);
      window.localStorage.setItem(languageStorageKey, nextLanguage);
    }
  }, [location.search]);

  const value = useMemo<MarketContextValue>(
    () => ({
      market: markets[marketCode],
      setMarket: (code) => {
        setMarketCode(code);
        setNeedsSelection(false);
        window.localStorage.setItem(marketStorageKey, code);
      },
      language,
      setLanguage: (nextLanguage) => {
        setLanguageState(nextLanguage);
        window.localStorage.setItem(languageStorageKey, nextLanguage);
      },
      needsSelection,
      dismissSelection: () => {
        setNeedsSelection(false);
        window.localStorage.setItem(marketStorageKey, marketCode);
        window.localStorage.setItem(languageStorageKey, language);
      },
    }),
    [language, marketCode, needsSelection],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const value = useContext(MarketContext);
  if (!value) throw new Error("useMarket must be used inside MarketProvider");
  return value;
}

export function MarketSelectionDialog({ disabled = false }: { disabled?: boolean }) {
  const { market, setMarket, language, setLanguage, needsSelection, dismissSelection } = useMarket();
  if (disabled || !needsSelection) return null;

  return (
    <div className="market-gate" role="dialog" aria-modal="true" aria-labelledby="market-gate-title">
      <div className="market-gate__panel">
        <p className="v23-eyebrow"><span /> {marketText(language, "Market", "판매국가")}</p>
        <h2 id="market-gate-title">
          {marketText(language, "Choose where you are ordering from.", "주문할 국가를 선택하세요.")}
        </h2>
        <p>
          {marketText(
            language,
            "Prices, PayPal currency and delivery fields will match your selected market.",
            "가격, PayPal 결제 통화, 배송 입력 항목이 선택한 판매국가에 맞춰집니다.",
          )}
        </p>
        <div className="market-gate__options">
          {Object.values(markets).map((option) => (
            <button key={option.code} type="button" className={market.code === option.code ? "is-active" : ""} onClick={() => setMarket(option.code)}>
              <strong>{marketText(language, option.label, option.koreanLabel)}</strong>
              <span>{option.currency} PayPal checkout</span>
            </button>
          ))}
        </div>
        <div className="market-gate__language">
          <button type="button" className={language === "en" ? "is-active" : ""} onClick={() => setLanguage("en")}>English</button>
          <button type="button" className={language === "ko" ? "is-active" : ""} onClick={() => setLanguage("ko")}>한국어</button>
        </div>
        <button className="market-gate__quiet" type="button" onClick={dismissSelection}>
          {marketText(language, `Continue with ${market.label}`, `${market.koreanLabel} 판매판으로 계속`)}
        </button>
      </div>
    </div>
  );
}
