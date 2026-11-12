// Plain-language answers about who HONDIT is and about the products, shared by the React pages (src/pages/InfoPage.tsx)
// and the server-rendered HTML (api/_seo-pages.js), so crawlers, answer engines and visitors read the same facts.
// Every statement here comes from facts the site already states elsewhere (product facts, policies, contact page, OUR JEJU).
// Do not add health claims, ratings, reviews or company registration details that are not confirmed by the operator.

export const SITE_FACTS = {
  address: '102 Jejudaehak-ro, Jeju-si, Jeju 63243, Republic of Korea',
  businessRegistration: '637-12-03059', // already shown in the site footer (src/components/home/HomeChrome.tsx)
  email: 'hondit.office@gmail.com',
  phone: '+82 10-3338-2694',
  wechat: 'hondit_jeju',
  instagram: 'https://www.instagram.com/hondit.office/',
  profiles: [
    ['Instagram', 'https://www.instagram.com/hondit.office/'],
    ['Blogger', 'https://hondit-jeju.blogspot.com'],
    ['WordPress', 'https://honditjeju.wordpress.com'],
    ['Tumblr', 'https://www.tumblr.com/hondit-jeju'],
  ],
  makerPages: [
    ['StoneJeju volcanic diffuser 350g (maker page)', 'https://stonejeju.com/product/detail.html?product_no=42'],
    ['StoneJeju volcanic diffuser 500g (maker page)', 'https://stonejeju.com/product/detail.html?product_no=41'],
  ],
};

const WHO = 'HONDIT is the selling and curation brand of a student team in the GTEP programme at Jeju National University. StoneJeju is the maker and product brand of the volcanic-stone diffusers. HONDIT does not manufacture them.';

export const ABOUT_PAGE = {
  path: '/about',
  navLabel: 'About',
  title: 'About HONDIT: who we are and how to check us | HONDIT',
  description: 'HONDIT is a student-led Jeju National University team that sells StoneJeju volcanic-stone diffusers overseas. Who we are, who makes the products, how payment works and how to verify us.',
  h1: 'About HONDIT',
  intro: [
    WHO,
    'We are a small student-led cross-border commerce project, not a large retailer. This page lists what can be checked.',
  ],
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [
        `HONDIT is an independent student-led project based at Jeju National University (${SITE_FACTS.address}). The campus is our working origin, not a university endorsement of any product.`,
        'We introduce Jeju products to customers in Singapore, Hong Kong, Japan, Taiwan and other Asian markets, and answer order questions directly.',
      ],
      links: [['Our Jeju', '/jeju']],
    },
    {
      heading: 'What we sell and who makes it',
      items: [
        'Volcanic Diffuser 350g and 500g: made by StoneJeju (stonejeju.com). HONDIT sells and introduces them.',
        'Cleansing care (Vegan Foam Oil, Foaming Cleanser, Cleansing Water): brand J’essence, manufactured by 제주리퍼블릭. HONDIT sells and curates them.',
      ],
      links: [['Products', '/products']],
    },
    {
      heading: 'How you can check us',
      items: [
        'Maker pages: the same diffusers are listed by StoneJeju at stonejeju.com. The "Maker pages" list below links to both.',
        `Contact: ${SITE_FACTS.email}, WhatsApp and Telegram ${SITE_FACTS.phone}, WeChat ${SITE_FACTS.wechat}, Instagram @hondit.office.`,
        `Address: ${SITE_FACTS.address}.`,
        `Korean business registration number: ${SITE_FACTS.businessRegistration} (also shown in the site footer).`,
        'Policies: shipping, refund, privacy and terms are public and linked below.',
        'Our own channels: Instagram, Blogger, WordPress and Tumblr, listed below.',
      ],
      links: [['Contact', '/contact'], ['Shipping', '/shipping'], ['Refund policy', '/policy/refund'], ['Terms', '/policy/terms'], ['Privacy', '/policy/privacy']],
    },
    {
      heading: 'How ordering and payment work',
      paragraphs: [
        'Choose a product and a quantity, check the order conditions for your country, then pay with PayPal. HONDIT never sees your card details. Orders ship from Korea after payment is confirmed, with tracking information after dispatch. Quantities outside the listed ones are handled as a quote.',
      ],
      links: [['Order conditions by country', '/bulk-orders']],
    },
  ],
  faq: [
    {
      q: 'Is HONDIT a real, trustworthy shop?',
      a: `HONDIT is a small student-led project at Jeju National University, not a large retailer. What can be checked: it operates under Korean business registration number ${SITE_FACTS.businessRegistration}, the products are made by StoneJeju (stonejeju.com), payment is taken by PayPal, the shipping, refund, privacy and terms policies are public, and the team can be reached at ${SITE_FACTS.email} or on WhatsApp ${SITE_FACTS.phone}.`,
    },
    {
      q: 'Who makes the HONDIT diffusers?',
      a: 'StoneJeju makes the volcanic-stone diffusers. HONDIT is the seller and curator that introduces them to overseas customers. The cleansing care products are brand J’essence, manufactured by 제주리퍼블릭.',
    },
    {
      q: 'Is HONDIT the same as JEJU STONE, HEJDIN or other Jeju stone brands?',
      a: 'No. HONDIT is a separate seller. Its diffusers are made by StoneJeju (stonejeju.com). Other Jeju stone or fragrance brands are separate brands and are not HONDIT.',
    },
  ],
};

