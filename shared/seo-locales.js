// Language versions of the server-rendered storefront pages (api/_seo-pages.js), for search in each market.
// Same facts as the English pages: product facts (src/data/productFacts.ts), storefront catalog, checkout terms.
// Product names match what the React storefront shows in that language (src/lib/market.tsx productText).
// Keywords follow what people type in each market (checked 2026-11-12 against marketplace and guide pages):
//   en  stone diffuser, aroma stone, lava stone / lava rock diffuser, no electricity, waterless, reed diffuser alternative,
//       Jeju souvenir, Korean gift, corporate gift Singapore
//   ja  アロマストーン, 溶岩石, 火山石, 電気不要, 火を使わない, 済州島 お土産, ギフト
//   zh  擴香石, 火山石擴香, 火山岩, 無需插電, 濟州島手信, 伴手禮, 公司禮品 (one Traditional Chinese page for HK, TW, MO)
//   ko  화산송이 디퓨저, 스톤 디퓨저, 무전원 디퓨저, 제주 기념품, 제주 선물
// Do not add health claims, scent duration, ratings or anything the product facts do not state.

/* Display languages that have their own indexable server-rendered version (?lang=<code>). English is the default URL. */
export const SEO_LANGUAGES = ['en', 'ko', 'ja', 'zh-HK'];
/* hreflang values each version answers for. The Traditional Chinese page serves Hong Kong, Taiwan and Macau readers. */
export const HREFLANGS = { en: ['en'], ko: ['ko'], ja: ['ja'], 'zh-HK': ['zh-Hant', 'zh-HK', 'zh-TW', 'zh-MO'] };
export const HTML_LANG = { en: 'en', ko: 'ko', ja: 'ja', 'zh-HK': 'zh-Hant' };
export const OG_LOCALE = { en: 'en_SG', ko: 'ko_KR', ja: 'ja_JP', 'zh-HK': 'zh_HK' };
/* Storefront paths that have language versions. */
export const LOCALIZED_PAGES = ['home', 'products', 'product', 'bulk', 'jeju', 'about', 'faq'];
export function canonicalSeoLanguage(lang) {
  if (lang === 'zh-TW' || lang === 'zh') return 'zh-HK';
  return SEO_LANGUAGES.includes(lang) ? lang : 'en';
}

const P350 = 'diffuser-350g';
const P500 = 'diffuser-500g';

