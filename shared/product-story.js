// Long product descriptions shown on product pages (React and server-rendered).
// Written for HONDIT from the makers' own published facts, not copied from them:
// - StoneJeju diffusers: official product pages (stonejeju.com product_no 41/42) and their detail images
//   (sizes, 10mL citrus oil, 10-12 drops, warm-water rinse before changing scent, Jeju onggi + scoria).
// - J'essence cleansers by 제주리퍼블릭 (Jeju Republic, Jeju, founded 2019): jejurepublic.com product pages
//   (vegan, for sensitive skin, pH 5.5 weakly acidic, no added fragrance or colour, foam oil turns oil > cream > foam).
// No scent-duration numbers, certifications or ingredient claims the makers have not published for these items.
export const PRODUCT_STORY_LANGUAGES = ['en', 'ko', 'ja', 'zh-HK', 'th', 'ms'];

export const PRODUCT_STORY_LABELS = {
  en: { heading: 'About this product', box: 'In the box', maker: 'Made by' },
  ko: { heading: '제품 이야기', box: '구성품', maker: '제조' },
  ja: { heading: 'この商品について', box: 'セット内容', maker: '製造' },
  'zh-HK': { heading: '關於這件商品', box: '盒內包括', maker: '製造' },
  th: { heading: 'เกี่ยวกับสินค้านี้', box: 'ในกล่องมี', maker: 'ผลิตโดย' },
  ms: { heading: 'Tentang produk ini', box: 'Dalam kotak', maker: 'Dibuat oleh' },
};

const STONEJEJU = 'StoneJeju (스톤제주), Jeju';
const JEJU_REPUBLIC = 'J’essence · 제주리퍼블릭 (Jeju Republic), Jeju';

