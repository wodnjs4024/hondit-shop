// One short seasonal line on the bulk order page: when to order for year-end and Lunar New Year gifts.
// Shown only until the last suggested order date. Delivery is usually 3-5 business days after dispatch;
// Korean carriers pause for Seollal (6-9 Feb 2027), so the Lunar New Year cut-off is earlier.
const LAST_DAY = '2027-01-15';
const NOTICE = {
  en: 'Year-end and Chinese New Year gifts: order by 4 December for Christmas, or by 15 January for Chinese New Year (6 February 2027). Tell us your quantity and date first and we will confirm it can arrive in time.',
  ko: '연말·설 선물: 크리스마스 전에 받으려면 12월 4일까지, 설(2027년 2월 6일) 전에 받으려면 1월 15일까지 주문해 주세요. 수량과 날짜를 먼저 알려 주시면 제때 도착할 수 있는지 확인해 드립니다.',
  ja: 'お歳暮・年末のギフト：12月中旬までに届けたい場合は12月4日までにご注文ください。先に数量と希望日をお知らせいただければ、間に合うかどうかご確認します。',
  'zh-HK': '聖誕及新年禮品：聖誕節前收貨請於12月4日前訂購，農曆新年（2027年2月6日）前收貨請於1月15日前訂購。可先告訴我們數量和日期，我們會確認能否準時送到。',
  'zh-TW': '尾牙與新年禮品：聖誕節前收貨請在12月4日前訂購，春節（2027年2月6日）前收貨請在1月15日前訂購。請先告訴我們數量和日期，我們會確認能否準時送達。',
  zh: '圣诞及新年礼品：圣诞节前收货请于12月4日前订购，春节（2027年2月6日）前收货请于1月15日前订购。可先告诉我们数量和日期，我们会确认能否准时送达。',
  th: 'ของขวัญปีใหม่และตรุษจีน: หากต้องการให้ถึงก่อนคริสต์มาส โปรดสั่งภายใน 4 ธันวาคม และก่อนตรุษจีน (6 กุมภาพันธ์ 2027) โปรดสั่งภายใน 15 มกราคม แจ้งจำนวนและวันที่ก่อน แล้วเราจะยืนยันว่าส่งทันหรือไม่',
  ms: 'Hadiah hujung tahun dan Tahun Baru Cina: pesan sebelum 4 Disember untuk Krismas, atau sebelum 15 Januari untuk Tahun Baru Cina (6 Februari 2027). Beritahu kami kuantiti dan tarikh dahulu, dan kami akan sahkan sama ada ia sempat tiba.',
};
export function giftSeasonNotice(language, today = new Date().toISOString().slice(0, 10)) {
  if (today > LAST_DAY) return '';
  return NOTICE[language] ?? NOTICE.en;
}
