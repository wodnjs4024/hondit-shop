// Initial Journal and press-outreach records, prepared from existing material only:
// - "HONDIT_무료PR_기사초안_4개국_20261023" (Google Docs 14ARAH6CKJbRcPKNeO87GMq6BBOyD_bxTLiPuJaVzHRg)
// - product facts verified against StoneJeju product pages (src/data/productFacts.ts, 2026-10-13)
// - storefront how-to copy (shared/storefront-catalog.js)
// - CONTENT_PIPELINE rows and the five Gmail drafts written on 2026-10-23
// Every article starts "in_review": nothing here is public until an admin checks facts, claims and photo rights,
// approves it and schedules it. supabase/seeds/010_journal_seed.sql inserts the same rows.

export const SOURCE_DOC = 'https://docs.google.com/document/d/14ARAH6CKJbRcPKNeO87GMq6BBOyD_bxTLiPuJaVzHRg/edit';
const PACK = '/images/hondit-pack/hondit_codex_image_pack/01_product_originals';

/* Facts the AI drafter and reviewers may rely on. Anything outside this list needs a new source. */
export const JOURNAL_FACTS = [
  { id: 'diffuser-350g', label: 'StoneJeju 볼카닉 디퓨져 350', url: 'https://stonejeju.com/product/detail.html?product_no=42', facts: ['Content: 350g ± of porous Jeju volcanic scoria', 'Size: 75 × 100 × 75 mm', 'Vessel: glass', 'Includes 10mL citrus fragrance oil', 'Use: 10–12 drops of oil onto the stone; refresh with a few drops when wanted', 'No flame, no electricity'] },
  { id: 'diffuser-500g', label: 'StoneJeju 볼카닉 디퓨져 500', url: 'https://stonejeju.com/product/detail.html?product_no=41', facts: ['Content: 500g ± of Jeju volcanic scoria', 'Size: 100 × 105 × 100 mm', 'Vessel: Jeju onggi pottery', 'Includes 10mL citrus fragrance oil', 'Use: 10–12 drops across the upper stones', 'No flame, no electricity'] },
  { id: 'care', label: 'HONDIT 상품 관리 안내', url: 'https://hondit-shop.vercel.app/products/diffuser-350g', facts: ['Natural stone varies in size and colour and may shed fine powder', 'Rinse the stone in warm water and dry completely before changing the fragrance', 'Avoid prolonged contact with sensitive or damaged skin; follow the product label'] },
  { id: 'brand', label: 'HONDIT 무료 PR 기사 초안 (2026-10-23)', url: SOURCE_DOC, facts: ['StoneJeju is the maker and product brand', 'HONDIT is a student-operated curation team from Jeju National University\'s GTEP programme', 'HONDIT is not the manufacturer; it handles overseas product information and sales enquiries', 'Order quantities, payment and delivery differ by market and product'] },
];
const SOURCES = (...ids) => JOURNAL_FACTS.filter((f) => ids.includes(f.id)).map(({ label, url }) => ({ label, url }));
const REVIEW_PENDING = { facts: false, claims: false, images: false, notes: 'StoneJeju 공식 사진·공방 사진 사용 허락 범위 확인 전. 시장별 주문 조건은 게시 직전 재확인.' };
const BASE = { status: 'in_review', author_type: 'hondit_editorial', author_name: 'HONDIT editorial team', image_rights: 'pending', review: REVIEW_PENDING, source_doc: SOURCE_DOC, group_key: 'jeju-volcanic-stone-home-2026-10' };

