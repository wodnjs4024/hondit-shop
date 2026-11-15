// Short questions and answers per product, shown on product pages (React and server-rendered, with FAQPage JSON-LD).
// Same facts as shared/product-story.js; nothing beyond what the makers publish.
const L = ['en', 'ko', 'ja', 'zh-HK', 'th', 'ms'];
export const PRODUCT_FAQ_LABEL = { en: 'Questions about this product', ko: '이 제품에 대한 질문', ja: 'この商品についての質問', 'zh-HK': '關於這件商品的問題', th: 'คำถามเกี่ยวกับสินค้านี้', ms: 'Soalan tentang produk ini' };

const scent = {
  en: ['How long does the scent last?', 'It depends on the size of the room, the airflow and how many drops you add, so there is no fixed number of days. Start with 10 to 12 drops and add a few more whenever the scent fades.'],
  ko: ['향은 얼마나 가나요?', '공간 크기, 바람, 떨어뜨린 방울 수에 따라 달라서 정해진 일수는 없습니다. 처음에 10~12방울로 시작하고, 향이 옅어지면 몇 방울씩 더해 주세요.'],
  ja: ['香りはどのくらい続きますか？', '部屋の広さや風通し、たらす滴数によって変わるため、決まった日数はありません。最初は10〜12滴から始め、香りが弱くなったら数滴足してください。'],
  'zh-HK': ['香味可以維持多久？', '視乎房間大小、空氣流通程度和滴入的份量，沒有固定日數。先滴10至12滴，香氣變淡時再補幾滴。'],
  th: ['กลิ่นอยู่ได้นานแค่ไหน?', 'ขึ้นอยู่กับขนาดห้อง การไหลเวียนของอากาศ และจำนวนหยด จึงไม่มีจำนวนวันที่แน่นอน เริ่มที่ 10–12 หยด แล้วเติมอีกไม่กี่หยดเมื่อกลิ่นจางลง'],
  ms: ['Berapa lama bau wangi bertahan?', 'Ia bergantung pada saiz bilik, aliran udara dan bilangan titisan, jadi tiada bilangan hari yang tetap. Mulakan dengan 10 hingga 12 titis dan tambah beberapa titis apabila bau pudar.'],
};
const ownOil = {
  en: ['Can I use my own fragrance or essential oil?', 'Yes. Rinse the stones in warm water and let them dry completely before switching, so the scents do not mix. Follow the label of the oil you use.'],
  ko: ['다른 향 오일이나 에센셜 오일을 써도 되나요?', '네. 향이 섞이지 않도록 바꾸기 전에 돌을 따뜻한 물에 헹구고 완전히 말려 주세요. 사용하는 오일의 라벨 안내를 따라 주세요.'],
  ja: ['手持ちのアロマオイルやエッセンシャルオイルも使えますか？', '使えます。香りが混ざらないよう、替える前に石をぬるま湯ですすぎ、完全に乾かしてください。お使いのオイルの表示に従ってください。'],
  'zh-HK': ['可以用自己的香薰油或精油嗎？', '可以。轉換前請先用溫水沖洗石頭並完全晾乾，以免香味混合。請按所用香油的標籤指示使用。'],
  th: ['ใช้น้ำมันหอมหรือน้ำมันหอมระเหยของตัวเองได้ไหม?', 'ได้ ก่อนเปลี่ยนให้ล้างหินด้วยน้ำอุ่นและผึ่งให้แห้งสนิท เพื่อไม่ให้กลิ่นผสมกัน และทำตามฉลากของน้ำมันที่ใช้'],
  ms: ['Bolehkah saya guna minyak wangian atau minyak pati sendiri?', 'Boleh. Bilas batu dengan air suam dan keringkan sepenuhnya sebelum menukar, supaya bau tidak bercampur. Ikut label minyak yang anda gunakan.'],
};
const gift = {
  en: ['Is it a good gift or Jeju souvenir?', 'It comes in its own package box and needs no plug, batteries or adapter in any country, so it is easy to give, carry home or send abroad.'],
  ko: ['선물이나 제주 기념품으로 괜찮나요?', '포장 상자에 담겨 있고, 어느 나라에서든 플러그·배터리·어댑터 없이 쓸 수 있어서 선물하거나 들고 가거나 해외로 보내기 쉽습니다.'],
  ja: ['プレゼントや済州島のお土産に向いていますか？', 'パッケージボックス入りで、どの国でもプラグや電池、変換アダプターなしで使えるので、贈りやすく、持ち帰りや海外発送もしやすいギフトです。'],
  'zh-HK': ['適合送禮或作濟州手信嗎？', '附包裝盒，在任何國家都不用插頭、電池或轉換插頭，方便送禮、帶回家或寄到海外。'],
  th: ['เหมาะเป็นของขวัญหรือของฝากจากเชจูไหม?', 'มาในกล่องบรรจุภัณฑ์ และใช้ได้ทุกประเทศโดยไม่ต้องใช้ปลั๊ก แบตเตอรี่ หรืออะแดปเตอร์ จึงให้เป็นของขวัญ พกกลับ หรือส่งไปต่างประเทศได้ง่าย'],
  ms: ['Adakah ia sesuai sebagai hadiah atau cenderahati Jeju?', 'Ia datang dalam kotak pembungkusan sendiri dan tidak memerlukan palam, bateri atau penyesuai di mana-mana negara, jadi mudah dihadiahkan, dibawa pulang atau dihantar ke luar negara.'],
};
const onggi = {
  en: ['What is Jeju onggi?', 'Onggi is Korean earthenware. On Jeju it was the everyday vessel for storing water and food for generations. The fired clay keeps a matte, breathing texture, which is why the maker pairs it with volcanic stone.'],
  ko: ['제주 옹기는 무엇인가요?', '옹기는 흙으로 구운 한국의 그릇입니다. 제주에서는 대대로 물과 음식을 담던 생활 용기였습니다. 구운 흙의 무광택, 숨 쉬는 질감 때문에 제조사가 화산송이와 함께 담았습니다.'],
  ja: ['済州オンギとは何ですか？', 'オンギは土を焼いてつくる韓国の器で、済州島では代々、水や食べ物を蓄える日用の器でした。焼いた土のマットで呼吸するような質感が、火山石と組み合わされています。'],
  'zh-HK': ['甚麼是濟州甕器？', '甕器是以陶土燒製的韓國器皿，在濟州世代用來盛水和存放食物。燒製陶土的啞光、會「呼吸」的質感，正是製造商把它配上火山石的原因。'],
  th: ['องกีของเชจูคืออะไร?', 'องกีคือภาชนะดินเผาของเกาหลี บนเกาะเชจูใช้เก็บน้ำและอาหารในชีวิตประจำวันมาหลายชั่วรุ่น ผิวดินเผาด้านที่ “หายใจได้” จึงถูกจับคู่กับหินภูเขาไฟ'],
  ms: ['Apakah onggi Jeju?', 'Onggi ialah tembikar tanah liat Korea. Di Jeju ia menjadi bekas harian untuk menyimpan air dan makanan sejak turun-temurun. Tekstur tanah liat bakar yang pudar dan “bernafas” itulah sebabnya ia dipadankan dengan batu gunung berapi.'],
};
const sensitive = {
  en: ['Is it suitable for sensitive skin?', 'The maker designs the J’essence line for sensitive skin: vegan, weakly acidic at pH 5.5 and without added fragrance. Everyone’s skin is different, so try it on a small area first and stop if irritation appears.'],
  ko: ['민감한 피부에도 괜찮나요?', '제조사는 J’essence 라인을 민감한 피부용으로 만듭니다. 비건, pH 5.5 약산성, 향료 무첨가입니다. 피부는 사람마다 다르니 작은 부위에 먼저 써 보고, 자극이 있으면 사용을 멈춰 주세요.'],
  ja: ['敏感肌でも使えますか？', 'J’essenceは敏感な肌向けに設計されています。ヴィーガン処方、pH5.5の弱酸性、香料無添加です。肌は人それぞれなので、まず狭い範囲で試し、刺激を感じたら使用を中止してください。'],
  'zh-HK': ['敏感肌可以用嗎？', '製造商把 J’essence 系列設計給敏感肌：純素、pH 5.5 弱酸性、不添加香料。每個人的皮膚都不同，請先在小範圍試用，如有刺激請停止使用。'],
  th: ['เหมาะกับผิวบอบบางไหม?', 'ผู้ผลิตออกแบบไลน์ J’essence สำหรับผิวบอบบาง สูตรวีแกน pH 5.5 กรดอ่อน และไม่เติมน้ำหอม แต่ผิวแต่ละคนต่างกัน ควรทดลองบริเวณเล็ก ๆ ก่อน และหยุดใช้หากระคายเคือง'],
  ms: ['Adakah ia sesuai untuk kulit sensitif?', 'Pengeluar mereka bentuk rangkaian J’essence untuk kulit sensitif: vegan, berasid lemah pada pH 5.5 dan tanpa wangian tambahan. Kulit setiap orang berbeza, jadi cuba pada kawasan kecil dahulu dan berhenti jika berlaku kerengsaan.'],
};
const waterproof = {
  en: ['Does it remove waterproof makeup?', 'It is made for sunscreen, base makeup and light makeup. For waterproof mascara, eyeliner or long-wear lipstick, use a dedicated eye and lip remover first.'],
  ko: ['워터프루프 메이크업도 지워지나요?', '선크림, 베이스 메이크업, 가벼운 메이크업용입니다. 워터프루프 마스카라·아이라이너·지속력 높은 립은 전용 아이·립 리무버로 먼저 지워 주세요.'],
  ja: ['ウォータープルーフのメイクも落とせますか？', '日焼け止め、ベースメイク、薄めのメイク向けです。ウォータープルーフのマスカラやアイライナー、落ちにくい口紅は、先に専用のアイ・リップリムーバーを使ってください。'],
  'zh-HK': ['可以卸防水化妝嗎？', '適用於防曬、底妝和淡妝。防水睫毛液、眼線或持久唇膏，請先用專用眼唇卸妝液。'],
  th: ['ล้างเมคอัพกันน้ำได้ไหม?', 'ทำมาสำหรับครีมกันแดด เมคอัพรองพื้น และเมคอัพบาง ๆ สำหรับมาสคาร่า อายไลเนอร์กันน้ำ หรือลิปติดทน ให้ใช้รีมูฟเวอร์ตาและปากเฉพาะก่อน'],
  ms: ['Bolehkah ia menanggalkan solekan kalis air?', 'Ia dibuat untuk pelindung matahari, solekan asas dan solekan ringan. Untuk maskara, pelapik mata kalis air atau gincu tahan lama, gunakan penanggal mata dan bibir khusus dahulu.'],
};
const secondStep = {
  en: ['Do I still need a face wash after the foam oil?', 'Usually not: the foam oil turns into foam with water and rinses off as a cleanser. On heavy makeup days you can follow with the J’essence foaming cleanser.'],
  ko: ['폼 오일 다음에 폼 클렌저를 또 써야 하나요?', '대부분은 필요 없습니다. 물을 더하면 거품으로 바뀌어 세안제처럼 헹궈집니다. 메이크업이 진한 날에는 J’essence 폼 클렌저로 한 번 더 씻어도 됩니다.'],
  ja: ['フォームオイルのあとに洗顔料は必要ですか？', 'たいていは不要です。水を加えると泡になり、洗顔料のように洗い流せます。メイクが濃い日は、J’essenceの泡洗顔料で仕上げても構いません。'],
  'zh-HK': ['用泡沫油後還需要洗面奶嗎？', '通常不需要：加水後會變成泡沫，像洗面奶一樣沖走。化濃妝的日子可再用 J’essence 泡沫潔面。'],
  th: ['หลังใช้โฟมออยล์ยังต้องใช้โฟมล้างหน้าอีกไหม?', 'ส่วนใหญ่ไม่ต้อง เมื่อเติมน้ำจะกลายเป็นโฟมและล้างออกได้เหมือนโฟมล้างหน้า ในวันที่แต่งหน้าหนักใช้โฟมล้างหน้า J’essence ต่อได้'],
  ms: ['Adakah saya masih perlu pencuci muka selepas minyak buih?', 'Biasanya tidak: minyak buih bertukar menjadi buih dengan air dan dibilas seperti pencuci muka. Pada hari solekan tebal, anda boleh ikuti dengan pencuci muka berbuih J’essence.'],
};
const morning = {
  en: ['Can I use it in the morning and at night?', 'Yes. It is a gentle daily wash for both. In the evening after sunscreen or makeup, use it after the J’essence foam oil or cleansing water.'],
  ko: ['아침저녁 모두 써도 되나요?', '네. 아침과 저녁 모두 쓰는 순한 데일리 세안제입니다. 선크림이나 메이크업을 한 날 저녁에는 J’essence 폼 오일이나 클렌징 워터 다음에 쓰세요.'],
  ja: ['朝と夜の両方に使えますか？', '使えます。朝晩どちらにも使えるやさしい洗顔料です。日焼け止めやメイクをした日の夜は、J’essenceのフォームオイルやクレンジングウォーターのあとに使ってください。'],
  'zh-HK': ['早晚都可以用嗎？', '可以，這是早晚都適用的溫和日常潔面。塗了防曬或化妝的晚上，請在 J’essence 泡沫油或卸妝水之後使用。'],
  th: ['ใช้ได้ทั้งเช้าและเย็นไหม?', 'ได้ เป็นโฟมล้างหน้าอ่อนโยนสำหรับใช้ทุกวันทั้งเช้าและเย็น ในตอนเย็นหลังทาครีมกันแดดหรือแต่งหน้า ให้ใช้หลังโฟมออยล์หรือคลีนซิ่งวอเตอร์ของ J’essence'],
  ms: ['Bolehkah saya gunakannya pagi dan malam?', 'Boleh. Ia pencuci muka harian yang lembut untuk kedua-duanya. Pada waktu malam selepas pelindung matahari atau solekan, gunakannya selepas minyak buih atau air pembersih J’essence.'],
};
const howWater = {
  en: ['How do I use cleansing water?', 'Soak a cotton pad, hold it on the skin for a moment and wipe gently without rubbing. Repeat with a fresh pad until it comes away clean. After heavier makeup, wash with the J’essence foaming cleanser.'],
  ko: ['클렌징 워터는 어떻게 쓰나요?', '화장솜을 충분히 적셔 잠시 피부에 올렸다가 문지르지 말고 부드럽게 닦아내세요. 솜이 깨끗해질 때까지 새 솜으로 반복합니다. 메이크업이 진한 날에는 J’essence 폼 클렌저로 세안하세요.'],
  ja: ['クレンジングウォーターはどう使いますか？', 'コットンにたっぷり含ませ、少し肌にのせてから、こすらずにやさしく拭き取ります。コットンが汚れなくなるまで新しいもので繰り返します。メイクが濃い日はJ’essenceの泡洗顔料で洗ってください。'],
  'zh-HK': ['卸妝水怎樣用？', '把化妝棉充分沾濕，在皮膚上稍停片刻，再輕輕抹走，不要用力擦。換新的化妝棉重複，直至乾淨。化濃妝後，再用 J’essence 泡沫潔面洗淨。'],
  th: ['ใช้คลีนซิ่งวอเตอร์อย่างไร?', 'ชุบสำลีให้ชุ่ม วางบนผิวสักครู่ แล้วเช็ดเบา ๆ โดยไม่ถู ทำซ้ำด้วยสำลีแผ่นใหม่จนสะอาด หลังแต่งหน้าหนัก ให้ล้างด้วยโฟมล้างหน้า J’essence'],
  ms: ['Bagaimana menggunakan air pembersih?', 'Basahkan kapas, letakkan pada kulit seketika dan sapu perlahan tanpa menggosok. Ulang dengan kapas baharu sehingga bersih. Selepas solekan tebal, cuci dengan pencuci muka berbuih J’essence.'],
};

const SETS = {
  'diffuser-350g': [scent, ownOil, gift],
  'diffuser-500g': [onggi, scent, ownOil],
  'foam-oil': [secondStep, waterproof, sensitive],
  'foaming-cleanser': [morning, sensitive],
  'cleansing-water': [howWater, waterproof, sensitive],
};

export function productFaq(slug, language = 'en') {
  const set = SETS[slug];
  if (!set) return null;
  const lang = language === 'zh-TW' || language === 'zh' ? 'zh-HK' : L.includes(language) ? language : 'en';
  return { language: lang, label: PRODUCT_FAQ_LABEL[lang], items: set.map((qa) => ({ question: qa[lang][0], answer: qa[lang][1] })) };
}

export function productFaqSchema(slug, language, url) {
  const faq = productFaq(slug, language);
  if (!faq) return null;
  return { '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${url}#faq`, inLanguage: faq.language, mainEntity: faq.items.map((i) => ({ '@type': 'Question', name: i.question, acceptedAnswer: { '@type': 'Answer', text: i.answer } })) };
}
