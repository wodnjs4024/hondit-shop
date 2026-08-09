import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type MarketCode = "SG" | "HK";
export type DisplayLanguage = "en" | "ko" | "zh" | "zh-HK" | "zh-TW" | "ja";
export type CurrencyCode = "SGD" | "HKD";

export type MarketConfig = {
  code: MarketCode;
  shortLabel: string;
  label: string;
  koreanLabel: string;
  countryCode: string;
  countryName: string;
  countryNameKo: string;
  currency: CurrencyCode;
  locale: string;
  rateFromSgd: number;
  hasShopee: boolean;
  announcement: string;
  announcementKo: string;
  footerLine: string;
  footerLineKo: string;
  checkoutNote: string;
  checkoutNoteKo: string;
};

type PricedItem = {
  bulkUnitPrice?: number;
  unitPriceSgd?: number;
  marketUnitPrices?: Partial<Record<MarketCode, number>>;
};

type MarketContextValue = {
  market: MarketConfig;
  marketCode: MarketCode;
  language: DisplayLanguage;
  setMarket: (market: MarketCode) => void;
  setLanguage: (language: DisplayLanguage) => void;
};

type LanguageOption = { code: DisplayLanguage; label: string; shortLabel: string };
type NonEnglishLanguage = Exclude<DisplayLanguage, "en">;
type TextDictionary = Record<string, string>;

export const markets: Record<MarketCode, MarketConfig> = {
  SG: {
    code: "SG",
    shortLabel: "SG",
    label: "Singapore",
    koreanLabel: "싱가포르",
    countryCode: "SG",
    countryName: "Singapore",
    countryNameKo: "싱가포르",
    currency: "SGD",
    locale: "en-SG",
    rateFromSgd: 1,
    hasShopee: true,
    announcement: "SINGAPORE BULK ORDER - PAYPAL SGD - SHOPEE RETAIL AVAILABLE",
    announcementKo: "싱가포르 대량주문 - PayPal SGD - Shopee 개별 구매 가능",
    footerLine: "Pieces of Jeju Island,\narriving in Singapore.",
    footerLineKo: "제주의 조각이\n싱가포르에 도착합니다.",
    checkoutNote: "Free Singapore EMS shipping included",
    checkoutNoteKo: "싱가포르 EMS 배송비 포함",
  },
  HK: {
    code: "HK",
    shortLabel: "HK",
    label: "Hong Kong",
    koreanLabel: "홍콩",
    countryCode: "HK",
    countryName: "Hong Kong",
    countryNameKo: "홍콩",
    currency: "HKD",
    locale: "en-HK",
    rateFromSgd: 6.0834,
    hasShopee: false,
    announcement: "HONG KONG BULK ORDER ONLY - PAYPAL HKD - SHIPS FROM KOREA",
    announcementKo: "홍콩 대량주문 전용 - PayPal HKD - 한국 발송",
    footerLine: "Pieces of Jeju Island,\narriving in Hong Kong.",
    footerLineKo: "제주의 조각이\n홍콩에 도착합니다.",
    checkoutNote: "Hong Kong EMS shipping included",
    checkoutNoteKo: "홍콩 EMS 배송비 포함",
  },
};

export const displayLanguages: LanguageOption[] = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "ko", label: "Korean", shortLabel: "KO" },
  { code: "zh", label: "Chinese", shortLabel: "CN" },
  { code: "zh-HK", label: "Hong Kong Chinese", shortLabel: "HK" },
  { code: "zh-TW", label: "Taiwan Chinese", shortLabel: "TW" },
  { code: "ja", label: "Japanese", shortLabel: "JP" },
];

const MarketContext = createContext<MarketContextValue | null>(null);

function isMarketCode(value: string | null): value is MarketCode {
  return value === "SG" || value === "HK";
}

function isDisplayLanguage(value: string | null): value is DisplayLanguage {
  return displayLanguages.some((item) => item.code === value);
}

function getInitialMarket(): MarketCode {
  if (typeof window === "undefined") return "SG";
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("market");
  if (isMarketCode(fromUrl)) return fromUrl;
  const fromStorage = window.localStorage.getItem("hondit-market");
  return isMarketCode(fromStorage) ? fromStorage : "SG";
}

function getInitialLanguage(): DisplayLanguage {
  if (typeof window === "undefined") return "en";
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("lang");
  if (isDisplayLanguage(fromUrl)) return fromUrl;
  const fromStorage = window.localStorage.getItem("hondit-language");
  return isDisplayLanguage(fromStorage) ? fromStorage : "en";
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [marketCode, setMarketCode] = useState<MarketCode>(getInitialMarket);
  const [language, setLanguageState] = useState<DisplayLanguage>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem("hondit-market", marketCode);
    window.localStorage.setItem("hondit-language", language);
    const url = new URL(window.location.href);
    url.searchParams.set("market", marketCode);
    url.searchParams.set("lang", language);
    window.history.replaceState({}, "", url);
  }, [marketCode, language]);

  const value = useMemo<MarketContextValue>(
    () => ({
      market: markets[marketCode],
      marketCode,
      language,
      setMarket: setMarketCode,
      setLanguage: setLanguageState,
    }),
    [language, marketCode],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const value = useContext(MarketContext);
  if (!value) throw new Error("useMarket must be used inside MarketProvider");
  return value;
}

export function MarketSelectionDialog(_props: { disabled?: boolean } = {}) {
  return null;
}

export function formatCurrency(amount: number, currency: CurrencyCode | string = "SGD", locale = "en-SG") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function formatSgd(amount: number) {
  return formatCurrency(amount, "SGD", "en-SG");
}

export function getMarketUnitPrice(product: PricedItem, market: MarketConfig) {
  const explicit = product.marketUnitPrices?.[market.code];
  if (typeof explicit === "number") return explicit;
  const base = product.bulkUnitPrice ?? product.unitPriceSgd ?? 0;
  return Number((base * market.rateFromSgd).toFixed(2));
}

export function getMarketLineTotal(product: PricedItem, quantity: number, market: MarketConfig) {
  return Number((getMarketUnitPrice(product, market) * quantity).toFixed(2));
}

export function formatMarketUnitMoney(product: PricedItem, market: MarketConfig) {
  return formatCurrency(getMarketUnitPrice(product, market), market.currency, market.locale);
}

export function formatMarketLineMoney(product: PricedItem, quantity: number, market: MarketConfig) {
  return formatCurrency(getMarketLineTotal(product, quantity, market), market.currency, market.locale);
}

const countryNames: Record<NonEnglishLanguage, Record<MarketCode, string>> = {
  ko: { SG: "싱가포르", HK: "홍콩" },
  zh: { SG: "新加坡", HK: "香港" },
  "zh-HK": { SG: "新加坡", HK: "香港" },
  "zh-TW": { SG: "新加坡", HK: "香港" },
  ja: { SG: "シンガポール", HK: "香港" },
};

export function marketCountryName(market: MarketConfig, language: DisplayLanguage) {
  if (language === "en") return market.countryName;
  return countryNames[language][market.code];
}

const commonText: Record<NonEnglishLanguage, TextDictionary> = {
  ko: {
    Home: "홈",
    "Explore Jeju": "제주 보기",
    Products: "상품",
    "Bulk Orders": "대량주문",
    Shipping: "배송",
    Contact: "문의",
    Menu: "메뉴",
    Market: "판매 국가",
    Language: "언어",
    Singapore: "싱가포르",
    "Hong Kong": "홍콩",
    "Shop on Shopee ->": "Shopee 구매 ->",
    "Bulk checkout ->": "대량주문 ->",
    "View details": "상세 보기",
    "Buy on Shopee": "Shopee 구매",
    "Bulk checkout": "대량주문",
    "Ask hondit": "문의하기",
    "Ask hondit ->": "문의하기 ->",
    "Bulk unavailable": "대량주문 불가",
    ALL: "전체",
    CARE: "케어",
    SCENT: "향",
    cleansing: "클렌징",
    diffuser: "디퓨저",
    "OUT OF STOCK": "품절",
    "Out of stock": "품절",
    "In stock": "재고 있음",
    "Low stock": "재고 적음",
    "Sold out": "품절",
    units: "개",
    "Bulk MOQ": "대량주문 MOQ",
    "Bulk unit": "대량주문 단가",
    Route: "구매 방식",
    "Shopee retail or PayPal bulk checkout": "Shopee 개별구매 또는 PayPal 대량주문",
    "PayPal bulk checkout only": "PayPal 대량주문 전용",
    "GOOD FOR": "추천 용도",
    HIGHLIGHTS: "특징",
    "HOW TO USE": "사용 방법",
    "Product not found.": "상품을 찾을 수 없습니다.",
    "Back to products": "상품 목록으로",
    "Back to Bulk Orders": "대량주문으로 돌아가기",
    "BULK ORDER": "대량주문",
    "DIRECT BULK CHECKOUT": "직접 대량주문",
    "Build the order. Pay securely with PayPal.": "주문을 구성하고 PayPal로 결제하세요.",
    "Choose one product": "상품 선택",
    "MOQ and approved quantity increments are checked automatically.": "MOQ와 주문 단위가 자동으로 확인됩니다.",
    "Add delivery details": "배송 정보 입력",
    "Required delivery information is saved only with the order.": "필수 배송 정보는 주문과 함께 저장됩니다.",
    "Pay with PayPal": "PayPal 결제",
    "Test the PayPal flow without moving real money.": "실결제 없이 PayPal 흐름을 점검합니다.",
    "Manage the order": "주문 관리",
    "Only completed paid orders appear in the protected admin console.": "결제 완료 주문만 관리자 페이지에 표시됩니다.",
    "01 - PRODUCT": "01 - 상품",
    "Choose a bulk product.": "대량주문 상품을 선택하세요.",
    "PAYPAL CHECKOUT": "PAYPAL 결제",
    "Continue to delivery and PayPal ->": "배송 입력 및 PayPal 결제로 ->",
    "Need a mixed commercial order?": "여러 상품을 묶어 주문해야 하나요?",
    "We can confirm product combinations, quantities and delivery details by email before payment.": "결제 전 이메일로 상품 조합, 수량, 배송 조건을 확인할 수 있습니다.",
    "Go to contact ->": "문의하기 ->",
    "Unit price": "개당 가격",
    Minimum: "최소 수량",
    "Minimum total": "최소 결제액",
    Step: "주문 단위",
    Delivery: "배송",
    "Order quantity": "주문 수량",
    "Total units": "총 수량",
    "Total payment": "총 결제액",
    "Full name": "이름",
    Name: "이름",
    Email: "이메일",
    "Phone / WhatsApp": "전화 / WhatsApp",
    "Company name": "회사명",
    Company: "회사명",
    Country: "배송 국가",
    "Address line 1": "주소 1",
    "Address line 2": "주소 2",
    "City / District": "도시 / 지역",
    "Postal code": "우편번호",
    "Order note": "주문 메모",
    "Shipping address": "배송 주소",
    "Not entered": "미입력",
    "No note": "메모 없음",
    "Product composition": "상품 구성",
    "Use and order notes": "사용 및 주문 안내",
    "Review before payment": "결제 전 확인",
    "Final payment check": "최종 결제 확인",
    "Please confirm these details before opening PayPal or card checkout.": "PayPal 또는 카드 결제창을 열기 전에 아래 정보를 확인해주세요.",
    "Pay with PayPal or credit/debit card.": "PayPal 또는 신용/직불카드로 결제합니다.",
    "For direct checkout, please use PayPal or an international card.": "직접 결제는 PayPal 또는 해외 결제가 가능한 카드로 진행해주세요.",
    "If PayPal/card checkout fails": "PayPal/카드 결제가 안 될 때",
    "Email purchase conditions": "구매조건 메일 보내기",
    "Notify me": "입고 문의",
    "This product is currently sold out.": "현재 품절된 상품입니다.",
    "Direct PayPal checkout is temporarily closed. Please contact hondit.": "PayPal 직접 결제가 잠시 닫혀 있습니다. hondit에 문의해주세요.",
    "Direct PayPal checkout is temporarily closed. Please contact hondit for this order.": "PayPal 직접 결제가 잠시 닫혀 있습니다. 이 주문은 hondit에 문의해주세요.",
    "Please complete all required shipping fields before payment.": "결제 전 필수 배송 정보를 모두 입력해주세요.",
    "Please confirm the quantity, address and final payment amount.": "수량, 주소, 최종 결제 금액을 확인해주세요.",
    "Payment could not be completed.": "결제가 완료되지 않았습니다.",
    "Payment could not be completed. Please email the purchase conditions to hondit or use Shopee SG where available.": "결제가 완료되지 않았습니다. 구매 조건을 hondit에 이메일로 보내거나 가능한 경우 Shopee SG를 이용해주세요.",
    "Add PAYPAL_CLIENT_ID in Vercel to enable PayPal buttons.": "Vercel에 PAYPAL_CLIENT_ID를 추가하면 PayPal 버튼이 활성화됩니다.",
    "Hidden Live PayPal verification URL. Do not share publicly.": "숨겨진 Live PayPal 확인 URL입니다. 공개하지 마세요.",
    EXPLORE: "둘러보기",
    CONNECT: "연결",
    "TRUST & SUPPORT": "신뢰와 지원",
    "Delivery guide": "배송 안내",
    "Refund support": "환불 안내",
    "Asia to Jeju": "아시아에서 제주까지",
    "A student-led brand based at": "제주를 기반으로 한 학생 운영 브랜드",
    "Jeju National University.": "제주대학교.",
    "JNU official site ->": "JNU 공식 사이트 ->",
    Refund: "환불",
    Privacy: "개인정보",
    Terms: "이용약관",
    "Admin sign-in": "관리자 로그인",
    "Page not found.": "페이지를 찾을 수 없습니다.",
    "Back to Home": "홈으로 돌아가기",
    "View Products": "상품 보기",
    "Return to Bulk Orders": "대량주문으로 돌아가기",
    "Shipping Policy": "배송 정책",
    "Refund Policy": "환불 정책",
    "Privacy Policy": "개인정보 처리방침",
    "FOR INDIVIDUALS": "개별 구매",
    "FOR BUSINESSES AND GROUPS": "사업자 및 단체",
    "Jeju-based student team": "제주 기반 학생 운영팀",
    "Official Shopee route": "공식 Shopee 구매 경로",
    "Direct bulk checkout": "직접 대량주문",
    "Bulk only": "대량주문 전용",
    "Bulk Checkout": "대량주문",
    "Student-led and based in Jeju City.": "제주시에 기반을 둔 학생 운영 프로젝트입니다.",
    "Bulk only direct route": "대량주문 전용 경로",
    "Live price, vouchers and protected checkout.": "실시간 가격, 쿠폰, 보호된 결제.",
    "Direct bulk orders dispatch from Korea after PayPal capture.": "직접 대량주문은 PayPal 결제 완료 후 한국에서 발송됩니다.",
    "Two clear routes": "두 가지 명확한 구매 경로",
    "Fixed market bulk prices": "판매 국가별 고정 대량주문가",
    "THE HONDIT EDIT": "hondit 셀렉션",
    "Care shaped by water. Scent grounded in stone.": "물에서 시작한 케어. 돌에 머무는 향.",
    "5 PRODUCTS": "상품 5종",
    "Focused care and scent edit": "케어와 향 제품 구성",
    PRICES: "가격",
    "2 ROUTES": "2가지 구매 방식",
    "BULK ONLY": "대량주문 전용",
    "Individual or bulk orders": "개별 구매 또는 대량주문",
    "Direct PayPal checkout": "PayPal 직접 결제",
    "SHOP BY RITUAL": "루틴별 상품",
    "Find your": "나에게 맞는",
    "everyday fit.": "일상 루틴.",
    "CHOOSE YOUR ROUTE": "구매 방식 선택",
    "One item or a larger order?": "하나만 살까요, 대량으로 주문할까요?",
    "Bulk orders only for this market.": "이 판매 국가는 대량주문만 운영합니다.",
    "INDIVIDUAL RETAIL": "개별 구매",
    "DIRECT MARKET": "직접 판매 국가",
    "No Shopee route": "Shopee 경로 없음",
    "Start bulk checkout": "대량주문 시작",
    "BUSINESS AND GROUPS": "사업자 및 공동구매",
    "Open bulk checkout": "대량주문 열기",
    "Open bulk checkout ->": "대량주문 열기 ->",
    "CONTACT HONDIT": "HONDIT 문의",
    "A real inbox,\nwith a clear route for every question.": "운영팀으로 바로 닿는\n명확한 문의 경로.",
    "SEND A MESSAGE": "문의 보내기",
    "Tell us what you need.": "필요한 내용을 알려주세요.",
    "Your name": "이름",
    Optional: "선택",
    "Order number": "주문번호",
    "Enquiry type": "문의 유형",
    Message: "문의 내용",
    "Include the product, order reference or question so we can help quickly.": "상품명, 주문번호, 질문 내용을 함께 적어주시면 더 빠르게 확인할 수 있습니다.",
    "Sending...": "전송 중...",
    "Send to hondit": "hondit에 보내기",
    "Message could not be sent. Please try again or email hondit.": "문의 전송에 실패했습니다. 다시 시도하거나 이메일로 문의해주세요.",
    "Your message has been saved. hondit will reply by email.": "문의가 저장되었습니다. hondit이 이메일로 답변드립니다.",
    "QUICK ROUTES": "빠른 경로",
    "Use the right channel.": "상황에 맞는 채널을 선택하세요.",
    "Payment, voucher, delivery tracking or address changes for Shopee orders. ->": "Shopee 주문 결제, 쿠폰, 배송 추적, 주소 변경 문의. ->",
    "Short product questions, social content and informal collaborations. ->": "간단한 상품 문의, 소셜 콘텐츠, 협업 문의. ->",
    "Attachments and formal records can still be sent by email.": "첨부파일이나 공식 문서는 이메일로 보낼 수 있습니다.",
    "INDIVIDUAL PURCHASE": "개별 구매",
    "Shop through Shopee Singapore": "Shopee 싱가포르에서 구매",
    "Marketplace delivery window and tracking": "마켓플레이스 배송 일정 및 추적",
    "Live vouchers and product availability": "실시간 쿠폰 및 재고 확인",
    "Order tracking inside Shopee": "Shopee 안에서 주문 추적",
    "Choose a product ->": "상품 선택하기 ->",
    "LARGER PURCHASE": "대량 구매",
    "BULK PURCHASE ONLY": "대량주문 전용",
    "Delivery begins after payment capture and preparation": "결제 완료 및 준비 후 배송 시작",
    "Product-specific MOQ and quantity steps": "상품별 최소 수량과 주문 단위 적용",
    "Server-verified PayPal capture before an admin order is confirmed": "서버에서 PayPal 결제 완료가 검증된 주문만 관리자 주문으로 확정",
    "TIMING NOTES": "배송 참고",
    "What can change the delivery date?": "배송일은 무엇에 따라 달라지나요?",
    "Dispatch day": "발송일",
    "Orders placed close to weekends or holidays may begin moving on the next working day.": "주말이나 공휴일 직전 주문은 다음 영업일부터 이동이 시작될 수 있습니다.",
    "Customs and carrier handover": "통관 및 배송사 인계",
    "Inspection, flight capacity and local handover can add time.": "검사, 항공편, 현지 인계 상황에 따라 시간이 추가될 수 있습니다.",
    "Bulk size and stock": "대량 수량과 재고",
    "Larger paid orders may require additional preparation before dispatch.": "큰 수량의 결제 완료 주문은 발송 전 준비 시간이 더 필요할 수 있습니다.",
    Tracking: "배송 추적",
    "Need help with an order?": "주문 도움이 필요하신가요?",
    "Use Shopee chat for a Shopee transaction, or prepare a message for the hondit team.": "Shopee 주문은 Shopee 채팅을, 대량주문은 hondit 문의를 이용해주세요.",
    "Send a message to hondit with your order number, product and delivery question.": "주문번호, 상품명, 배송 문의 내용을 hondit에 보내주세요.",
  },
  zh: {},
  "zh-HK": {},
  "zh-TW": {},
  ja: {},
};

