import { diffuserMarkets, diffuserProductPath, diffuserSlugs } from './diffuser-search-routes.js';
import { pickupSearchPath } from './pickup-search.js';

// Verified against StoneJeju product detail images. Retail offers and stock are resolved by the existing shop.
export const diffuserSpecs = {
  'diffuser-350g': { officialName: '볼카닉 디퓨져 350', content: '350g ±', dimensions: '75 × 100 × 75 mm', container: 'Glass vessel', oil: '10mL', description: 'Compact Jeju volcanic scoria diffuser with a glass vessel and 10mL citrus fragrance oil.', source: 'https://stonejeju.com/product/detail.html?product_no=42', image: '/images/diffuser-350g.webp' },
  'diffuser-500g': { officialName: '볼카닉 디퓨져 500', content: '500g ±', dimensions: '100 × 105 × 100 mm', container: 'Jeju onggi pottery', oil: '10mL', description: 'Jeju volcanic scoria diffuser with Jeju onggi pottery and 10mL citrus fragrance oil.', source: 'https://stonejeju.com/product/detail.html?product_no=41', image: '/images/diffuser-500g.webp' },
};

export const diffuserCare = [
  'Natural stone varies in size and colour and may shed fine powder.',
  'Avoid prolonged contact with sensitive or damaged skin. Follow the product label.',
  'Rinse the stone in warm water and dry completely before changing the fragrance.',
];

export function thaiDiffuserActions(slug) {
  const pickup = new URLSearchParams({ market: 'TH', lang: 'th' });
  if (slug) {
    pickup.set('product', slug);
    pickup.set('quantity', '1');
  }
  return {
    deliveryLabel: 'สั่งซื้อแบบชุด ส่งถึงไทย',
    deliveryPath: slug ? '#thai-delivery' : '#compare-diffusers',
    pickupLabel: 'สอบถามรับสินค้าที่สนามบินเชจู',
    pickupPath: '/jeju/pickup?' + pickup,
  };
}

