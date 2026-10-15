import type { DisplayLanguage } from "../lib/market";

/* About page (/jeju): route and field-guide labels. Distances are computed great-circle figures, labelled as approximate. */
const copy = {
  ko: { route: (m: string) => `${m}에서 제주까지`, routeBody: "HONDIT의 상품은 제주에서 고르고 한국에서 발송합니다. 지금 보고 계신 시장에서 시작해 제주까지의 길을 한 장의 지도로 보여드립니다.", distance: "직선거리 약", market: "시장", korea: "한국", jeju: "제주", origin: "HONDIT이 시작된 곳", field: "제주 여섯 곳의 좌표", fieldBody: "지도 위 번호나 목록을 고르면 그 장소의 사진과 설명이 열립니다.", credit: "사진", official: "공식 안내" },
  en: { route: (m: string) => `From ${m} to Jeju`, routeBody: "HONDIT selects in Jeju and ships from Korea. This map starts in the market you are viewing and follows the line back to the island.", distance: "Straight-line distance about", market: "Market", korea: "Korea", jeju: "Jeju", origin: "Where HONDIT began", field: "Six coordinates on Jeju", fieldBody: "Choose a number on the map or a row in the list to open that place.", credit: "Photo", official: "Official guide" },
  ja: { route: (m: string) => `${m}から済州へ`, routeBody: "HONDITは済州で選び、韓国から発送します。ご覧の市場から済州までの道のりを一枚の地図でお見せします。", distance: "直線距離 約", market: "市場", korea: "韓国", jeju: "済州", origin: "HONDITが始まった場所", field: "済州 6か所の座標", fieldBody: "地図の番号かリストを選ぶと、その場所の写真と説明が開きます。", credit: "写真", official: "公式案内" },
  zh: { route: (m: string) => `從${m}到濟州`, routeBody: "HONDIT 在濟州挑選商品，從韓國出貨。這張地圖從您正在瀏覽的市場出發，一路連到濟州。", distance: "直線距離約", market: "市場", korea: "韓國", jeju: "濟州", origin: "HONDIT 的起點", field: "濟州六個地點的座標", fieldBody: "選擇地圖上的編號或清單，即可查看該地點的照片與介紹。", credit: "照片", official: "官方介紹" },
  ms: { route: (m: string) => `Dari ${m} ke Jeju`, routeBody: "HONDIT memilih produk di Jeju dan menghantar dari Korea. Peta ini bermula di pasaran yang anda lihat dan menyusuri laluan kembali ke pulau itu.", distance: "Jarak garis lurus kira-kira", market: "Pasaran", korea: "Korea", jeju: "Jeju", origin: "Tempat HONDIT bermula", field: "Enam koordinat di Jeju", fieldBody: "Pilih nombor pada peta atau baris dalam senarai untuk membuka tempat itu.", credit: "Foto", official: "Panduan rasmi" },
  th: { route: (m: string) => `จาก${m}ถึงเชจู`, routeBody: "HONDIT คัดสินค้าที่เชจูและจัดส่งจากเกาหลี แผนที่นี้เริ่มจากตลาดที่คุณกำลังดูและลากเส้นกลับไปยังเกาะ", distance: "ระยะทางเส้นตรงประมาณ", market: "ตลาด", korea: "เกาหลี", jeju: "เชจู", origin: "จุดเริ่มต้นของ HONDIT", field: "พิกัดหกแห่งบนเชจู", fieldBody: "เลือกหมายเลขบนแผนที่หรือรายการเพื่อเปิดดูสถานที่นั้น", credit: "ภาพ", official: "ข้อมูลทางการ" },
};

export function aboutCopy(language: DisplayLanguage) {
  return copy[language === "zh" || language === "zh-HK" || language === "zh-TW" ? "zh" : language];
}