export const FAQ_PAGE = {
  path: '/faq',
  navLabel: 'FAQ',
  title: 'Jeju volcanic-stone diffuser FAQ: no flame, no electricity | HONDIT',
  description: 'Short answers about Jeju volcanic-stone diffusers: how they work without electricity or flame, which size to choose, how to use and care for them, and how to order from overseas.',
  h1: 'Jeju volcanic-stone diffuser: questions and answers',
  intro: [
    'Short answers about the StoneJeju volcanic-stone diffusers that HONDIT introduces to overseas customers.',
  ],
  sections: [],
  faq: [
    {
      q: 'Is there a home fragrance diffuser that needs no electricity and no flame?',
      a: 'Yes. The StoneJeju volcanic-stone diffuser is porous Jeju volcanic scoria in a vessel. You drop the citrus fragrance oil that comes with it onto the stones. It needs no electricity and no flame, so it can sit on a shelf, desk or counter.',
    },
    {
      q: 'What is a stone diffuser (aroma stone), and how is it different from a reed diffuser or an electric diffuser?',
      a: 'A stone diffuser, also called an aroma stone, is a porous stone that holds a few drops of fragrance oil and lets the scent spread on its own. The StoneJeju diffuser uses Jeju volcanic scoria. Unlike a reed diffuser, it has no reeds and no open bottle of liquid. Unlike an electric or ultrasonic diffuser, it needs no water, cable or power. You add drops only when you want scent.',
    },
    {
      q: 'Is Jeju scoria the same as lava stone or lava rock?',
      a: 'Jeju scoria, called songi (송이) in Korean, is a porous volcanic rock from Jeju Island, formed from lava. Diffusers made from this kind of rock are often called lava stone or lava rock diffusers. Its many small holes are what hold the fragrance oil.',
    },
    {
      q: 'What is a Jeju volcanic-stone (scoria) diffuser and how do you use it?',
      a: 'Jeju scoria is a porous volcanic rock. The stone is arranged in its vessel and 10-12 drops of the 10mL citrus fragrance oil are added onto the stones. Add a few drops again whenever you want to refresh the scent.',
    },
    {
      q: 'Which size should I choose, 350g or 500g?',
      a: 'The 350g has a glass vessel (75 × 100 × 75 mm) and suits small bedrooms, bathrooms, desks and quiet personal spaces. The 500g comes in Jeju onggi pottery (100 × 105 × 100 mm) and suits living rooms, reception desks, studios and hospitality spaces. Both include 10mL citrus fragrance oil.',
    },
    {
      q: 'Where can I buy a Jeju volcanic-stone diffuser from overseas?',
      a: 'HONDIT sells the StoneJeju diffusers to customers in Singapore, Hong Kong, Japan, Taiwan and other Asian markets with direct PayPal checkout at set quantities and delivery from Korea. The quantities and prices for each country are on the order conditions page.',
    },
    {
      q: 'Is it a good non-food gift or souvenir from Jeju?',
      a: 'Many Jeju souvenirs are food. A diffuser made with Jeju volcanic scoria is a non-food option that needs no batteries or power. Because it ships from Korea to overseas addresses, it also works as a gift for someone who cannot visit Jeju.',
    },
    {
      q: 'Can a small shop, studio or guesthouse use it at a front desk?',
      a: 'Yes, that is the use the 500g is recommended for: reception desks, studios and hospitality spaces. It has no flame and no cable, so it only needs a shelf or counter. Quantity orders for businesses are listed on the order conditions page.',
    },
    {
      q: 'Can I order diffusers as corporate gifts or event giveaways in Singapore?',
      a: 'Yes. HONDIT takes quantity orders for teams, events, shops and guesthouses. In Singapore, direct PayPal checkout is open at set quantities with delivery included. Other quantities or mixed sizes are handled as a quote. See the order conditions page, or contact HONDIT with the quantity and the date you need it by.',
    },
    {
      q: 'How do I look after the stone?',
      a: 'Natural stone varies in size and colour and may shed fine powder. Avoid prolonged contact with sensitive or damaged skin and follow the product label. To change the fragrance, rinse the stone in warm water and dry it completely first.',
    },
    {
      q: 'How does ordering, payment and delivery work?',
      a: 'Pay with PayPal at the quantities listed for your country. Orders ship from Korea after payment is confirmed. Delivery is usually 3-5 business days after dispatch, and tracking information is provided after dispatch. Customs, holidays and carrier delays can add time.',
    },
    {
      q: 'Who is HONDIT and who makes the diffusers?',
      a: WHO,
    },
  ],
};

