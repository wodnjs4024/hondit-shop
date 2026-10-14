import type { DisplayLanguage } from "../lib/market";
const copy = {
  "ko": {
    "homeTitle": "StoneJeju를 가까이에서 만나보세요",
    "homeCaption": "숲 속에 놓인 제품과 포장을 영상으로 살펴보세요.",
    "homeCta": "상품 보기",
    "homeAlt": "숲 속 이끼 위에 놓인 옹기 형태 디퓨저와 포장 상자",
    "forestAlt": "나무 사이로 햇빛이 들어오는 숲",
    "detailLightAlt": "햇빛을 받는 옹기 형태 디퓨저와 포장 상자",
    "detailStoneAlt": "용기 안의 돌과 옆에 놓인 포장 상자",
    "videoFallback": "영상을 불러올 수 없습니다. 상품 사진과 설명을 확인해주세요."
  },
  "en": {
    "homeTitle": "Take a closer look at StoneJeju.",
    "homeCaption": "See the product and its packaging in a forest setting.",
    "homeCta": "View products",
    "homeAlt": "A pottery-style diffuser and its packaging on moss in a forest",
    "forestAlt": "Sunlight filtering through trees in a forest",
    "detailLightAlt": "A pottery-style diffuser and its packaging in sunlight",
    "detailStoneAlt": "Stones inside the diffuser vessel, with its packaging alongside",
    "videoFallback": "The video could not be loaded. Please view the product photos and details."
  },
  "ja": {
    "homeTitle": "StoneJejuの魅力を、もっと身近に。",
    "homeCaption": "森の中に置かれた製品とパッケージを動画でご覧ください。",
    "homeCta": "商品を見る",
    "homeAlt": "森の苔の上に置かれた陶器のような形のディフューザーとパッケージ",
    "forestAlt": "木々の間から日差しが差し込む森",
    "detailLightAlt": "日差しを受ける陶器のような形のディフューザーとパッケージ",
    "detailStoneAlt": "容器の中の石と、その隣に置かれたパッケージ",
    "videoFallback": "動画を読み込めませんでした。商品写真と詳細をご確認ください。"
  },
  "zh-Hant": {
    "homeTitle": "近距離欣賞 StoneJeju。",
    "homeCaption": "透過影片，看看置於林間的產品與包裝。",
    "homeCta": "查看商品",
    "homeAlt": "放在林間苔蘚上的陶罐造型擴香器與包裝盒",
    "forestAlt": "陽光穿過樹木灑進森林",
    "detailLightAlt": "陽光下的陶罐造型擴香器與包裝盒",
    "detailStoneAlt": "容器內的石塊，以及旁邊的包裝盒",
    "videoFallback": "無法載入影片，請查看商品照片與詳細介紹。"
  },
  "ms": {
    "homeTitle": "Lihat StoneJeju dengan lebih dekat.",
    "homeCaption": "Lihat produk dan pembungkusannya dalam suasana hutan.",
    "homeCta": "Lihat produk",
    "homeAlt": "Peresap berbentuk tembikar dan pembungkusannya di atas lumut dalam hutan",
    "forestAlt": "Cahaya matahari menembusi pokok di dalam hutan",
    "detailLightAlt": "Peresap berbentuk tembikar dan pembungkusannya dalam cahaya matahari",
    "detailStoneAlt": "Batu di dalam bekas peresap, dengan pembungkusan di sisinya",
    "videoFallback": "Video tidak dapat dimuatkan. Sila lihat foto dan butiran produk."
  },
  "th": {
    "homeTitle": "ชม StoneJeju อย่างใกล้ชิด",
    "homeCaption": "ชมผลิตภัณฑ์และบรรจุภัณฑ์ท่ามกลางบรรยากาศป่าผ่านวิดีโอ",
    "homeCta": "ดูสินค้า",
    "homeAlt": "เครื่องหอมทรงเครื่องปั้นดินเผาและบรรจุภัณฑ์บนมอสในป่า",
    "forestAlt": "แสงแดดส่องผ่านต้นไม้ในป่า",
    "detailLightAlt": "เครื่องหอมทรงเครื่องปั้นดินเผาและบรรจุภัณฑ์ท่ามกลางแสงแดด",
    "detailStoneAlt": "หินภายในภาชนะเครื่องหอมและบรรจุภัณฑ์ที่วางอยู่ข้างกัน",
    "videoFallback": "ไม่สามารถโหลดวิดีโอได้ โปรดดูรูปภาพและรายละเอียดสินค้า"
  }
} as const;
export function stonejejuMediaCopy(language: DisplayLanguage) { return copy[language === 'zh' || language === 'zh-HK' || language === 'zh-TW' ? 'zh-Hant' : language === 'ko' || language === 'ja' || language === 'ms' || language === 'th' ? language : 'en']; }