const zhBase: TextDictionary = {
  Home: "首页",
  "Explore Jeju": "探索济州",
  Products: "商品",
  "Bulk Orders": "批量订购",
  Shipping: "配送",
  Contact: "联系",
  Menu: "菜单",
  Market: "市场",
  Language: "语言",
  Singapore: "新加坡",
  "Hong Kong": "香港",
  "Shop on Shopee ->": "前往 Shopee ->",
  "Bulk checkout ->": "批量结账 ->",
  "View details": "查看详情",
  "Buy on Shopee": "Shopee 购买",
  "Bulk checkout": "批量结账",
  "Ask hondit": "咨询 hondit",
  "Ask hondit ->": "咨询 hondit ->",
  "Bulk unavailable": "暂不可批量订购",
  ALL: "全部",
  CARE: "护理",
  SCENT: "香氛",
  cleansing: "洁面",
  diffuser: "扩香",
  "OUT OF STOCK": "售罄",
  "Out of stock": "售罄",
  "In stock": "有库存",
  "Low stock": "库存较少",
  "Sold out": "售罄",
  units: "件",
  "Bulk MOQ": "批量 MOQ",
  "Bulk unit": "批量单价",
  Route: "购买方式",
  "Shopee retail or PayPal bulk checkout": "Shopee 零售或 PayPal 批量结账",
  "PayPal bulk checkout only": "仅 PayPal 批量结账",
  "GOOD FOR": "适合",
  HIGHLIGHTS: "特点",
  "HOW TO USE": "使用方法",
  "Product not found.": "找不到商品。",
  "Back to products": "返回商品",
  "Back to Bulk Orders": "返回批量订购",
  "BULK ORDER": "批量订购",
  "DIRECT BULK CHECKOUT": "直接批量结账",
  "Build the order. Pay securely with PayPal.": "选择商品并通过 PayPal 安全付款。",
  "Choose one product": "选择商品",
  "MOQ and approved quantity increments are checked automatically.": "MOQ 和订购步进会自动检查。",
  "Add delivery details": "填写配送信息",
  "Required delivery information is saved only with the order.": "必要配送信息只会随订单保存。",
  "Pay with PayPal": "使用 PayPal 付款",
  "Test the PayPal flow without moving real money.": "测试 PayPal 流程，不产生真实付款。",
  "Manage the order": "管理订单",
  "Only completed paid orders appear in the protected admin console.": "只有已完成付款的订单会显示在后台。",
  "01 - PRODUCT": "01 - 商品",
  "Choose a bulk product.": "请选择批量订购商品。",
  "PAYPAL CHECKOUT": "PAYPAL 结账",
  "Continue to delivery and PayPal ->": "填写配送并前往 PayPal ->",
  "Need a mixed commercial order?": "需要混合商品商业订单？",
  "We can confirm product combinations, quantities and delivery details by email before payment.": "付款前可通过邮件确认商品组合、数量和配送条件。",
  "Go to contact ->": "前往联系 ->",
  "Unit price": "单价",
  Minimum: "最低数量",
  "Minimum total": "最低金额",
  Step: "订购步进",
  Delivery: "配送",
  "Order quantity": "订购数量",
  "Total units": "总数量",
  "Total payment": "总付款",
  "Full name": "姓名",
  Name: "姓名",
  Email: "电子邮件",
  "Phone / WhatsApp": "电话 / WhatsApp",
  "Company name": "公司名称",
  Company: "公司",
  Country: "国家/地区",
  "Address line 1": "地址 1",
  "Address line 2": "地址 2",
  "City / District": "城市 / 区",
  "Postal code": "邮政编码",
  "Order note": "订单备注",
  "Shipping address": "配送地址",
  "Not entered": "未填写",
  "No note": "无备注",
  "Product composition": "商品组成",
  "Use and order notes": "使用与订购说明",
  "Review before payment": "付款前确认",
  "Final payment check": "最终付款确认",
  "Please confirm these details before opening PayPal or card checkout.": "打开 PayPal 或银行卡结账前，请确认以下信息。",
  "Pay with PayPal or credit/debit card.": "使用 PayPal 或信用/借记卡付款。",
  "For direct checkout, please use PayPal or an international card.": "直接结账请使用 PayPal 或支持国际支付的银行卡。",
  "If PayPal/card checkout fails": "如果 PayPal/银行卡结账失败",
  "Email purchase conditions": "发送购买条件邮件",
  "Notify me": "到货通知",
  "This product is currently sold out.": "此商品当前售罄。",
  "Direct PayPal checkout is temporarily closed. Please contact hondit.": "PayPal 直接结账暂时关闭，请联系 hondit。",
  "Direct PayPal checkout is temporarily closed. Please contact hondit for this order.": "此订单暂时无法使用 PayPal 直接结账，请联系 hondit。",
  "Please complete all required shipping fields before payment.": "付款前请填写所有必填配送信息。",
  "Please confirm the quantity, address and final payment amount.": "请确认数量、地址和最终付款金额。",
  "Payment could not be completed.": "付款未能完成。",
  "Payment could not be completed. Please email the purchase conditions to hondit or use Shopee SG where available.": "付款未能完成。请将购买条件发送给 hondit，或在可用时使用 Shopee SG。",
  "Add PAYPAL_CLIENT_ID in Vercel to enable PayPal buttons.": "在 Vercel 添加 PAYPAL_CLIENT_ID 后即可启用 PayPal 按钮。",
  "Hidden Live PayPal verification URL. Do not share publicly.": "隐藏的 Live PayPal 验证网址，请勿公开分享。",
  EXPLORE: "探索",
  CONNECT: "连接",
  "TRUST & SUPPORT": "信任与支持",
  "Delivery guide": "配送指南",
  "Refund support": "退款支持",
  "Asia to Jeju": "从亚洲到济州",
  "A student-led brand based at": "源自济州大学的学生运营品牌",
  "Jeju National University.": "济州大学。",
  "JNU official site ->": "JNU 官方网站 ->",
  Refund: "退款",
  Privacy: "隐私",
  Terms: "条款",
  "Admin sign-in": "管理员登录",
  "Page not found.": "找不到页面。",
  "Back to Home": "返回首页",
  "View Products": "查看商品",
  "Return to Bulk Orders": "返回批量订购",
  "Shipping Policy": "配送政策",
  "Refund Policy": "退款政策",
  "Privacy Policy": "隐私政策",
  "FOR INDIVIDUALS": "个人购买",
  "FOR BUSINESSES AND GROUPS": "企业与团体",
  "Jeju-based student team": "济州学生运营团队",
  "Official Shopee route": "官方 Shopee 路径",
  "Direct bulk checkout": "直接批量结账",
  "Bulk only": "仅批量订购",
  "Bulk Checkout": "批量结账",
  "Student-led and based in Jeju City.": "由位于济州市的学生团队运营。",
  "Bulk only direct route": "仅直接批量订购",
  "Live price, vouchers and protected checkout.": "实时价格、优惠券与受保护结账。",
  "Direct bulk orders dispatch from Korea after PayPal capture.": "直接批量订单在 PayPal 付款完成后由韩国发出。",
  "Two clear routes": "两种清晰购买方式",
  "Fixed market bulk prices": "按市场固定批量价格",
  "THE HONDIT EDIT": "hondit 精选",
  "Care shaped by water. Scent grounded in stone.": "以水塑造护理，以石承载香气。",
  "5 PRODUCTS": "5 件商品",
  "Focused care and scent edit": "护理与香氛精选",
  PRICES: "价格",
  "2 ROUTES": "2 种方式",
  "BULK ONLY": "仅批量",
  "Individual or bulk orders": "个人或批量订购",
  "Direct PayPal checkout": "PayPal 直接结账",
  "SHOP BY RITUAL": "按日常使用选购",
  "Find your": "找到你的",
  "everyday fit.": "日常适配。",
  "CHOOSE YOUR ROUTE": "选择购买方式",
  "One item or a larger order?": "单件还是更大订单？",
  "Bulk orders only for this market.": "该市场仅支持批量订购。",
  "INDIVIDUAL RETAIL": "个人零售",
  "DIRECT MARKET": "直接销售市场",
  "No Shopee route": "无 Shopee 路径",
  "Start bulk checkout": "开始批量结账",
  "BUSINESS AND GROUPS": "企业与团购",
  "Open bulk checkout": "打开批量结账",
  "Open bulk checkout ->": "打开批量结账 ->",
  "CONTACT HONDIT": "联系 HONDIT",
  "A real inbox,\nwith a clear route for every question.": "真实收件箱，\n每个问题都有清晰路径。",
  "SEND A MESSAGE": "发送信息",
  "Tell us what you need.": "告诉我们你的需求。",
  "Your name": "你的姓名",
  Optional: "选填",
  "Order number": "订单编号",
  "Enquiry type": "咨询类型",
  Message: "内容",
  "Include the product, order reference or question so we can help quickly.": "请附上商品、订单编号或问题，方便我们快速处理。",
  "Sending...": "发送中...",
  "Send to hondit": "发送给 hondit",
  "Message could not be sent. Please try again or email hondit.": "信息发送失败。请重试或发送邮件给 hondit。",
  "Your message has been saved. hondit will reply by email.": "信息已保存。hondit 会通过邮件回复。",
  "QUICK ROUTES": "快速路径",
  "Use the right channel.": "选择合适的渠道。",
  "Payment, voucher, delivery tracking or address changes for Shopee orders. ->": "Shopee 订单的付款、优惠券、物流追踪或地址变更。->",
  "Short product questions, social content and informal collaborations. ->": "简短商品问题、社交内容或非正式合作。->",
  "Attachments and formal records can still be sent by email.": "附件和正式记录仍可通过电子邮件发送。",
  "INDIVIDUAL PURCHASE": "个人购买",
  "Shop through Shopee Singapore": "通过 Shopee Singapore 购买",
  "Marketplace delivery window and tracking": "平台配送时间与追踪",
  "Live vouchers and product availability": "实时优惠券与库存",
  "Order tracking inside Shopee": "在 Shopee 内追踪订单",
  "Choose a product ->": "选择商品 ->",
  "LARGER PURCHASE": "较大采购",
  "BULK PURCHASE ONLY": "仅批量采购",
  "Delivery begins after payment capture and preparation": "付款确认并备货后开始配送",
  "Product-specific MOQ and quantity steps": "按商品设定 MOQ 与订购步进",
  "Server-verified PayPal capture before an admin order is confirmed": "后台订单确认前会由服务器验证 PayPal 付款",
  "TIMING NOTES": "时间说明",
  "What can change the delivery date?": "哪些因素会影响送达日期？",
  "Dispatch day": "发货日",
  "Orders placed close to weekends or holidays may begin moving on the next working day.": "接近周末或假期的订单可能在下一个工作日开始处理。",
  "Customs and carrier handover": "清关与承运商交接",
  "Inspection, flight capacity and local handover can add time.": "检查、航班容量和本地交接可能增加时间。",
  "Bulk size and stock": "批量规模与库存",
  "Larger paid orders may require additional preparation before dispatch.": "较大的已付款订单可能需要更多发货前准备时间。",
  Tracking: "物流追踪",
  "Need help with an order?": "订单需要帮助？",
  "Use Shopee chat for a Shopee transaction, or prepare a message for the hondit team.": "Shopee 交易请使用 Shopee Chat，批量订单请联系 hondit。",
  "Send a message to hondit with your order number, product and delivery question.": "请将订单号、商品和配送问题发送给 hondit。",
};