// Korean versions for visitors who chose 한국어. Same facts as the English pages above; the server-rendered
// SEO pages (api/_seo-pages.js) keep using the English INFO_PAGES.
const WHO_KO = 'HONDIT은 제주대학교 GTEP 과정 학생팀이 운영하는 판매·큐레이션 브랜드입니다. 화산석 디퓨저의 제조사이자 제품 브랜드는 StoneJeju이며, HONDIT은 제품을 직접 만들지 않습니다.';

export const ABOUT_PAGE_KO = {
  ...ABOUT_PAGE,
  navLabel: 'HONDIT 소개',
  title: 'HONDIT 소개: 제주대학교 학생팀이 운영하는 제주 화산석 디퓨저 판매처 | HONDIT',
  description: 'HONDIT은 제주대학교 GTEP 학생팀이 운영하는 판매·큐레이션 브랜드입니다. 제조사 StoneJeju, 사업자등록번호, 연락처, PayPal 결제와 배송·환불 정책을 한곳에서 확인하세요.',
  h1: 'HONDIT 소개',
  intro: [
    WHO_KO,
    '대형 쇼핑몰이 아니라 학생이 운영하는 작은 해외 판매 프로젝트입니다. 아래에 직접 확인할 수 있는 정보를 모았습니다.',
  ],
  sections: [
    {
      heading: '우리는 누구인가요',
      paragraphs: [
        `HONDIT은 제주대학교(${SITE_FACTS.address})를 기반으로 한 독립 학생 프로젝트입니다. 캠퍼스는 활동 거점일 뿐, 대학이 제품을 보증하는 것은 아닙니다.`,
        '싱가포르, 홍콩, 일본, 대만 등 아시아 고객에게 제주 제품을 소개하고 주문 문의에 직접 답합니다.',
      ],
      links: [['우리의 제주', '/jeju']],
    },
    {
      heading: '무엇을 팔고, 누가 만드나요',
      items: [
        '볼캐닉 디퓨저 350g·500g: StoneJeju(stonejeju.com)가 만들고 HONDIT이 판매·소개합니다.',
        '클렌징 제품(비건 폼 오일, 포밍 클렌저, 클렌징 워터): J’essence 브랜드, 제주리퍼블릭 제조. HONDIT이 판매·큐레이션합니다.',
      ],
      links: [['상품', '/products']],
    },
    {
      heading: '확인할 수 있는 정보',
      items: [
        '제조사 페이지: 같은 디퓨저가 StoneJeju 사이트(stonejeju.com)에도 올라와 있습니다. 아래 "제조사 페이지" 목록에서 바로 열 수 있습니다.',
        `연락처: ${SITE_FACTS.email}, WhatsApp·Telegram ${SITE_FACTS.phone}, WeChat ${SITE_FACTS.wechat}, Instagram @hondit.office`,
        `주소: ${SITE_FACTS.address}`,
        `사업자등록번호: ${SITE_FACTS.businessRegistration} (사이트 하단에도 표시)`,
        '배송, 환불, 개인정보, 이용약관을 공개하고 있으며 아래에 링크가 있습니다.',
        '운영 채널: Instagram, Blogger, WordPress, Tumblr (아래 목록)',
      ],
      links: [['문의', '/contact'], ['배송 안내', '/shipping'], ['환불 안내', '/policy/refund'], ['이용약관', '/policy/terms'], ['개인정보', '/policy/privacy']],
    },
    {
      heading: '주문과 결제',
      paragraphs: [
        '상품과 수량을 고르고 내 나라의 주문 조건을 확인한 뒤 PayPal로 결제합니다. HONDIT은 카드 정보를 보지 않습니다. 결제가 확인되면 한국에서 발송하고, 발송 후 배송 추적 정보를 보내 드립니다. 정해진 수량 밖의 주문은 견적으로 안내합니다.',
      ],
      links: [['나라별 주문 조건', '/bulk-orders']],
    },
  ],
  faq: [
    {
      q: 'HONDIT은 믿을 수 있는 곳인가요?',
      a: `HONDIT은 제주대학교 학생이 운영하는 작은 프로젝트이며 대형 쇼핑몰이 아닙니다. 확인할 수 있는 것: 사업자등록번호 ${SITE_FACTS.businessRegistration}로 운영하고, 제품은 StoneJeju(stonejeju.com)가 만들며, 결제는 PayPal이 처리합니다. 배송·환불·개인정보·이용약관이 공개되어 있고 ${SITE_FACTS.email} 또는 WhatsApp ${SITE_FACTS.phone}로 연락할 수 있습니다.`,
    },
    {
      q: 'HONDIT 디퓨저는 누가 만드나요?',
      a: 'StoneJeju가 화산석 디퓨저를 만듭니다. HONDIT은 해외 고객에게 소개하고 판매하는 판매자입니다. 클렌징 제품은 J’essence 브랜드로 제주리퍼블릭이 제조합니다.',
    },
    {
      q: 'HONDIT은 JEJU STONE, HEJDIN 같은 다른 제주 돌 브랜드와 같은 곳인가요?',
      a: '아닙니다. HONDIT은 별도의 판매자이며 디퓨저는 StoneJeju(stonejeju.com)가 만듭니다. 다른 제주 돌·향 브랜드는 HONDIT과 관계없는 별도 브랜드입니다.',
    },
  ],
};

