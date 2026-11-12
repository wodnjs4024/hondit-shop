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
  h1: '제주 화산석 디퓨저, 자주 묻는 질문',
  intro: ['HONDIT이 해외 고객에게 소개하는 StoneJeju 화산석 디퓨저에 대한 짧은 답변입니다.'],
  faq: [
    {
      q: '전기도 불도 쓰지 않는 디퓨저가 있나요?',
      a: '네. StoneJeju 화산석 디퓨저는 용기에 구멍이 많은 제주 송이석을 담은 제품입니다. 함께 들어 있는 시트러스 향 오일을 돌 위에 떨어뜨리면 됩니다. 전기도 불도 필요 없어서 선반, 책상, 카운터 어디에나 둘 수 있습니다.',
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

export const INFO_PAGES = { about: ABOUT_PAGE, faq: FAQ_PAGE };