export const seedArticles = [
  {
    ...BASE,
    id: '7d1f0f0a-0001-4a10-9a01-000000000001',
    content_id: 'S-JRN-SG-01',
    language: 'en',
    market: 'SG',
    slug: 'jeju-volcanic-stone-everyday-home',
    title: "From Jeju's volcanic landscape to the everyday home",
    dek: "StoneJeju's volcanic-stone diffuser turns a material from Jeju Island's landscape into a small, non-electric fragrance object. Here is what it is, how it is used and who is behind it.",
    hero_image_url: '/images/journal/sg-01-diffuser-350-hero.webp',
    hero_image_alt: 'StoneJeju volcanic-stone diffuser 350: black glass vessel filled with Jeju scoria, with its citrus fragrance oil bottle',
    hero_image_caption: 'Volcanic Diffuser 350: porous Jeju scoria in a black glass vessel, with 10mL of citrus oil.',
    hero_image_credit: 'Photo: StoneJeju official product photograph, cropped. Used with permission.',
    related_products: ['diffuser-350g', 'diffuser-500g'],
    cta_type: 'product',
    seo_title: "Jeju volcanic-stone diffuser: a non-electric fragrance object | HONDIT Journal",
    seo_description: 'How StoneJeju turns porous Jeju volcanic scoria into a flame-free, plug-free fragrance object, in 350g and 500g sizes, introduced overseas by HONDIT.',
    sources: SOURCES('diffuser-350g', 'diffuser-500g', 'care', 'brand'),
    body_md: `Jeju Island was built by volcanic eruptions, and its dark, porous stone shows up everywhere: in field walls, along the coast and in the island's crafts. StoneJeju, a maker based on the island, uses that same volcanic scoria in a decorative home-fragrance object.

## What the object is

The diffuser is a vessel filled with small pieces of Jeju volcanic scoria. The stone is porous, so it takes up fragrance oil and releases it slowly into the room. It needs no electricity and no open flame, and there are no reeds to replace. Each set comes with 10mL of citrus fragrance oil.

![StoneJeju Volcanic Diffuser 350 in its black glass vessel, with loose pieces of scoria beside it](/images/journal/sg-01-diffuser-350-vessel.webp "350 size: about 75 × 100 × 75 mm, glass vessel. Photo: StoneJeju, used with permission.")

## Two sizes for two kinds of space

- 350g: about 75 × 100 × 75 mm, with the stone held in a glass vessel. It suits a desk, a bedside table or a shelf.
- 500g: about 100 × 105 × 100 mm, in Jeju onggi, the traditional Korean earthenware. It is made for a living room or a shared space.

## How it is used

Place the stone in its vessel and add 10–12 drops of the citrus oil across the upper stones. Let the stone absorb the oil, then add a few drops whenever you want the scent back. Because you decide when to refresh it, the object stays quiet when you do not need fragrance.

## Living with natural stone

Every piece is natural, so size and colour vary from set to set and the stone may shed a little fine powder. To change to a different fragrance, rinse the stone in warm water and let it dry completely first. Avoid prolonged contact with sensitive or damaged skin and follow the oil's label.

## Who is behind it

StoneJeju is the maker and the product brand. HONDIT is a student-operated curation team from Jeju National University's GTEP programme that introduces the diffuser to overseas customers and handles product information and sales enquiries. HONDIT is not the manufacturer. For the students, the project is a working lesson in how product storytelling, language, market rules and export operations fit together.

## Ordering from Singapore

Orders from Singapore start at 10 units of one size, and international delivery to Singapore is included in the price shown on the product page. You can pay directly on the [350g diffuser page](/products/diffuser-350g) or the [500g diffuser page](/products/diffuser-500g) for exactly 10 units, or for 20 units or more, of one size per order.

A quantity between 11 and 19, an order that mixes the two sizes, or a quantity above the stock shown is handled as a separate quote: [send an enquiry](/contact) with the sizes and quantities you need. Any import duties or taxes are paid by the recipient.`,
  },
  {
    ...BASE,
    id: '7d1f0f0a-0001-4a10-9a01-000000000002',
    content_id: 'S-JRN-JP-01',
    language: 'ja',
    market: 'JP',
    slug: 'jeju-volcanic-stone-diffuser',
    title: '済州島の火山石を日常の暮らしへ――電源不要のStoneJejuディフューザー',
    dek: '韓国・済州島の多孔質な火山石（スコリア）を器に収めた、火も電気も使わないディフューザー。素材、サイズ、使い方とお手入れ、そして日本へ届けるまでをまとめました。',
    hero_image_url: `${PACK}/07_diffuser_500_window.webp`,
    hero_image_alt: '窓辺に置かれた済州オンギの器のStoneJeju火山石ディフューザー500g',
    hero_image_caption: '500gは済州のオンギ（甕器）に火山石を収めています。',
    hero_image_credit: '写真：StoneJeju 公式製品写真（許諾を得て使用）',
    related_products: ['diffuser-500g', 'diffuser-350g'],
    cta_type: 'product',
    seo_title: '済州島の火山石ディフューザー｜電源不要・火を使わない香りの雑貨 | HONDIT Journal',
    seo_description: '済州島の多孔質な火山石を使ったStoneJejuのディフューザー。350gはガラス容器、500gは済州のオンギ。使い方とお手入れ、日本でのご注文方法。',
    sources: SOURCES('diffuser-350g', 'diffuser-500g', 'care', 'brand'),
    body_md: `済州島は火山の島です。石垣や海岸、島の工芸品にいたるまで、黒く小さな穴の多い火山石が暮らしの風景をつくってきました。島の工房StoneJejuは、この火山石（スコリア）を香りの生活雑貨に仕立てています。

## 素材について

器の中に入っているのは、細かく砕いた済州の火山石です。石の表面には無数の小さな穴があり、フレグランスオイルを吸い込んで、ゆっくりと部屋に香りを広げます。電源も火も使わず、リードの交換もいりません。10mLのシトラスフレグランスオイルが付属します。

## 2つのサイズ

- 350g：約75×100×75mm。ガラスの器に石を収めた、デスクやベッドサイド向けのサイズです。
- 500g：約100×105×100mm。器は済州のオンギ（甕器）。韓国で古くから使われてきた焼き物で、リビングなど広めの空間に向いています。

![スタジオで撮影したStoneJeju火山石ディフューザー500g](${PACK}/06_diffuser_500_studio.webp "500g：済州のオンギの器。約100×105×100mm。写真：StoneJeju（許諾を得て使用）")

## 使い方

石を器に入れ、上の石にシトラスオイルを10〜12滴たらします。石がオイルを吸い込んだら、あとは香りがほしいときに数滴足すだけ。香りの強さを自分で決められるので、仕事部屋にも寝室にも置きやすい道具です。

## お手入れ

天然の石なので、大きさや色は一つひとつ異なり、細かな粉が出ることがあります。別の香りに替えるときは、石をぬるま湯ですすぎ、完全に乾かしてから使ってください。敏感な肌や傷のある肌に長く触れないようにし、オイルの表示に従ってください。

## インテリアとして置く

黒い火山石と器だけの、文字の少ない見た目なので、本棚や玄関、窓辺に置いても主張しすぎません。350gは小さな棚やデスクに、500gはオンギの素朴な質感を生かしてリビングや受付カウンターに向いています。香りを足さない日は、済州の石をそのまま飾っておくオブジェになります。

## ショップや宿泊施設でのご相談

セレクトショップでの取り扱い、旅館やゲストハウスでのお客様へのギフト、客室への設置などのご相談も受け付けています。数量やご用途を[お問い合わせ](/contact)からお知らせください。

## つくり手と届け手

製品ブランド・製造はStoneJejuです。HONDITは済州大学GTEPの学生チームで、海外向けの商品紹介と販売に関するお問い合わせを担当しています（製造元ではありません）。学生たちは多言語での説明や海外の購入条件の調査を通じて、済州ゆかりの商品を海外に届ける仕組みを学んでいます。

## 日本でのご注文

日本へは、1回のご注文につき1サイズ20個から、[500gの商品ページ](/products/diffuser-500g)または[350gの商品ページ](/products/diffuser-350g)で円建てのままお支払いいただけます。表示価格には韓国から日本までの国際配送料が含まれています。

10個のお試し注文、2つのサイズを組み合わせたご注文、表示在庫を超える数量は個別のお見積もりになります。[お問い合わせ](/contact)からサイズと数量をお知らせください。関税や輸入時の税金がかかる場合は、受取人のご負担となります。`,
  },
  {
    ...BASE,
    id: '7d1f0f0a-0001-4a10-9a01-000000000003',
    content_id: 'S-JRN-HK-01',
    language: 'zh-HK',
    market: 'HK',
    slug: 'jeju-volcanic-stone-home-fragrance',
    title: '把濟州火山石帶進日常空間：StoneJeju 無須插電的香氛擺設',
    dek: '濟州島以火山地貌聞名。StoneJeju 把多孔的火山石放進器皿，配合香氛精油使用，無須插電、毋須點火。以下整理兩款尺寸、使用與保養方法，以及在香港的訂購方式。',
    hero_image_url: '/images/journal/sg-01-diffuser-350-hero.webp',
    hero_image_alt: 'StoneJeju 火山石擴香 350：黑色玻璃器皿盛滿濟州火山石，旁邊是柑橘香氛油',
    hero_image_caption: '350 款：黑色玻璃器皿配濟州火山石及 10mL 柑橘香氛油。',
    hero_image_credit: '相片：StoneJeju 官方產品相片（經裁切，已獲授權使用）',
    related_products: ['diffuser-350g', 'diffuser-500g'],
    cta_type: 'product',
    seo_title: '濟州火山石擴香：無須插電的香氛擺設 | HONDIT Journal',
    seo_description: 'StoneJeju 以多孔濟州火山石製成的香氛擺設，350g 玻璃器皿、500g 濟州甕器，配 10mL 柑橘香氛油。使用、保養與香港訂購方式。',
    sources: SOURCES('diffuser-350g', 'diffuser-500g', 'care', 'brand'),
    body_md: `濟州島由火山噴發形成，黑色、佈滿細孔的火山石隨處可見：田邊的石牆、海岸線，以至島上的手工藝。濟州品牌 StoneJeju 把這種火山石（火山渣）變成一件家居香氛擺設。

## 它是甚麼

器皿內盛着細小的濟州火山石。石頭表面多孔，可以吸收香氛油，再慢慢把香氣釋放到空間之中。它不用插電、不用點火，也沒有需要更換的藤枝。每套附 10mL 柑橘香氛油。

## 兩款尺寸

- 350g：約 75 × 100 × 75 毫米，玻璃器皿，適合放在書桌、床頭或層架。
- 500g：約 100 × 105 × 100 毫米，器皿是濟州甕器（韓國傳統陶器），適合客廳或較大的共用空間。

![影樓拍攝的 StoneJeju 500g 火山石擴香，濟州甕器](${PACK}/06_diffuser_500_studio.webp "500 款：濟州甕器，約 100 × 105 × 100 毫米。相片：StoneJeju（已獲授權使用）")

## 使用方法

把火山石放進器皿，在上層石頭滴上 10 至 12 滴柑橘香氛油。待石頭吸收後，想再聞到香氣時補幾滴即可。何時補香由自己決定，香氣濃淡也較容易掌握，放在細小的居住空間亦不會過份。

## 保養

每件都是天然石材，大小和顏色各有不同，亦可能有少量細粉。想轉用另一種香氛時，先用溫水沖洗石頭，待完全乾透再使用。避免長時間接觸敏感或受損的皮膚，並按香氛油標籤指示使用。

## 作為禮物和擺設

器皿上只有簡單的標記，黑色火山石本身就是一件擺設，放在書枱、玄關或店舖櫃位都不會顯得突兀。對想送一份來自韓國濟州、又不只是食品的禮物的人來說，它是一個實用的選擇：收禮的人不用電、不用點火，按自己喜好補香即可。

## 團購和公司禮品

我們亦接受團購、公司節日禮品和店舖採購查詢。請透過[聯絡我們](/contact)告訴我們數量、尺寸和用途，我們會按實際需要回覆。

## 誰在背後

StoneJeju 是產品品牌及製造方。HONDIT 由濟州大學 GTEP 學生團隊營運，負責向海外介紹產品及處理銷售查詢，並非生產商。這個學生項目嘗試把地區文化、產品資料、語言溝通和實際海外貿易連結起來。

## 在香港訂購

香港訂單以每張訂單一種尺寸、20 件起計，可直接在[350g 產品頁](/products/diffuser-350g)或[500g 產品頁](/products/diffuser-500g)以港幣付款。標示價格已包括由韓國寄往香港的國際運費。

10 件試購、兩種尺寸混合訂購，或超過頁面所示庫存的數量，會另行報價：請[聯絡我們](/contact)並註明尺寸和數量。如有任何進口稅項，由收件人負責。`,
  },
  {
    ...BASE,
    id: '7d1f0f0a-0001-4a10-9a01-000000000004',
    content_id: 'S-JRN-TW-01',
    language: 'zh-TW',
    market: 'TW',
    slug: 'jeju-volcanic-stone-natural-materials',
    title: '從濟州火山地景走進居家生活：StoneJeju 火山石擴香的自然材質故事',
    dek: '濟州島的火山地貌不只在風景裡，也走進了生活用品。這篇整理 StoneJeju 火山石擴香的材質、兩種規格、使用與保養，以及一群濟州大學學生如何把它介紹到海外。',
    hero_image_url: `${PACK}/08_diffuser_500_wood.webp`,
    hero_image_alt: '放在木質桌面上的 StoneJeju 500g 火山石擴香，濟州甕器容器',
    hero_image_caption: '500g：濟州甕器容器，約 100 × 105 × 100 公釐。',
    hero_image_credit: '照片：StoneJeju 官方產品照片（已取得授權使用）',
    related_products: ['diffuser-500g', 'diffuser-350g'],
    cta_type: 'product',
    seo_title: '濟州火山石擴香的自然材質故事：不插電、不點火 | HONDIT Journal',
    seo_description: 'StoneJeju 火山石擴香使用多孔濟州火山渣，350g 玻璃容器與 500g 濟州甕器兩種規格，附 10mL 柑橘香氛油。材質、使用、保養、民宿與選物店應用，以及台灣訂購方式。',
    sources: SOURCES('diffuser-350g', 'diffuser-500g', 'care', 'brand'),
    body_md: `濟州島由火山活動形成，島上的石牆、海岸和傳統工藝都看得到黑色多孔的火山石。濟州品牌 StoneJeju 把這種火山渣做成居家香氛用品，讓自然材質從風景走進日常。

## 為什麼是火山石

火山石在冷卻時留下許多細小氣孔，因此能吸附香氛油，再慢慢把香氣釋放到空間中。這件擴香不需要插電、不需要點火，也沒有要定期更換的擴香竹。每組附 10mL 柑橘香氛油。

## 兩種規格

- 350g：約 75 × 100 × 75 公釐，玻璃容器，適合書桌、床頭或層架。
- 500g：約 100 × 105 × 100 公釐，容器為濟州甕器（韓國傳統陶器），適合客廳等較大的空間。

![攝影棚拍攝的 StoneJeju 500g 火山石擴香](${PACK}/06_diffuser_500_studio.webp "500g 規格的濟州甕器容器。照片：StoneJeju（已取得授權使用）")

## 怎麼使用

把火山石放進容器，在上層石頭滴 10 到 12 滴柑橘香氛油。石頭吸收之後，想要香氣時再補幾滴即可。補香的時間與份量都由自己決定。

## 保養提醒

每一件都是天然石材，大小與顏色會有差異，也可能掉落少量細粉。要更換成其他香氛時，請先用溫水沖洗石頭並完全晾乾。避免長時間接觸敏感或受損的皮膚，並依照香氛油標示使用。

## 放在民宿與選物店

甕器的手作質感和黑紅色的火山石，帶著濟州島的氣氛，適合放在民宿的房間、櫃檯或公共空間，也適合設計選物店作為居家香氛小物陳列。如果想為民宿房間準備，或在店裡販售，歡迎[聯絡我們](/contact)告訴我們數量與用途。

## 學生團隊的海外推廣

產品品牌與製造方是 StoneJeju。負責海外介紹的 HONDIT 由濟州大學 GTEP 學生團隊營運，處理海外商品資訊和銷售洽詢，並非製造商。學生們透過多語內容整理與海外市場調查，練習把地方商品、語言與實際貿易流程串在一起。

## 在台灣訂購

寄往台灣的訂單，每筆訂單選一種規格、20 件起，可以在[500g 商品頁](/products/diffuser-500g)或[350g 商品頁](/products/diffuser-350g)直接以新台幣付款。標示價格已包含從韓國寄到台灣的國際運費。

10 件試購、兩種規格混合，或超過頁面顯示庫存的數量，需要另外報價：請[聯絡我們](/contact)並寫明規格與數量。如有關稅或進口稅費，由收件人負擔。`,
  },
];