export const FAQ_PAGE_KO = {
  ...FAQ_PAGE,
  navLabel: '자주 묻는 질문',
  title: '제주 화산송이 디퓨저 FAQ: 전기·불 없는 스톤 디퓨저 사용법과 해외 주문 | HONDIT',
  description: '제주 화산송이 스톤 디퓨저(아로마 스톤)에 대한 짧은 답변. 리드·전기 디퓨저와의 차이, 350g·500g 고르기, 사용법과 관리, 제주 기념품·기업 선물, 해외 주문과 배송.',
  h1: '제주 화산석 디퓨저, 자주 묻는 질문',
  intro: ['HONDIT이 해외 고객에게 소개하는 StoneJeju 화산석 디퓨저에 대한 짧은 답변입니다.'],
  faq: [
    {
      q: '전기도 불도 쓰지 않는 디퓨저가 있나요?',
      a: '네. StoneJeju 화산석 디퓨저는 용기에 구멍이 많은 제주 송이석을 담은 제품입니다. 함께 들어 있는 시트러스 향 오일을 돌 위에 떨어뜨리면 됩니다. 전기도 불도 필요 없어서 선반, 책상, 카운터 어디에나 둘 수 있습니다.',
    },
    {
      q: '스톤 디퓨저(아로마 스톤)는 리드 디퓨저나 전기 디퓨저와 무엇이 다른가요?',
      a: '스톤 디퓨저는 구멍이 많은 돌에 향 오일을 몇 방울 떨어뜨려 향이 스스로 퍼지게 하는 방식입니다. StoneJeju 디퓨저는 제주 화산송이를 씁니다. 리드 디퓨저처럼 막대나 열린 액체 병이 없고, 전기·초음파 디퓨저처럼 물이나 전선, 전원이 필요 없습니다. 향이 필요할 때만 오일을 더하면 됩니다.',
    },
    {
      q: '제주 송이석은 용암석(라바 스톤)과 같은 건가요?',
      a: '제주 송이(스코리아)는 용암에서 생긴, 구멍이 많은 제주의 화산암입니다. 이런 돌로 만든 디퓨저를 해외에서는 흔히 lava stone, lava rock 디퓨저라고 부릅니다. 작은 구멍들이 향 오일을 머금습니다.',
    },
    {
      q: '제주 화산석(송이석) 디퓨저는 무엇이고 어떻게 쓰나요?',
      a: '제주 송이석은 구멍이 많은 화산암입니다. 용기에 담긴 돌 위에 10mL 시트러스 향 오일을 10~12방울 떨어뜨립니다. 향이 옅어지면 몇 방울 더 떨어뜨립니다.',
    },
    {
      q: '350g과 500g 중 무엇을 고르면 되나요?',
      a: '350g은 유리 용기(75 × 100 × 75 mm)로 작은 침실, 욕실, 책상처럼 조용한 개인 공간에 맞습니다. 500g은 제주 옹기(100 × 105 × 100 mm)로 거실, 안내 데스크, 스튜디오, 숙박 공간에 맞습니다. 두 제품 모두 10mL 시트러스 향 오일이 들어 있습니다.',
    },
    {
      q: '해외에서 제주 화산석 디퓨저를 살 수 있나요?',
      a: 'HONDIT은 싱가포르, 홍콩, 일본, 대만 등 아시아 고객에게 정해진 수량으로 PayPal 바로 결제와 한국 발송을 제공합니다. 나라별 수량과 가격은 주문 조건 페이지에 있습니다.',
    },
    {
      q: '제주 기념품이나 선물로 괜찮나요?',
      a: '제주 기념품은 먹거리가 많습니다. 제주 송이석으로 만든 디퓨저는 배터리나 전원이 필요 없는 먹거리 아닌 선물입니다. 한국에서 해외 주소로 보낼 수 있어서 제주에 올 수 없는 사람에게 주는 선물로도 쓸 수 있습니다.',
    },
    {
      q: '작은 가게, 스튜디오, 게스트하우스 안내 데스크에 둘 수 있나요?',
      a: '네. 500g을 추천하는 용도가 안내 데스크, 스튜디오, 숙박 공간입니다. 불도 전선도 없어서 선반이나 카운터만 있으면 됩니다. 사업자용 수량 주문은 주문 조건 페이지에 있습니다.',
    },
    {
      q: '싱가포르에서 기업 선물이나 행사 기념품으로 주문할 수 있나요?',
      a: '네. HONDIT은 팀, 행사, 가게, 게스트하우스의 수량 주문을 받습니다. 싱가포르는 정해진 수량에서 배송비 포함 PayPal 바로 결제가 열려 있고, 그 밖의 수량이나 크기 섞기는 견적으로 안내합니다. 주문 조건 페이지를 보거나, 필요한 수량과 받을 날짜를 적어 HONDIT에 문의해 주세요.',
    },
    {
      q: '돌은 어떻게 관리하나요?',
      a: '자연석이라 크기와 색이 조금씩 다르고 고운 가루가 나올 수 있습니다. 민감하거나 상처 난 피부에 오래 닿지 않게 하고 제품 라벨을 따라 주세요. 향을 바꾸려면 먼저 돌을 따뜻한 물에 헹군 뒤 완전히 말려 주세요.',
    },
    {
      q: '주문, 결제, 배송은 어떻게 되나요?',
      a: '내 나라에 정해진 수량으로 PayPal 결제를 합니다. 결제가 확인되면 한국에서 발송합니다. 보통 발송 후 영업일 3~5일 안에 도착하며, 발송 후 배송 추적 정보를 드립니다. 통관, 공휴일, 택배사 사정으로 늦어질 수 있습니다.',
    },
    {
      q: 'HONDIT은 누구이고, 디퓨저는 누가 만드나요?',
      a: WHO_KO,
    },
  ],
};