commonText.zh = zhBase;
commonText["zh-HK"] = {
  ...zhBase,
  Home: "首頁",
  Products: "商品",
  "Bulk Orders": "批量訂購",
  Shipping: "配送",
  Contact: "聯絡",
  Market: "市場",
  Language: "語言",
  "Buy on Shopee": "Shopee 購買",
  "Bulk checkout": "批量結帳",
  "Bulk checkout ->": "批量結帳 ->",
  "DIRECT BULK CHECKOUT": "直接批量結帳",
  "Build the order. Pay securely with PayPal.": "選擇商品並透過 PayPal 安全付款。",
  "PAYPAL CHECKOUT": "PAYPAL 結帳",
  "Continue to delivery and PayPal ->": "填寫配送並前往 PayPal ->",
  "Unit price": "單價",
  Delivery: "配送",
  "Order quantity": "訂購數量",
  "Total payment": "總付款",
  "Company name": "公司名稱",
  "Shipping address": "配送地址",
  "Final payment check": "最終付款確認",
  "Payment could not be completed.": "付款未能完成。",
  "Privacy Policy": "私隱政策",
  "Refund Policy": "退款政策",
  "Shipping Policy": "配送政策",
  "A real inbox,\nwith a clear route for every question.": "真實收件箱，\n每個問題都有清晰路徑。",
};
commonText["zh-TW"] = {
  ...commonText["zh-HK"],
  "Hong Kong": "香港",
  "Bulk Orders": "大量訂購",
  "Bulk checkout": "大量結帳",
  "Bulk checkout ->": "大量結帳 ->",
  "DIRECT BULK CHECKOUT": "直接大量結帳",
  "Choose a bulk product.": "請選擇大量訂購商品。",
  "Bulk orders only for this market.": "此市場僅支援大量訂購。",
};
commonText.ja = {
  Home: "ホーム",
  "Explore Jeju": "済州を見る",
  Products: "商品",
  "Bulk Orders": "一括注文",
  Shipping: "配送",
  Contact: "お問い合わせ",
  Menu: "メニュー",
  Market: "販売地域",
  Language: "言語",
  Singapore: "シンガポール",
  "Hong Kong": "香港",
  "Shop on Shopee ->": "Shopee で購入 ->",
  "Bulk checkout ->": "一括注文 ->",
  "View details": "詳細を見る",
  "Buy on Shopee": "Shopee で購入",
  "Bulk checkout": "一括注文",
  "Ask hondit": "hondit に相談",
  "Ask hondit ->": "hondit に相談 ->",
  "Bulk unavailable": "一括注文不可",
  ALL: "すべて",
  CARE: "ケア",
  SCENT: "香り",
  cleansing: "クレンジング",
  diffuser: "ディフューザー",
  "OUT OF STOCK": "在庫切れ",
  "Out of stock": "在庫切れ",
  "In stock": "在庫あり",
  "Low stock": "残りわずか",
  "Sold out": "売り切れ",
  units: "個",
  "Bulk MOQ": "一括 MOQ",
  "Bulk unit": "一括単価",
  Route: "購入方法",
  "Shopee retail or PayPal bulk checkout": "Shopee 小売または PayPal 一括注文",
  "PayPal bulk checkout only": "PayPal 一括注文のみ",
  "GOOD FOR": "おすすめ用途",
  HIGHLIGHTS: "特徴",
  "HOW TO USE": "使い方",
  "Product not found.": "商品が見つかりません。",
  "Back to products": "商品一覧へ戻る",
  "Back to Bulk Orders": "一括注文へ戻る",
  "BULK ORDER": "一括注文",
  "DIRECT BULK CHECKOUT": "直接一括注文",
  "Build the order. Pay securely with PayPal.": "注文内容を作成し、PayPal で安全に決済します。",
  "Choose one product": "商品を選択",
  "MOQ and approved quantity increments are checked automatically.": "MOQ と注文単位は自動で確認されます。",
  "Add delivery details": "配送情報を入力",
  "Required delivery information is saved only with the order.": "必要な配送情報は注文と一緒に保存されます。",
  "Pay with PayPal": "PayPal で支払う",
  "Test the PayPal flow without moving real money.": "実際の支払いなしで PayPal の流れを確認します。",
  "Manage the order": "注文管理",
  "Only completed paid orders appear in the protected admin console.": "支払い完了済みの注文のみ管理画面に表示されます。",
  "01 - PRODUCT": "01 - 商品",
  "Choose a bulk product.": "一括注文の商品を選択してください。",
  "PAYPAL CHECKOUT": "PAYPAL 決済",
  "Continue to delivery and PayPal ->": "配送入力と PayPal 決済へ ->",
  "Need a mixed commercial order?": "複数商品を組み合わせた注文ですか？",
  "We can confirm product combinations, quantities and delivery details by email before payment.": "支払い前にメールで商品構成、数量、配送条件を確認できます。",
  "Go to contact ->": "お問い合わせへ ->",
  "Unit price": "単価",
  Minimum: "最小数量",
  "Minimum total": "最低金額",
  Step: "注文単位",
  Delivery: "配送",
  "Order quantity": "注文数量",
  "Total units": "合計数量",
  "Total payment": "合計金額",
  "Full name": "氏名",
  Name: "氏名",
  Email: "メール",
  "Phone / WhatsApp": "電話 / WhatsApp",
  "Company name": "会社名",
  Company: "会社名",
  Country: "国/地域",
  "Address line 1": "住所 1",
  "Address line 2": "住所 2",
  "City / District": "市区町村",
  "Postal code": "郵便番号",
  "Order note": "注文メモ",
  "Shipping address": "配送先住所",
  "Not entered": "未入力",
  "No note": "メモなし",
  "Product composition": "商品構成",
  "Use and order notes": "使用・注文メモ",
  "Review before payment": "支払い前確認",
  "Final payment check": "最終確認",
  "Please confirm these details before opening PayPal or card checkout.": "PayPal またはカード決済を開く前に内容をご確認ください。",
  "Pay with PayPal or credit/debit card.": "PayPal またはクレジット/デビットカードで支払います。",
  "For direct checkout, please use PayPal or an international card.": "直接決済には PayPal または海外決済対応カードをご利用ください。",
  "If PayPal/card checkout fails": "PayPal/カード決済が失敗した場合",
  "Email purchase conditions": "購入条件をメールで送る",
  "Notify me": "入荷連絡",
  "This product is currently sold out.": "この商品は現在売り切れです。",
  "Direct PayPal checkout is temporarily closed. Please contact hondit.": "PayPal 直接決済は一時停止中です。hondit までご連絡ください。",
  "Direct PayPal checkout is temporarily closed. Please contact hondit for this order.": "この注文は PayPal 直接決済を一時停止中です。hondit までご連絡ください。",
  "Please complete all required shipping fields before payment.": "支払い前に必須の配送情報をすべて入力してください。",
  "Please confirm the quantity, address and final payment amount.": "数量、住所、最終金額をご確認ください。",
  "Payment could not be completed.": "決済を完了できませんでした。",
  "Payment could not be completed. Please email the purchase conditions to hondit or use Shopee SG where available.": "決済を完了できませんでした。購入条件を hondit へメールするか、利用可能な場合は Shopee SG をご利用ください。",
  "Add PAYPAL_CLIENT_ID in Vercel to enable PayPal buttons.": "Vercel に PAYPAL_CLIENT_ID を追加すると PayPal ボタンが有効になります。",
  "Hidden Live PayPal verification URL. Do not share publicly.": "非公開の Live PayPal 確認 URL です。公開しないでください。",
  EXPLORE: "見る",
  CONNECT: "連絡",
  "TRUST & SUPPORT": "信頼とサポート",
  "Delivery guide": "配送ガイド",
  "Refund support": "返金サポート",
  "Asia to Jeju": "アジアから済州へ",
  "A student-led brand based at": "済州大学を拠点にした学生運営ブランド",
  "Jeju National University.": "済州大学。",
  "JNU official site ->": "JNU 公式サイト ->",
  Refund: "返金",
  Privacy: "プライバシー",
  Terms: "利用規約",
  "Admin sign-in": "管理者ログイン",
  "Page not found.": "ページが見つかりません。",
  "Back to Home": "ホームへ戻る",
  "View Products": "商品を見る",
  "Return to Bulk Orders": "一括注文へ戻る",
  "Shipping Policy": "配送ポリシー",
  "Refund Policy": "返金ポリシー",
  "Privacy Policy": "プライバシーポリシー",
  "FOR INDIVIDUALS": "個人向け",
  "FOR BUSINESSES AND GROUPS": "事業者・団体向け",
  "Jeju-based student team": "済州拠点の学生チーム",
  "Official Shopee route": "公式 Shopee ルート",
  "Direct bulk checkout": "直接一括注文",
  "Bulk only": "一括注文のみ",
  "Bulk Checkout": "一括注文",
  "Student-led and based in Jeju City.": "済州市を拠点にした学生運営プロジェクトです。",
  "Bulk only direct route": "一括注文専用ルート",
  "Live price, vouchers and protected checkout.": "リアルタイム価格、クーポン、安全な決済。",
  "Direct bulk orders dispatch from Korea after PayPal capture.": "直接一括注文は PayPal 決済完了後、韓国から発送されます。",
  "Two clear routes": "2つの明確な購入方法",
  "Fixed market bulk prices": "販売地域別の固定一括価格",
  "THE HONDIT EDIT": "hondit セレクト",
  "Care shaped by water. Scent grounded in stone.": "水から生まれるケア。石に宿る香り。",
  "5 PRODUCTS": "5商品",
  "Focused care and scent edit": "ケアと香りのセレクト",
  PRICES: "価格",
  "2 ROUTES": "2つの方法",
  "BULK ONLY": "一括注文のみ",
  "Individual or bulk orders": "個人購入または一括注文",
  "Direct PayPal checkout": "PayPal 直接決済",
  "SHOP BY RITUAL": "ルーティンで選ぶ",
  "Find your": "あなたに合う",
  "everyday fit.": "日常の選択。",
  "CHOOSE YOUR ROUTE": "購入方法を選ぶ",
  "One item or a larger order?": "1点購入か、大口注文か？",
  "Bulk orders only for this market.": "この販売地域は一括注文のみです。",
  "INDIVIDUAL RETAIL": "個人小売",
  "DIRECT MARKET": "直接販売地域",
  "No Shopee route": "Shopee ルートなし",
  "Start bulk checkout": "一括注文を開始",
  "BUSINESS AND GROUPS": "事業者・共同購入",
  "Open bulk checkout": "一括注文を開く",
  "Open bulk checkout ->": "一括注文を開く ->",
  "CONTACT HONDIT": "HONDIT に連絡",
  "A real inbox,\nwith a clear route for every question.": "実際の受信箱へ、\n質問ごとに明確なルートを。",
  "SEND A MESSAGE": "メッセージを送る",
  "Tell us what you need.": "必要な内容をお知らせください。",
  "Your name": "お名前",
  Optional: "任意",
  "Order number": "注文番号",
  "Enquiry type": "お問い合わせ種別",
  Message: "内容",
  "Include the product, order reference or question so we can help quickly.": "商品名、注文番号、質問内容を含めると早く確認できます。",
  "Sending...": "送信中...",
  "Send to hondit": "hondit に送信",
  "Message could not be sent. Please try again or email hondit.": "送信できませんでした。再試行するか hondit へメールしてください。",
  "Your message has been saved. hondit will reply by email.": "お問い合わせを保存しました。hondit がメールで返信します。",
  "QUICK ROUTES": "クイックルート",
  "Use the right channel.": "内容に合うチャネルを選んでください。",
  "Payment, voucher, delivery tracking or address changes for Shopee orders. ->": "Shopee 注文の決済、クーポン、配送追跡、住所変更。->",
  "Short product questions, social content and informal collaborations. ->": "簡単な商品質問、SNS、カジュアルな協業。->",
  "Attachments and formal records can still be sent by email.": "添付や正式な記録はメールでも送れます。",
  "INDIVIDUAL PURCHASE": "個人購入",
  "Shop through Shopee Singapore": "Shopee Singapore で購入",
  "Marketplace delivery window and tracking": "マーケットプレイスの配送期間と追跡",
  "Live vouchers and product availability": "リアルタイムクーポンと在庫",
  "Order tracking inside Shopee": "Shopee 内で注文追跡",
  "Choose a product ->": "商品を選ぶ ->",
  "LARGER PURCHASE": "大口購入",
  "BULK PURCHASE ONLY": "一括注文専用",
  "Delivery begins after payment capture and preparation": "決済確定と準備後に配送開始",
  "Product-specific MOQ and quantity steps": "商品別 MOQ と注文単位",
  "Server-verified PayPal capture before an admin order is confirmed": "管理注文確定前にサーバーで PayPal 決済を検証",
  "TIMING NOTES": "配送メモ",
  "What can change the delivery date?": "配送日は何で変わりますか？",
  "Dispatch day": "発送日",
  "Orders placed close to weekends or holidays may begin moving on the next working day.": "週末や祝日前の注文は翌営業日から動き始める場合があります。",
  "Customs and carrier handover": "通関と配送会社引き渡し",
  "Inspection, flight capacity and local handover can add time.": "検査、航空便、現地引き渡しにより時間がかかる場合があります。",
  "Bulk size and stock": "大口数量と在庫",
  "Larger paid orders may require additional preparation before dispatch.": "大口の支払い済み注文は発送前準備に追加時間が必要な場合があります。",
  Tracking: "配送追跡",
  "Need help with an order?": "注文のサポートが必要ですか？",
  "Use Shopee chat for a Shopee transaction, or prepare a message for the hondit team.": "Shopee 注文は Shopee Chat、一括注文は hondit へお問い合わせください。",
  "Send a message to hondit with your order number, product and delivery question.": "注文番号、商品名、配送に関する質問を hondit へ送ってください。",
};