/* Press outreach: the five Gmail drafts (hondit.office@gmail.com, 2026-10-23) and their CONTENT_PIPELINE rows.
   Contacts are copied as found; confirm each against the outlet's own contact page before approval. */
const PR_BASE = { approval_status: 'pending', send_status: 'not_sent', reply_status: 'none', materials_url: SOURCE_DOC, contact_source: 'CONTENT_PIPELINE / Gmail 초안 2026-10-23 (매체 공식 페이지 재확인 필요)' };
export const seedPress = [
  { ...PR_BASE, id: '7d1f0f0a-0002-4a10-9a01-000000000001', content_id: 'P-EMAIL-SG-01', market: 'SG', language: 'en', outlet: 'Home & Decor Singapore', angle: '홈 데코·디퓨저 독립 기사 제안', editorial_contact: 'djreubs@sph.com.sg', link_id: 'l0039', gmail_draft_id: 'r1673051610796015869', email_subject: 'Editorial idea: a Jeju volcanic-stone diffuser as a home design object', next_action: '정식 사진·사양·판매조건 검수 후 발송', article_id: '7d1f0f0a-0001-4a10-9a01-000000000001' },
  { ...PR_BASE, id: '7d1f0f0a-0002-4a10-9a01-000000000002', content_id: 'P-EMAIL-SG-02', market: 'SG', language: 'en', outlet: 'Expat Living Singapore', angle: '제주 생활 선물·홈 향기', editorial_contact: 'editorial@expatliving.sg', link_id: 'l0040', gmail_draft_id: 'r4313969471669529596', email_subject: "Story suggestion: bringing a little of Jeju's volcanic landscape into the home", next_action: '최신 편집 정책·구매조건 확인', article_id: '7d1f0f0a-0001-4a10-9a01-000000000001' },
  { ...PR_BASE, id: '7d1f0f0a-0002-4a10-9a01-000000000003', content_id: 'P-EMAIL-JP-01', market: 'JP', language: 'ja', outlet: 'Mynavi Woman', angle: '無電源の香り雑貨・済州島', editorial_contact: 'woman-p@mynavi.jp', link_id: 'l0041', gmail_draft_id: 'r-612018064288113643', email_subject: '【プレス情報】済州島の火山石を使った電源不要のディフューザー「StoneJeju」', next_action: '일본어 피치 검수', article_id: '7d1f0f0a-0001-4a10-9a01-000000000002' },
  { ...PR_BASE, id: '7d1f0f0a-0002-4a10-9a01-000000000004', content_id: 'P-EMAIL-HK-01', market: 'HK', language: 'en', outlet: 'Home Journal', angle: '제주 화산석 소재·디자인', editorial_contact: 'editorial@homejournal.com', link_id: 'l0042', gmail_draft_id: 'r-5532602254262658802', email_subject: 'Editorial idea for Home Journal: a Jeju volcanic-stone fragrance object', next_action: '실물 제품·공방 사진 검수', article_id: '7d1f0f0a-0001-4a10-9a01-000000000003' },
  { ...PR_BASE, id: '7d1f0f0a-0002-4a10-9a01-000000000005', content_id: 'P-EMAIL-TW-01', market: 'TW', language: 'zh-TW', outlet: 'Womany 女人迷', angle: '濟州火山石擴香與生活選物', editorial_contact: 'news@womany.net', link_id: 'l0043', gmail_draft_id: 'r-6566523252030743241', email_subject: '品牌故事投稿｜濟州火山石擴香 StoneJeju × HONDIT', next_action: '대만 번체·배송조건 검수', article_id: '7d1f0f0a-0001-4a10-9a01-000000000004' },
];