// Japanese and Traditional Chinese versions (same facts as the English pages). Used by the React pages and by the
// server-rendered language versions (/about?lang=ja, /faq?lang=zh-HK ...). Keyword choices follow how people search in
// each market: アロマストーン・溶岩石・済州島 お土産 (JP), 擴香石・火山石擴香・濟州島手信/伴手禮 (HK, TW, MO).
const WHO_JA = 'HONDITは、済州大学校（チェジュ大学）GTEPプログラムの学生チームが運営する販売・キュレーションブランドです。火山石ディフューザーのメーカー兼製品ブランドはStoneJejuで、HONDITは製造していません。';
const WHO_ZH = 'HONDIT 是濟州大學 GTEP 課程學生團隊經營的銷售與選品品牌。火山石擴香的製造商及產品品牌是 StoneJeju，HONDIT 並不生產這些產品。';

export const ABOUT_PAGE_JA = {
  ...ABOUT_PAGE,
  navLabel: 'HONDITについて',
  title: 'HONDITについて：済州大学の学生チームが届ける済州島の火山石ディフューザー | HONDIT',
  description: 'HONDITは済州大学GTEPの学生チームが運営する販売ブランドです。メーカーStoneJeju、事業者登録番号、連絡先、PayPal決済、配送・返金ポリシーを確認できます。',
  h1: 'HONDITについて',
  intro: [
    WHO_JA,
    '大手ショップではなく、学生が運営する小さな越境販売プロジェクトです。このページでは、ご自身で確かめられる情報をまとめています。',
  ],
  sections: [
    {
      heading: '私たちについて',
      paragraphs: [
        `HONDITは済州大学校（${SITE_FACTS.address}）を拠点とする独立した学生プロジェクトです。キャンパスは活動の拠点であり、大学が製品を保証するものではありません。`,
        'シンガポール、香港、日本、台湾などアジアのお客様に済州島の製品を紹介し、注文のご質問に直接お答えしています。',
      ],
      links: [['私たちの済州', '/jeju?lang=ja']],
    },
    {
      heading: '販売している製品とメーカー',
      items: [
        'ボルカニックディフューザー 350g・500g：StoneJeju（stonejeju.com）が製造し、HONDITが販売・紹介しています。',
        'クレンジングケア（ヴィーガンフォームオイル、フォーミングクレンザー、クレンジングウォーター）：ブランドはJ’essence、製造は제주리퍼블릭（Jeju Republic）。HONDITが販売・キュレーションしています。',
      ],
      links: [['製品一覧', '/products?lang=ja']],
    },
    {
      heading: '確認できる情報',
      items: [
        'メーカーページ：同じディフューザーがStoneJejuのサイト（stonejeju.com）にも掲載されています。下の「メーカーページ」から開けます。',
        `連絡先：${SITE_FACTS.email}、WhatsApp・Telegram ${SITE_FACTS.phone}、WeChat ${SITE_FACTS.wechat}、Instagram @hondit.office`,
        `所在地：${SITE_FACTS.address}`,
        `韓国の事業者登録番号：${SITE_FACTS.businessRegistration}（サイト下部にも表示）`,
        '配送・返金・個人情報・利用規約を公開しており、下にリンクがあります。',
        '運営チャンネル：Instagram、Blogger、WordPress、Tumblr（下の一覧）',
      ],
      links: [['お問い合わせ', '/contact'], ['配送案内', '/shipping'], ['返金ポリシー', '/policy/refund'], ['利用規約', '/policy/terms'], ['個人情報', '/policy/privacy']],
    },
    {
      heading: '注文と支払い',
      paragraphs: [
        '製品と数量を選び、お住まいの国の注文条件を確認してからPayPalでお支払いください。HONDITがカード情報を見ることはありません。お支払いの確認後に韓国から発送し、発送後に追跡情報をお送りします。表示以外の数量はお見積もりでご案内します。',
      ],
      links: [['国別の注文条件', '/bulk-orders?lang=ja']],
    },
  ],
  faq: [
    {
      q: 'HONDITは信頼できるショップですか？',
      a: `HONDITは済州大学の学生が運営する小さなプロジェクトで、大手ショップではありません。確認できること：韓国の事業者登録番号${SITE_FACTS.businessRegistration}で運営し、製品はStoneJeju（stonejeju.com）が製造、決済はPayPalが処理します。配送・返金・個人情報・利用規約は公開されており、${SITE_FACTS.email}またはWhatsApp ${SITE_FACTS.phone}で連絡できます。`,
    },
    {
      q: 'HONDITのディフューザーは誰が作っていますか？',
      a: 'StoneJejuが火山石ディフューザーを製造しています。HONDITは海外のお客様に紹介・販売する販売者です。クレンジングケアはJ’essenceブランドで、제주리퍼블릭（Jeju Republic）が製造しています。',
    },
    {
      q: 'HONDITはJEJU STONEやHEJDINなど、ほかの済州ストーンブランドと同じですか？',
      a: 'いいえ。HONDITは別の販売者で、ディフューザーはStoneJeju（stonejeju.com）が製造しています。ほかの済州の石や香りのブランドは、HONDITとは関係のない別ブランドです。',
    },
  ],
};