const productKo: TextDictionary = {
  "Volcanic Diffuser 350g": "볼캐닉 디퓨저 350g",
  "Volcanic Diffuser 500g": "볼캐닉 디퓨저 500g",
  "Vegan Foam Oil 150ml": "비건 폼 오일 150ml",
  "Vegan Foaming Cleanser 200ml": "비건 포밍 클렌저 200ml",
  "Vegan Cleansing Water 300ml": "비건 클렌징 워터 300ml",
  "J'essence Vegan Foam Oil": "제이센스 비건 폼 오일",
  "J'essence Vegan Foaming Cleanser": "제이센스 비건 포밍 클렌저",
  "J'essence Vegan Cleansing Water": "제이센스 비건 클렌징 워터",
  "Volcanic Stone Diffuser": "볼캐닉 스톤 디퓨저",
  "Diffuser 350g": "디퓨저 350g",
  "Diffuser 500g": "디퓨저 500g",
  "Vegan Foam Oil": "비건 폼 오일",
  "Foaming Cleanser": "포밍 클렌저",
  "Cleansing Water": "클렌징 워터",
  CARE: "케어",
  SCENT: "향",
  "HOME SCENT": "홈 센트",
  "EVENING CARE": "이브닝 케어",
  "DAILY CARE": "데일리 케어",
  "LIGHT CARE": "라이트 케어",
  "Compact scent for small spaces": "작은 공간을 위한 콤팩트한 향",
  "Scent object for larger rooms": "넓은 공간을 위한 향 오브제",
  "Makeup and sunscreen cleanse": "메이크업과 선스크린 클렌징",
  "Soft everyday face wash": "매일 쓰기 좋은 부드러운 페이스 워시",
  "Quick and gentle cleanse": "빠르고 순한 클렌징",
  "A compact scent object made with porous Jeju volcanic scoria, a handmade vessel and 10ml citrus oil. Add scent only when you want it, without flame, reeds or electricity.": "다공성 제주 화산송이, 핸드메이드 용기, 시트러스 오일 10ml로 구성한 콤팩트 향 오브제입니다. 불, 리드, 전기 없이 원할 때만 향을 더합니다.",
  "A larger Jeju volcanic-stone diffuser for a stronger visual presence. Its porous scoria holds citrus oil and releases a light, clean scent without flame, reeds or power.": "존재감이 더 큰 제주 화산석 디퓨저입니다. 다공성 스코리아가 시트러스 오일을 머금고 불, 리드, 전기 없이 맑은 향을 천천히 냅니다.",
  "A vegan, pH 5.5 foam-oil cleanser designed for sunscreen, base makeup and a complete evening cleanse. Fragrance-free and made for a calm, simple routine.": "선스크린, 베이스 메이크업, 저녁 클렌징 루틴을 위한 pH 5.5 비건 폼 오일 클렌저입니다. 무향으로 차분하고 단순한 루틴에 맞췄습니다.",
  "A fragrance-free vegan foaming cleanser with a pH 5.5 formula for a soft daily wash. The pump creates ready-to-use foam for a quick morning or evening routine.": "pH 5.5 포뮬러의 무향 비건 포밍 클렌저입니다. 펌프로 바로 쓰는 부드러운 거품이 아침과 저녁 루틴을 빠르게 도와줍니다.",
  "A fragrance-free vegan cleansing water for light makeup and quick resets. Its pH 5.5 formula offers a low-effort first cleansing step.": "가벼운 메이크업과 빠른 리셋을 위한 무향 비건 클렌징 워터입니다. pH 5.5 포뮬러로 부담이 적은 첫 클렌징 단계에 어울립니다.",
  "350g volcanic scoria": "350g 화산송이",
  "500g volcanic scoria": "500g 화산송이",
  "10ml citrus oil included": "시트러스 오일 10ml 포함",
  "No flame or electricity": "불과 전기 불필요",
  "Best for bedroom, bathroom or desk": "침실, 욕실, 책상에 적합",
  "Handmade vessel": "핸드메이드 용기",
  "A larger object for home or business spaces": "집과 사업장에 어울리는 큰 오브제",
  "Vegan formula": "비건 포뮬러",
  "pH 5.5": "pH 5.5",
  "Fragrance-free": "무향",
  "For sunscreen and base makeup": "선스크린과 베이스 메이크업용",
  "Ready-to-use soft foam": "바로 쓰는 부드러운 거품",
  "For light makeup and quick cleansing": "가벼운 메이크업과 빠른 클렌징용",
  "Place the volcanic stone in its vessel.": "화산석을 용기에 담습니다.",
  "Add 10-12 drops of citrus oil directly onto the stone.": "시트러스 오일 10-12방울을 돌 위에 직접 떨어뜨립니다.",
  "Let it absorb, then refresh with a few drops whenever needed.": "흡수시킨 뒤 필요할 때 몇 방울 더해 향을 되살립니다.",
  "Arrange the volcanic stone in its vessel.": "화산석을 용기에 자연스럽게 배치합니다.",
  "Add 10-12 drops across the upper stones.": "윗부분 돌에 시트러스 오일 10-12방울을 떨어뜨립니다.",
  "Refresh the scent only when you choose.": "원할 때만 향을 보충합니다.",
  "Pump onto dry hands.": "마른 손에 펌핑합니다.",
  "Massage gently over dry skin.": "마른 피부 위에 부드럽게 마사지합니다.",
  "Add water to create foam, then rinse thoroughly.": "물을 더해 거품을 만든 뒤 깨끗이 헹굽니다.",
  "Wet your face with lukewarm water.": "미온수로 얼굴을 적십니다.",
  "Pump the foam into your hand.": "거품을 손에 펌핑합니다.",
  "Massage gently and rinse thoroughly.": "부드럽게 마사지하고 깨끗이 헹굽니다.",
  "Soak a cotton pad with cleansing water.": "화장솜에 클렌징 워터를 충분히 적십니다.",
  "Wipe gently across the face without rubbing.": "문지르지 말고 얼굴 전체를 부드럽게 닦습니다.",
  "Follow with a water-based cleanser when your routine requires it.": "필요한 루틴에서는 워터 베이스 클렌저로 마무리합니다.",
  "Small bedrooms, bathrooms, desks and quiet personal spaces.": "작은 침실, 욕실, 책상과 조용한 개인 공간.",
  "Living rooms, reception desks, studios and hospitality spaces.": "거실, 리셉션 데스크, 스튜디오와 접객 공간.",
  "Evening cleansing when sunscreen or light makeup needs to be removed.": "선스크린이나 가벼운 메이크업을 지우는 저녁 클렌징.",
  "Morning cleansing and a simple everyday face-wash routine.": "아침 세안과 단순한 데일리 페이스 워시 루틴.",
  "Light makeup, quick cleansing and low-effort evening resets.": "가벼운 메이크업, 빠른 클렌징, 부담 적은 저녁 리셋.",
  "150ml": "150ml",
  "200ml": "200ml",
  "300ml": "300ml",
  "350g": "350g",
  "500g": "500g",
  "One-step cleansing for makeup and sunscreen routines.": "메이크업과 선스크린 루틴을 위한 원스텝 클렌징.",
  "Soft daily face wash for a clean, comfortable finish.": "깨끗하고 편안한 마무리를 위한 부드러운 데일리 세안.",
  "Light cleansing water for quick reset moments.": "빠른 리셋을 위한 가벼운 클렌징 워터.",
  "Compact volcanic stone scent object for smaller corners.": "작은 공간을 위한 콤팩트 화산석 향 오브제.",
  "Fuller volcanic stone diffuser for rooms and shared spaces.": "방과 공유 공간을 위한 더 큰 화산석 디퓨저.",
  "A gentle vegan foam oil selected for daily cleansing routines in warm, humid city weather.": "덥고 습한 도시 날씨의 데일리 클렌징 루틴을 위해 고른 순한 비건 폼 오일입니다.",
  "A soft foaming cleanser for everyday wash routines, selected for simple and clear skin care.": "단순하고 산뜻한 스킨케어를 위해 고른 데일리 세안용 부드러운 포밍 클렌저입니다.",
  "A lightweight cleansing water for light makeup, sunscreen residue and quick daily cleansing.": "가벼운 메이크업, 선스크린 잔여감, 빠른 데일리 클렌징에 맞춘 가벼운 클렌징 워터입니다.",
  "A compact Jeju volcanic stone diffuser with citrus oil, suited for desks, shelves and personal spaces.": "책상, 선반, 개인 공간에 어울리는 시트러스 오일 포함 콤팩트 제주 화산석 디퓨저입니다.",
  "A larger Jeju volcanic stone diffuser with citrus oil, suited for bedrooms, bathrooms and shared spaces.": "침실, 욕실, 공유 공간에 어울리는 시트러스 오일 포함 대형 제주 화산석 디퓨저입니다.",
  "Sensitive skin routine": "민감 피부 루틴",
  "No-rinse routine": "노린스 루틴",
  "Jeju volcanic stone": "제주 화산석",
  "Citrus oil 10ml included": "시트러스 오일 10ml 포함",
  "No flame": "불 사용 없음",
  "No electricity": "전기 사용 없음",
  "Reusable stone": "재사용 가능한 스톤",
  "For sunscreen and makeup removal": "선스크린과 메이크업 제거용",
  "Use as the first step of an evening cleansing routine": "저녁 클렌징 첫 단계로 사용",
  "For morning or evening cleansing": "아침 또는 저녁 세안용",
  "Pair with Foam Oil after sunscreen-heavy days": "선스크린을 많이 쓴 날 폼 오일과 함께 사용",
  "Apply with cotton pad": "화장솜에 적셔 사용",
  "Use for light makeup or a quick cleanse": "가벼운 메이크업 또는 빠른 클렌징에 사용",
  "Place the stones in the pot": "스톤을 용기에 담기",
  "Add citrus oil onto the stones": "스톤 위에 시트러스 오일 떨어뜨리기",
  "Refresh with a few more drops when needed": "필요할 때 몇 방울 더해 향 보충",
  "Hidden test item": "숨겨진 테스트 상품",
  "Live PayPal check": "Live PayPal 확인",
  "Refund after verification": "확인 후 환불",
};

const productText: Record<DisplayLanguage, TextDictionary> = {
  en: {},
  ko: productKo,
  zh: {},
  "zh-HK": {},
  "zh-TW": {},
  ja: {},
};