/* Gmail draft bodies as saved on 2026-10-23 (plain text). The Gmail draft stays the copy that is actually sent. */
const PR_BODIES = {
  'P-EMAIL-SG-01': `Hello Home & Decor editorial team,

I'm writing on behalf of HONDIT, a student-operated lifestyle-product curation team at Jeju National University's GTEP programme.

We help introduce StoneJeju's Jeju volcanic-stone diffusers to overseas audiences. Available in 350g and 500g versions, the products are designed to be used with fragrance oil without electricity or an open flame. StoneJeju is the product brand; HONDIT handles product information and overseas sales enquiries.

For your home-decor and thoughtful-gifting coverage, the material story may be relevant: a natural Jeju stone presented as a small decorative fragrance object for everyday interiors.

Would your editors consider this as an independent story tip? We can provide verified product specifications and rights-cleared images after confirming the relevant usage permissions. We're not seeking a paid placement or requesting a backlink.

HONDIT product and brand information:
https://hondit-shop.vercel.app/?market=SG&lang=en&utm_source=outreach&utm_medium=email&utm_campaign=sg_pr_202610&utm_content=l0039&link_id=l0039

Thank you for considering the idea.

HONDIT | Jeju National University GTEP
hondit.office@gmail.com`,
  'P-EMAIL-SG-02': `Dear Expat Living editorial team,

I'm reaching out from HONDIT, a student-operated Jeju lifestyle-product curator based at Jeju National University's GTEP programme.

We're introducing StoneJeju volcanic-stone diffusers (350g and 500g), decorative pieces designed to be paired with fragrance oil without electricity or a flame. StoneJeju makes the product; HONDIT supports overseas product information and sales enquiries.

We thought this might offer an interesting home-and-lifestyle story for readers interested in meaningful Korean gifts, natural materials and interior accents. It also offers a small window into how a Jeju student team is taking locally inspired products to overseas audiences.

If this is of editorial interest, we would be pleased to share a verified product fact sheet and cleared photography. We are offering a story lead for independent consideration, not seeking paid coverage. We are not claiming single-item retail availability in Singapore.

Product and brand information:
https://hondit-shop.vercel.app/?market=SG&lang=en&utm_source=outreach&utm_medium=email&utm_campaign=sg_pr_202610&utm_content=l0040&link_id=l0040

Best regards,
HONDIT | Jeju National University GTEP
hondit.office@gmail.com`,
  'P-EMAIL-JP-01': `マイナビウーマン編集部 ご担当者様

突然のご連絡失礼いたします。済州大学GTEPの学生チームが運営するHONDIT（ホンディット）です。

韓国・済州島の火山石を活用したStoneJejuのディフューザー（350g／500g）について、暮らし・ギフト分野の情報提供をさせていただきます。

本製品はフレグランスオイルを使って香りを楽しむ生活雑貨で、電源や火を必要としません。製品ブランドはStoneJejuで、HONDITは海外向けの商品紹介・販売に関するお問い合わせ窓口を担当しております。

済州の自然素材を生かしたインテリア小物や韓国発の生活雑貨という切り口で、編集部の企画の参考になりましたら幸いです。ご関心がありましたら、確認済みの製品仕様や使用許諾の取れた画像資料をご案内いたします。

有料広告の依頼ではなく、掲載の可否は編集部のご判断にお任せいたします。日本向けの購入条件・配送条件は商品ごとに異なるため、未確認の単品販売や配送保証は行いません。

参考URL：
https://hondit-shop.vercel.app/?market=JP&lang=ja&utm_source=outreach&utm_medium=email&utm_campaign=jp_pr_202610&utm_content=l0041&link_id=l0041

お忙しいところ恐れ入りますが、どうぞよろしくお願い申し上げます。

HONDIT｜済州大学GTEP
hondit.office@gmail.com`,
  'P-EMAIL-HK-01': `Dear Home Journal editorial team,

I'm writing from HONDIT, a student-operated lifestyle-product curation team at Jeju National University's GTEP programme in South Korea.

We introduce StoneJeju's 350g and 500g volcanic-stone diffusers to overseas audiences. These objects are designed to hold fragrance oil and require neither an electrical plug nor an open flame. StoneJeju is the product brand, while HONDIT handles overseas product information and sales enquiries.

We believe the combination of volcanic material, everyday function and a connection to Jeju Island may be an interesting design story for Home Journal's interiors readership. The editorial angle would be material and object design rather than unverified wellness or fragrance-performance claims.

Would your team be interested in considering this story lead? We can share verified specifications and photography once its publication permissions have been confirmed. We are not requesting paid placement or guaranteed coverage.

Product and brand information:
https://hondit-shop.vercel.app/?market=HK&lang=zh-HK&utm_source=outreach&utm_medium=email&utm_campaign=hk_pr_202610&utm_content=l0042&link_id=l0042

Kind regards,
HONDIT | Jeju National University GTEP
hondit.office@gmail.com`,
  'P-EMAIL-TW-01': `女人迷編輯團隊您好：

我們是由韓國濟州大學 GTEP 學生團隊營運的 HONDIT，負責介紹濟州生活選物並處理海外商品資訊及銷售洽詢。

想向貴編輯部提供一則關於濟州自然材質、日常居家香氛，以及年輕團隊海外推廣經驗的品牌故事。

StoneJeju 的火山石擴香產品有 350g 與 500g 兩款，搭配香氛精油使用，不需要插電或點火。StoneJeju 為產品品牌，HONDIT 並非製造商，而是海外選物與銷售窗口。

如果編輯團隊認為此題材適合生活風格、韓國設計或送禮專題，我們可以提供經核實的產品規格及確認對外使用權限的照片。本信僅供獨立編採參考，並非付費廣告邀請；刊登與否完全尊重編輯判斷。我們不會宣稱所有市場都能單件購買或保證特定到貨日期。

品牌及產品資料：
https://hondit-shop.vercel.app/?market=TW&lang=en&utm_source=outreach&utm_medium=email&utm_campaign=tw_pr_202610&utm_content=l0043&link_id=l0043

感謝您的閱讀。

HONDIT｜濟州大學 GTEP
hondit.office@gmail.com`,
};
for (const row of seedPress) row.email_body = PR_BODIES[row.content_id];