export const FAQ_PAGE_JA = {
  ...FAQ_PAGE,
  navLabel: 'よくある質問',
  title: '済州島の溶岩石アロマストーン FAQ：電気も火も使わないディフューザー | HONDIT',
  description: '済州島の火山石（溶岩石）を使ったアロマストーン型ディフューザーのよくある質問。リードディフューザーとの違い、350gと500gの選び方、使い方とお手入れ、お土産・ギフト、日本への注文と配送。',
  h1: '済州島の火山石ディフューザー（アロマストーン）よくある質問',
  intro: ['HONDITが海外のお客様に紹介しているStoneJejuの火山石ディフューザーについての短い回答です。'],
  faq: [
    {
      q: '電気も火も使わないルームフレグランスはありますか？',
      a: 'はい。StoneJejuの火山石ディフューザーは、多孔質の済州島の火山石（スコリア）を器に入れたものです。付属のシトラスのフレグランスオイルを石に垂らすだけで、電気も火も使いません。棚、デスク、カウンターに置けます。',
    },
    {
      q: 'アロマストーン（ストーンディフューザー）は、リードディフューザーや電動ディフューザーと何が違いますか？',
      a: 'アロマストーンは、多孔質の石にオイルを数滴含ませ、香りを自然に広げるタイプです。StoneJejuのディフューザーは済州島の火山石を使っています。リードディフューザーのようなスティックや開いた液体ボトルがなく、電動・超音波式のような水やコード、電源も不要です。香りがほしいときだけオイルを足します。',
    },
    {
      q: '済州島の火山石は溶岩石（ラバストーン）と同じですか？',
      a: '済州島のスコリア（韓国語で「ソンイ」）は、溶岩からできた穴の多い済州島の火山岩です。この種の石を使ったディフューザーは、溶岩石やラバストーンのディフューザーとも呼ばれます。小さな穴がフレグランスオイルを含みます。',
    },
    {
      q: '済州島の火山石ディフューザーの使い方は？',
      a: '器に入った石に、付属の10mLシトラスオイルを10〜12滴垂らします。香りが弱くなったら、数滴足してください。',
    },
    {
      q: '350gと500g、どちらを選べばいいですか？',
      a: '350gはガラスの器（75 × 100 × 75 mm）で、寝室、洗面所、デスクなど小さな個人の空間に向いています。500gは済州島の甕器（オンギ）の器（100 × 105 × 100 mm）で、リビング、受付、スタジオ、宿泊施設に向いています。どちらも10mLのシトラスオイル付きです。',
    },
    {
      q: '日本から済州島の火山石ディフューザーを買えますか？',
      a: 'HONDITは日本、シンガポール、香港、台湾などのお客様に、決まった数量でPayPal直接決済と韓国からの発送を行っています。国ごとの数量と価格は注文条件のページに載っています。',
    },
    {
      q: '食べ物以外の済州島のお土産・ギフトになりますか？',
      a: '済州島のお土産は食べ物が多いですが、済州島の火山石を使ったディフューザーは電池も電源もいらない、食べ物以外の選択肢です。韓国から海外の住所へ届けられるので、済州島に来られない方への贈り物にもなります。',
    },
    {
      q: '会社の記念品やイベントのギフトとしてまとめて注文できますか？',
      a: 'はい。HONDITはチーム、イベント、店舗、ゲストハウス向けの数量注文を受け付けています。決められた数量ならPayPalで直接決済でき、送料は価格に含まれます。それ以外の数量やサイズの組み合わせはお見積もりでご案内します。注文条件のページを見るか、必要な数量とお届け希望日をお知らせください。',
    },
    {
      q: 'お店、スタジオ、ゲストハウスの受付に置けますか？',
      a: 'はい。500gのおすすめの用途が、受付、スタジオ、宿泊施設です。火もコードもないので、棚かカウンターがあれば置けます。事業者向けの数量注文は注文条件のページにあります。',
    },
    {
      q: '石のお手入れはどうすればいいですか？',
      a: '天然石のため大きさや色に個体差があり、細かい粉が出ることがあります。敏感な肌や傷のある肌に長く触れないようにし、製品ラベルに従ってください。香りを変えるときは、石をぬるま湯ですすぎ、完全に乾かしてから使ってください。',
    },
    {
      q: '注文、支払い、配送はどうなりますか？',
      a: 'お住まいの国に決められた数量でPayPal決済をします。お支払いの確認後に韓国から発送します。通常、発送後3〜5営業日で届き、発送後に追跡情報をお送りします。通関、祝日、配送会社の事情で遅れることがあります。',
    },
    {
      q: 'HONDITとは？ディフューザーは誰が作っていますか？',
      a: WHO_JA,
    },
  ],
};