const productZh: TextDictionary = {
  ...Object.fromEntries(Object.entries(productKo).map(([key]) => [key, key])),
  "Volcanic Diffuser 350g": "火山石扩香 350g",
  "Volcanic Diffuser 500g": "火山石扩香 500g",
  "Vegan Foam Oil 150ml": "纯素泡沫油 150ml",
  "Vegan Foaming Cleanser 200ml": "纯素泡沫洁面 200ml",
  "Vegan Cleansing Water 300ml": "纯素卸妆水 300ml",
  "J'essence Vegan Foam Oil": "J'essence 纯素泡沫油",
  "J'essence Vegan Foaming Cleanser": "J'essence 纯素泡沫洁面",
  "J'essence Vegan Cleansing Water": "J'essence 纯素卸妆水",
  "Volcanic Stone Diffuser": "火山石扩香",
  "HOME SCENT": "家居香氛",
  "EVENING CARE": "晚间护理",
  "DAILY CARE": "日常护理",
  "LIGHT CARE": "轻柔护理",
  "Compact scent for small spaces": "适合小空间的紧凑香氛",
  "Scent object for larger rooms": "适合较大房间的香氛摆件",
  "Makeup and sunscreen cleanse": "清洁彩妆与防晒",
  "Soft everyday face wash": "柔和日常洁面",
  "Quick and gentle cleanse": "快速温和清洁",
  "Diffuser 350g": "扩香器 350g",
  "Diffuser 500g": "扩香器 500g",
  "Vegan Foam Oil": "纯素泡沫油",
  "Foaming Cleanser": "泡沫洁面",
  "Cleansing Water": "卸妆水",
  CARE: "护理",
  SCENT: "香氛",
  "A compact scent object made with porous Jeju volcanic scoria, a handmade vessel and 10ml citrus oil. Add scent only when you want it, without flame, reeds or electricity.": "由多孔济州火山岩、手工容器和 10ml 柑橘油组成的小型香氛摆件。不需火焰、藤枝或电力，只在需要时添加香气。",
  "A larger Jeju volcanic-stone diffuser for a stronger visual presence. Its porous scoria holds citrus oil and releases a light, clean scent without flame, reeds or power.": "尺寸更大的济州火山石扩香器，视觉存在感更强。多孔火山岩吸附柑橘油，无需火焰、藤枝或电力，也能释放清爽淡香。",
  "A vegan, pH 5.5 foam-oil cleanser designed for sunscreen, base makeup and a complete evening cleanse. Fragrance-free and made for a calm, simple routine.": "为防晒、底妆和完整晚间清洁设计的 pH 5.5 纯素泡沫油洁面。无香精，适合安静简单的日常护理。",
  "A fragrance-free vegan foaming cleanser with a pH 5.5 formula for a soft daily wash. The pump creates ready-to-use foam for a quick morning or evening routine.": "无香精 pH 5.5 纯素泡沫洁面，适合柔和日常清洁。按压即可获得泡沫，适合早晚快速使用。",
  "A fragrance-free vegan cleansing water for light makeup and quick resets. Its pH 5.5 formula offers a low-effort first cleansing step.": "适合淡妆和快速清洁的无香精纯素卸妆水。pH 5.5 配方可作为轻负担的第一步清洁。",
  "350g volcanic scoria": "350g 火山岩",
  "500g volcanic scoria": "500g 火山岩",
  "10ml citrus oil included": "含 10ml 柑橘油",
  "No flame or electricity": "无需火焰或电力",
  "Best for bedroom, bathroom or desk": "适合卧室、浴室或桌面",
  "Handmade vessel": "手工容器",
  "A larger object for home or business spaces": "适合居家或商业空间的大型摆件",
  "Vegan formula": "纯素配方",
  "pH 5.5": "pH 5.5",
  "Fragrance-free": "无香精",
  "For sunscreen and base makeup": "适合防晒和底妆",
  "Ready-to-use soft foam": "即用柔和泡沫",
  "For light makeup and quick cleansing": "适合淡妆和快速清洁",
  "Place the volcanic stone in its vessel.": "将火山石放入容器。",
  "Add 10-12 drops of citrus oil directly onto the stone.": "将 10-12 滴柑橘油直接滴在石头上。",
  "Let it absorb, then refresh with a few drops whenever needed.": "待其吸收，需要时再补几滴恢复香气。",
  "Arrange the volcanic stone in its vessel.": "将火山石摆放在容器中。",
  "Add 10-12 drops across the upper stones.": "在上层石头滴加 10-12 滴柑橘油。",
  "Refresh the scent only when you choose.": "只在需要时补充香气。",
  "Pump onto dry hands.": "按压到干燥手掌上。",
  "Massage gently over dry skin.": "在干燥肌肤上轻柔按摩。",
  "Add water to create foam, then rinse thoroughly.": "加水起泡后彻底冲洗。",
  "Wet your face with lukewarm water.": "用温水打湿面部。",
  "Pump the foam into your hand.": "将泡沫按压到手中。",
  "Massage gently and rinse thoroughly.": "轻柔按摩后彻底冲洗。",
  "Soak a cotton pad with cleansing water.": "用卸妆水浸湿化妆棉。",
  "Wipe gently across the face without rubbing.": "轻轻擦拭面部，避免用力摩擦。",
  "Follow with a water-based cleanser when your routine requires it.": "如护理流程需要，可再使用水性洁面。",
  "Small bedrooms, bathrooms, desks and quiet personal spaces.": "小卧室、浴室、桌面和安静的个人空间。",
  "Living rooms, reception desks, studios and hospitality spaces.": "客厅、接待台、工作室和接待空间。",
  "Evening cleansing when sunscreen or light makeup needs to be removed.": "需要卸除防晒或淡妆的晚间清洁。",
  "Morning cleansing and a simple everyday face-wash routine.": "早晨清洁和简单日常洗脸流程。",
  "Light makeup, quick cleansing and low-effort evening resets.": "淡妆、快速清洁和轻负担晚间整理。",
  "One-step cleansing for makeup and sunscreen routines.": "适合彩妆和防晒的单步清洁。",
  "Soft daily face wash for a clean, comfortable finish.": "柔和日常洁面，带来干净舒适的肤感。",
  "Light cleansing water for quick reset moments.": "适合快速整理的轻盈卸妆水。",
  "Compact volcanic stone scent object for smaller corners.": "适合小角落的紧凑火山石香氛摆件。",
  "Fuller volcanic stone diffuser for rooms and shared spaces.": "适合房间和共享空间的较大火山石扩香器。",
  "A gentle vegan foam oil selected for daily cleansing routines in warm, humid city weather.": "为温暖潮湿城市天气中的日常洁面而选的温和纯素泡沫油。",
  "A soft foaming cleanser for everyday wash routines, selected for simple and clear skin care.": "为简单清爽护理而选的柔和日常泡沫洁面。",
  "A lightweight cleansing water for light makeup, sunscreen residue and quick daily cleansing.": "适合淡妆、防晒残留和快速日常清洁的轻盈卸妆水。",
  "A compact Jeju volcanic stone diffuser with citrus oil, suited for desks, shelves and personal spaces.": "含柑橘油的小型济州火山石扩香器，适合桌面、架子和个人空间。",
  "A larger Jeju volcanic stone diffuser with citrus oil, suited for bedrooms, bathrooms and shared spaces.": "含柑橘油的较大济州火山石扩香器，适合卧室、浴室和共享空间。",
  Vegan: "纯素",
  "Sensitive skin routine": "敏感肌护理",
  "No-rinse routine": "免冲洗护理",
  "Jeju volcanic stone": "济州火山石",
  "Citrus oil 10ml included": "含 10ml 柑橘油",
  "No flame": "无需火焰",
  "No electricity": "无需电力",
  "Reusable stone": "可重复使用的石头",
  "For sunscreen and makeup removal": "用于卸除防晒和彩妆",
  "Use as the first step of an evening cleansing routine": "作为晚间清洁的第一步",
  "For morning or evening cleansing": "适合早晨或晚间清洁",
  "Pair with Foam Oil after sunscreen-heavy days": "防晒较多的日子可搭配泡沫油使用",
  "Apply with cotton pad": "配合化妆棉使用",
  "Use for light makeup or a quick cleanse": "用于淡妆或快速清洁",
  "Place the stones in the pot": "将石头放入容器",
  "Add citrus oil onto the stones": "将柑橘油滴在石头上",
  "Refresh with a few more drops when needed": "需要时再补几滴",
  "Hidden test item": "隐藏测试商品",
  "Live PayPal check": "Live PayPal 检查",
  "Refund after verification": "验证后退款",
};
productText.zh = productZh;
productText["zh-HK"] = {
  ...productZh,
  "Volcanic Diffuser 350g": "火山石擴香 350g",
  "Volcanic Diffuser 500g": "火山石擴香 500g",
  "Vegan Foam Oil 150ml": "純素泡沫油 150ml",
  "Vegan Foaming Cleanser 200ml": "純素泡沫潔面 200ml",
  "Vegan Cleansing Water 300ml": "純素卸妝水 300ml",
  CARE: "護理",
  SCENT: "香氛",
  "Compact scent for small spaces": "適合小空間的緊湊香氛",
  "Scent object for larger rooms": "適合較大房間的香氛擺件",
  "Makeup and sunscreen cleanse": "清潔彩妝與防曬",
  "Soft everyday face wash": "柔和日常潔面",
  "Quick and gentle cleanse": "快速溫和清潔",
  "A compact Jeju volcanic stone diffuser with citrus oil, suited for desks, shelves and personal spaces.": "含柑橘油的小型濟州火山石擴香器，適合桌面、層架和個人空間。",
  "A larger Jeju volcanic stone diffuser with citrus oil, suited for bedrooms, bathrooms and shared spaces.": "含柑橘油的較大濟州火山石擴香器，適合睡房、浴室和共享空間。",
  "Jeju volcanic stone": "濟州火山石",
  "Citrus oil 10ml included": "含 10ml 柑橘油",
  "No flame": "無需火焰",
  "No electricity": "無需電力",
  "Reusable stone": "可重複使用的石頭",
  "A compact scent object made with porous Jeju volcanic scoria, a handmade vessel and 10ml citrus oil. Add scent only when you want it, without flame, reeds or electricity.": "由多孔濟州火山岩、手工容器和 10ml 柑橘油組成的小型香氛擺件。無需火焰、藤枝或電力，只在需要時添加香氣。",
  "A larger Jeju volcanic-stone diffuser for a stronger visual presence. Its porous scoria holds citrus oil and releases a light, clean scent without flame, reeds or power.": "尺寸較大的濟州火山石擴香器，視覺存在感更強。多孔火山岩吸附柑橘油，無需火焰、藤枝或電力，也能釋放清爽淡香。",
  "A vegan, pH 5.5 foam-oil cleanser designed for sunscreen, base makeup and a complete evening cleanse. Fragrance-free and made for a calm, simple routine.": "為防曬、底妝和完整晚間清潔設計的 pH 5.5 純素泡沫油潔面。無香精，適合安靜簡單的日常護理。",
  "A fragrance-free vegan foaming cleanser with a pH 5.5 formula for a soft daily wash. The pump creates ready-to-use foam for a quick morning or evening routine.": "無香精 pH 5.5 純素泡沫潔面，適合柔和日常清潔。按壓即可使用泡沫，適合早晚快速護理。",
  "A fragrance-free vegan cleansing water for light makeup and quick resets. Its pH 5.5 formula offers a low-effort first cleansing step.": "適合淡妝和快速清潔的無香精純素卸妝水。pH 5.5 配方可作為低負擔的第一步清潔。",
  "350g volcanic scoria": "350g 火山岩",
  "500g volcanic scoria": "500g 火山岩",
  "10ml citrus oil included": "含 10ml 柑橘油",
  "No flame or electricity": "無需火焰或電力",
  "Best for bedroom, bathroom or desk": "適合睡房、浴室或桌面",
  "Handmade vessel": "手工容器",
  "A larger object for home or business spaces": "適合家居或商業空間的大型擺件",
  "Vegan formula": "純素配方",
  "Fragrance-free": "無香精",
  "For sunscreen and base makeup": "適合防曬和底妝",
  "Ready-to-use soft foam": "即用柔和泡沫",
  "For light makeup and quick cleansing": "適合淡妝和快速清潔",
  "Place the volcanic stone in its vessel.": "將火山石放入容器。",
  "Add 10-12 drops of citrus oil directly onto the stone.": "將 10-12 滴柑橘油直接滴在石頭上。",
  "Let it absorb, then refresh with a few drops whenever needed.": "待其吸收，需要時再補幾滴恢復香氣。",
  "Arrange the volcanic stone in its vessel.": "將火山石擺放在容器中。",
  "Add 10-12 drops across the upper stones.": "在上層石頭滴加 10-12 滴柑橘油。",
  "Refresh the scent only when you choose.": "只在需要時補充香氣。",
  "Pump onto dry hands.": "按壓到乾燥手掌上。",
  "Massage gently over dry skin.": "在乾燥肌膚上輕柔按摩。",
  "Add water to create foam, then rinse thoroughly.": "加水起泡後徹底沖洗。",
  "Wet your face with lukewarm water.": "用溫水打濕面部。",
  "Pump the foam into your hand.": "將泡沫按壓到手中。",
  "Massage gently and rinse thoroughly.": "輕柔按摩後徹底沖洗。",
  "Soak a cotton pad with cleansing water.": "用卸妝水浸濕化妝棉。",
  "Wipe gently across the face without rubbing.": "輕輕擦拭面部，避免用力摩擦。",
  "Follow with a water-based cleanser when your routine requires it.": "如護理流程需要，可再使用水性潔面。",
  "Small bedrooms, bathrooms, desks and quiet personal spaces.": "小睡房、浴室、桌面和安靜的個人空間。",
  "Living rooms, reception desks, studios and hospitality spaces.": "客廳、接待台、工作室和接待空間。",
  "Evening cleansing when sunscreen or light makeup needs to be removed.": "需要卸除防曬或淡妝的晚間清潔。",
  "Morning cleansing and a simple everyday face-wash routine.": "早晨清潔和簡單日常洗面流程。",
  "Light makeup, quick cleansing and low-effort evening resets.": "淡妝、快速清潔和低負擔晚間整理。",
  "One-step cleansing for makeup and sunscreen routines.": "適合彩妝和防曬的單步清潔。",
  "Soft daily face wash for a clean, comfortable finish.": "柔和日常潔面，帶來乾淨舒適的膚感。",
  "Light cleansing water for quick reset moments.": "適合快速整理的輕盈卸妝水。",
  "Compact volcanic stone scent object for smaller corners.": "適合小角落的緊湊火山石香氛擺件。",
  "Fuller volcanic stone diffuser for rooms and shared spaces.": "適合房間和共享空間的較大火山石擴香器。",
  "A gentle vegan foam oil selected for daily cleansing routines in warm, humid city weather.": "為溫暖潮濕城市天氣中的日常潔面而選的溫和純素泡沫油。",
  "A soft foaming cleanser for everyday wash routines, selected for simple and clear skin care.": "為簡單清爽護理而選的柔和日常泡沫潔面。",
  "A lightweight cleansing water for light makeup, sunscreen residue and quick daily cleansing.": "適合淡妝、防曬殘留和快速日常清潔的輕盈卸妝水。",
  Vegan: "純素",
  "Sensitive skin routine": "敏感肌護理",
  "No-rinse routine": "免沖洗護理",
  "For sunscreen and makeup removal": "用於卸除防曬和彩妝",
  "Use as the first step of an evening cleansing routine": "作為晚間清潔的第一步",
  "For morning or evening cleansing": "適合早晨或晚間清潔",
  "Pair with Foam Oil after sunscreen-heavy days": "防曬較多的日子可搭配泡沫油使用",
  "Apply with cotton pad": "配合化妝棉使用",
  "Use for light makeup or a quick cleanse": "用於淡妝或快速清潔",
  "Place the stones in the pot": "將石頭放入容器",
  "Add citrus oil onto the stones": "將柑橘油滴在石頭上",
  "Refresh with a few more drops when needed": "需要時再補幾滴",
};
productText["zh-TW"] = {
  ...productText["zh-HK"],
  "Vegan Foaming Cleanser 200ml": "純素泡沫洗面乳 200ml",
  "Vegan Cleansing Water 300ml": "純素卸妝水 300ml",
};
productText.ja = {
  ...Object.fromEntries(Object.entries(productKo).map(([key]) => [key, key])),
  "Volcanic Diffuser 350g": "ボルカニックディフューザー 350g",
  "Volcanic Diffuser 500g": "ボルカニックディフューザー 500g",
  "Vegan Foam Oil 150ml": "ヴィーガンフォームオイル 150ml",
  "Vegan Foaming Cleanser 200ml": "ヴィーガンフォーミングクレンザー 200ml",
  "Vegan Cleansing Water 300ml": "ヴィーガンクレンジングウォーター 300ml",
  "J'essence Vegan Foam Oil": "J'essence ヴィーガンフォームオイル",
  "J'essence Vegan Foaming Cleanser": "J'essence ヴィーガンフォーミングクレンザー",
  "J'essence Vegan Cleansing Water": "J'essence ヴィーガンクレンジングウォーター",
  "Volcanic Stone Diffuser": "ボルカニックストーンディフューザー",
  "HOME SCENT": "ホームセント",
  "EVENING CARE": "イブニングケア",
  "DAILY CARE": "デイリーケア",
  "LIGHT CARE": "ライトケア",
  "Compact scent for small spaces": "小さな空間向けのコンパクトな香り",
  "Scent object for larger rooms": "広めの部屋向けの香りのオブジェ",
  "Makeup and sunscreen cleanse": "メイクと日焼け止めのクレンジング",
  "Soft everyday face wash": "毎日のやさしい洗顔",
  "Quick and gentle cleanse": "すばやくやさしいクレンジング",
  "Diffuser 350g": "ディフューザー 350g",
  "Diffuser 500g": "ディフューザー 500g",
  "Vegan Foam Oil": "ヴィーガンフォームオイル",
  "Foaming Cleanser": "フォーミングクレンザー",
  "Cleansing Water": "クレンジングウォーター",
  CARE: "ケア",
  SCENT: "香り",
  "A compact scent object made with porous Jeju volcanic scoria, a handmade vessel and 10ml citrus oil. Add scent only when you want it, without flame, reeds or electricity.": "多孔質の済州火山スコリア、手作りの器、10mlのシトラスオイルで構成したコンパクトな香りのオブジェです。火、リード、電気を使わず、必要な時だけ香りを足せます。",
  "A larger Jeju volcanic-stone diffuser for a stronger visual presence. Its porous scoria holds citrus oil and releases a light, clean scent without flame, reeds or power.": "存在感のある大きめの済州火山石ディフューザーです。多孔質の石がシトラスオイルを含み、火、リード、電源なしで軽やかな香りを放ちます。",
  "A vegan, pH 5.5 foam-oil cleanser designed for sunscreen, base makeup and a complete evening cleanse. Fragrance-free and made for a calm, simple routine.": "日焼け止め、ベースメイク、夜のしっかりクレンジング向けに設計した pH 5.5 のヴィーガンフォームオイルクレンザーです。無香料で、落ち着いたシンプルなルーティンに合わせています。",
  "A fragrance-free vegan foaming cleanser with a pH 5.5 formula for a soft daily wash. The pump creates ready-to-use foam for a quick morning or evening routine.": "pH 5.5 処方の無香料ヴィーガンフォーミングクレンザーです。ポンプでそのまま使える泡が出て、朝晩の洗顔をすばやく整えます。",
  "A fragrance-free vegan cleansing water for light makeup and quick resets. Its pH 5.5 formula offers a low-effort first cleansing step.": "軽いメイクや素早いリセットに使える無香料ヴィーガンクレンジングウォーターです。pH 5.5 処方で、負担の少ない最初のクレンジングステップになります。",
  "350g volcanic scoria": "350g 火山スコリア",
  "500g volcanic scoria": "500g 火山スコリア",
  "10ml citrus oil included": "10ml シトラスオイル付き",
  "No flame or electricity": "火や電気は不要",
  "Best for bedroom, bathroom or desk": "寝室、浴室、デスクにおすすめ",
  "Handmade vessel": "手作りの器",
  "A larger object for home or business spaces": "住空間や業務空間向けの大きめオブジェ",
  "Vegan formula": "ヴィーガン処方",
  "pH 5.5": "pH 5.5",
  "Fragrance-free": "無香料",
  "For sunscreen and base makeup": "日焼け止めとベースメイクに",
  "Ready-to-use soft foam": "そのまま使えるやわらかな泡",
  "For light makeup and quick cleansing": "軽いメイクと素早いクレンジングに",
  "Place the volcanic stone in its vessel.": "火山石を器に入れます。",
  "Add 10-12 drops of citrus oil directly onto the stone.": "シトラスオイルを石に直接10-12滴垂らします。",
  "Let it absorb, then refresh with a few drops whenever needed.": "吸収させ、必要な時に数滴足して香りを戻します。",
  "Arrange the volcanic stone in its vessel.": "火山石を器に並べます。",
  "Add 10-12 drops across the upper stones.": "上部の石に10-12滴垂らします。",
  "Refresh the scent only when you choose.": "必要な時だけ香りを足します。",
  "Pump onto dry hands.": "乾いた手に取ります。",
  "Massage gently over dry skin.": "乾いた肌になじませます。",
  "Add water to create foam, then rinse thoroughly.": "水を加えて泡立て、よくすすぎます。",
  "Wet your face with lukewarm water.": "ぬるま湯で顔を濡らします。",
  "Pump the foam into your hand.": "泡を手に取ります。",
  "Massage gently and rinse thoroughly.": "やさしくなじませ、よくすすぎます。",
  "Soak a cotton pad with cleansing water.": "コットンにクレンジングウォーターを含ませます。",
  "Wipe gently across the face without rubbing.": "こすらず顔全体をやさしく拭き取ります。",
  "Follow with a water-based cleanser when your routine requires it.": "必要に応じて水系クレンザーで仕上げます。",
  "Small bedrooms, bathrooms, desks and quiet personal spaces.": "小さな寝室、浴室、デスク、静かな個人空間。",
  "Living rooms, reception desks, studios and hospitality spaces.": "リビング、受付デスク、スタジオ、接客空間。",
  "Evening cleansing when sunscreen or light makeup needs to be removed.": "日焼け止めや軽いメイクを落とす夜のクレンジング。",
  "Morning cleansing and a simple everyday face-wash routine.": "朝の洗顔とシンプルな毎日のフェイスウォッシュ。",
  "Light makeup, quick cleansing and low-effort evening resets.": "軽いメイク、素早いクレンジング、手軽な夜のリセット。",
  "One-step cleansing for makeup and sunscreen routines.": "メイクと日焼け止め向けのワンステップクレンジング。",
  "Soft daily face wash for a clean, comfortable finish.": "清潔で快適な仕上がりのためのやさしい日常洗顔。",
  "Light cleansing water for quick reset moments.": "素早いリセットに使える軽いクレンジングウォーター。",
  "Compact volcanic stone scent object for smaller corners.": "小さな場所向けのコンパクトな火山石香りオブジェ。",
  "Fuller volcanic stone diffuser for rooms and shared spaces.": "部屋や共有空間向けの大きめ火山石ディフューザー。",
  "A gentle vegan foam oil selected for daily cleansing routines in warm, humid city weather.": "蒸し暑い都市の毎日のクレンジングに合わせて選んだ、やさしいヴィーガンフォームオイルです。",
  "A soft foaming cleanser for everyday wash routines, selected for simple and clear skin care.": "シンプルで清潔感のあるスキンケアに合わせて選んだ、毎日のやさしい泡洗顔です。",
  "A lightweight cleansing water for light makeup, sunscreen residue and quick daily cleansing.": "軽いメイク、日焼け止め残り、素早い日常クレンジングに向いた軽いクレンジングウォーターです。",
  "A compact Jeju volcanic stone diffuser with citrus oil, suited for desks, shelves and personal spaces.": "デスク、棚、個人空間に合う、シトラスオイル付きのコンパクトな済州火山石ディフューザーです。",
  "A larger Jeju volcanic stone diffuser with citrus oil, suited for bedrooms, bathrooms and shared spaces.": "寝室、浴室、共有空間に合う、シトラスオイル付きの大きめ済州火山石ディフューザーです。",
  Vegan: "ヴィーガン",
  "Sensitive skin routine": "敏感肌ルーティン",
  "No-rinse routine": "洗い流し不要ルーティン",
  "Jeju volcanic stone": "済州火山石",
  "Citrus oil 10ml included": "10ml シトラスオイル付き",
  "No flame": "火を使わない",
  "No electricity": "電気を使わない",
  "Reusable stone": "繰り返し使える石",
  "For sunscreen and makeup removal": "日焼け止めとメイク落としに",
  "Use as the first step of an evening cleansing routine": "夜のクレンジングの最初のステップに",
  "For morning or evening cleansing": "朝または夜の洗顔に",
  "Pair with Foam Oil after sunscreen-heavy days": "日焼け止めを多く使った日はフォームオイルと併用",
  "Apply with cotton pad": "コットンで使用",
  "Use for light makeup or a quick cleanse": "軽いメイクや素早いクレンジングに",
  "Place the stones in the pot": "石を容器に入れる",
  "Add citrus oil onto the stones": "石にシトラスオイルを垂らす",
  "Refresh with a few more drops when needed": "必要な時に数滴足す",
  "Hidden test item": "非公開テスト商品",
  "Live PayPal check": "Live PayPal 確認",
  "Refund after verification": "確認後に返金",
};