/* The other 10 of the "무료 PR 우선 15곳" list (HONDIT 무료 PR 15곳 최신 발송 준비.xlsx, 2026-10-21 re-check, sheets
   15곳_재검증 · 개별_제안문11). Proposal text is copied as written there. These have no link_id yet: issue one from 03_LINKS
   NEXT_LINK_ID, put the Final URL in the text, then approve. The four Instagram accounts failed account verification and
   have no proposal, so they cannot be approved until one is written. */
const PR_LIST = 'HONDIT 무료 PR 15곳 최신 발송 준비.xlsx (2026-10-21 재검증)';
const LINK_FIRST = '03_LINKS NEXT_LINK_ID로 link_id 지정 → 본문 링크를 Final URL로 교체 → 승인';
const IG_HOLD = '보류: 계정 실제 활동·국가·DM 수신·유료 파트너십 여부 확인 전 접촉 금지 (제안문 없음)';
const more = [
  ['P-EMAIL-SG-03', 'SG', 'en', 'Honeycombers Singapore', 'https://thehoneycombers.com/singapore/about-us/', 'hello@thehoneycombers.com', '자연 소재·홈 프래그런스·제주 생활 브랜드 스토리', `#3 A / 제안 준비. 보내기 전: 백링크 요청·게스트 포스트 금지. ${LINK_FIRST}`, 'PR story tip: Jeju volcanic stone reimagined as a non-electric home-fragrance object', `Hello Honeycombers team,

I'm writing from HONDIT, a student-led Jeju National University GTEP team helping showcase Jeju lifestyle products in overseas markets. Our current product story is StoneJeju's volcanic-stone diffusers (350g and 500g), decorative fragrance items used with oil, without electricity or a flame.

If you are covering Asian design objects, distinctive Korean gifts, or home scents, would this be relevant as an editorial tip? We can provide licensed product photographs, product facts and a clear explanation of the maker (StoneJeju) versus the overseas seller (HONDIT).

We understand you do not accept guest posts or backlink requests, and this is not one. Thank you for considering it.

HONDIT | hondit.office@gmail.com
https://hondit-shop.vercel.app/`],
  ['P-FORM-JP-01', 'JP', 'ja', 'ESSEonline', 'https://esse-online.jp/', 'https://esse-online.jp/list/secure/contact-input', '무전원 아로마스톤·관리 간편성 (효능 표현 금지)', `#5 A / 제안 준비 · 편집부 폼 (필수 전화번호·담당자 수동 입력, 담당자 승인 필요). 1차 발송 추천. ${LINK_FIRST}`, '【情報提供】済州島の火山石を使った電源不要のディフューザー／StoneJeju', `ESSEonline編集部 ご担当者様

済州大学GTEPの学生チームが運営するHONDITと申します。
貴媒体でアロマストーンや暮らしの香りアイテムが紹介されていることを拝見し、情報提供いたします。

私たちはStoneJejuの済州火山石ディフューザー（350g・500g）を海外向けにご案内しています。フレグランスオイルを使用し、電源や火を使わずに香りを楽しむ生活雑貨です。

製品の正確な仕様、使用方法、利用許諾を得た写真をご提供できます。掲載・取材は編集部のご判断にお任せします。有料広告の依頼ではありません。

ご検討いただけましたら幸いです。
HONDIT（済州大学GTEP）
hondit.office@gmail.com
https://hondit-shop.vercel.app/`],
  ['P-FORM-HK-01', 'HK', 'en', 'Sassy Hong Kong', 'https://www.sassyhongkong.com/', 'https://www.sassyhongkong.com/faqs/', 'HK 홈 프래그런스 가이드 업데이트 검토', `#9 A / 제안 준비 · FAQ의 실제 접수 링크 확인 (유료 featured listing과 별개). HK 구매·재고·배송조건 미확인 상태에서 구매처 주장 금지. 1차 발송 추천. ${LINK_FIRST}`, 'Product tip for your Hong Kong home-fragrance guides: Jeju volcanic-stone diffuser', `Hello Sassy Hong Kong editorial team,

Your home scents and diffuser guides caught our attention. We're HONDIT, a Jeju National University GTEP student-run curator representing StoneJeju's volcanic-stone diffusers in overseas sales enquiries.

The 350g/500g products are natural-stone home-fragrance objects used with oil, requiring neither electricity nor a flame. If your editors revisit Korean design gifts or home-scent options, we would be happy to share a factual product brief and original approved photos.

We are affiliated with the seller HONDIT, and are not asking for a paid or guaranteed feature. We will verify Hong Kong purchasing and return conditions before making consumer availability claims.

Thank you,
HONDIT | hondit.office@gmail.com
https://hondit-shop.vercel.app/`],
  ['P-EMAIL-HK-02', 'HK', 'zh-HK', 'U Lifestyle', 'https://www.ulifestyle.com.hk/', 'press@ulifestyle.com.hk', '제주 기념품·홍콩 생활공간 선물', `#11 A / 제안 준비. 보내기 전: 번체 HK 문안, 실제 배송조건 확인. ${LINK_FIRST}`, '生活資訊提供｜濟州火山石擴香 StoneJeju（HONDIT 海外選物）', `U Lifestyle 編輯團隊您好：

我們是濟州大學 GTEP 學生團隊營運的 HONDIT，負責介紹及海外銷售濟州生活選物。希望向編輯部提供 StoneJeju 濟州火山石擴香產品的資訊，規格包括 350g 及 500g。

產品使用香氛精油，無須插電或點火，亦可作為家居擺設。若貴平台日後製作韓國特色禮物、居家香氛或濟州旅遊手信相關專題，我們可提供已獲授權的實物照片及經核實的產品資料。

本信只供獨立編採參考，並非付費廣告申請。產品品牌是 StoneJeju，HONDIT 為海外銷售窗口；香港購買及退換條款會以正式頁面資料為準。

謝謝！
HONDIT | hondit.office@gmail.com
https://hondit-shop.vercel.app/`],
  ['P-EMAIL-HK-03', 'HK', 'en', 'Saucy Hong Kong', 'https://www.saucyhongkong.com/', 'editor@saucyhongkong.com', '제주 대학생 무역팀의 현지화·브랜드 스토리', `#12 A- / 제안 준비 (음식 중심 매체라 적합도 낮음, 홈향기 독자층 미확인). ${LINK_FIRST}`, 'Jeju student export story + design-led home fragrance product tip', `Hello Saucy Hong Kong editor,

I'm from HONDIT, a Jeju National University student GTEP project introducing Jeju lifestyle items overseas. We thought you might be interested in the people and place behind StoneJeju's volcanic-stone fragrance diffuser — a design object used with scent oil but no electricity or flame.

If this fits a broader Korean craft, travel or emerging-brand story, we can offer verified background notes and original licensed product images. We understand Saucy's focus may be elsewhere, so a short 'not a fit' response is absolutely fine.

This is an editorial tip only, not a paid placement request.

HONDIT | hondit.office@gmail.com
https://hondit-shop.vercel.app/`],
  ['P-EMAIL-HK-04', 'HK', 'zh-HK', 'HK Aromatherapy Development Association', 'https://hkadal.com/', 'hkaromada@gmail.com', '제품 특징 일반 정보·전문가 피드백 문의 (매체 아님)', `#47 B / 전문 교류. 유료 교육·건강 효능·제품 인증 연계 금지. ${LINK_FIRST}`, '專業資訊交流｜濟州火山石擴香產品（非療效或認證申請）', `香港芳香療法發展協會您好：

我們是濟州大學 GTEP 學生團隊營運的 HONDIT，介紹 StoneJeju 濟州火山石擴香產品（350g／500g）。產品使用香氛精油，無須插電或點火。

想請教協會是否接受不涉及廣告費用的產品資料交流，或是否有適合的香氛用品專業交流渠道。我們希望聆聽使用與資訊呈現方面的專業意見，不要求推薦、認證或任何醫療／健康效果背書。

如合作需要支付費用，請先告知，我們現階段不會參加任何收費服務。

謝謝。
HONDIT | hondit.office@gmail.com
https://hondit-shop.vercel.app/`],
  ['P-DM-SG-01', 'SG', 'en', '@daysofahomebody', 'https://www.instagram.com/daysofahomebody/', 'https://www.instagram.com/daysofahomebody/', '슬로우 리빙·홈데코', `#31 ${IG_HOLD}`],
  ['P-DM-SG-02', 'SG', 'en', '@jklmnest', 'https://www.instagram.com/jklmnest/', 'https://www.instagram.com/jklmnest/', '홈데코', `#32 ${IG_HOLD}`],
  ['P-DM-SG-03', 'SG', 'en', '@tfthishouse', 'https://www.instagram.com/tfthishouse/', 'https://www.instagram.com/tfthishouse/', '실내공간 연출', `#33 ${IG_HOLD}`],
  ['P-DM-JP-01', 'JP', 'ja', '@rie.brain', 'https://www.instagram.com/rie.brain/', 'https://www.instagram.com/rie.brain/', '일본 향기생활 계정 여부 미확인', `#34 ${IG_HOLD}`],
];
more.forEach(([content_id, market, language, outlet, outlet_url, editorial_contact, angle, next_action, email_subject = null, email_body = null], i) => {
  seedPress.push({ ...PR_BASE, id: `7d1f0f0a-0002-4a10-9a01-0000000000${String(i + 6).padStart(2, '0')}`, content_id, market, language, outlet, outlet_url, angle, editorial_contact, contact_source: PR_LIST, link_id: null, gmail_draft_id: null, email_subject, email_body, next_action, article_id: null });
});