export const ABOUT_PAGE_ZH = {
  ...ABOUT_PAGE,
  navLabel: '關於 HONDIT',
  title: '關於 HONDIT：濟州大學學生團隊帶來的濟州火山石擴香 | HONDIT',
  description: 'HONDIT 是濟州大學 GTEP 學生團隊經營的銷售品牌。可查看製造商 StoneJeju、韓國商業登記號碼、聯絡方式、PayPal 付款及運送與退款政策。',
  h1: '關於 HONDIT',
  intro: [
    WHO_ZH,
    '我們不是大型網店，而是學生經營的小型跨境銷售項目。本頁整理了可以自行查證的資料。',
  ],
  sections: [
    {
      heading: '我們是誰',
      paragraphs: [
        `HONDIT 是以濟州大學（${SITE_FACTS.address}）為據點的獨立學生項目。校園只是工作據點，並不代表大學為任何產品背書。`,
        '我們向新加坡、香港、日本、台灣等亞洲顧客介紹濟州產品，並直接回覆訂購查詢。',
      ],
      links: [['我們的濟州', '/jeju?lang=zh-HK']],
    },
    {
      heading: '我們賣甚麼、由誰製造',
      items: [
        '火山石擴香 350g・500g：由 StoneJeju（stonejeju.com）製造，HONDIT 負責銷售與介紹。',
        '潔面護理（純素泡沫油、純素泡沫潔面、純素卸妝水）：品牌 J’essence，由 제주리퍼블릭（Jeju Republic）製造，HONDIT 負責銷售與選品。',
      ],
      links: [['產品', '/products?lang=zh-HK']],
    },
    {
      heading: '可以查證的資料',
      items: [
        '製造商頁面：同一款擴香也刊登在 StoneJeju 網站（stonejeju.com），可從下方「製造商頁面」直接打開。',
        `聯絡方式：${SITE_FACTS.email}、WhatsApp・Telegram ${SITE_FACTS.phone}、WeChat ${SITE_FACTS.wechat}、Instagram @hondit.office`,
        `地址：${SITE_FACTS.address}`,
        `韓國商業登記號碼：${SITE_FACTS.businessRegistration}（網站底部亦有顯示）`,
        '運送、退款、私隱及使用條款均已公開，連結在下方。',
        '官方渠道：Instagram、Blogger、WordPress、Tumblr（見下方列表）',
      ],
      links: [['聯絡我們', '/contact'], ['運送說明', '/shipping'], ['退款政策', '/policy/refund'], ['使用條款', '/policy/terms'], ['私隱政策', '/policy/privacy']],
    },
    {
      heading: '訂購與付款',
      paragraphs: [
        '選擇產品和數量，確認所在地區的訂購條件後，以 PayPal 付款。HONDIT 不會看到你的信用卡資料。確認付款後由韓國發貨，發貨後提供追蹤資料。列表以外的數量會以報價方式處理。',
      ],
      links: [['各地區訂購條件', '/bulk-orders?lang=zh-HK']],
    },
  ],
  faq: [
    {
      q: 'HONDIT 可信嗎？',
      a: `HONDIT 是濟州大學學生經營的小型項目，並非大型網店。可以查證的是：以韓國商業登記號碼 ${SITE_FACTS.businessRegistration} 營運，產品由 StoneJeju（stonejeju.com）製造，付款由 PayPal 處理；運送、退款、私隱及使用條款均已公開，亦可透過 ${SITE_FACTS.email} 或 WhatsApp ${SITE_FACTS.phone} 聯絡我們。`,
    },
    {
      q: 'HONDIT 的擴香由誰製造？',
      a: '火山石擴香由 StoneJeju 製造。HONDIT 是向海外顧客介紹及銷售的賣家。潔面護理產品的品牌是 J’essence，由 제주리퍼블릭（Jeju Republic）製造。',
    },
    {
      q: 'HONDIT 和 JEJU STONE、HEJDIN 等其他濟州石品牌是同一家嗎？',
      a: '不是。HONDIT 是獨立賣家，擴香由 StoneJeju（stonejeju.com）製造。其他濟州石或香氛品牌都是與 HONDIT 無關的獨立品牌。',
    },
  ],
};