function dynamicText(language: DisplayLanguage, english: string) {
  if (language === "en") return undefined;
  const country = (code: string) => countryNames[language][code === "HK" ? "HK" : "SG"];
  const dict = commonText[language];
  const zh = (simplified: string, traditional: string) => (language === "zh" ? simplified : traditional);

  const announcement = english.match(/^(SINGAPORE|HONG KONG) BULK ORDER(?: ONLY)? - PAYPAL (SGD|HKD)(?: - (SHOPEE RETAIL AVAILABLE|SHIPS FROM KOREA))$/);
  if (announcement) {
    const name = announcement[1] === "SINGAPORE" ? country("SG") : country("HK");
    const only = announcement[1] === "HONG KONG";
    if (language === "ko") return only ? `${name} 대량주문 전용 - PayPal ${announcement[2]} - 한국 발송` : `${name} 대량주문 - PayPal ${announcement[2]} - Shopee 개별 구매 가능`;
    if (language === "ja") return only ? `${name} 一括注文のみ - PayPal ${announcement[2]} - 韓国発送` : `${name} 一括注文 - PayPal ${announcement[2]} - Shopee 小売対応`;
    return only ? `${name}批量訂購專用 - PayPal ${announcement[2]} - 韓國發貨` : `${name}批量訂購 - PayPal ${announcement[2]} - 可使用 Shopee 零售`;
  }

  const footer = english.match(/^Pieces of Jeju Island,\narriving in (Singapore|Hong Kong)\.$/);
  if (footer) {
    if (language === "ko") return `제주의 조각이\n${country(footer[1] === "Hong Kong" ? "HK" : "SG")}에 도착합니다.`;
    if (language === "ja") return `済州島のかけらを\n${country(footer[1] === "Hong Kong" ? "HK" : "SG")}へ。`;
    return `濟州島的片段，\n送到${country(footer[1] === "Hong Kong" ? "HK" : "SG")}。`;
  }

  const checkoutNote = english.match(/^(Free Singapore|Hong Kong) EMS shipping included$/);
  if (checkoutNote) {
    const name = checkoutNote[1] === "Hong Kong" ? country("HK") : country("SG");
    if (language === "ko") return `${name} EMS 배송비 포함`;
    if (language === "ja") return `${name} EMS 配送料込み`;
    return `已包含${name} EMS 運費`;
  }

  const currencyUnit = english.match(/^(SGD|HKD) BULK UNIT PRICE$/);
  if (currencyUnit) return `${currencyUnit[1]} ${dict["Bulk unit"] || "批量单价"}`;

  const orderFrom = english.match(/^Order from (\d+) units, in steps of (\d+)\.(?: Available up to (\d+) units\.)?$/);
  if (orderFrom) {
    const max = orderFrom[3];
    if (language === "ko") return `${orderFrom[1]}개부터 ${orderFrom[2]}개 단위로 주문합니다.${max ? ` 최대 ${max}개까지 가능합니다.` : ""}`;
    if (language === "ja") return `${orderFrom[1]}個から${orderFrom[2]}個単位で注文できます。${max ? `最大${max}個まで可能です。` : ""}`;
    return `${orderFrom[1]}件起訂，每${orderFrom[2]}件為一步進。${max ? `最多可訂${max}件。` : ""}`;
  }

  const minimum = english.match(/^Minimum (\d+)\. Increase in steps of (\d+)\.$/);
  if (minimum) {
    if (language === "ko") return `최소 ${minimum[1]}개. ${minimum[2]}개 단위로 늘릴 수 있습니다.`;
    if (language === "ja") return `最小${minimum[1]}個。${minimum[2]}個単位で増やせます。`;
    return `最低${minimum[1]}件。每${minimum[2]}件增加。`;
  }

  const countryAvailable = english.match(/^Orders are currently available for delivery within (.+)\.$/);
  if (countryAvailable) {
    if (language === "ko") return `현재 ${countryAvailable[1]} 배송 주문만 가능합니다.`;
    if (language === "ja") return `現在、${countryAvailable[1]}向け配送注文のみ対応しています。`;
    return `目前僅支援配送至${countryAvailable[1]}的訂單。`;
  }

  const paypalCurrency = english.match(/^PayPal Sandbox payment\. Currency: (SGD|HKD)\.$/);
  if (paypalCurrency) {
    if (language === "ko") return `PayPal Sandbox 결제입니다. 통화: ${paypalCurrency[1]}.`;
    if (language === "ja") return `PayPal Sandbox 決済です。通貨: ${paypalCurrency[1]}。`;
    return `PayPal Sandbox 付款。貨幣：${paypalCurrency[1]}。`;
  }

  const savedRef = english.match(/^Your message has been saved\. Reference: (.+)$/);
  if (savedRef) {
    if (language === "ko") return `문의가 저장되었습니다. 접수번호: ${savedRef[1]}`;
    if (language === "ja") return `お問い合わせを保存しました。受付番号: ${savedRef[1]}`;
    return `訊息已儲存。參考編號：${savedRef[1]}`;
  }

  const shippingTo = english.match(/^SHIPPING TO (.+)$/);
  if (shippingTo) {
    if (language === "ko") return `${shippingTo[1]} 배송`;
    if (language === "ja") return `${shippingTo[1]} への配送`;
    return `配送至 ${shippingTo[1]}`;
  }

  const payThrough = english.match(/^Pay through PayPal in (SGD|HKD)$/);
  if (payThrough) {
    if (language === "ko") return `PayPal ${payThrough[1]} 결제`;
    if (language === "ja") return `PayPal ${payThrough[1]} 決済`;
    return `使用 PayPal 以 ${payThrough[1]} 付款`;
  }

  if (
    english ===
    "Bulk prices are lower because they exclude marketplace fees applied on Shopee. Ordering directly here passes those savings on to you."
  ) {
    if (language === "ko") return "대량주문가는 Shopee 마켓 수수료를 제외해 구성합니다. 직접 주문하면 그 차액을 고객 가격에 반영합니다.";
    if (language === "ja") return "一括注文価格は Shopee のマーケット手数料を除いて設定しています。直接注文ではその分を価格に反映します。";
    return zh(
      "批量价格不包含 Shopee 平台手续费。直接订购时，这部分差额会反映到客户价格中。",
      "批量價格不包含 Shopee 平台手續費。直接訂購時，這部分差額會反映到客戶價格中。",
    );
  }

  const fixedMarketPrice = english.match(/^This market uses direct bulk checkout only\. The displayed price is the fixed (SGD|HKD|USD|TWD) bulk unit price\.$/);
  if (fixedMarketPrice) {
    if (language === "ko") return `이 판매 지역은 직접 대량주문만 운영합니다. 표시 금액은 고정 ${fixedMarketPrice[1]} 대량주문 단가입니다.`;
    if (language === "ja") return `この販売地域は直接一括注文のみ対応します。表示価格は固定の${fixedMarketPrice[1]}一括注文単価です。`;
    return zh(
      `此销售地区仅支持直接批量结账。显示价格为固定 ${fixedMarketPrice[1]} 批量单价。`,
      `此銷售地區僅支援直接批量結帳。顯示價格為固定 ${fixedMarketPrice[1]} 批量單價。`,
    );
  }

  if (english === "For receipt, company delivery name or special handling requests, write here.") {
    if (language === "ko") return "영수증명, 회사 배송명, 별도 요청사항이 있으면 적어주세요.";
    if (language === "ja") return "領収書名、会社配送名、特別な取り扱い希望があればこちらに記入してください。";
    return zh("如需收据名称、公司收货名或特别处理要求，请填写在这里。", "如需收據名稱、公司收貨名或特別處理要求，請填寫在這裡。");
  }

  if (english === "I confirm that my email, phone number, shipping address, product quantity and final payment amount are correct.") {
    if (language === "ko") return "이메일, 전화번호, 배송 주소, 상품 수량, 최종 결제 금액이 정확한 것을 확인했습니다.";
    if (language === "ja") return "メール、電話番号、配送先、商品数量、最終決済金額が正しいことを確認しました。";
    return zh(
      "我确认电子邮件、电话号码、配送地址、商品数量和最终付款金额均正确。",
      "我確認電子郵件、電話號碼、配送地址、商品數量和最終付款金額均正確。",
    );
  }

  if (english === "If checkout does not complete, email these purchase conditions to hondit. We will reply with a direct PayPal payment link.") {
    if (language === "ko") return "결제가 완료되지 않으면 현재 구매 조건을 hondit 메일로 보내주세요. 확인 후 직접 결제 가능한 PayPal 링크를 답장드립니다.";
    if (language === "ja") return "決済が完了しない場合は、この購入条件を hondit にメールしてください。確認後、直接支払い用の PayPal リンクを返信します。";
    return zh(
      "如果结账未完成，请将当前购买条件发送邮件给 hondit。确认后，我们会回复可直接付款的 PayPal 链接。",
      "如果結帳未完成，請將目前購買條件發送電郵給 hondit。確認後，我們會回覆可直接付款的 PayPal 連結。",
    );
  }

  if (english === "Send the product, quantity, payment total and delivery details by email. hondit will check the order and reply with a direct PayPal link.") {
    if (language === "ko") return "상품, 수량, 결제금액, 배송정보를 메일로 보내주세요. hondit이 주문 내용을 확인한 뒤 직접 결제 가능한 PayPal 링크를 답장드립니다.";
    if (language === "ja") return "商品、数量、支払い合計、配送情報をメールでお送りください。hondit が注文内容を確認し、直接支払い用の PayPal リンクを返信します。";
    return zh(
      "请通过邮件发送商品、数量、付款总额和配送信息。hondit 会确认订单并回复直接 PayPal 付款链接。",
      "請透過電郵發送商品、數量、付款總額和配送資訊。hondit 會確認訂單並回覆直接 PayPal 付款連結。",
    );
  }

  return undefined;
}

const koCleanOverrides: TextDictionary = {
  Home: "홈",
  "Explore Jeju": "제주 보기",
  Products: "상품",
  "Bulk Orders": "대량 주문",
  Shipping: "배송",
  Contact: "문의",
  Menu: "메뉴",
  "Shop on Shopee ->": "Shopee에서 구매 ->",
  "Bulk checkout ->": "대량 결제 ->",
  "A student-led brand based at": "제주대학교 기반 학생 운영 브랜드",
  "Jeju National University.": "제주대학교.",
  "Student-led project based at Jeju National University.": "제주대학교 기반 학생 운영 프로젝트.",
  EXPLORE: "탐색",
  CONNECT: "연결",
  "TRUST & SUPPORT": "신뢰와 지원",
  "Asia to Jeju": "아시아에서 제주까지",
  "Delivery guide": "배송 안내",
  "Refund support": "환불 안내",
  Email: "이메일",
  Refund: "환불",
  Privacy: "개인정보",
  Terms: "이용약관",
  "Admin sign-in": "관리자 로그인",
  "JEJU NATIONAL UNIVERSITY - STUDENT-LED": "제주대학교 · 학생 운영",
  "Jeju, held in": "제주를 담은",
  "everyday ritual.": "매일의 리추얼.",
  "FOR INDIVIDUALS": "개인 구매",
  "Buy on Shopee": "Shopee 구매",
  "FOR BUSINESSES AND GROUPS": "사업자 및 단체",
  "Bulk Checkout": "대량 결제",
  "Bulk only": "대량 주문 전용",
  "Jeju-based student team": "제주 기반 학생팀",
  "Official Shopee route": "공식 Shopee 경로",
  "Direct bulk checkout": "직접 대량 결제",
  ORIGIN: "기원",
  RETAIL: "리테일",
  ROUTE: "경로",
  DELIVERY: "배송",
  PAYMENT: "결제",
  "Jeju National University": "제주대학교",
  "Student-led and based in Jeju City.": "제주시 기반 학생 운영 프로젝트입니다.",
  "Live price, vouchers and protected checkout.": "실시간 가격, 바우처, 보호 결제를 이용합니다.",
  "Bulk only direct route": "대량 주문 전용 직접 경로",
  "Direct bulk orders dispatch from Korea after PayPal capture.": "대량 주문은 PayPal 결제 완료 후 한국에서 발송 준비됩니다.",
  "Two clear routes": "두 가지 구매 경로",
  "SEA - STONE - WIND": "바다 · 돌 · 바람",
  "A place you can feel,": "느낄 수 있는 장소,",
  "before it becomes a ritual.": "리추얼이 되기 전에.",
  "Our edit begins with Jeju's quiet materials: moving water, porous volcanic stone and air that never quite stands still.": "hondit의 셀렉션은 움직이는 물, 다공성 화산석, 멈추지 않는 공기처럼 조용한 제주 소재에서 시작됩니다.",
  "Explore our Jeju ->": "우리의 제주 보기 ->",
  "SHOP BY RITUAL": "리추얼별 보기",
  "Find your": "나에게 맞는",
  "everyday fit.": "일상의 선택.",
  "VOLCANIC DIFFUSER": "화산석 디퓨저",
  "No flame. No electricity.": "불꽃 없이. 전기 없이.",
  "Refresh the scent whenever you choose.": "원할 때 향을 다시 더하세요.",
  "Apply the citrus fragrance oil directly to the porous Jeju volcanic stone. The stone absorbs the oil and releases the scent naturally-without reed sticks, heat or electricity.": "시트러스 프래그런스 오일을 제주 화산석에 직접 떨어뜨립니다. 스틱, 열, 전기 없이 돌이 오일을 머금고 자연스럽게 향을 냅니다.",
  "Jeju Volcanic Stone Diffuser": "제주 화산석 디퓨저",
  "Volcanic stone / Citrus fragrance oil / Ceramic bowl": "화산석 / 시트러스 프래그런스 오일 / 세라믹 볼",
  "Flameless / No electricity / Refreshable scent": "무화염 / 무전기 / 다시 채우는 향",
  "ADD 10-12 DROPS": "10-12방울 떨어뜨리기",
  "Apply the fragrance oil directly onto the volcanic stone.": "프래그런스 오일을 화산석에 직접 떨어뜨립니다.",
  "LET IT ABSORB": "흡수시키기",
  "Allow the porous stone to absorb the oil naturally.": "다공성 돌이 오일을 자연스럽게 머금도록 둡니다.",
  "REFRESH AS NEEDED": "필요할 때 보충",
  "Add a few more drops when the scent becomes lighter.": "향이 옅어지면 몇 방울 더해 주세요.",
  "A REAL ROUTE TO OUR ORIGIN": "우리의 기원을 따라가는 실제 경로",
  "Asia to Korea.": "아시아에서 한국으로.",
  "Korea to Jeju.": "한국에서 제주로.",
  "Three clear geographic views locate hondit without covering the map: accurate country boundaries, South Korea as the only highlighted country, then real coordinates on Jeju.": "세 단계의 지리 화면으로 hondit의 위치를 명확히 보여줍니다. 정확한 국가 경계, 한국만 강조한 지도, 그리고 제주 실제 좌표를 순서대로 확인합니다.",
  "Map navigation": "지도 단계",
  Asia: "아시아",
  "Regional context": "지역 맥락",
  "South Korea": "한국",
  "Find Jeju below": "아래에서 제주 찾기",
  "Jeju Island": "제주도",
  "Explore six places": "여섯 장소 보기",
  "REGIONAL CONTEXT": "지역 맥락",
  "Find South Korea without losing Asia.": "아시아 안에서 한국을 찾습니다.",
  "Country boundaries remain neutral. South Korea is the only highlighted country and is selectable.": "국가 경계는 중립적으로 두고, 한국만 강조해 선택할 수 있습니다.",
  "Open South Korea map": "한국 지도 열기",
  "A CLOSER VIEW": "더 가까운 보기",
  "Jeju sits below the peninsula.": "제주는 한반도 남쪽에 있습니다.",
  "The province outline is real map data. Select the orange Jeju Island shape to continue.": "실제 행정구역 지도 데이터를 사용했습니다. 주황색 제주도를 선택해 계속하세요.",
  "Back to Asia": "아시아로 돌아가기",
  "Map of South Korea with Jeju highlighted": "제주가 강조된 한국 지도",
  "Open Jeju Island map": "제주도 지도 열기",
  "SOUTH KOREA": "한국",
  "JEJU STRAIT": "제주 해협",
  "BEYOND THE MAP": "지도 너머",
  "What Korea is known for": "한국을 떠올리게 하는 것",
  "What the world knows Korea for.": "세계가 한국을 기억하는 방식.",
  "K-Beauty": "K-뷰티",
  "DAILY RITUAL": "데일리 리추얼",
  "Layered cleansing and gentle skincare made Korea globally recognisable.": "겹겹의 클렌징과 섬세한 스킨케어는 한국을 세계적으로 알린 일상 문화입니다.",
  "Korean Food": "한국 음식",
  "MARKET ENERGY": "시장 에너지",
  "Street markets and shared tables make food immediate and social.": "시장과 함께 나누는 식탁은 한국 음식을 생생하고 사회적인 경험으로 만듭니다.",
  Seoul: "서울",
  CITY: "도시",
  "A fast capital where older places meet new culture.": "오래된 장소와 새 문화가 만나는 빠른 수도입니다.",
  Heritage: "전통",
  PLACE: "장소",
  "Hanbok and historic palaces remain visible in everyday Seoul.": "한복과 궁궐은 오늘의 서울에서도 여전히 보이는 문화입니다.",
  "Back to South Korea": "한국 지도로 돌아가기",
  "JEJU ISLAND FIELD GUIDE": "제주 필드 가이드",
  "Six places, one clear origin": "여섯 장소, 하나의 분명한 기원",
  "REAL COORDINATES": "실제 좌표",
  "Interactive map of Jeju Island": "제주도 인터랙티브 지도",
  "Jeju Island outline": "제주도 윤곽",
  View: "보기",
  "PROJECT ORIGIN": "프로젝트 기원",
  "The Ara Campus is where hondit's independent student-led cross-border commerce project began.": "아라캠퍼스는 hondit의 독립 학생 운영 크로스보더 커머스 프로젝트가 시작된 곳입니다.",
  "102 Jejudaehak-ro, Jeju-si, Jeju 63243": "제주특별자치도 제주시 제주대학로 102, 63243",
  "Official campus guide": "공식 캠퍼스 안내",
  "Our Jeju story": "우리의 제주 이야기",
  "Choose a Jeju place": "제주 장소 선택",
  "hondit home": "hondit home",
  Hallasan: "한라산",
  "VOLCANIC HEART": "화산의 중심",
  "The mountain at Jeju's centre anchors the island's volcanic landscape and hondit's stone-led visual language.": "섬 중심의 산은 제주의 화산 지형과 hondit의 돌 중심 시각 언어를 지탱합니다.",
  "Hallasan National Park, Jeju": "제주 한라산국립공원",
  "UNESCO World Heritage": "유네스코 세계유산",
  "Woljeongri Beach": "월정리 해변",
  Woljeongri: "월정리",
  "CLEAR COAST": "맑은 해안",
  "Pale sand, emerald water and open coastal light express the fresh, quiet side of Jeju.": "밝은 모래, 에메랄드빛 물, 열린 해안의 빛이 제주의 맑고 조용한 면을 보여줍니다.",
  "Bijarim Forest": "비자림",
  Bijarim: "비자림",
  "SLOW FOREST": "느린 숲",
  "A protected old-growth grove whose shaded paths bring a slower, softer rhythm to the island story.": "보호받는 오래된 숲길은 제주의 이야기에 느리고 부드러운 리듬을 더합니다.",
  "Seongsan Ilchulbong": "성산일출봉",
  Seongsan: "성산",
  "EASTERN EDGE": "동쪽 끝",
  "The ocean-facing tuff cone is one of Jeju's clearest meetings of volcanic stone, wind and sea.": "바다를 향한 응회구는 화산석, 바람, 바다가 만나는 제주의 또렷한 장면입니다.",
  "Jusangjeolli Cliff": "주상절리",
  Jusangjeolli: "주상절리",
  "STONE AND SEA": "돌과 바다",
  "Dark columnar rock meeting the ocean gives the volcanic diffuser its most direct landscape reference.": "검은 기둥 모양 암석과 바다가 만나는 풍경은 화산석 디퓨저의 가장 직접적인 레퍼런스입니다.",
  "Visit Jeju guide": "제주 안내 보기",
};