/* Verification columns copied from the file, per candidate: 재선정50 번호·실행 등급 (A/B/C), 15곳_재검증 결과 등급,
   확인된 무료 경로/한계, 보내기 전 확인, 공식 근거 URL, 관련 기사 URL, and the hold reason where the file says 보류. */
const IG_FAIL = '원본 후보. 공식 활성 계정·최근 제품 분야 및 DM 수신 검증 실패';
const FILE = {
  'P-EMAIL-SG-01': [1, 'A', 'A / 제안 준비', '편집책임자 직접 문의 공개. 무료 편집 검토 가능, 게재 보장 없음', '소비자 단품 판매 링크로 오인시키지 않기', 'https://www.homeanddecor.com.sg/about-us', 'https://www.homeanddecor.com.sg/shopping/housewarming-gift-ideas', 'https://www.homeanddecor.com.sg/'],
  'P-EMAIL-SG-02': [2, 'A', 'A / 제안 준비', 'Editorial & Media Releases 이메일 공개; 광고와 구분', '싱가포르 단품 구매 가능 여부 별도 확인', 'https://expatliving.sg/contact-us/', 'https://e-magazine.expatliving.sg/MediaKit/SG-Media-Kit.pdf', 'https://expatliving.sg/'],
  'P-EMAIL-SG-03': [3, 'A', 'A / 제안 준비', 'PR and marketing pitches 공개; 게스트 포스트·백링크 요청 불허', '백링크 요청·게스트 포스트 금지', 'https://thehoneycombers.com/singapore/about-us/', 'https://thehoneycombers.com/singapore/'],
  'P-FORM-JP-01': [5, 'A', 'A / 제안 준비', '정보 제공·보도자료 접수 명시; 필수 전화번호 입력 필요', '필수 전화번호·담당자 승인 필요', 'https://esse-online.jp/list/secure/contact-input', 'https://esse-online.jp/articles/-/36541'],
  'P-EMAIL-JP-01': [6, 'A', 'A / 제안 준비', '공식 보도자료 이메일 게시', '일본 소비자 단품 구매 가능 여부 확정 전 가격 미기재', 'https://woman.mynavi.jp/inquiry_all/inquiry_company/inquiry_press/', 'https://woman.mynavi.jp/prmail/', 'https://woman.mynavi.jp/'],
  'P-FORM-HK-01': [9, 'A', 'A / 제안 준비', '브랜드 관계를 공개하고 제품 제안 가능; 유료 featured listings 별도', 'URL/입점·재고·배송조건 미확인 상태에서는 소비자 구매처 주장 금지', 'https://www.sassyhongkong.com/faqs/', 'https://www.sassyhongkong.com/home-scents-fragrance-candles-diffusers-room-sprays/'],
  'P-EMAIL-HK-01': [10, 'A', 'A / 제안 준비', 'Editorial과 Advertising 문의 명확 분리', '제작과정 이미지 실물/사용 승인 확인', 'https://homejournal.com/about-us/', 'https://homejournal.com/zh/%E5%85%B3%E4%BA%8E%E6%88%91%E4%BB%AC/', 'https://homejournal.com/'],
  'P-EMAIL-HK-02': [11, 'A', 'A / 제안 준비', '활동 제보 공식 이메일 공개. 광고와 구분', '번체 HK 문안, 실제 배송조건 확인', 'https://www.ulifestyle.com.hk/aboutus', 'https://www.ulifestyle.com.hk/aboutus'],
  'P-EMAIL-HK-03': [12, 'A', 'A- / 제안 준비', '제품/브랜드 스토리 제보 공개; 음식 중심 성격이 있어 적합도 낮춤', '홈향기 전용 독자층 여부 미확인', 'https://www.saucyhongkong.com/contact', 'https://www.saucyhongkong.com/contact'],
  'P-EMAIL-TW-01': [13, 'A', 'A / 제안 준비', '뉴스稿/브랜드 스토리 공개 접수, 광고는 별도', '대만 B2C 구매조건/반품정책 미확정이면 구매 광고처럼 소개 금지', 'https://womany.net/about.html', 'https://womany.net/about.html', 'https://womany.net/'],
  'P-DM-SG-01': [31, 'A', '보류 / 계정 검증', IG_FAIL, '계정 실제 활동, 본인 확인, 광고비 요구 여부 선확인', 'https://hello.storify.me/blog/7-singapore-home-owners-who-tell-good-stories-about-their-stylish-homes/', ''],
  'P-DM-SG-02': [32, 'A', '보류 / 계정 검증', IG_FAIL, '계정 실제 활동, 유료 파트너십 여부 선확인', 'https://hello.storify.me/blog/7-singapore-home-owners-who-tell-good-stories-about-their-stylish-homes/', ''],
  'P-DM-SG-03': [33, 'A', '보류 / 계정 검증', IG_FAIL, '계정 실제 활동, 실제 국가, DM 제한 선확인', 'https://pristinearoma.sg/blogs/pristine-homes/new-york-city-meets-bali-tfthishouse', ''],
  'P-DM-JP-01': [34, 'A', '보류 / 계정 검증', IG_FAIL, '실제 제품 관련 게시물 확인 전 접촉 금지', 'https://influencer.codigital.co.jp/ja/insights/fragrance-perfume-influencers-japan/', ''],
  'P-EMAIL-HK-04': [47, 'A', 'B / 전문 교류', '공식 협회 연락 가능; 독립 편집 매체 아님', '유료 교육·건강 효능·제품 인증 연계 금지', 'https://hkadal.com/', 'https://hkadal.com/'],
};
const FIRST_WAVE = { 'P-EMAIL-SG-01': '1차 발송 추천', 'P-FORM-JP-01': '1차 발송 추천', 'P-FORM-HK-01': '1차 발송 추천', 'P-EMAIL-SG-02': '2차 발송 추천', 'P-EMAIL-HK-01': '2차 발송 추천', 'P-EMAIL-TW-01': '2차 발송 추천' };
for (const row of seedPress) {
  const [no, grade, recheck, route, check, evidence, related, site] = FILE[row.content_id];
  Object.assign(row, {
    grade, recheck_result: recheck, verified_route: route, pre_send_check: check, evidence_url: evidence, related_url: related || null,
    hold_reason: recheck.startsWith('보류') ? `계정 검증 실패 (${route.replace('원본 후보. ', '')}). ${check}` : null,
    outlet_url: row.outlet_url || site || null,
    notes: `${PR_LIST} · 재선정50 #${no}${FIRST_WAVE[row.content_id] ? ` · ${FIRST_WAVE[row.content_id]}` : ''}`,
  });
}
