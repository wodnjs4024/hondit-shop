// Questions and answers for the Jeju Airport pickup page (visible list + FAQPage JSON-LD).
// Facts: pickup 1-3 pieces (contact-copy.js pickupRequestTotal), 350g KRW 18,000 / 500g KRW 40,000 each,
// handover time, meeting point and payment confirmed by message (sales-presentation-copy.js).
// Availability (JW, 2026-11-19): StoneJeju diffusers are normally sold only offline in Jeju; HONDIT sells them
// to overseas buyers as a GTEP-programme exception until the end of February 2027.
import { pickupSearchLanguage } from './pickup-search.js';

export const AVAILABILITY = {
  en: 'StoneJeju diffusers are normally sold only in shops in Jeju. Outside Jeju they are available only through HONDIT, a Jeju National University GTEP student team, until the end of February 2027.',
  ko: 'StoneJeju 디퓨저는 원래 제주 오프라인 매장에서만 판매됩니다. 제주 밖에서는 2027년 2월 말까지 제주대학교 GTEP 학생팀 HONDIT을 통해서만 구매할 수 있습니다.',
  ja: 'StoneJejuのディフューザーは、本来は済州島の店舗だけで販売されています。済州島の外では、2027年2月末まで済州大学GTEP学生チームのHONDITを通してのみ購入できます。',
  'zh-HK': 'StoneJeju 火山石香薰原本只在濟州實體店發售。濟州以外，2027 年 2 月底前只可經濟州大學 GTEP 學生團隊 HONDIT 購買。',
  'zh-TW': 'StoneJeju 火山岩擴香原本只在濟州實體店販售。濟州以外，2027 年 2 月底前只能透過濟州大學 GTEP 學生團隊 HONDIT 購買。',
};

const FAQ = {
  en: [
    ['Can I collect a StoneJeju diffuser at Jeju Airport?', 'Yes. HONDIT hands over 1 to 3 pieces at Jeju International Airport on your arrival or departure day, by prior arrangement. Send your date, time and size by message first.'],
    ['How much is airport pickup?', '350g: KRW 18,000 each. 500g: KRW 40,000 each. There is no delivery charge because you collect it in person.'],
    ['How do I reserve?', 'Add HONDIT\'s contact and send the purchase request with your date and time. The reservation is confirmed once the handover time, the meeting point inside the airport and the payment method are agreed.'],
    ['Can I buy it elsewhere in Jeju or overseas?', AVAILABILITY.en + ' Overseas orders start at 5 pieces of one size, paid in local currency with delivery included; in Singapore a single piece is on HONDIT\'s Shopee listing.'],
    ['Do you deliver around Jeju island?', 'No. HONDIT does not deliver across the island and does not ship single pieces abroad. Pickup is at Jeju Airport only.'],
  ],
  ko: [
    ['제주공항에서 StoneJeju 디퓨저를 받을 수 있나요?', '네. 제주 도착일이나 출국일에 제주국제공항에서 1~3개를 직접 전달합니다. 사전 예약제이며, 날짜·시간·사이즈를 먼저 메시지로 보내 주세요.'],
    ['공항 수령 가격은 얼마인가요?', '350g은 개당 18,000원, 500g은 개당 40,000원입니다. 직접 받으시므로 배송비는 없습니다.'],
    ['어떻게 예약하나요?', 'HONDIT 연락 채널을 친구 추가하고 날짜와 시간을 적은 구매 요청을 보내 주세요. 전달 시간, 공항 안 만남 지점, 결제 방법을 확인하면 예약이 확정됩니다.'],
    ['제주의 다른 곳이나 해외에서도 살 수 있나요?', AVAILABILITY.ko + ' 해외 주문은 같은 사이즈 5개부터이며, 현지 통화로 배송비 포함 결제합니다. 싱가포르는 HONDIT 쇼피에서 1개도 살 수 있습니다.'],
    ['제주 시내로 배달해 주나요?', '아니요. 제주 전역 배달과 해외 단품 배송은 하지 않습니다. 수령은 제주공항에서만 가능합니다.'],
  ],
  ja: [
    ['StoneJejuのディフューザーを済州空港で受け取れますか？', 'はい。済州に到着する日または出発する日に、済州国際空港で1〜3個をお渡しします。事前予約制なので、日時とサイズを先にメッセージでお知らせください。'],
    ['空港受け取りの料金は？', '350gは1個18,000ウォン、500gは1個40,000ウォンです。直接お受け取りいただくため、送料はかかりません。'],
    ['予約方法は？', 'HONDITの連絡先を追加し、日時を書いた購入リクエストを送ってください。受け渡し時間、空港内の待ち合わせ場所、支払い方法を確認できた時点で予約が確定します。'],
    ['済州のほかの場所や海外でも買えますか？', AVAILABILITY.ja + ' 日本への配送は同じサイズ5個から、日本円・送料込みで注文できます。'],
    ['済州島内に配達してもらえますか？', 'いいえ。島内の配達や海外への1個配送は行っていません。受け取りは済州空港のみです。'],
  ],
  'zh-HK': [
    ['可以在濟州機場領取 StoneJeju 火山石香薰嗎？', '可以。HONDIT 會在你抵達濟州或離境當天，於濟州國際機場交收 1 至 3 件。須預約，請先以訊息告訴我們日期、時間和款式。'],
    ['機場交收價錢是多少？', '350g 每件 KRW 18,000，500g 每件 KRW 40,000。親身領取，不收運費。'],
    ['點樣預約？', '新增 HONDIT 聯絡人，傳送寫上日期和時間的購買請求。確認交收時間、機場內會面地點和付款方式後，預約才確定。'],
    ['可以在濟州其他地方或海外買嗎？', AVAILABILITY['zh-HK'] + ' 寄香港須同款 5 件起，以港幣付款並已包運費。'],
    ['會送貨到濟州島其他地方嗎？', '不會。HONDIT 不提供全島配送，也不寄單件到海外。交收只在濟州機場。'],
  ],
};

export function pickupFaq(language) {
  const code = pickupSearchLanguage(language);
  return FAQ[code] ? { language: code, items: FAQ[code] } : null;
}

export const pickupFaqHeading = { en: 'Questions about Jeju Airport pickup', ko: '제주공항 수령 자주 묻는 질문', ja: '済州空港受け取りのよくある質問', 'zh-HK': '濟州機場交收常見問題' };