const zhCleanOverrides: TextDictionary = {
  Home: "首页",
  "Explore Jeju": "探索济州",
  Products: "产品",
  "Bulk Orders": "批量订购",
  Shipping: "配送",
  Contact: "联系",
  Menu: "菜单",
  "Shop on Shopee ->": "前往 Shopee ->",
  "Bulk checkout ->": "批量结账 ->",
  "A student-led brand based at": "源自济州大学的学生运营品牌",
  "Jeju National University.": "济州大学。",
  "Student-led project based at Jeju National University.": "基于济州大学的学生运营项目。",
  EXPLORE: "探索",
  CONNECT: "联系",
  "TRUST & SUPPORT": "信任与支持",
  "Asia to Jeju": "从亚洲到济州",
  "Delivery guide": "配送指南",
  "Refund support": "退款支持",
  Email: "电子邮件",
  Refund: "退款",
  Privacy: "隐私",
  Terms: "条款",
  "Admin sign-in": "管理员登录",
  "JEJU NATIONAL UNIVERSITY - STUDENT-LED": "济州大学 · 学生运营",
  "Jeju, held in": "把济州带进",
  "everyday ritual.": "每日仪式。",
  "FOR INDIVIDUALS": "个人购买",
  "Buy on Shopee": "Shopee 购买",
  "FOR BUSINESSES AND GROUPS": "企业与团体",
  "Bulk Checkout": "批量结账",
  "Bulk only": "仅批量订购",
  "Jeju-based student team": "济州学生运营团队",
  "Official Shopee route": "官方 Shopee 渠道",
  "Direct bulk checkout": "直接批量结账",
  ORIGIN: "起源",
  RETAIL: "零售",
  ROUTE: "渠道",
  DELIVERY: "配送",
  PAYMENT: "支付",
  "Jeju National University": "济州大学",
  "Student-led and based in Jeju City.": "由济州市的学生团队运营。",
  "Live price, vouchers and protected checkout.": "实时价格、优惠券与受保护结账。",
  "Bulk only direct route": "仅批量直接渠道",
  "Direct bulk orders dispatch from Korea after PayPal capture.": "批量订单在 PayPal 完成扣款后从韩国发货。",
  "Two clear routes": "两种清晰购买方式",
  "SEA - STONE - WIND": "海 · 石 · 风",
  "A place you can feel,": "可被感受的地方，",
  "before it becomes a ritual.": "在成为仪式之前。",
  "Our edit begins with Jeju's quiet materials: moving water, porous volcanic stone and air that never quite stands still.": "hondit 的选择从济州安静的素材开始：流动的水、多孔火山石，以及从不完全静止的空气。",
  "Explore our Jeju ->": "探索我们的济州 ->",
  "SHOP BY RITUAL": "按日常仪式选购",
  "Find your": "找到你的",
  "everyday fit.": "日常选择。",
  "VOLCANIC DIFFUSER": "火山石香薰",
  "No flame. No electricity.": "无明火。无电力。",
  "Refresh the scent whenever you choose.": "想要时即可补充香气。",
  "Apply the citrus fragrance oil directly to the porous Jeju volcanic stone. The stone absorbs the oil and releases the scent naturally-without reed sticks, heat or electricity.": "将柑橘香氛油直接滴在济州多孔火山石上。石头吸收油分并自然释放香气，无需藤条、加热或电力。",
  "Jeju Volcanic Stone Diffuser": "济州火山石香薰",
  "Volcanic stone / Citrus fragrance oil / Ceramic bowl": "火山石 / 柑橘香氛油 / 陶瓷碗",
  "Flameless / No electricity / Refreshable scent": "无明火 / 无电力 / 可补充香气",
  "ADD 10-12 DROPS": "滴入 10-12 滴",
  "Apply the fragrance oil directly onto the volcanic stone.": "将香氛油直接滴在火山石上。",
  "LET IT ABSORB": "等待吸收",
  "Allow the porous stone to absorb the oil naturally.": "让多孔火山石自然吸收油分。",
  "REFRESH AS NEEDED": "按需补充",
  "Add a few more drops when the scent becomes lighter.": "香气变淡时再补几滴。",
  "A REAL ROUTE TO OUR ORIGIN": "通往起源的真实路线",
  "Asia to Korea.": "从亚洲到韩国。",
  "Korea to Jeju.": "从韩国到济州。",
  "Three clear geographic views locate hondit without covering the map: accurate country boundaries, South Korea as the only highlighted country, then real coordinates on Jeju.": "三个清晰地理视图呈现 hondit 的位置：准确国家边界、仅突出韩国，然后显示济州真实坐标。",
  "Map navigation": "地图导航",
  Asia: "亚洲",
  "Regional context": "区域背景",
  "South Korea": "韩国",
  "Find Jeju below": "在下方找到济州",
  "Jeju Island": "济州岛",
  "Explore six places": "探索六个地点",
  "REGIONAL CONTEXT": "区域背景",
  "Find South Korea without losing Asia.": "在亚洲范围内找到韩国。",
  "Country boundaries remain neutral. South Korea is the only highlighted country and is selectable.": "国家边界保持中性，只有韩国被突出并可选择。",
  "Open South Korea map": "打开韩国地图",
  "A CLOSER VIEW": "更近的视图",
  "Jeju sits below the peninsula.": "济州位于半岛南方。",
  "The province outline is real map data. Select the orange Jeju Island shape to continue.": "省级轮廓使用真实地图数据。选择橙色济州岛继续。",
  "Back to Asia": "返回亚洲",
  "Map of South Korea with Jeju highlighted": "突出济州的韩国地图",
  "Open Jeju Island map": "打开济州岛地图",
  "SOUTH KOREA": "韩国",
  "JEJU STRAIT": "济州海峡",
  "BEYOND THE MAP": "地图之外",
  "What Korea is known for": "韩国的代表印象",
  "What the world knows Korea for.": "世界认识韩国的方式。",
  "K-Beauty": "K-Beauty",
  "DAILY RITUAL": "日常仪式",
  "Layered cleansing and gentle skincare made Korea globally recognisable.": "分层清洁与温和护肤让韩国被全球认识。",
  "Korean Food": "韩国美食",
  "MARKET ENERGY": "市场活力",
  "Street markets and shared tables make food immediate and social.": "街头市场与共享餐桌让韩国美食更直接、更有社交感。",
  Seoul: "首尔",
  CITY: "城市",
  "A fast capital where older places meet new culture.": "一座旧场所与新文化相遇的快速首都。",
  Heritage: "传统",
  PLACE: "地点",
  "Hanbok and historic palaces remain visible in everyday Seoul.": "韩服与历史宫殿仍在首尔日常中可见。",
  "Back to South Korea": "返回韩国地图",
  "JEJU ISLAND FIELD GUIDE": "济州岛实地指南",
  "Six places, one clear origin": "六个地点，一个清晰起源",
  "REAL COORDINATES": "真实坐标",
  "Interactive map of Jeju Island": "济州岛互动地图",
  "Jeju Island outline": "济州岛轮廓",
  View: "查看",
  "PROJECT ORIGIN": "项目起源",
  "The Ara Campus is where hondit's independent student-led cross-border commerce project began.": "Ara 校区是 hondit 独立学生跨境商务项目开始的地方。",
  "102 Jejudaehak-ro, Jeju-si, Jeju 63243": "济州市济州大学路 102，63243",
  "Official campus guide": "官方校园指南",
  "Our Jeju story": "我们的济州故事",
  "Choose a Jeju place": "选择济州地点",
  "hondit home": "hondit home",
  Hallasan: "汉拿山",
  "VOLCANIC HEART": "火山之心",
  "The mountain at Jeju's centre anchors the island's volcanic landscape and hondit's stone-led visual language.": "位于岛中央的山支撑着济州的火山景观，也构成 hondit 以石为核心的视觉语言。",
  "Hallasan National Park, Jeju": "济州汉拿山国立公园",
  "UNESCO World Heritage": "联合国教科文组织世界遗产",
  "Woljeongri Beach": "月汀里海边",
  Woljeongri: "月汀里",
  "CLEAR COAST": "清澈海岸",
  "Pale sand, emerald water and open coastal light express the fresh, quiet side of Jeju.": "浅色沙滩、翡翠海水与开阔海光呈现济州清新安静的一面。",
  "Bijarim Forest": "榧子林",
  Bijarim: "榧子林",
  "SLOW FOREST": "慢节奏森林",
  "A protected old-growth grove whose shaded paths bring a slower, softer rhythm to the island story.": "受保护的古树林以阴凉小径带来更慢、更柔和的岛屿节奏。",
  "Seongsan Ilchulbong": "城山日出峰",
  Seongsan: "城山",
  "EASTERN EDGE": "东部边缘",
  "The ocean-facing tuff cone is one of Jeju's clearest meetings of volcanic stone, wind and sea.": "面向海洋的凝灰岩锥，是济州火山石、风与海最清晰的交汇。",
  "Jusangjeolli Cliff": "柱状节理",
  Jusangjeolli: "柱状节理",
  "STONE AND SEA": "石与海",
  "Dark columnar rock meeting the ocean gives the volcanic diffuser its most direct landscape reference.": "黑色柱状岩与海相遇，是火山石香薰最直接的景观参照。",
  "Visit Jeju guide": "查看济州指南",
};

const zhTraditionalCleanOverrides: TextDictionary = {
  ...zhCleanOverrides,
  Home: "首頁",
  "Explore Jeju": "探索濟州",
  Products: "產品",
  "Bulk Orders": "批量訂購",
  Shipping: "配送",
  Contact: "聯絡",
  Menu: "選單",
  "Shop on Shopee ->": "前往 Shopee ->",
  "Bulk checkout ->": "批量結帳 ->",
  "A student-led brand based at": "源自濟州大學的學生營運品牌",
  "Jeju National University.": "濟州大學。",
  "Student-led project based at Jeju National University.": "基於濟州大學的學生營運項目。",
  CONNECT: "聯絡",
  "TRUST & SUPPORT": "信任與支援",
  "Asia to Jeju": "從亞洲到濟州",
  "Delivery guide": "配送指南",
  "Refund support": "退款支援",
  Email: "電郵",
  Privacy: "私隱",
  Terms: "條款",
  "Admin sign-in": "管理員登入",
  "JEJU NATIONAL UNIVERSITY - STUDENT-LED": "濟州大學 · 學生營運",
  "Jeju, held in": "把濟州帶進",
  "FOR INDIVIDUALS": "個人購買",
  "FOR BUSINESSES AND GROUPS": "企業與團體",
  "Bulk Checkout": "批量結帳",
  "Bulk only": "僅限批量訂購",
  "Jeju-based student team": "濟州學生營運團隊",
  "Official Shopee route": "官方 Shopee 渠道",
  "Direct bulk checkout": "直接批量結帳",
  "Student-led and based in Jeju City.": "由濟州市的學生團隊營運。",
  "Live price, vouchers and protected checkout.": "即時價格、優惠券與受保障結帳。",
  "Direct bulk orders dispatch from Korea after PayPal capture.": "批量訂單在 PayPal 完成扣款後由韓國出貨。",
  "SEA - STONE - WIND": "海 · 石 · 風",
  "A place you can feel,": "可被感受的地方，",
  "Our edit begins with Jeju's quiet materials: moving water, porous volcanic stone and air that never quite stands still.": "hondit 的選品從濟州安靜的素材開始：流動的水、多孔火山石，以及從不完全靜止的空氣。",
  "Explore our Jeju ->": "探索我們的濟州 ->",
  "VOLCANIC DIFFUSER": "火山石香薰",
  "Apply the citrus fragrance oil directly to the porous Jeju volcanic stone. The stone absorbs the oil and releases the scent naturally-without reed sticks, heat or electricity.": "將柑橘香氛油直接滴在濟州多孔火山石上。石頭吸收油分並自然釋放香氣，無需藤枝、加熱或電力。",
  "Jeju Volcanic Stone Diffuser": "濟州火山石香薰",
  "A REAL ROUTE TO OUR ORIGIN": "通往起源的真實路線",
  "Asia to Korea.": "從亞洲到韓國。",
  "Korea to Jeju.": "從韓國到濟州。",
  "Three clear geographic views locate hondit without covering the map: accurate country boundaries, South Korea as the only highlighted country, then real coordinates on Jeju.": "三個清晰地理視圖呈現 hondit 的位置：準確國界、僅突出韓國，然後顯示濟州真實座標。",
  "Jeju Island": "濟州島",
  "Find Jeju below": "在下方找到濟州",
  "Explore six places": "探索六個地點",
  "Jeju sits below the peninsula.": "濟州位於半島南方。",
  "The province outline is real map data. Select the orange Jeju Island shape to continue.": "省級輪廓使用真實地圖資料。選擇橙色濟州島繼續。",
  "JEJU STRAIT": "濟州海峽",
  "What the world knows Korea for.": "世界認識韓國的方式。",
  "JEJU ISLAND FIELD GUIDE": "濟州島實地指南",
  "Six places, one clear origin": "六個地點，一個清晰起源",
  "REAL COORDINATES": "真實座標",
  "The Ara Campus is where hondit's independent student-led cross-border commerce project began.": "Ara 校區是 hondit 獨立學生跨境商務項目開始的地方。",
};