export const PRODUCT_STORY = {
  'diffuser-350g': {
    maker: STONEJEJU,
    en: {
      paragraphs: [
        'Songi is the red-black volcanic scoria that covers the slopes of Jeju’s oreum, the small volcanic cones that dot the island. Each stone is full of tiny air pockets left by escaping gas when the lava cooled. That porous body is what makes it work: a few drops of oil sink into the stone and leave it slowly, so the scent spreads through the air on its own.',
        'This 350g set puts a handful of Jeju scoria in a black glass vessel and adds a 10mL bottle of citrus fragrance oil inspired by Jeju tangerines. It needs no electricity, no water, no reeds and no flame, so it can sit on a bedside table, a bathroom shelf or a desk without a cable or a candle. The scent is light rather than heavy, and you decide how strong it is by how many drops you add.',
        'To start, drip 10 to 12 drops onto the stones and give them a few minutes to absorb. Add a few drops again when the scent fades. To switch to another oil, rinse the stones in warm water and let them dry completely first. Every stone is natural, so size and colour vary a little from set to set.',
      ],
      box: ['Jeju volcanic scoria, 350g ±', 'Black glass vessel, 75 × 100 × 75 mm', 'Citrus fragrance oil, 10mL', 'Package box'],
    },
    ko: {
      paragraphs: [
        '송이는 제주 오름의 비탈을 덮고 있는 붉고 검은 화산석입니다. 용암이 식을 때 가스가 빠져나가며 남긴 작은 구멍이 돌 전체에 가득합니다. 이 구멍 덕분에 오일 몇 방울이 돌 속으로 스며들었다가 천천히 빠져나오고, 향이 저절로 공간에 퍼집니다.',
        '350g 세트는 제주 화산송이를 검은 유리 용기에 담고, 제주 감귤에서 영감을 받은 시트러스 향 오일 10mL를 함께 넣었습니다. 전기도, 물도, 리드 스틱도, 불도 필요 없어서 침대 옆 협탁이나 욕실 선반, 책상 위에 선 없이 두기 좋습니다. 향은 무겁지 않고 가볍게 퍼지며, 떨어뜨리는 방울 수로 세기를 조절합니다.',
        '처음에는 돌 위에 10~12방울을 떨어뜨리고 몇 분 동안 스며들게 두세요. 향이 옅어지면 몇 방울을 더하면 됩니다. 다른 오일로 바꿀 때는 돌을 따뜻한 물에 헹군 뒤 완전히 말려 주세요. 모두 자연석이라 세트마다 크기와 색이 조금씩 다릅니다.',
      ],
      box: ['제주 화산송이 350g ±', '검은 유리 용기 75 × 100 × 75mm', '시트러스 향 오일 10mL', '포장 상자'],
    },
    ja: {
      paragraphs: [
        'ソンイ（송이）は、済州島に点在する小さな火山「オルム」の斜面を覆う、赤黒い火山礫（スコリア）です。溶岩が冷えるときにガスが抜けてできた細かな穴が、石全体に広がっています。この多孔質の石にオイルを数滴たらすと、石がオイルを吸い込み、少しずつ香りを放ちます。',
        '350gのセットは、済州島のスコリアを黒いガラス容器に入れ、済州のみかんから着想したシトラスのフレグランスオイル10mLを添えました。電気も水もリードスティックも火も使わないので、ベッドサイドや洗面所の棚、デスクにコードなしで置けます。香りは重すぎず軽やかで、たらす滴数で強さを調整できます。',
        '最初は石に10〜12滴たらし、数分なじませてください。香りが弱くなったら数滴足します。別のオイルに替えるときは、石をぬるま湯ですすぎ、完全に乾かしてから使ってください。天然の石なので、大きさや色はセットごとに少しずつ異なります。',
      ],
      box: ['済州島の火山スコリア 350g ±', '黒いガラス容器 75 × 100 × 75 mm', 'シトラスフレグランスオイル 10mL', 'パッケージボックス'],
    },
    'zh-HK': {
      paragraphs: [
        '「松伊」（송이）是覆蓋濟州島各個小火山丘「오름」山坡的紅黑色火山渣。熔岩冷卻時氣體逸出，在石頭內留下無數細小氣孔。正因為這種多孔結構，滴上幾滴香氛油，石頭便會吸收，再慢慢釋放香氣，讓氣味自然散佈在空間裡。',
        '這款350g套裝把濟州火山石放進黑色玻璃容器，並附上以濟州柑橘為靈感的柑橘香氛油10mL。不用插電、不用加水、不用藤枝，也不用點火，放在床頭櫃、浴室層架或書桌上都不需要電線或蠟燭。香氣清新不濃烈，滴多少由你決定。',
        '第一次使用時，在石頭上滴10至12滴，靜待幾分鐘讓油滲入。香氣變淡時再補幾滴即可。如想轉用另一款香油，請先用溫水沖洗石頭並完全晾乾。每顆都是天然石，每套的大小和顏色會略有不同。',
      ],
      box: ['濟州火山石 350g ±', '黑色玻璃容器 75 × 100 × 75 mm', '柑橘香氛油 10mL', '包裝盒'],
    },
    th: {
      paragraphs: [
        'ซงอี (송이) คือหินภูเขาไฟสีแดงอมดำที่ปกคลุมเนินของ “โอรึม” ภูเขาไฟลูกเล็ก ๆ ที่กระจายอยู่ทั่วเกาะเชจู ตอนที่ลาวาเย็นตัว ก๊าซที่หนีออกไปได้ทิ้งรูพรุนเล็ก ๆ ไว้ทั่วทั้งก้อน เมื่อหยดน้ำมันหอมลงไปไม่กี่หยด หินจะดูดซับไว้แล้วค่อย ๆ ปล่อยกลิ่นออกมาเอง',
        'ชุด 350 กรัมนี้ใส่หินภูเขาไฟเชจูในภาชนะแก้วสีดำ พร้อมน้ำมันหอมกลิ่นซิตรัส 10 มล. ที่ได้แรงบันดาลใจจากส้มเชจู ไม่ต้องใช้ไฟฟ้า น้ำ ก้านไม้ หรือเปลวไฟ วางบนโต๊ะข้างเตียง ชั้นในห้องน้ำ หรือโต๊ะทำงานได้โดยไม่ต้องมีสายไฟ กลิ่นเบาสบายไม่ฉุน และปรับความแรงได้จากจำนวนหยด',
        'ครั้งแรกให้หยดน้ำมัน 10–12 หยดลงบนหิน แล้วรอสักครู่ให้ซึมเข้าไป เมื่อกลิ่นจางลงให้เติมอีกไม่กี่หยด หากต้องการเปลี่ยนกลิ่น ให้ล้างหินด้วยน้ำอุ่นและผึ่งให้แห้งสนิทก่อน หินเป็นธรรมชาติ ขนาดและสีจึงต่างกันเล็กน้อยในแต่ละชุด',
      ],
      box: ['หินภูเขาไฟเชจู 350 กรัม ±', 'ภาชนะแก้วสีดำ 75 × 100 × 75 มม.', 'น้ำมันหอมกลิ่นซิตรัส 10 มล.', 'กล่องบรรจุภัณฑ์'],
    },
    ms: {
      paragraphs: [
        'Songi ialah skoria gunung berapi merah kehitaman yang menutupi lereng oreum, kon gunung berapi kecil yang bertaburan di Pulau Jeju. Ketika lava menyejuk, gas yang terlepas meninggalkan liang-liang halus di seluruh batu. Beberapa titis minyak akan meresap ke dalam batu dan dilepaskan perlahan-lahan, jadi bau wangi tersebar sendiri.',
        'Set 350g ini mengisi skoria Jeju dalam bekas kaca hitam, bersama 10mL minyak wangian sitrus yang diilhamkan oleh limau Jeju. Tiada elektrik, air, batang buluh atau api diperlukan, jadi ia sesuai di meja sisi katil, rak bilik air atau meja kerja tanpa kabel. Baunya ringan, dan kekuatannya bergantung pada bilangan titisan.',
        'Untuk bermula, titiskan 10 hingga 12 titis ke atas batu dan biarkan meresap beberapa minit. Tambah beberapa titis apabila bau mula pudar. Untuk menukar minyak, bilas batu dengan air suam dan keringkan sepenuhnya dahulu. Setiap batu adalah semula jadi, jadi saiz dan warnanya berbeza sedikit.',
      ],
      box: ['Skoria gunung berapi Jeju, 350g ±', 'Bekas kaca hitam, 75 × 100 × 75 mm', 'Minyak wangian sitrus, 10mL', 'Kotak pembungkusan'],
    },
  },
  'diffuser-500g': {
    maker: STONEJEJU,
    en: {
      paragraphs: [
        'Two Jeju materials meet in this diffuser. The vessel is Jeju onggi, the earthenware that island households used for generations to store water and food, with the matte, breathing texture of fired clay. Inside sits 500g of songi, the porous volcanic scoria from Jeju’s oreum, whose tiny air pockets take in fragrance oil and release it slowly.',
        'With more stone and a wider vessel than the 350g set, it suits a living room, a reception desk, a shop counter or a guest room. It comes with a 10mL bottle of citrus fragrance oil inspired by Jeju tangerines, and needs no electricity, water, reeds or flame.',
        'Drip 10 to 12 drops onto the stones, let them absorb for a few minutes, and add a few drops again whenever the scent fades. Before changing to another oil, rinse the stones in warm water and dry them completely. Because onggi is fired clay and the stones are natural, each piece varies slightly in colour and form.',
      ],
      box: ['Jeju volcanic scoria, 500g ±', 'Jeju onggi pottery vessel, 100 × 105 × 100 mm', 'Citrus fragrance oil, 10mL', 'Package box'],
    },
    ko: {
      paragraphs: [
        '이 디퓨저에는 제주의 두 가지 재료가 만납니다. 용기는 제주 사람들이 대대로 물과 음식을 담아 온 제주 옹기입니다. 흙이 숨 쉬는 질감이 그대로 남아 있습니다. 그 안에는 제주 오름에서 온 화산송이 500g이 들어 있고, 송이의 작은 구멍이 향 오일을 머금었다가 천천히 내보냅니다.',
        '350g 세트보다 돌이 많고 용기가 넓어서 거실, 안내 데스크, 매장 카운터, 객실에 잘 어울립니다. 제주 감귤에서 영감을 받은 시트러스 향 오일 10mL가 함께 들어 있으며, 전기·물·리드 스틱·불이 모두 필요 없습니다.',
        '돌 위에 10~12방울을 떨어뜨리고 몇 분 동안 스며들게 둔 뒤, 향이 옅어질 때마다 몇 방울씩 더하세요. 다른 오일로 바꾸기 전에는 돌을 따뜻한 물에 헹구고 완전히 말려 주세요. 옹기는 흙을 구워 만들고 돌은 자연석이라, 제품마다 색과 모양이 조금씩 다릅니다.',
      ],
      box: ['제주 화산송이 500g ±', '제주 옹기 용기 100 × 105 × 100mm', '시트러스 향 오일 10mL', '포장 상자'],
    },
    ja: {
      paragraphs: [
        'このディフューザーでは、済州島の2つの素材が出会います。器は、島の家々が代々水や食べ物の保存に使ってきた済州オンギ（甕器）。土が呼吸するような質感がそのまま残っています。中には済州のオルムから来た火山スコリア「ソンイ」500gが入り、細かな穴がフレグランスオイルを含んでゆっくりと香りを放ちます。',
        '350gのセットより石が多く器も広いので、リビング、受付カウンター、店舗のレジ横、客室などに向いています。済州のみかんから着想したシトラスのフレグランスオイル10mL付き。電気・水・リードスティック・火は使いません。',
        '石に10〜12滴たらして数分なじませ、香りが弱くなったら数滴足してください。別のオイルに替える前に、石をぬるま湯ですすいで完全に乾かします。オンギは土を焼いた器、石は天然素材のため、ひとつひとつ色や形が少しずつ異なります。',
      ],
      box: ['済州島の火山スコリア 500g ±', '済州オンギの器 100 × 105 × 100 mm', 'シトラスフレグランスオイル 10mL', 'パッケージボックス'],
    },
    'zh-HK': {
      paragraphs: [
        '這款擴香結合了兩種濟州材料。容器是濟州甕器，島上家家戶戶世代用來盛水和存放食物的陶器，保留了陶土會「呼吸」的質感。裡面盛著500g來自濟州火山丘「오름」的松伊火山石，細小的氣孔會吸住香氛油，再慢慢釋放香氣。',
        '石頭比350g套裝多、容器也更寬，適合放在客廳、接待處、店舖收銀枱或客房。附以濟州柑橘為靈感的柑橘香氛油10mL，不用插電、加水、藤枝或點火。',
        '在石頭上滴10至12滴，靜待幾分鐘讓油滲入，香氣變淡時再補幾滴。轉用另一款香油前，請先用溫水沖洗石頭並完全晾乾。甕器由陶土燒製，石頭是天然石，所以每件的顏色和形狀都略有不同。',
      ],
      box: ['濟州火山石 500g ±', '濟州甕器容器 100 × 105 × 100 mm', '柑橘香氛油 10mL', '包裝盒'],
    },
    th: {
      paragraphs: [
        'ดิฟฟิวเซอร์นี้รวมวัสดุสองอย่างของเชจูไว้ด้วยกัน ภาชนะคือ “องกี” เครื่องปั้นดินเผาเชจู ที่ชาวเกาะใช้เก็บน้ำและอาหารกันมาหลายชั่วรุ่น ผิวดินที่ “หายใจได้” ยังคงอยู่ ข้างในบรรจุหินภูเขาไฟซงอี 500 กรัมจากโอรึมของเชจู รูพรุนเล็ก ๆ จะดูดซับน้ำมันหอมและค่อย ๆ ปล่อยกลิ่นออกมา',
        'มีหินมากกว่าและภาชนะกว้างกว่าชุด 350 กรัม จึงเหมาะกับห้องนั่งเล่น เคาน์เตอร์ต้อนรับ เคาน์เตอร์ร้านค้า หรือห้องพัก มาพร้อมน้ำมันหอมกลิ่นซิตรัส 10 มล. ที่ได้แรงบันดาลใจจากส้มเชจู ไม่ต้องใช้ไฟฟ้า น้ำ ก้านไม้ หรือเปลวไฟ',
        'หยดน้ำมัน 10–12 หยดลงบนหิน รอสักครู่ให้ซึม แล้วเติมอีกไม่กี่หยดเมื่อกลิ่นจางลง ก่อนเปลี่ยนกลิ่น ให้ล้างหินด้วยน้ำอุ่นและผึ่งให้แห้งสนิท องกีเป็นดินเผาและหินเป็นธรรมชาติ สีและรูปทรงของแต่ละชิ้นจึงต่างกันเล็กน้อย',
      ],
      box: ['หินภูเขาไฟเชจู 500 กรัม ±', 'ภาชนะดินเผาองกีเชจู 100 × 105 × 100 มม.', 'น้ำมันหอมกลิ่นซิตรัส 10 มล.', 'กล่องบรรจุภัณฑ์'],
    },
    ms: {
      paragraphs: [
        'Dua bahan Jeju bertemu dalam penyebar aroma ini. Bekasnya ialah onggi Jeju, tembikar yang digunakan penduduk pulau turun-temurun untuk menyimpan air dan makanan, dengan tekstur tanah liat yang “bernafas”. Di dalamnya terdapat 500g songi, skoria gunung berapi dari oreum Jeju, yang liang halusnya menyerap minyak wangian dan melepaskannya perlahan-lahan.',
        'Dengan lebih banyak batu dan bekas yang lebih lebar daripada set 350g, ia sesuai untuk ruang tamu, meja penyambut tetamu, kaunter kedai atau bilik tetamu. Disertakan 10mL minyak wangian sitrus yang diilhamkan oleh limau Jeju. Tiada elektrik, air, batang buluh atau api diperlukan.',
        'Titiskan 10 hingga 12 titis ke atas batu, biarkan meresap beberapa minit, dan tambah beberapa titis apabila bau pudar. Sebelum menukar minyak, bilas batu dengan air suam dan keringkan sepenuhnya. Onggi diperbuat daripada tanah liat bakar dan batunya semula jadi, jadi warna dan bentuk setiap satu berbeza sedikit.',
      ],
      box: ['Skoria gunung berapi Jeju, 500g ±', 'Bekas tembikar onggi Jeju, 100 × 105 × 100 mm', 'Minyak wangian sitrus, 10mL', 'Kotak pembungkusan'],
    },
  },
  'foam-oil': {
    maker: JEJU_REPUBLIC,
    en: {
      paragraphs: [
        'J’essence is a vegan cleansing line from 제주리퍼블릭 (Jeju Republic), a small company founded on Jeju in 2019 to make everyday products from the island. This foam oil is its one-step cleanser: it starts as an oil on dry skin, turns creamy as you massage, and becomes a soft foam when you add water.',
        'The oil stage lifts sunscreen and base makeup, and the foam stage washes it away, so for most evenings one product does the job of an oil cleanser and a face wash. The formula is vegan, weakly acidic at pH 5.5 and has no added fragrance, which suits sensitive skin.',
        'Pump onto dry hands, massage over a dry face, then add a little water and keep massaging until it foams. Rinse well. For waterproof eye or lip makeup, use a dedicated remover first.',
      ],
      box: ['Vegan foam oil, 150ml pump bottle'],
    },
    ko: {
      paragraphs: [
        'J’essence는 2019년 제주에서 시작한 제주리퍼블릭의 비건 클렌징 라인입니다. 이 폼 오일은 한 번에 끝내는 클렌저입니다. 마른 피부에서는 오일로 시작해 문지를수록 크림처럼 바뀌고, 물을 더하면 부드러운 거품이 됩니다.',
        '오일 단계에서 선크림과 베이스 메이크업을 녹여내고, 거품 단계에서 씻어내기 때문에 대부분의 저녁에는 오일 클렌저와 폼 클렌저를 따로 쓸 필요가 없습니다. 비건 포뮬러에 pH 5.5 약산성, 향료를 넣지 않아 민감한 피부에도 쓰기 좋습니다.',
        '마른 손에 펌핑해 마른 얼굴에 마사지한 뒤, 물을 조금 더해 거품이 날 때까지 다시 문지르고 깨끗이 헹구세요. 워터프루프 눈·입술 메이크업은 전용 리무버로 먼저 지워 주세요.',
      ],
      box: ['비건 폼 오일 150ml 펌프 용기'],
    },
    ja: {
      paragraphs: [
        'J’essenceは、2019年に済州島で生まれた제주리퍼블릭（ジェジュ・リパブリック）のヴィーガンクレンジングシリーズです。このフォームオイルは1ステップで完了するクレンザー。乾いた肌ではオイル、なじませるとクリーム状に変わり、水を加えるとやわらかな泡になります。',
        'オイルの段階で日焼け止めやベースメイクを浮かせ、泡の段階で洗い流すので、たいていの夜はオイルクレンジングと洗顔を1本で済ませられます。ヴィーガン処方、pH5.5の弱酸性、香料無添加で、敏感な肌にも使いやすい設計です。',
        '乾いた手にポンプで取り、乾いた顔になじませます。少量の水を加えて泡立つまでさらにマッサージし、よくすすいでください。ウォータープルーフのアイ・リップメイクは、先に専用リムーバーで落としてください。',
      ],
      box: ['ヴィーガンフォームオイル 150ml ポンプボトル'],
    },
    'zh-HK': {
      paragraphs: [
        'J’essence 是濟州公司 제주리퍼블릭（Jeju Republic，2019年於濟州成立）推出的純素潔面系列。這款泡沫油是一步到位的潔面產品：在乾燥肌膚上是油，按摩時變成乳霜質地，加水後化為綿密泡沫。',
        '油的階段溶解防曬和底妝，泡沫階段把它們洗淨，所以大部分晚上一支就能代替卸妝油和洗面奶。純素配方、pH 5.5 弱酸性、不添加香料，適合敏感肌膚。',
        '按壓適量於乾手，在乾臉上按摩，再加少量水繼續按摩至起泡，然後徹底沖洗。防水眼妝或唇妝請先用專用卸妝產品清除。',
      ],
      box: ['純素泡沫油 150ml 按壓瓶'],
    },
    th: {
      paragraphs: [
        'J’essence คือไลน์ทำความสะอาดผิวแบบวีแกนของ 제주리퍼블릭 (Jeju Republic) บริษัทที่ก่อตั้งบนเกาะเชจูในปี 2019 โฟมออยล์นี้เป็นคลีนเซอร์ขั้นตอนเดียว เริ่มจากเป็นออยล์บนผิวแห้ง เปลี่ยนเป็นเนื้อครีมเมื่อนวด และกลายเป็นโฟมนุ่มเมื่อเติมน้ำ',
        'ช่วงที่เป็นออยล์จะละลายครีมกันแดดและเมคอัพรองพื้น ช่วงที่เป็นโฟมจะล้างออก ในคืนส่วนใหญ่จึงใช้ขวดเดียวแทนคลีนซิ่งออยล์และโฟมล้างหน้าได้ สูตรวีแกน ค่า pH 5.5 กรดอ่อน และไม่เติมน้ำหอม เหมาะกับผิวบอบบาง',
        'กดใส่มือที่แห้ง นวดบนใบหน้าที่แห้ง แล้วเติมน้ำเล็กน้อยนวดต่อจนเกิดฟอง จากนั้นล้างออกให้สะอาด สำหรับเมคอัพตาหรือริมฝีปากแบบกันน้ำ ให้ใช้รีมูฟเวอร์เฉพาะก่อน',
      ],
      box: ['โฟมออยล์วีแกน 150 มล. ขวดปั๊ม'],
    },
    ms: {
      paragraphs: [
        'J’essence ialah rangkaian pembersih vegan daripada 제주리퍼블릭 (Jeju Republic), syarikat yang diasaskan di Jeju pada 2019. Minyak buih ini ialah pembersih satu langkah: ia bermula sebagai minyak pada kulit kering, menjadi seperti krim semasa diurut, dan bertukar menjadi buih lembut apabila ditambah air.',
        'Peringkat minyak melarutkan pelindung matahari dan solekan asas, dan peringkat buih membilasnya, jadi pada kebanyakan malam satu botol menggantikan pembersih minyak dan pencuci muka. Formula vegan, pH 5.5 berasid lemah dan tanpa wangian tambahan, sesuai untuk kulit sensitif.',
        'Pam ke tangan yang kering, urut pada muka yang kering, kemudian tambah sedikit air dan urut lagi sehingga berbuih. Bilas dengan bersih. Untuk solekan mata atau bibir kalis air, gunakan penanggal khusus dahulu.',
      ],
      box: ['Minyak buih vegan, botol pam 150ml'],
    },
  },
  'foaming-cleanser': {
    maker: JEJU_REPUBLIC,
    en: {
      paragraphs: [
        'A plain, gentle face wash from J’essence, the vegan cleansing line of 제주리퍼블릭 (Jeju Republic) on Jeju. The pump delivers foam that is ready to use, so there is no lathering in your palm and no squeezing too much.',
        'The formula is vegan and weakly acidic at pH 5.5, close to the skin’s own balance, with no added fragrance or colour. It is made for sensitive skin and for people who want a face wash that cleans and then gets out of the way, morning and evening.',
        'Wet your face with lukewarm water, pump the foam into your hand, massage gently and rinse thoroughly. After an evening with sunscreen or makeup, use it as the second step after the J’essence foam oil or cleansing water.',
      ],
      box: ['Vegan foaming cleanser, 200ml foam pump bottle'],
    },
    ko: {
      paragraphs: [
        '제주리퍼블릭의 비건 클렌징 라인 J’essence의 순한 세안제입니다. 펌프를 누르면 바로 쓸 수 있는 거품이 나와서, 손에서 따로 거품을 낼 필요도 많이 짤 걱정도 없습니다.',
        '비건 포뮬러에 피부 본연의 균형에 가까운 pH 5.5 약산성이며, 향료와 색소를 넣지 않았습니다. 민감한 피부, 그리고 아침저녁으로 깨끗하게 씻고 끝나는 세안제를 원하는 분께 맞춥니다.',
        '미지근한 물로 얼굴을 적신 뒤, 거품을 손에 펌핑해 부드럽게 문지르고 깨끗이 헹구세요. 선크림이나 메이크업을 한 날 저녁에는 J’essence 폼 오일이나 클렌징 워터 다음 두 번째 단계로 쓰면 됩니다.',
      ],
      box: ['비건 폼 클렌저 200ml 거품 펌프 용기'],
    },
    ja: {
      paragraphs: [
        '済州島の제주리퍼블릭（ジェジュ・リパブリック）が手がけるヴィーガンクレンジング、J’essenceのやさしい洗顔料です。ポンプを押すとすぐに使える泡が出るので、手のひらで泡立てる手間も、出しすぎる心配もありません。',
        'ヴィーガン処方で、肌本来のバランスに近いpH5.5の弱酸性。香料・着色料は加えていません。敏感な肌の方や、朝晩すっきり洗えてシンプルに終わる洗顔料を求める方に向いています。',
        'ぬるま湯で顔を濡らし、泡を手に取ってやさしくなじませ、よくすすいでください。日焼け止めやメイクをした日の夜は、J’essenceのフォームオイルやクレンジングウォーターのあとの2ステップ目に使えます。',
      ],
      box: ['ヴィーガン泡洗顔料 200ml 泡ポンプボトル'],
    },
    'zh-HK': {
      paragraphs: [
        '來自濟州 제주리퍼블릭（Jeju Republic）純素潔面系列 J’essence 的溫和洗面泡沫。一按即出現成泡沫，不用在掌心起泡，也不怕擠得太多。',
        '純素配方，pH 5.5 弱酸性，接近肌膚本身的平衡，不添加香料及色素。適合敏感肌膚，以及想要早晚洗得乾淨、步驟簡單的人。',
        '先用溫水沾濕面部，按壓泡沫於手心，輕輕按摩後徹底沖洗。塗了防曬或化妝的晚上，可在 J’essence 泡沫油或卸妝水之後作為第二步使用。',
      ],
      box: ['純素泡沫潔面 200ml 泡沫按壓瓶'],
    },
    th: {
      paragraphs: [
        'โฟมล้างหน้าสูตรอ่อนโยนจาก J’essence ไลน์ทำความสะอาดผิวแบบวีแกนของ 제주리퍼블릭 (Jeju Republic) บนเกาะเชจู หัวปั๊มให้โฟมพร้อมใช้ทันที ไม่ต้องตีฟองในมือและไม่ต้องกังวลว่าจะบีบมากเกินไป',
        'สูตรวีแกน ค่า pH 5.5 กรดอ่อนใกล้เคียงสมดุลตามธรรมชาติของผิว ไม่เติมน้ำหอมและสี เหมาะกับผิวบอบบาง และคนที่อยากได้โฟมล้างหน้าที่ล้างสะอาดแล้วจบ ทั้งเช้าและเย็น',
        'ล้างหน้าด้วยน้ำอุ่น กดโฟมใส่มือ นวดเบา ๆ แล้วล้างออกให้สะอาด ในคืนที่ทาครีมกันแดดหรือแต่งหน้า ใช้เป็นขั้นตอนที่สองหลังโฟมออยล์หรือคลีนซิ่งวอเตอร์ของ J’essence',
      ],
      box: ['โฟมล้างหน้าวีแกน 200 มล. ขวดปั๊มโฟม'],
    },
    ms: {
      paragraphs: [
        'Pencuci muka yang lembut daripada J’essence, rangkaian pembersih vegan 제주리퍼블릭 (Jeju Republic) di Jeju. Pamnya mengeluarkan buih yang sedia digunakan, jadi tidak perlu membuih di tapak tangan atau risau mengambil terlalu banyak.',
        'Formula vegan dan berasid lemah pada pH 5.5, hampir dengan keseimbangan semula jadi kulit, tanpa wangian atau pewarna tambahan. Dibuat untuk kulit sensitif dan sesiapa yang mahukan pencuci muka yang ringkas, pagi dan malam.',
        'Basahkan muka dengan air suam, pam buih ke tangan, urut perlahan dan bilas dengan bersih. Selepas memakai pelindung matahari atau solekan, gunakan sebagai langkah kedua selepas minyak buih atau air pembersih J’essence.',
      ],
      box: ['Pencuci muka berbuih vegan, botol pam buih 200ml'],
    },
  },
  'cleansing-water': {
    maker: JEJU_REPUBLIC,
    en: {
      paragraphs: [
        'The lightest step in the J’essence vegan cleansing line from 제주리퍼블릭 (Jeju Republic) on Jeju. It is a water-textured cleanser you use with a cotton pad, for light makeup, a midday reset or the first wipe before washing.',
        'The formula is vegan, weakly acidic at pH 5.5 and has no added fragrance, and it is made for sensitive skin. Because you wipe rather than scrub, it keeps cleansing quick on days when you do not want a full routine.',
        'Soak a cotton pad, hold it on the skin for a moment, then wipe gently without rubbing. Use a fresh pad until it comes away clean. On heavier makeup days, follow with the J’essence foaming cleanser.',
      ],
      box: ['Vegan cleansing water, 300ml bottle'],
    },
    ko: {
      paragraphs: [
        '제주리퍼블릭의 비건 클렌징 라인 J’essence에서 가장 가벼운 단계입니다. 화장솜에 덜어 쓰는 물 같은 제형의 클렌저로, 가벼운 메이크업이나 낮 동안의 리셋, 세안 전 첫 닦아내기에 씁니다.',
        '비건 포뮬러에 pH 5.5 약산성, 향료를 넣지 않았고 민감한 피부를 위해 만들었습니다. 문지르지 않고 닦아내는 방식이라 긴 루틴이 부담스러운 날에도 클렌징을 빠르게 끝낼 수 있습니다.',
        '화장솜을 충분히 적셔 잠시 피부에 올려 두었다가, 문지르지 말고 부드럽게 닦아내세요. 화장솜이 깨끗해질 때까지 새 솜으로 반복합니다. 메이크업이 진한 날에는 J’essence 폼 클렌저로 이어서 세안하세요.',
      ],
      box: ['비건 클렌징 워터 300ml'],
    },
    ja: {
      paragraphs: [
        '済州島の제주리퍼블릭（ジェジュ・リパブリック）によるヴィーガンクレンジング、J’essenceでいちばん軽いステップ。コットンで使う水のようなテクスチャーのクレンザーで、薄いメイク、日中のリセット、洗顔前の拭き取りに使います。',
        'ヴィーガン処方、pH5.5の弱酸性、香料無添加で、敏感な肌のためにつくられています。こすらず拭き取るだけなので、しっかりしたケアをしたくない日もクレンジングを手早く終えられます。',
        'コットンにたっぷり含ませ、少し肌にのせてから、こすらずにやさしく拭き取ります。コットンが汚れなくなるまで新しいものに替えて繰り返してください。メイクがしっかりした日は、J’essenceの泡洗顔料で仕上げます。',
      ],
      box: ['ヴィーガンクレンジングウォーター 300ml'],
    },
    'zh-HK': {
      paragraphs: [
        '濟州 제주리퍼블릭（Jeju Republic）純素潔面系列 J’essence 中最輕盈的一步。水狀質地，配合化妝棉使用，適合淡妝、日間補妝前的清潔，或洗臉前的第一次抹拭。',
        '純素配方、pH 5.5 弱酸性、不添加香料，專為敏感肌膚而設。用抹而不用擦，在不想做完整護膚步驟的日子也能快速完成清潔。',
        '把化妝棉充分沾濕，在皮膚上稍停片刻，再輕輕抹走，不要用力擦。換上新的化妝棉重複，直至棉片乾淨。化濃妝的日子，之後再用 J’essence 泡沫潔面洗淨。',
      ],
      box: ['純素卸妝水 300ml'],
    },
    th: {
      paragraphs: [
        'ขั้นตอนที่เบาที่สุดในไลน์ทำความสะอาดผิวแบบวีแกน J’essence ของ 제주리퍼블릭 (Jeju Republic) บนเกาะเชจู เป็นคลีนเซอร์เนื้อน้ำที่ใช้กับสำลี สำหรับเมคอัพบาง ๆ การรีเฟรชผิวระหว่างวัน หรือการเช็ดครั้งแรกก่อนล้างหน้า',
        'สูตรวีแกน ค่า pH 5.5 กรดอ่อน ไม่เติมน้ำหอม และทำมาเพื่อผิวบอบบาง ใช้วิธีเช็ดแทนการขัดถู จึงทำความสะอาดได้รวดเร็วในวันที่ไม่อยากทำหลายขั้นตอน',
        'ชุบสำลีให้ชุ่ม วางบนผิวสักครู่ แล้วเช็ดเบา ๆ โดยไม่ถู เปลี่ยนสำลีแผ่นใหม่จนกว่าจะสะอาด ในวันที่แต่งหน้าหนัก ให้ล้างต่อด้วยโฟมล้างหน้า J’essence',
      ],
      box: ['คลีนซิ่งวอเตอร์วีแกน 300 มล.'],
    },
    ms: {
      paragraphs: [
        'Langkah paling ringan dalam rangkaian pembersih vegan J’essence daripada 제주리퍼블릭 (Jeju Republic) di Jeju. Pembersih bertekstur air yang digunakan dengan kapas, untuk solekan ringan, menyegarkan kulit pada waktu siang atau sapuan pertama sebelum mencuci muka.',
        'Formula vegan, berasid lemah pada pH 5.5, tanpa wangian tambahan, dan dibuat untuk kulit sensitif. Anda hanya menyapu tanpa menggosok, jadi pembersihan cepat pada hari anda tidak mahu rutin penuh.',
        'Basahkan kapas, letakkan pada kulit seketika, kemudian sapu perlahan tanpa menggosok. Gunakan kapas baharu sehingga ia bersih. Pada hari solekan tebal, ikuti dengan pencuci muka berbuih J’essence.',
      ],
      box: ['Air pembersih vegan, botol 300ml'],
    },
  },
};

export function productStory(slug, language = 'en') {
  const entry = PRODUCT_STORY[slug];
  if (!entry) return null;
  const lang = language === 'zh-TW' || language === 'zh' ? 'zh-HK' : PRODUCT_STORY_LANGUAGES.includes(language) ? language : 'en';
  const copy = entry[lang] || entry.en;
  return { ...copy, maker: entry.maker, labels: PRODUCT_STORY_LABELS[lang] || PRODUCT_STORY_LABELS.en, language: lang };
}
