import type { DisplayLanguage } from "../lib/market";

const copy = {
  ko: {intro:"제주 화산석 디퓨저와 데일리 케어를 만나보세요.",product:"StoneJeju 500g · 제품 연출 영상",forest:"숲의 분위기에서, 화산석의 질감으로",forestText:"숲의 빛과 고요한 분위기를 지나, StoneJeju의 용기와 화산석을 가까이 살펴보세요. 영상의 실제 촬영 장소는 확인되지 않았습니다.",detail:"StoneJeju 500g · 용기·화산석·포장 가까이 보기",play:"영상 재생",pause:"영상 일시정지",products:"상품 보기",coast:"제주의 해안 풍경"},
  en: {intro:"Discover volcanic stone diffusers and everyday care selected in Jeju.",product:"StoneJeju 500g · product styling film",forest:"From a forest atmosphere to volcanic texture",forestText:"Follow the light and stillness of a forest, then take a closer look at StoneJeju’s vessel and volcanic stones. The filming location has not been confirmed.",detail:"StoneJeju 500g · vessel, stones and packaging up close",play:"Play video",pause:"Pause video",products:"View products",coast:"Jeju coastal scenery"},
  ja: {intro:"済州から選んだ火山石ディフューザーとデイリーケアをご覧ください。",product:"StoneJeju 500g · 製品イメージ動画",forest:"森の空気感から、火山石の質感へ",forestText:"森の光と静けさから、StoneJejuの容器と火山石へ。実際の撮影場所は確認されていません。",detail:"StoneJeju 500g · 容器・火山石・パッケージを間近に",play:"動画を再生",pause:"動画を一時停止",products:"商品を見る",coast:"済州の海岸風景"},
  zh: {intro:"探索濟州精選火山石擴香器與日常護理產品。",product:"StoneJeju 500g · 產品情境影片",forest:"從森林氛圍，走近火山石的質感",forestText:"從林間光影與寧靜氛圍，走近 StoneJeju 的容器與火山石。實際拍攝地點尚未確認。",detail:"StoneJeju 500g · 近看容器、火山石與包裝",play:"播放影片",pause:"暫停影片",products:"查看商品",coast:"濟州海岸風景"},
  ms: {intro:"Terokai peresap batu gunung berapi dan penjagaan harian pilihan Jeju.",product:"StoneJeju 500g · filem suasana produk",forest:"Dari suasana hutan ke tekstur batu gunung berapi",forestText:"Dari cahaya dan ketenangan hutan, lihat bekas dan batu gunung berapi StoneJeju dengan lebih dekat. Lokasi penggambaran belum disahkan.",detail:"StoneJeju 500g · bekas, batu dan pembungkusan dari dekat",play:"Mainkan video",pause:"Jeda video",products:"Lihat produk",coast:"Pemandangan pantai Jeju"},
  th: {intro:"ค้นพบเครื่องหอมหินภูเขาไฟและผลิตภัณฑ์ดูแลประจำวันจากเชจู",product:"StoneJeju 500g · วิดีโอจัดแสดงผลิตภัณฑ์",forest:"จากบรรยากาศป่าสู่พื้นผิวหินภูเขาไฟ",forestText:"จากแสงและความสงบของป่า สู่การชมภาชนะและหินภูเขาไฟ StoneJeju อย่างใกล้ชิด ยังไม่ได้ยืนยันสถานที่ถ่ายทำจริง",detail:"StoneJeju 500g · ชมภาชนะ หิน และบรรจุภัณฑ์อย่างใกล้ชิด",play:"เล่นวิดีโอ",pause:"หยุดวิดีโอชั่วคราว",products:"ดูสินค้า",coast:"ทิวทัศน์ชายฝั่งเชจู"},
};
export function homeMediaCopy(language: DisplayLanguage) {
  return copy[language === "zh-HK" || language === "zh-TW" ? "zh" : language];
}