export const LOCALES = {
  ko: {
    nav: { '/': '홈', '/products': '상품', '/bulk-orders': '묶음 주문', '/jeju': '우리의 제주', '/about': 'HONDIT 소개', '/faq': '자주 묻는 질문', '/journal': '저널', '/shipping': '배송 안내', '/contact': '문의' },
    footer: (reg) => `HONDIT · 제주대학교 GTEP 학생팀 · 사업자등록번호 ${reg}`,
    brandLine: 'HONDIT은 제주대학교 GTEP 과정 학생팀이 운영하는 판매·큐레이션 브랜드입니다. 화산석 디퓨저의 제조사이자 제품 브랜드는 StoneJeju입니다.',
    whoLine: 'HONDIT은 디퓨저를 직접 만들지 않습니다. 해외 고객에게 소개하고 주문 문의에 답합니다.',
    countries: { SG: '싱가포르', HK: '홍콩', JP: '일본', TW: '대만', TH: '태국', MY: '말레이시아', BN: '브루나이', MO: '마카오' },
    tier: (q, price, included) => `${q}개: 개당 ${price}${included ? ', 배송비 포함' : ''}`,
    noDirect: '이 상품은 바로 결제가 열려 있지 않습니다. HONDIT에 견적을 문의해 주세요.',
    termsNote: '표시된 수량은 PayPal로 바로 결제합니다. 그 밖의 수량, 크기 섞기, 재고보다 많은 주문은 견적으로 안내하며, 도착 국가의 관세와 세금은 받는 분이 부담합니다.',
    label: { content: '구성', container: '용기', size: '크기', oil: '향 오일', maker: '제조사·제품 브랜드', seller: '판매·큐레이션', highlights: '특징', howTo: '사용 방법', followLabel: '제품 라벨을 따라 주세요.', goodFor: '이런 곳에 좋아요', care: '관리', terms: '나라별 주문 조건', chooseQty: '수량 고르기', refund: '환불 안내', shipping: '배송 안내', ask: '문의하기', orderConditions: '주문 조건', products: '상품', careBrand: '브랜드: J’essence. 제조: 제주리퍼블릭. 판매·큐레이션: HONDIT.' },
    facts: { [P350]: { content: '제주 화산송이 약 350g', container: '유리 용기', oil: '시트러스 향 오일 10mL 포함' }, [P500]: { content: '제주 화산송이 약 500g', container: '제주 옹기', oil: '시트러스 향 오일 10mL 포함' } },
    care: ['자연석이라 크기와 색이 조금씩 다르고 고운 가루가 나올 수 있습니다.', '민감하거나 상처 난 피부에 오래 닿지 않게 하고 제품 라벨을 따라 주세요.', '향을 바꾸기 전에는 돌을 따뜻한 물에 헹군 뒤 완전히 말려 주세요.'],
    products: {
      [P350]: { name: '볼캐닉 디퓨저 350g', title: '볼캐닉 디퓨저 350g: 유리 용기 제주 화산송이 스톤 디퓨저, 전기·불 없이 | HONDIT', description: '제주 화산송이 약 350g을 유리 용기에 담은 무전원 스톤 디퓨저. 시트러스 향 오일 10mL 포함, 침실·욕실·책상용. 제조 StoneJeju, 판매 HONDIT. 나라별 해외 주문 수량과 가격.', body: '구멍이 많은 제주 화산송이를 유리 용기에 담은 작은 스톤 디퓨저입니다. 함께 든 시트러스 향 오일을 돌 위에 떨어뜨리면 전기도 불도 없이 향이 퍼집니다.', highlights: ['제주 화산송이 약 350g', '시트러스 향 오일 10mL 포함', '불과 전기 불필요', '침실, 욕실, 책상에 적합'], howTo: ['화산송이를 용기에 담습니다.', '시트러스 오일을 돌 위에 10~12방울 떨어뜨립니다.', '스며들면 향이 필요할 때마다 몇 방울 더합니다.'], goodFor: '작은 침실, 욕실, 책상처럼 조용한 개인 공간.' },
      [P500]: { name: '볼캐닉 디퓨저 500g', title: '볼캐닉 디퓨저 500g: 제주 옹기에 담은 화산송이 디퓨저, 전기·불 없이 | HONDIT', description: '제주 화산송이 약 500g을 제주 옹기에 담은 무전원 디퓨저. 시트러스 향 오일 10mL 포함, 거실·안내 데스크·숙박 공간용. 제조 StoneJeju, 판매 HONDIT. 나라별 해외 주문 조건.', body: '제주 화산송이를 제주 옹기에 담은 큰 스톤 디퓨저입니다. 송이석이 시트러스 오일을 머금어 전기도 불도 없이 향을 냅니다.', highlights: ['제주 화산송이 약 500g', '시트러스 향 오일 10mL 포함', '제주 옹기 용기', '집이나 매장에 두기 좋은 큰 오브제'], howTo: ['화산송이를 용기에 담습니다.', '위쪽 돌에 고루 10~12방울 떨어뜨립니다.', '원할 때만 향을 더합니다.'], goodFor: '거실, 안내 데스크, 스튜디오, 숙박 공간.' },
      'foam-oil': { name: '비건 폼 오일 150ml', title: '비건 폼 오일 150ml: pH 5.5 무향 클렌저 | HONDIT', description: '선스크린과 베이스 메이크업을 지우는 pH 5.5 무향 비건 폼 오일 클렌저. J’essence 브랜드, 제주리퍼블릭 제조, HONDIT 판매. 나라별 묶음 주문 조건.', body: '선스크린, 베이스 메이크업, 저녁 클렌징을 위한 pH 5.5 비건 폼 오일 클렌저입니다. 무향입니다.', highlights: ['비건 포뮬러', 'pH 5.5', '무향', '선스크린과 베이스 메이크업용'], howTo: ['마른 손에 펌프합니다.', '마른 얼굴에 부드럽게 마사지합니다.', '물을 더해 거품을 낸 뒤 깨끗이 헹굽니다.'], goodFor: '선스크린이나 가벼운 메이크업을 지우는 저녁 클렌징.' },
      'foaming-cleanser': { name: '비건 포밍 클렌저 200ml', title: '비건 포밍 클렌저 200ml: pH 5.5 무향 거품 세안제 | HONDIT', description: '펌프로 바로 거품이 나오는 pH 5.5 무향 비건 포밍 클렌저. J’essence 브랜드, 제주리퍼블릭 제조, HONDIT 판매. 나라별 묶음 주문 조건.', body: 'pH 5.5 포뮬러의 무향 비건 포밍 클렌저입니다. 펌프를 누르면 바로 쓰는 거품이 나옵니다.', highlights: ['비건 포뮬러', 'pH 5.5', '무향', '바로 쓰는 부드러운 거품'], howTo: ['미지근한 물로 얼굴을 적십니다.', '거품을 손에 펌프합니다.', '부드럽게 마사지하고 깨끗이 헹굽니다.'], goodFor: '아침 세안과 단순한 매일 세안.' },
      'cleansing-water': { name: '비건 클렌징 워터 300ml', title: '비건 클렌징 워터 300ml: pH 5.5 무향 클렌징 워터 | HONDIT', description: '가벼운 메이크업과 빠른 클렌징을 위한 pH 5.5 무향 비건 클렌징 워터. J’essence 브랜드, 제주리퍼블릭 제조, HONDIT 판매. 나라별 묶음 주문 조건.', body: '가벼운 메이크업과 빠른 리셋을 위한 무향 비건 클렌징 워터입니다. pH 5.5 포뮬러입니다.', highlights: ['비건 포뮬러', 'pH 5.5', '무향', '가벼운 메이크업과 빠른 클렌징용'], howTo: ['화장솜에 클렌징 워터를 적십니다.', '문지르지 말고 얼굴을 부드럽게 닦습니다.', '필요하면 물 세안제로 마무리합니다.'], goodFor: '가벼운 메이크업, 빠른 클렌징, 간단한 저녁 정리.' },
    },
    pages: {
      home: { title: '제주 화산송이 디퓨저, 전기·불 없는 스톤 디퓨저 | 제주 기념품·선물 | HONDIT', description: 'StoneJeju가 만든 제주 화산송이 스톤 디퓨저(350g·500g)와 제주 클렌징 케어. 제주대학교 학생팀 HONDIT이 싱가포르·홍콩·일본·대만으로 PayPal 결제와 한국 발송으로 보냅니다.', h1: '향을 머금는 제주 화산석, HONDIT', scentH2: '화산송이 스톤 디퓨저', scentP: '구멍이 많은 제주 화산송이를 용기에 담고, 함께 든 시트러스 향 오일 10mL를 떨어뜨려 씁니다. 전기도 불도, 리드 막대도 필요 없습니다.', careH2: '클렌징 케어', orderH2: '주문 방법', orderP: '상품과 수량을 고르고 내 나라의 주문 조건을 확인한 뒤, 바로 결제가 열린 나라는 PayPal로 결제합니다.', giftH2: '제주 기념품과 단체 선물', giftP: '먹거리가 아닌 제주 기념품을 찾는다면 화산송이 디퓨저가 좋습니다. 해외 주소로 보낼 수 있고, 기업 선물이나 행사 기념품처럼 수량 주문도 받습니다.', fromH2: '제주에서' },
      products: { title: '상품: 제주 화산송이 디퓨저와 클렌징 케어 | HONDIT', description: 'HONDIT 상품 목록: StoneJeju 제주 화산송이 스톤 디퓨저 350g·500g과 J’essence 비건 클렌징 케어. 나라별 해외 주문 조건 포함.', h1: 'HONDIT 상품', note: '주문 조건은 나라마다 다릅니다. 묶음 주문 안내를 확인해 주세요.' },
      bulk: { title: '해외 묶음 주문과 단체·기업 선물 주문 | HONDIT', description: 'HONDIT 해외 묶음 주문 안내: 나라별 PayPal 바로 결제 수량, 배송비 포함 가격, 견적 주문. 기업 선물·행사 기념품·매장용 수량 주문.', h1: '해외 묶음 주문', intro: '나라마다 정해진 수량만 바로 결제할 수 있고, 그 가격에 배송비가 포함됩니다. 그 밖의 주문은 견적으로 안내합니다.' },
      jeju: { title: '우리의 제주: 제주대학교 학생 프로젝트 HONDIT', description: 'HONDIT은 제주에서 시작했습니다. 제주대학교 학생이 운영하는 독립 해외 판매 프로젝트로, StoneJeju 화산석 디퓨저를 해외 고객에게 소개합니다.', h1: '우리의 제주', paras: ['HONDIT은 제주대학교(제주시 제주대학로 102, 63243)를 거점으로 한 독립 학생 해외 판매 프로젝트입니다. 캠퍼스는 활동 거점일 뿐, 제품을 보증하는 것은 아닙니다.'] },
    },
  },

  ja: {
    nav: { '/': 'ホーム', '/products': '製品一覧', '/bulk-orders': 'まとめて注文', '/jeju': '私たちの済州', '/about': 'HONDITについて', '/faq': 'よくある質問', '/journal': 'ジャーナル', '/shipping': '配送案内', '/contact': 'お問い合わせ' },
    footer: (reg) => `HONDIT · 済州大学校GTEP学生チーム · 韓国事業者登録番号 ${reg}`,
    brandLine: 'HONDITは、済州大学校GTEPプログラムの学生チームが運営する販売・キュレーションブランドです。火山石ディフューザーのメーカー兼製品ブランドはStoneJejuです。',
    whoLine: 'HONDITはディフューザーを製造していません。海外のお客様に紹介し、注文のご質問にお答えしています。',
    countries: { SG: 'シンガポール', HK: '香港', JP: '日本', TW: '台湾', TH: 'タイ', MY: 'マレーシア', BN: 'ブルネイ', MO: 'マカオ' },
    tier: (q, price, included) => `${q}個：1個あたり ${price}${included ? '（送料込み）' : ''}`,
    noDirect: 'この製品は直接決済に対応していません。HONDITにお見積もりをご依頼ください。',
    termsNote: '表示の数量はPayPalで直接お支払いいただけます。それ以外の数量、サイズの組み合わせ、在庫を超えるご注文はお見積もりとなり、お届け先の国の関税・税金は受取人のご負担です。',
    label: { content: '内容', container: '器', size: 'サイズ', oil: 'フレグランスオイル', maker: 'メーカー・製品ブランド', seller: '販売・キュレーション', highlights: '特徴', howTo: '使い方', followLabel: '製品ラベルに従ってください。', goodFor: 'おすすめの場所', care: 'お手入れ', terms: '国別の注文条件', chooseQty: '数量を選ぶ', refund: '返金ポリシー', shipping: '配送案内', ask: 'お問い合わせ', orderConditions: '注文条件', products: '製品一覧', careBrand: 'ブランド：J’essence。製造：제주리퍼블릭（Jeju Republic）。販売・キュレーション：HONDIT。' },
    facts: { [P350]: { content: '済州島の火山石 約350g', container: 'ガラスの器', oil: 'シトラスのフレグランスオイル 10mL付き' }, [P500]: { content: '済州島の火山石 約500g', container: '済州島の甕器（オンギ）', oil: 'シトラスのフレグランスオイル 10mL付き' } },
    care: ['天然石のため大きさや色に個体差があり、細かい粉が出ることがあります。', '敏感な肌や傷のある肌に長く触れないようにし、製品ラベルに従ってください。', '香りを変える前に、石をぬるま湯ですすぎ、完全に乾かしてください。'],
    products: {
      [P350]: { name: 'ボルカニックディフューザー 350g', title: 'ボルカニックディフューザー 350g｜済州島の溶岩石アロマストーン・電気不要｜HONDIT', description: '済州島の火山石（溶岩石）約350gをガラスの器に入れた、電気も火も使わないアロマストーン型ディフューザー。シトラスオイル10mL付き。寝室・洗面所・デスクに。製造StoneJeju、販売HONDIT。', body: '多孔質の済州島の火山石をガラスの器に入れた、小さなアロマストーン型ディフューザーです。付属のシトラスオイルを石に垂らすと、電気も火も使わずに香りが広がります。', highlights: ['済州島の火山石 約350g', 'シトラスオイル10mL付き', '火も電気も不要', '寝室、洗面所、デスクに'], howTo: ['火山石を器に入れます。', 'シトラスオイルを石に10〜12滴垂らします。', 'しみ込んだら、香りがほしいときに数滴足します。'], goodFor: '小さな寝室、洗面所、デスクなど静かな個人の空間。' },
      [P500]: { name: 'ボルカニックディフューザー 500g', title: 'ボルカニックディフューザー 500g｜済州島の甕器と火山石のアロマストーン｜HONDIT', description: '済州島の火山石約500gを済州島の甕器（オンギ）に入れた、電気不要のアロマストーン型ディフューザー。シトラスオイル10mL付き。リビング・受付・宿泊施設に。製造StoneJeju、販売HONDIT。', body: '済州島の火山石を済州島の甕器（オンギ）に入れた、大きめのストーンディフューザーです。スコリアがシトラスオイルを含み、電気も火も使わずに香ります。', highlights: ['済州島の火山石 約500g', 'シトラスオイル10mL付き', '済州島の甕器（オンギ）', '住まいにもお店にも置ける大きめのオブジェ'], howTo: ['火山石を器に並べます。', '上の石に10〜12滴、まんべんなく垂らします。', '香りは好きなときだけ足します。'], goodFor: 'リビング、受付、スタジオ、宿泊施設。' },
      'foam-oil': { name: 'ヴィーガンフォームオイル 150ml', title: 'ヴィーガンフォームオイル 150ml｜pH5.5・無香料クレンジング｜HONDIT', description: '日焼け止めやベースメイクを落とす、pH5.5・無香料のヴィーガンフォームオイルクレンザー。ブランドJ’essence、製造제주리퍼블릭、販売HONDIT。国別の注文条件。', body: '日焼け止め、ベースメイク、夜のクレンジングのためのpH5.5ヴィーガンフォームオイルクレンザーです。無香料です。', highlights: ['ヴィーガン処方', 'pH 5.5', '無香料', '日焼け止めとベースメイクに'], howTo: ['乾いた手にポンプで出します。', '乾いた肌にやさしくなじませます。', '水を加えて泡立て、よくすすぎます。'], goodFor: '日焼け止めや軽いメイクを落とす夜のクレンジング。' },
      'foaming-cleanser': { name: 'ヴィーガンフォーミングクレンザー 200ml', title: 'ヴィーガンフォーミングクレンザー 200ml｜pH5.5・無香料の泡洗顔｜HONDIT', description: 'ポンプで泡が出る、pH5.5・無香料のヴィーガンフォーミングクレンザー。ブランドJ’essence、製造제주리퍼블릭、販売HONDIT。国別の注文条件。', body: 'pH5.5処方の無香料ヴィーガンフォーミングクレンザーです。ポンプを押すと、すぐ使える泡が出ます。', highlights: ['ヴィーガン処方', 'pH 5.5', '無香料', 'すぐ使えるやわらかい泡'], howTo: ['ぬるま湯で顔をぬらします。', '泡を手に出します。', 'やさしくなじませ、よくすすぎます。'], goodFor: '朝の洗顔と、シンプルな毎日の洗顔。' },
      'cleansing-water': { name: 'ヴィーガンクレンジングウォーター 300ml', title: 'ヴィーガンクレンジングウォーター 300ml｜pH5.5・無香料｜HONDIT', description: '軽いメイクとすばやいクレンジングのための、pH5.5・無香料のヴィーガンクレンジングウォーター。ブランドJ’essence、製造제주리퍼블릭、販売HONDIT。国別の注文条件。', body: '軽いメイクとすばやいリセットのための無香料ヴィーガンクレンジングウォーターです。pH5.5処方です。', highlights: ['ヴィーガン処方', 'pH 5.5', '無香料', '軽いメイクとすばやいクレンジングに'], howTo: ['コットンにクレンジングウォーターを含ませます。', 'こすらずに、やさしく顔をふきます。', '必要に応じて洗顔料で仕上げます。'], goodFor: '軽いメイク、すばやいクレンジング、手軽な夜のケア。' },
    },
    pages: {
      home: { title: '済州島の溶岩石アロマストーン・電気不要の火山石ディフューザー｜済州島のお土産｜HONDIT', description: 'StoneJejuが作る済州島の火山石（溶岩石）アロマストーン型ディフューザー350g・500gと、済州島のクレンジングケア。済州大学の学生チームHONDITが、PayPal決済・韓国発送で日本へお届けします。', h1: '香りを含む済州島の火山石、HONDIT', scentH2: '火山石のアロマストーン型ディフューザー', scentP: '多孔質の済州島の火山石を器に入れ、付属のシトラスのフレグランスオイル10mLを垂らして使います。電気も火も、リードスティックも使いません。', careH2: 'クレンジングケア', orderH2: '注文方法', orderP: '製品と数量を選び、お住まいの国の注文条件を確認して、直接決済に対応している国はPayPalでお支払いください。', giftH2: '済州島のお土産とまとめ買いギフト', giftP: '食べ物以外の済州島のお土産を探しているなら、火山石ディフューザーがおすすめです。海外の住所へ届けられ、会社の記念品やイベントのギフトなど数量注文も承ります。', fromH2: '済州島から' },
      products: { title: '製品一覧：済州島の火山石ディフューザーとクレンジングケア｜HONDIT', description: 'HONDITの製品一覧：StoneJejuの済州島の火山石アロマストーン型ディフューザー350g・500gと、J’essenceのヴィーガンクレンジングケア。国別の注文条件つき。', h1: 'HONDITの製品', note: '注文条件は国によって異なります。まとめて注文のご案内をご覧ください。' },
      bulk: { title: '海外まとめ注文・法人ギフトの注文条件｜HONDIT', description: 'HONDITの海外まとめ注文：国ごとのPayPal直接決済の数量、送料込み価格、お見積もり。会社の記念品、イベントギフト、店舗用の数量注文に。', h1: '海外まとめ注文', intro: '国ごとに決められた数量のみ直接決済でき、その価格に送料が含まれます。それ以外はお見積もりでご案内します。' },
      jeju: { title: '私たちの済州：済州大学の学生プロジェクト HONDIT', description: 'HONDITは済州島で始まりました。済州大学の学生が運営する独立した越境販売プロジェクトとして、StoneJejuの火山石ディフューザーを海外に紹介しています。', h1: '私たちの済州', paras: ['HONDITは済州大学校（102 Jejudaehak-ro, Jeju-si, Jeju 63243, 韓国）を拠点とする独立した学生の越境販売プロジェクトです。キャンパスは活動の拠点であり、製品を保証するものではありません。'] },
    },
  },

  'zh-HK': {
    nav: { '/': '首頁', '/products': '產品', '/bulk-orders': '批量訂購', '/jeju': '我們的濟州', '/about': '關於 HONDIT', '/faq': '常見問題', '/journal': '專欄', '/shipping': '運送說明', '/contact': '聯絡我們' },
    footer: (reg) => `HONDIT · 濟州大學 GTEP 學生團隊 · 韓國商業登記號碼 ${reg}`,
    brandLine: 'HONDIT 是濟州大學 GTEP 課程學生團隊經營的銷售與選品品牌。火山石擴香的製造商及產品品牌是 StoneJeju。',
    whoLine: 'HONDIT 並不生產擴香，而是向海外顧客介紹產品並回覆訂購查詢。',
    countries: { SG: '新加坡', HK: '香港', JP: '日本', TW: '台灣', TH: '泰國', MY: '馬來西亞', BN: '汶萊', MO: '澳門' },
    tier: (q, price, included) => `${q} 件：每件 ${price}${included ? '，已含運費' : ''}`,
    noDirect: '此產品未開放直接付款，請向 HONDIT 查詢報價。',
    termsNote: '列表中的數量可直接以 PayPal 付款。其他數量、混合尺寸或超出庫存的訂單會以報價處理，目的地的關稅及稅項由收件人支付。',
    label: { content: '內容', container: '容器', size: '尺寸', oil: '香氛油', maker: '製造商及產品品牌', seller: '銷售與選品', highlights: '特點', howTo: '使用方法', followLabel: '請依照產品標籤使用。', goodFor: '適合擺放', care: '保養', terms: '各地區訂購條件', chooseQty: '選擇數量', refund: '退款政策', shipping: '運送說明', ask: '查詢', orderConditions: '訂購條件', products: '產品', careBrand: '品牌：J’essence。製造：제주리퍼블릭（Jeju Republic）。銷售與選品：HONDIT。' },
    facts: { [P350]: { content: '濟州火山石約 350g', container: '玻璃容器', oil: '附 10mL 柑橘香氛油' }, [P500]: { content: '濟州火山石約 500g', container: '濟州甕器', oil: '附 10mL 柑橘香氛油' } },
    care: ['天然石的大小和顏色各有不同，可能會有細粉。', '請避免長時間接觸敏感或受損的皮膚，並依照產品標籤使用。', '更換香味前，先用溫水沖洗石頭並完全乾透。'],
    products: {
      [P350]: { name: '火山石擴香 350g', title: '火山石擴香 350g｜濟州火山岩擴香石・玻璃容器・無需插電｜HONDIT', description: '濟州火山石約 350g 配玻璃容器的擴香石，無需插電、無火。附 10mL 柑橘香氛油，適合睡房、浴室、書桌。StoneJeju 製造，HONDIT 銷售，寄往香港、台灣、新加坡、日本。', body: '把多孔的濟州火山石放進玻璃容器的小型擴香石。把附送的柑橘香氛油滴在石上，無需電力也不用火，香氣便會散發。', highlights: ['濟州火山石約 350g', '附 10mL 柑橘香氛油', '無需火焰或電力', '適合睡房、浴室或書桌'], howTo: ['把火山石放進容器。', '在石上滴 10 至 12 滴柑橘油。', '吸收後，想要香氣時再補幾滴。'], goodFor: '細小睡房、浴室、書桌等安靜的個人空間。' },
      [P500]: { name: '火山石擴香 500g', title: '火山石擴香 500g｜濟州甕器火山岩擴香石・無火無電｜HONDIT', description: '濟州火山石約 500g 配濟州甕器的擴香石，無需插電、無火。附 10mL 柑橘香氛油，適合客廳、接待處、民宿。StoneJeju 製造，HONDIT 銷售，寄往香港、台灣、新加坡、日本。', body: '把濟州火山石放進濟州甕器的大型擴香石。火山渣吸收柑橘香氛油，無需電力也不用火便能散發香氣。', highlights: ['濟州火山石約 500g', '附 10mL 柑橘香氛油', '濟州甕器', '適合家居或店舖的大型擺件'], howTo: ['把火山石排放在容器內。', '在上層石頭均勻滴 10 至 12 滴。', '只在想要時補充香氣。'], goodFor: '客廳、接待處、工作室和住宿空間。' },
      'foam-oil': { name: '純素泡沫油 150ml', title: '純素泡沫油 150ml｜pH 5.5 無香料卸妝潔面｜HONDIT', description: '卸除防曬和底妝的 pH 5.5 無香料純素泡沫油潔面。品牌 J’essence，제주리퍼블릭 製造，HONDIT 銷售。各地區批量訂購條件。', body: '適合卸除防曬、底妝及晚間潔面的 pH 5.5 純素泡沫油。無香料。', highlights: ['純素配方', 'pH 5.5', '無香料', '適合防曬及底妝'], howTo: ['按壓到乾燥的手上。', '在乾燥的臉上輕輕按摩。', '加水起泡，再徹底沖洗。'], goodFor: '需要卸除防曬或淡妝的晚間潔面。' },
      'foaming-cleanser': { name: '純素泡沫潔面 200ml', title: '純素泡沫潔面 200ml｜pH 5.5 無香料泡沫洗面｜HONDIT', description: '按壓即出泡沫的 pH 5.5 無香料純素泡沫潔面。品牌 J’essence，제주리퍼블릭 製造，HONDIT 銷售。各地區批量訂購條件。', body: 'pH 5.5 配方的無香料純素泡沫潔面。按壓即出可直接使用的綿密泡沫。', highlights: ['純素配方', 'pH 5.5', '無香料', '即用柔軟泡沫'], howTo: ['用溫水弄濕臉。', '把泡沫按壓到手上。', '輕輕按摩後徹底沖洗。'], goodFor: '早上潔面及簡單的日常洗臉。' },
      'cleansing-water': { name: '純素卸妝水 300ml', title: '純素卸妝水 300ml｜pH 5.5 無香料｜HONDIT', description: '適合淡妝和快速清潔的 pH 5.5 無香料純素卸妝水。品牌 J’essence，제주리퍼블릭 製造，HONDIT 銷售。各地區批量訂購條件。', body: '適合淡妝及快速清潔的無香料純素卸妝水，pH 5.5 配方。', highlights: ['純素配方', 'pH 5.5', '無香料', '適合淡妝及快速清潔'], howTo: ['用化妝棉沾濕卸妝水。', '不要用力擦，輕輕抹過臉部。', '如有需要，再用水性潔面完成。'], goodFor: '淡妝、快速清潔和輕鬆的晚間護理。' },
    },
    pages: {
      home: { title: '濟州火山石擴香石・無需插電的火山岩擴香｜濟州島手信／伴手禮｜HONDIT', description: 'StoneJeju 製造的濟州火山石擴香石 350g・500g 及濟州潔面護理。濟州大學學生團隊 HONDIT 以 PayPal 付款、韓國發貨，寄往香港、台灣、澳門、新加坡。', h1: '吸收香氣的濟州火山石，HONDIT', scentH2: '火山石擴香石', scentP: '把多孔的濟州火山石放進容器，滴上附送的 10mL 柑橘香氛油即可使用。無需電力、無火，也不用藤枝。', careH2: '潔面護理', orderH2: '如何訂購', orderP: '選擇產品和數量，確認所在地區的訂購條件後，在開放直接付款的地區以 PayPal 付款。', giftH2: '濟州島手信與公司禮品', giftP: '想找食品以外的濟州島手信或伴手禮，火山石擴香是好選擇。可以寄到海外地址，亦接受公司禮品、活動禮物等數量訂購。', fromH2: '來自濟州' },
      products: { title: '產品：濟州火山石擴香石與潔面護理｜HONDIT', description: 'HONDIT 產品：StoneJeju 濟州火山石擴香石 350g・500g 及 J’essence 純素潔面護理，附各地區訂購條件。', h1: 'HONDIT 產品', note: '訂購條件因地區而異，請查看批量訂購說明。' },
      bulk: { title: '海外批量訂購・公司禮品訂購條件｜HONDIT', description: 'HONDIT 海外批量訂購：各地區 PayPal 直接付款數量、已含運費價格及報價訂單。適合公司禮品、活動禮物及店舖用量。', h1: '海外批量訂購', intro: '各地區只可按指定數量直接付款，價格已包含運費。其他訂單以報價處理。' },
      jeju: { title: '我們的濟州：濟州大學學生項目 HONDIT', description: 'HONDIT 從濟州開始，是濟州大學學生經營的獨立跨境銷售項目，向海外顧客介紹 StoneJeju 火山石擴香。', h1: '我們的濟州', paras: ['HONDIT 是以濟州大學（102 Jejudaehak-ro, Jeju-si, Jeju 63243, 韓國）為據點的獨立學生跨境銷售項目。校園只是工作據點，並不代表為產品背書。'] },
    },
  },
};