export const FAQ_PAGE_ZH = {
  ...FAQ_PAGE,
  navLabel: '常見問題',
  title: '濟州火山石擴香石 FAQ：無需插電、無火的擴香 | HONDIT',
  description: '關於濟州火山石擴香石的常見問題：與藤枝擴香、電動擴香機的分別，350g 與 500g 怎樣選，用法與保養，濟州島手信／伴手禮、公司禮品，以及寄往香港、台灣的訂購與運送。',
  h1: '濟州火山石擴香（擴香石）常見問題',
  intro: ['關於 HONDIT 向海外顧客介紹的 StoneJeju 火山石擴香的簡短解答。'],
  faq: [
    {
      q: '有沒有無需插電、也不用點火的居家香氛？',
      a: '有。StoneJeju 火山石擴香是把多孔的濟州火山石（火山渣）放進容器裏，只要把附送的柑橘香氛油滴在石上便可，無需電力，也不用火，可以放在層架、書桌或櫃枱上。',
    },
    {
      q: '擴香石和藤枝擴香、電動擴香機有甚麼分別？',
      a: '擴香石是讓多孔石頭吸收幾滴香氛油，讓香氣自然散發的方式。StoneJeju 擴香使用濟州火山石。它沒有藤枝擴香的竹枝和開口的液體瓶，也不像電動或超聲波擴香機那樣需要水、電線或電源。想要香氣時才加油即可。',
    },
    {
      q: '濟州火山石和火山岩、熔岩石是同一種東西嗎？',
      a: '濟州的火山渣（韓文叫「송이」songi）是由熔岩形成、佈滿細孔的濟州火山岩。用這類石頭做的擴香，常被稱為火山岩擴香石或熔岩石擴香。石上的細孔就是吸住香氛油的地方。',
    },
    {
      q: '濟州火山石擴香怎樣使用？',
      a: '在容器內的石上滴 10 至 12 滴附送的 10mL 柑橘香氛油。香氣變淡時，再補幾滴即可。',
    },
    {
      q: '350g 和 500g 應該選哪一款？',
      a: '350g 配玻璃容器（75 × 100 × 75 mm），適合細小的睡房、浴室、書桌等個人空間。500g 配濟州甕器（100 × 105 × 100 mm），適合客廳、接待處、工作室和住宿空間。兩款都附 10mL 柑橘香氛油。',
    },
    {
      q: '在香港或台灣可以買到濟州火山石擴香嗎？',
      a: 'HONDIT 為香港、台灣、新加坡、日本等地的顧客提供指定數量的 PayPal 直接付款，並由韓國發貨。各地區的數量與價格列在訂購條件頁面。',
    },
    {
      q: '適合做濟州島手信或伴手禮嗎？',
      a: '濟州島手信多是食品。用濟州火山石製成的擴香是不用電池或電源的非食品選擇。由於可以從韓國寄到海外地址，也適合送給未能來濟州的人。',
    },
    {
      q: '可以訂購作公司禮品或活動禮物嗎？',
      a: '可以。HONDIT 接受團隊、活動、店舖和民宿的數量訂單。指定數量可直接以 PayPal 付款，運費已包含在價格內；其他數量或混合尺寸會以報價處理。請查看訂購條件頁面，或告訴我們所需數量和收貨日期。',
    },
    {
      q: '小店、工作室或民宿的接待處可以擺放嗎？',
      a: '可以。500g 推薦的用途正是接待處、工作室和住宿空間。沒有火也沒有電線，只需要一個層架或櫃枱。商家的數量訂購列在訂購條件頁面。',
    },
    {
      q: '石頭要怎樣保養？',
      a: '天然石的大小和顏色各有不同，可能會有細粉。請避免長時間接觸敏感或受損的皮膚，並依照產品標籤使用。想換香味時，先用溫水沖洗石頭，完全乾透後再使用。',
    },
    {
      q: '訂購、付款和運送是怎樣的？',
      a: '按所在地區指定的數量以 PayPal 付款。確認付款後由韓國發貨，一般在發貨後 3 至 5 個工作天送達，發貨後會提供追蹤資料。清關、公眾假期或速遞公司情況可能令時間延長。',
    },
    {
      q: 'HONDIT 是誰？擴香由誰製造？',
      a: WHO_ZH,
    },
  ],
};

/* The info page for a display language (Traditional Chinese covers zh-HK and zh-TW). */
export function infoPageFor(kind, language) {
  const set = { ko: [ABOUT_PAGE_KO, FAQ_PAGE_KO], ja: [ABOUT_PAGE_JA, FAQ_PAGE_JA], 'zh-HK': [ABOUT_PAGE_ZH, FAQ_PAGE_ZH], 'zh-TW': [ABOUT_PAGE_ZH, FAQ_PAGE_ZH] }[language] || [ABOUT_PAGE, FAQ_PAGE];
  return kind === 'about' ? set[0] : set[1];
}

export const INFO_PAGES = { about: ABOUT_PAGE, faq: FAQ_PAGE };