const copy = {
  SG: {
    title: 'Jeju volcanic stone diffusers in Singapore',
    description: 'Compare StoneJeju’s 350g glass and 500g onggi diffusers, see what comes in the box and find Singapore retail and bundle order options.',
    compare: '350g glass or 500g Jeju onggi?',
    model: ['350g glass diffuser', '500g Jeju onggi diffuser'],
    modelDescription: ['A compact glass vessel for a desk or bedside table.', 'A larger Jeju onggi pottery vessel for a living room, reception desk or shop counter.'],
    details: 'See product details', order: 'Check bundle quantities', source: 'Maker specifications',
    specs: 'Vessel dimensions', included: 'Included with either size', oil: '10 mL citrus fragrance oil',
    how: 'How a volcanic stone diffuser works',
    use: 'Add the included citrus fragrance oil to the porous stones as directed on the label. The stones hold the oil and release the scent without water, reeds, a flame or an electrical outlet. Place the vessel on a stable surface and refresh the fragrance according to the label.',
    buy: 'Buying from Singapore',
    buying: 'For a single diffuser, check the Singapore Shopee listing on the product page. For gifts or a group order, open the bundle options to check quantities, the total in SGD, and delivery before paying.',
    pickup: 'Jeju Airport pickup', pickupNote: 'Travelling to Jeju? Message HONDIT to arrange airport handover on your arrival or departure day. Confirm the meeting point and payment method in advance.',
    maker: 'StoneJeju makes both diffusers. HONDIT is the seller and can help with ordering and pickup.',
    other: 'Other markets', guide: 'Compare StoneJeju diffusers',
  },
  JP: {
    title: '済州の火山石アロマディフューザー｜日本からの注文',
    description: '火も電気も使わないStoneJejuの火山石アロマディフューザー。350gのガラス容器と500gの済州オンギを比較し、日本向けの注文方法を確認できます。',
    compare: 'ガラスの350gと済州オンギの500g',
    model: ['350g ガラス容器', '500g 済州オンギ'],
    modelDescription: ['机やベッド脇に置きやすいコンパクトなガラス容器。', 'リビングや受付、店頭に置ける大きめの済州オンギ（伝統陶器）の器。'],
    details: '商品詳細を見る', order: 'まとめ買いの条件を見る', source: 'メーカーの製品仕様',
    specs: '容器の外寸', included: '両サイズの付属品', oil: 'シトラスのフレグランスオイル 10 mL',
    how: '火も電気も使わないアロマストーン',
    use: '製品ラベルに従って、多孔質の火山石に付属のオイルを垂らします。石から自然に香りが広がり、水やリードスティック、火、電源は必要ありません。安定した場所に置き、香りを足すときもラベルの説明をご確認ください。',
    buy: '日本への配送とお支払い',
    buying: '韓国から日本へのまとめ買いは、商品ごとの注文ページで数量、円でのお支払い総額、配送条件をご確認ください。表示の条件に合わない数量や組み合わせはお問い合わせください。',
    pickup: '済州空港での受け取り', pickupNote: '済州へ旅行される方は、到着日または出発日の空港受け取りをメッセージでご相談いただけます。待ち合わせ場所と支払方法を事前にご確認ください。',
    maker: '製造元はStoneJejuです。販売と注文・受け取りのご案内はHONDITが行います。',
    other: '他の配送先', guide: 'StoneJejuの2サイズを比較',
  },
  HK: {
    title: '濟州火山石擴香｜香港選購指南',
    description: '比較 StoneJeju 350g 玻璃款與 500g 濟州甕器款，了解無火擴香用法、香港批量訂購和濟州機場交收。',
    compare: '350g 玻璃款，還是 500g 濟州甕器款？',
    model: ['350g 玻璃款', '500g 濟州甕器款'],
    modelDescription: ['小巧玻璃容器，可放在書枱或床頭櫃。', '較大的濟州傳統甕器，適合放在客廳、工作室或店舖櫃枱。'],
    details: '查看商品詳情', order: '查看批量訂購條件', source: '製造商產品規格',
    specs: '容器尺寸', included: '兩款均附', oil: '10 mL 柑橘香氛油',
    how: '火山石怎樣擴香？',
    use: '按產品標籤指示，將附送的香氛油滴在多孔火山石上。石頭吸收香氛油後慢慢散發香氣，無需加水、插電、點火或使用擴香枝。將容器放在穩固的平面上，補充香氛油時亦請參考標籤。',
    buy: '香港送貨與付款',
    buying: '從韓國送往香港的批量訂單，可在商品訂購頁查看可選數量、港幣總額及送貨條件。如需混合款式或頁面未列出的數量，可先聯絡 HONDIT。',
    pickup: '濟州機場交收', pickupNote: '到濟州旅遊，可先發訊息約定抵達日或離境日於機場交收。出發前請確認會面地點及付款方式。',
    maker: '兩款產品均由 StoneJeju 製造，HONDIT 負責銷售及處理訂購與交收查詢。',
    other: '其他送貨地區', guide: '比較 StoneJeju 兩款擴香',
  },
  TW: {
    title: '濟州火山石擴香｜台灣選購指南',
    description: '認識不用電、不點火的 StoneJeju 火山岩擴香。比較 350g 玻璃款和 500g 濟州甕器款，查看台灣訂購及濟州機場取貨方式。',
    compare: '350g 玻璃款與 500g 濟州甕器款怎麼選？',
    model: ['350g 玻璃款', '500g 濟州甕器款'],
    modelDescription: ['小巧的玻璃容器，適合書桌或床頭。', '較大的濟州傳統陶甕，適合客廳、工作室或接待櫃台。'],
    details: '查看商品資訊', order: '查看組合訂購條件', source: '原廠產品規格',
    specs: '容器尺寸', included: '兩種規格皆附', oil: '10 mL 柑橘香氛油',
    how: '不用電的火山岩擴香怎麼用？',
    use: '依照產品標籤，把隨附的香氛油滴在多孔火山岩上。岩石吸收油後自然散香，不用加水、插電、點火或使用擴香竹。把容器放在平穩的表面，補香時也請依標籤使用。',
    buy: '寄送台灣與付款',
    buying: '從韓國寄送台灣的組合訂單，可在商品訂購頁確認可選數量、新台幣應付總額及配送條件。如果需要混搭或其他數量，請先詢問 HONDIT。',
    pickup: '濟州機場取貨', pickupNote: '預計到濟州旅遊，可以先傳訊息約定抵達或離開當天的機場取貨。請先確認碰面地點與付款方式。',
    maker: '兩款產品都由 StoneJeju 製造，HONDIT 負責銷售與回覆訂購、取貨問題。',
    other: '其他配送地區', guide: '比較 StoneJeju 兩種規格',
  },
  TH: {
    title: 'ดิฟฟิวเซอร์หินภูเขาไฟเชจู | คู่มือสั่งซื้อในไทย',
    description: 'เปรียบเทียบ StoneJeju รุ่นแก้ว 350 กรัมและรุ่นเครื่องปั้นดินเผาองกี 500 กรัม วิธีใช้แบบไม่ต้องเสียบปลั๊ก และวิธีสั่งซื้อจากประเทศไทย',
    compare: 'รุ่นแก้ว 350 กรัม หรือรุ่นองกีเชจู 500 กรัม?',
    model: ['รุ่นแก้ว 350 กรัม', 'รุ่นองกีเชจู 500 กรัม'],
    modelDescription: ['ภาชนะแก้วขนาดกะทัดรัดสำหรับโต๊ะทำงานหรือโต๊ะข้างเตียง', 'ภาชนะเครื่องปั้นดินเผาองกีจากเชจูขนาดใหญ่ขึ้น สำหรับห้องนั่งเล่นหรือเคาน์เตอร์ต้อนรับ'],
    details: 'ดูรายละเอียดสินค้า', order: 'ดูจำนวนและเงื่อนไขสั่งซื้อ', source: 'ข้อมูลจากผู้ผลิต',
    specs: 'ขนาดภาชนะ', included: 'มีให้ทั้งสองรุ่น', oil: 'น้ำมันหอมกลิ่นซิตรัส 10 มล.',
    how: 'หินภูเขาไฟกระจายกลิ่นอย่างไร?',
    use: 'หยดน้ำมันหอมที่ให้มาลงบนหินภูเขาไฟที่มีรูพรุนตามคำแนะนำบนฉลาก หินจะค่อย ๆ ปล่อยกลิ่นโดยไม่ต้องใช้น้ำ ก้านไม้ เปลวไฟ หรือไฟฟ้า วางภาชนะบนพื้นผิวที่มั่นคง',
    buy: 'จัดส่งมายังประเทศไทยและชำระเงิน',
    buying: 'เปิดหน้าสั่งซื้อเพื่อดูจำนวนที่รองรับ ยอดชำระเป็นเงินบาท และเงื่อนไขการจัดส่งจากเกาหลี หากต้องการคละรุ่นหรือจำนวนอื่น โปรดสอบถาม HONDIT',
    pickup: 'รับสินค้าที่สนามบินเชจู', pickupNote: 'หากเดินทางไปเชจู สามารถส่งข้อความเพื่อนัดรับในวันเดินทางถึงหรือวันเดินทางกลับ โปรดยืนยันจุดนัดพบและวิธีชำระเงินล่วงหน้า',
    maker: 'StoneJeju เป็นผู้ผลิตทั้งสองรุ่น HONDIT เป็นผู้ขายและดูแลคำถามเรื่องการสั่งซื้อและนัดรับสินค้า',
    other: 'ปลายทางอื่น', guide: 'เปรียบเทียบ StoneJeju ทั้งสองรุ่น',
  },
  MY: {
    title: 'Penyebar aroma batu gunung berapi Jeju | Panduan Malaysia',
    description: 'Bandingkan StoneJeju 350 g dengan bekas kaca dan 500 g dengan tembikar onggi Jeju. Semak cara penggunaan, penghantaran ke Malaysia dan mata wang bayaran.',
    compare: 'Bekas kaca 350 g atau tembikar onggi Jeju 500 g?',
    model: ['Bekas kaca 350 g', 'Tembikar onggi Jeju 500 g'],
    modelDescription: ['Bekas kaca kompak untuk meja kerja atau meja sisi katil.', 'Bekas tembikar onggi Jeju yang lebih besar untuk ruang tamu atau kaunter penerimaan.'],
    details: 'Lihat butiran produk', order: 'Semak kuantiti dan syarat pesanan', source: 'Spesifikasi pengeluar',
    specs: 'Ukuran bekas', included: 'Disertakan dengan kedua-dua saiz', oil: 'Minyak pewangi sitrus 10 mL',
    how: 'Bagaimanakah batu gunung berapi menyebarkan aroma?',
    use: 'Titiskan minyak pewangi yang disertakan pada batu berliang mengikut arahan pada label. Batu melepaskan aroma tanpa air, batang rotan, api atau elektrik. Letakkan bekas di permukaan yang stabil.',
    buy: 'Penghantaran ke Malaysia dan mata wang bayaran',
    buying: 'Semak halaman pesanan untuk kuantiti yang tersedia, jumlah yang akan dicaj dalam SGD dan syarat penghantaran dari Korea. Harga rujukan dalam MYR, apabila dipaparkan, ialah anggaran. Hubungi HONDIT untuk gabungan produk atau kuantiti lain.',
    pickup: 'Ambil di Lapangan Terbang Jeju', pickupNote: 'Jika anda ke Jeju, hubungi HONDIT untuk mengatur pengambilan pada hari ketibaan atau berlepas. Sahkan lokasi pertemuan dan kaedah pembayaran terlebih dahulu.',
    maker: 'StoneJeju menghasilkan kedua-dua produk. HONDIT menjualnya dan membantu dengan pesanan serta pengambilan.',
    other: 'Destinasi lain', guide: 'Bandingkan dua saiz StoneJeju',
  },
};

export function diffuserGuide(option) {
  const data = copy[option.market];
  const selection = new URLSearchParams({ market: option.market, lang: option.lang });
  return {
    ...data,
    products: diffuserSlugs.map((slug, index) => ({
      slug, ...diffuserSpecs[slug], name: data.model[index], useCase: data.modelDescription[index],
      detailsPath: diffuserProductPath(slug, option),
      orderPath: '/bulk-orders/' + slug + '?' + selection,
    })),
    pickupPath: pickupSearchPath(option.lang),
    otherMarkets: Object.values(diffuserMarkets).filter(({ market }) => market !== option.market),
  };
}

export function diffuserLocalizedMeta(slug, option) {
  const guide = diffuserGuide(option);
  const model = guide.products.find((item) => item.slug === slug);
  const name = 'StoneJeju ' + model.name;
  return { name, title: name + ' | ' + guide.title + ' | HONDIT', description: model.useCase + ' ' + guide.oil + ' · ' + model.dimensions, image: model.image };
}