const jaCleanOverrides: TextDictionary = {
  Home: "ホーム",
  "Explore Jeju": "済州を見る",
  Products: "商品",
  "Bulk Orders": "一括注文",
  Shipping: "配送",
  Contact: "お問い合わせ",
  Menu: "メニュー",
  "Shop on Shopee ->": "Shopeeで購入 ->",
  "Bulk checkout ->": "一括決済 ->",
  "A student-led brand based at": "済州大学発の学生運営ブランド",
  "Jeju National University.": "済州大学。",
  "Student-led project based at Jeju National University.": "済州大学を拠点とする学生運営プロジェクト。",
  EXPLORE: "探索",
  CONNECT: "連絡",
  "TRUST & SUPPORT": "信頼とサポート",
  "Asia to Jeju": "アジアから済州へ",
  "Delivery guide": "配送ガイド",
  "Refund support": "返金サポート",
  Email: "メール",
  Refund: "返金",
  Privacy: "プライバシー",
  Terms: "利用規約",
  "Admin sign-in": "管理者ログイン",
  "JEJU NATIONAL UNIVERSITY - STUDENT-LED": "済州大学 · 学生運営",
  "Jeju, held in": "済州を宿す",
  "everyday ritual.": "毎日のリチュアル。",
  "FOR INDIVIDUALS": "個人購入",
  "Buy on Shopee": "Shopeeで購入",
  "FOR BUSINESSES AND GROUPS": "法人・団体",
  "Bulk Checkout": "一括決済",
  "Bulk only": "一括注文専用",
  "Jeju-based student team": "済州の学生運営チーム",
  "Official Shopee route": "公式 Shopee ルート",
  "Direct bulk checkout": "直接一括決済",
  ORIGIN: "起源",
  RETAIL: "小売",
  ROUTE: "ルート",
  DELIVERY: "配送",
  PAYMENT: "決済",
  "Jeju National University": "済州大学",
  "Student-led and based in Jeju City.": "済州市を拠点とする学生運営プロジェクトです。",
  "Live price, vouchers and protected checkout.": "リアルタイム価格、クーポン、保護された決済を利用できます。",
  "Bulk only direct route": "一括注文専用の直接ルート",
  "Direct bulk orders dispatch from Korea after PayPal capture.": "一括注文は PayPal 決済完了後、韓国から発送準備を行います。",
  "Two clear routes": "2つの明確な購入ルート",
  "SEA - STONE - WIND": "海 · 石 · 風",
  "A place you can feel,": "感じられる場所を、",
  "before it becomes a ritual.": "リチュアルになる前に。",
  "Our edit begins with Jeju's quiet materials: moving water, porous volcanic stone and air that never quite stands still.": "honditのセレクトは、流れる水、多孔質の火山石、止まらない空気という済州の静かな素材から始まります。",
  "Explore our Jeju ->": "私たちの済州を見る ->",
  "SHOP BY RITUAL": "リチュアルで選ぶ",
  "Find your": "自分に合う",
  "everyday fit.": "日常の選択。",
  "VOLCANIC DIFFUSER": "火山石ディフューザー",
  "No flame. No electricity.": "火を使わず。電気も使わず。",
  "Refresh the scent whenever you choose.": "必要な時に香りを足せます。",
  "Apply the citrus fragrance oil directly to the porous Jeju volcanic stone. The stone absorbs the oil and releases the scent naturally-without reed sticks, heat or electricity.": "シトラスのフレグランスオイルを済州の多孔質火山石に直接垂らします。リード、熱、電気を使わず、石がオイルを吸収して自然に香ります。",
  "Jeju Volcanic Stone Diffuser": "済州火山石ディフューザー",
  "Volcanic stone / Citrus fragrance oil / Ceramic bowl": "火山石 / シトラスオイル / セラミックボウル",
  "Flameless / No electricity / Refreshable scent": "火を使わない / 電気不要 / 香りを足せる",
  "ADD 10-12 DROPS": "10-12滴を垂らす",
  "Apply the fragrance oil directly onto the volcanic stone.": "フレグランスオイルを火山石に直接垂らします。",
  "LET IT ABSORB": "吸収させる",
  "Allow the porous stone to absorb the oil naturally.": "多孔質の石が自然にオイルを吸収するのを待ちます。",
  "REFRESH AS NEEDED": "必要に応じて追加",
  "Add a few more drops when the scent becomes lighter.": "香りが弱くなったら数滴足してください。",
  "A REAL ROUTE TO OUR ORIGIN": "起源へ向かう本当のルート",
  "Asia to Korea.": "アジアから韓国へ。",
  "Korea to Jeju.": "韓国から済州へ。",
  "Three clear geographic views locate hondit without covering the map: accurate country boundaries, South Korea as the only highlighted country, then real coordinates on Jeju.": "3つの地理ビューでhonditの位置を明確に示します。正確な国境、韓国のみのハイライト、そして済州の実座標です。",
  "Map navigation": "地図ナビゲーション",
  Asia: "アジア",
  "Regional context": "地域の文脈",
  "South Korea": "韓国",
  "Find Jeju below": "下で済州を探す",
  "Jeju Island": "済州島",
  "Explore six places": "6つの場所を見る",
  "REGIONAL CONTEXT": "地域の文脈",
  "Find South Korea without losing Asia.": "アジアの中で韓国を見つけます。",
  "Country boundaries remain neutral. South Korea is the only highlighted country and is selectable.": "国境は中立に保ち、韓国だけを強調して選択できます。",
  "Open South Korea map": "韓国地図を開く",
  "A CLOSER VIEW": "より近い視点",
  "Jeju sits below the peninsula.": "済州は半島の南にあります。",
  "The province outline is real map data. Select the orange Jeju Island shape to continue.": "行政区域の輪郭は実際の地図データです。オレンジ色の済州島を選択して続けます。",
  "Back to Asia": "アジアに戻る",
  "Map of South Korea with Jeju highlighted": "済州を強調した韓国地図",
  "Open Jeju Island map": "済州島地図を開く",
  "SOUTH KOREA": "韓国",
  "JEJU STRAIT": "済州海峡",
  "BEYOND THE MAP": "地図の先へ",
  "What Korea is known for": "韓国を象徴するもの",
  "What the world knows Korea for.": "世界が知る韓国。",
  "K-Beauty": "K-Beauty",
  "DAILY RITUAL": "日常のリチュアル",
  "Layered cleansing and gentle skincare made Korea globally recognisable.": "重ねるクレンジングとやさしいスキンケアが、韓国を世界に印象づけました。",
  "Korean Food": "韓国料理",
  "MARKET ENERGY": "市場の活気",
  "Street markets and shared tables make food immediate and social.": "市場と分かち合う食卓が、韓国料理を身近で社交的なものにします。",
  Seoul: "ソウル",
  CITY: "都市",
  "A fast capital where older places meet new culture.": "古い場所と新しい文化が出会うスピード感のある首都です。",
  Heritage: "伝統",
  PLACE: "場所",
  "Hanbok and historic palaces remain visible in everyday Seoul.": "韓服と歴史的な宮殿は、今のソウルの日常にも残っています。",
  "Back to South Korea": "韓国地図に戻る",
  "JEJU ISLAND FIELD GUIDE": "済州島フィールドガイド",
  "Six places, one clear origin": "6つの場所、ひとつの明確な起源",
  "REAL COORDINATES": "実座標",
  "Interactive map of Jeju Island": "済州島インタラクティブ地図",
  "Jeju Island outline": "済州島の輪郭",
  View: "見る",
  "PROJECT ORIGIN": "プロジェクトの起源",
  "The Ara Campus is where hondit's independent student-led cross-border commerce project began.": "Araキャンパスは、honditの独立した学生運営クロスボーダーコマースが始まった場所です。",
  "102 Jejudaehak-ro, Jeju-si, Jeju 63243": "済州市済州大学路102、63243",
  "Official campus guide": "公式キャンパスガイド",
  "Our Jeju story": "私たちの済州ストーリー",
  "Choose a Jeju place": "済州の場所を選ぶ",
  "hondit home": "hondit home",
  Hallasan: "漢拏山",
  "VOLCANIC HEART": "火山の中心",
  "The mountain at Jeju's centre anchors the island's volcanic landscape and hondit's stone-led visual language.": "島の中心にある山が済州の火山景観と、honditの石を軸にした表現を支えています。",
  "Hallasan National Park, Jeju": "済州 漢拏山国立公園",
  "UNESCO World Heritage": "ユネスコ世界遺産",
  "Woljeongri Beach": "月汀里ビーチ",
  Woljeongri: "月汀里",
  "CLEAR COAST": "澄んだ海岸",
  "Pale sand, emerald water and open coastal light express the fresh, quiet side of Jeju.": "淡い砂、エメラルドの海、開けた海辺の光が済州の新鮮で静かな面を表します。",
  "Bijarim Forest": "榧子林",
  Bijarim: "榧子林",
  "SLOW FOREST": "ゆっくりした森",
  "A protected old-growth grove whose shaded paths bring a slower, softer rhythm to the island story.": "保護された古い森の木陰道が、島の物語にゆっくり柔らかなリズムを加えます。",
  "Seongsan Ilchulbong": "城山日出峰",
  Seongsan: "城山",
  "EASTERN EDGE": "東の端",
  "The ocean-facing tuff cone is one of Jeju's clearest meetings of volcanic stone, wind and sea.": "海に向かう凝灰丘は、火山石、風、海が出会う済州らしい景色です。",
  "Jusangjeolli Cliff": "柱状節理",
  Jusangjeolli: "柱状節理",
  "STONE AND SEA": "石と海",
  "Dark columnar rock meeting the ocean gives the volcanic diffuser its most direct landscape reference.": "黒い柱状岩と海の出会いが、火山石ディフューザーの最も直接的な風景参照です。",
  "Visit Jeju guide": "済州ガイドを見る",
};

const cleanTextOverrides: Record<NonEnglishLanguage, TextDictionary> = {
  ko: koCleanOverrides,
  zh: zhCleanOverrides,
  "zh-HK": zhTraditionalCleanOverrides,
  "zh-TW": zhTraditionalCleanOverrides,
  ja: jaCleanOverrides,
};

function cleanDynamicText(language: DisplayLanguage, english: string) {
  if (language === "en") return undefined;
  const nonEnglish = language as NonEnglishLanguage;

  const marketDelivery = english.match(/^(.+) delivery$/);
  if (marketDelivery) {
    if (language === "ko") return `${marketDelivery[1]} 배송`;
    if (language === "ja") return `${marketDelivery[1]} 配送`;
    return `${marketDelivery[1]} 配送`;
  }

  const livePrices = english.match(/^Live prices, vouchers and secure (.+) checkout\.$/);
  if (livePrices) {
    if (language === "ko") return `실시간 가격, 바우처, 안전한 ${livePrices[1]} 결제.`;
    if (language === "ja") return `リアルタイム価格、クーポン、安全な${livePrices[1]}決済。`;
    return `即時價格、優惠券與安全的 ${livePrices[1]} 結帳。`;
  }

  const fixedPrices = english.match(/^Fixed (SGD|HKD|USD|TWD) prices and direct PayPal checkout\.$/);
  if (fixedPrices) {
    if (language === "ko") return `고정 ${fixedPrices[1]} 가격과 PayPal 직접 결제.`;
    if (language === "ja") return `固定${fixedPrices[1]}価格とPayPal直接決済。`;
    return `固定 ${fixedPrices[1]} 價格與 PayPal 直接結帳。`;
  }

  const reviewMOQ = english.match(/^Review MOQ, then pay securely through PayPal in (SGD|HKD|USD|TWD)\.$/);
  if (reviewMOQ) {
    if (language === "ko") return `MOQ를 확인한 뒤 PayPal ${reviewMOQ[1]}로 안전하게 결제합니다.`;
    if (language === "ja") return `MOQを確認し、PayPalで${reviewMOQ[1]}決済します。`;
    return `確認 MOQ 後，透過 PayPal 以 ${reviewMOQ[1]} 安全結帳。`;
  }

  const paypal = english.match(/^PayPal (SGD|HKD|USD|TWD) checkout$/);
  if (paypal) {
    if (language === "ko") return `PayPal ${paypal[1]} 결제`;
    if (language === "ja") return `PayPal ${paypal[1]} 決済`;
    return `PayPal ${paypal[1]} 結帳`;
  }

  const fixedBulkPrice = english.match(/^Fixed (SGD|HKD|USD|TWD) bulk price$/);
  if (fixedBulkPrice) {
    if (language === "ko") return `고정 ${fixedBulkPrice[1]} 대량 주문가`;
    if (language === "ja") return `固定${fixedBulkPrice[1]}一括注文価格`;
    return `固定 ${fixedBulkPrice[1]} 批量價格`;
  }

  const noShopee = english.match(/^No Shopee retail route is shown for (.+)\. Orders go through hondit checkout only\.$/);
  if (noShopee) {
    if (language === "ko") return `${noShopee[1]}에서는 Shopee 소매 경로를 표시하지 않습니다. 주문은 hondit 결제만 사용합니다.`;
    if (language === "ja") return `${noShopee[1]}ではShopee小売ルートを表示しません。注文はhondit決済のみです。`;
    return `${noShopee[1]} 不顯示 Shopee 零售渠道。訂單僅透過 hondit 結帳。`;
  }

  const shopeeOrPaypal = english.match(/^Shopee retail or secure PayPal (SGD|HKD|USD|TWD) direct checkout\.$/);
  if (shopeeOrPaypal) {
    if (language === "ko") return `Shopee 소매 또는 안전한 PayPal ${shopeeOrPaypal[1]} 직접 결제.`;
    if (language === "ja") return `Shopee小売または安全なPayPal ${shopeeOrPaypal[1]}直接決済。`;
    return `Shopee 零售或安全 PayPal ${shopeeOrPaypal[1]} 直接結帳。`;
  }

  const bulkPriced = english.match(/^Bulk orders are priced and captured in (SGD|HKD|USD|TWD)\.$/);
  if (bulkPriced) {
    if (language === "ko") return `대량 주문은 ${bulkPriced[1]}로 가격이 책정되고 결제됩니다.`;
    if (language === "ja") return `一括注文は${bulkPriced[1]}で価格設定・決済されます。`;
    return `批量訂單以 ${bulkPriced[1]} 定價並扣款。`;
  }

  const override = cleanTextOverrides[nonEnglish]?.[english];
  return override || undefined;
}

export function marketText(language: DisplayLanguage, english: string, fallback?: string) {
  if (language === "en") return english;
  const cleanDynamic = cleanDynamicText(language, english);
  if (cleanDynamic) return cleanDynamic;
  const clean = cleanTextOverrides[language as NonEnglishLanguage]?.[english];
  if (clean) return clean;
  const dynamic = dynamicText(language, english);
  if (dynamic) return dynamic;
  return commonText[language][english] || (language === "ko" ? fallback : undefined) || english;
}

export function marketProductText(language: DisplayLanguage, text: string) {
  return productText[language]?.[text] || marketText(language, text);
}
