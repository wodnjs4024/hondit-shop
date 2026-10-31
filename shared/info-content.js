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
        'Maker pages: the same diffusers are listed by StoneJeju at stonejeju.com (350g: product_no=42, 500g: product_no=41).',
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

export const INFO_PAGES = { about: ABOUT_PAGE, faq: FAQ_PAGE };
