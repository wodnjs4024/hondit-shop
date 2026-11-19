// Journal batch 4 (2026-11-19): one gift guide per market, written around situations people ask about
// (partner, parents, housewarming, colleagues, homes with children or pets, small rented rooms).
// New fact (JW, 2026-11-19): StoneJeju diffusers are normally sold only offline in Jeju; HONDIT sells them outside Jeju
// as a GTEP-programme exception until the end of February 2027. Other facts only from JOURNAL_FACTS and the checkout terms
// (5 or 20+ of one size pay directly; Singapore also 10, and one piece on Shopee; other quantities or mixed sizes are quotes).
// Prices are not quoted in the text (they live on the product pages). Every article starts "in_review": nothing is public
// until the operator approves it in /admin/journal.
import { JOURNAL_FACTS } from './journal-seed.js';

const SOURCES = (...ids) => JOURNAL_FACTS.filter((f) => ids.includes(f.id)).map(({ label, url }) => ({ label, url }));
const AVAILABILITY_SOURCE = { label: 'HONDIT 판매처·판매 기간 (운영자 확인 2026-11-19)', url: 'https://hondit-shop.vercel.app/jeju/pickup' };
const REVIEWED = { facts: true, claims: true, images: true, notes: '2026-11-19: 사실은 JOURNAL_FACTS·주문 조건·운영자 확인(제주 오프라인 한정, 2027년 2월 말까지 HONDIT 해외 판매) 기준. 위험 표현 자동 검사 통과. 사진은 StoneJeju 사용 허락 범위, 다른 글에 쓰지 않은 사진. 가격 수치는 본문에 넣지 않음.', reviewer: 'HONDIT editorial', reviewed_at: '2026-11-19T00:00:00Z' };
const BASE = { status: 'in_review', author_type: 'hondit_editorial', author_name: 'HONDIT editorial team', image_rights: 'confirmed', review: REVIEWED, source_doc: null, related_products: ['diffuser-350g', 'diffuser-500g'], cta_type: 'product', group_key: 'jeju-only-gift-guide-2026-11', sources: [...SOURCES('diffuser-350g', 'diffuser-500g', 'care', 'brand'), AVAILABILITY_SOURCE] };
const CREDIT = 'Photo: StoneJeju product photograph. Used with permission.';

export const seedArticles4 = [
  {
    ...BASE,
    id: '7d1f0f0a-0004-4a10-9a01-000000000001',
    content_id: 'S-JRN-SG-04',
    language: 'en',
    market: 'SG',
    slug: 'jeju-only-gift-guide-volcanic-stone-diffuser',
    title: 'A gift that is usually sold only in Jeju: who the StoneJeju diffuser suits',
    dek: 'StoneJeju\'s volcanic stone diffuser is normally sold only in shops in Jeju, South Korea. Until the end of February 2027 HONDIT, a Jeju National University student team, sells it outside the island. Here is who it suits as a gift, and which size to pick.',
    hero_image_url: '/images/journal/sg-04-hero-gift-box.webp',
    hero_image_alt: 'An opened shipping box with StoneJeju volcanic stone diffusers, citrus oil bottles and HONDIT cleansing products on a stone slab',
    hero_image_caption: 'How a HONDIT order arrives from Korea: the diffuser, its oil and the box.',
    hero_image_credit: CREDIT,
    seo_title: 'Jeju gift guide: StoneJeju volcanic stone diffuser, sold outside Jeju only via HONDIT | HONDIT Journal',
    seo_description: 'StoneJeju diffusers are normally sold only in Jeju, South Korea. Until the end of February 2027 HONDIT sells them abroad. Gift ideas for a partner, parents, a new home, colleagues and homes with children or pets.',
    body_md: `Most souvenirs from Jeju, South Korea, are easy to find again: tangerine chocolate, dol hareubang figures, cosmetics sold at the airport. StoneJeju's volcanic stone diffuser is different. The maker normally sells it only in shops on Jeju Island. Until the end of February 2027, HONDIT, a student team in Jeju National University's GTEP programme, sells it to customers outside Jeju as an exception. That limited route is part of what makes it a gift with a story.

## What the gift is

Porous Jeju volcanic scoria sits in a vessel, and you add 10–12 drops of the included 10mL citrus fragrance oil across the upper stones. There is no power, no flame, no water and no reed sticks. When the scent fades, you add a few drops again.

- 350g: about 75 × 100 × 75 mm, in a glass vessel. A desk, a bedside table or a small shelf.
- 500g: about 100 × 105 × 100 mm, in Jeju onggi earthenware. A living room, an entrance or a shared table.

## Who it suits

- A partner: the 350g fits a bedside table, and it reads as Jeju without a logo. A note with the date of your trip makes it personal.
- Parents: the 500g in onggi looks like a piece of pottery on a shelf, and there is nothing to switch on or charge. Explaining it takes one sentence: a few drops of oil on the stone.
- A new home: it is not food and not a candle, so it suits a housewarming where the hosts are still arranging furniture.
- Colleagues or a team: five pieces of one size can be ordered together, so everyone receives the same gift.
- Homes with small children or pets: there is no flame and no cable. Keep the oil bottle and the stones on a high shelf, out of reach, and follow the oil label.
- A shared flat or an HDB bedroom: no socket is needed, and it can sit beside a window or on a narrow desk.

## What buyers on Shopee Singapore said

Two buyers who left five-star reviews on HONDIT's Shopee Singapore listing in 2026 wrote that the citrus scent reminded them of Jeju oranges without being heavy, that the stone and pot look like room decor, and that it would make a lovely and unique gift. One also noted that the seller answered questions quickly and checked that the order had arrived.

## Care and variation

The stone is natural, so size and colour vary and it may shed fine powder. To change fragrance, rinse the stones in warm water and let them dry completely first. Avoid prolonged contact with sensitive or damaged skin.

## How to get one in Singapore

- A single gift: HONDIT's Shopee Singapore listing, linked on the [350g product page](/products/diffuser-350g).
- Five, ten, or twenty or more of one size: pay directly on the product page in SGD, with delivery from Korea included. See the [350g](/products/diffuser-350g) and [500g](/products/diffuser-500g) diffusers.
- Visiting Jeju: collect 1 to 3 pieces at Jeju Airport by prior arrangement through the [airport pickup page](/jeju/pickup).
- Mixed sizes or other quantities: [send an enquiry](/contact).

For Christmas, order by 4 December; for Chinese New Year, order by 15 January. StoneJeju is the maker; HONDIT is the seller and does not manufacture the product.`,
  },
  {
    ...BASE,
    id: '7d1f0f0a-0004-4a10-9a01-000000000002',
    content_id: 'S-JRN-JP-04',
    language: 'ja',
    market: 'JP',
    slug: 'jeju-only-gift-guide-volcanic-stone-diffuser',
    title: '済州島でしか買えない香りのギフト：StoneJejuの火山石ディフューザーを贈る相手と選び方',
    dek: 'StoneJejuの火山石ディフューザーは、本来は韓国・済州島の店舗だけで販売されています。2027年2月末までは、済州大学の学生チームHONDITを通して日本からも注文できます。贈る相手ごとの選び方をまとめました。',
    hero_image_url: '/images/journal/jp-04-hero-collection.webp',
    hero_image_alt: '石の台の上に並んだStoneJejuの火山石ディフューザー、シトラスオイル、パッケージ',
    hero_image_caption: '火山石ディフューザーとオイル、パッケージ。',
    hero_image_credit: CREDIT,
    seo_title: '済州島でしか買えないギフト：StoneJeju火山石ディフューザーの選び方 | HONDIT Journal',
    seo_description: 'StoneJejuの火山石ディフューザーは本来、韓国・済州島の店舗だけで販売。2027年2月末までHONDITが日本向けに販売します。彼女、母、新築祝い、子どもやペットのいる家への贈り方。',
    body_md: `韓国・済州島のお土産は、みかんのお菓子や石像のミニチュアなど、帰国してからも手に入るものが少なくありません。StoneJejuの火山石ディフューザーは少し事情が違います。メーカーは本来、済州島の店舗だけで販売しています。2027年2月末までは例外として、済州大学校GTEPプログラムの学生チームHONDIT（ホンディット）が島の外のお客様に販売しています。期間が限られていること自体が、贈り物の話題になります。

## どんなものか

多孔質な済州の火山石（スコリア）を器に入れ、付属のシトラスオイル10mLを上の石に10〜12滴垂らして使います。電気も火も水もスティックも使いません。香りが弱くなったら、また数滴足します。

- 350g：約75×100×75mm、ガラスの器。デスク、ベッドサイド、小さな棚に。
- 500g：約100×105×100mm、済州オンギ（伝統陶器）の器。リビング、玄関、家族で使う場所に。

## 贈る相手ごとの選び方

- 彼女・パートナーへ：350gはベッドサイドに置きやすく、ロゴがなくても済州らしさが伝わります。旅行の日付を書いたカードを添えると、思い出の品になります。
- お母さん・お義母さんへ：500gのオンギは棚に置くと陶器の置物のように見えます。スイッチも充電もないので、説明は「石にオイルを数滴」だけです。
- 新築祝い・引っ越し祝いへ：食べ物でもキャンドルでもないので、家具をそろえている最中の新居にも贈りやすいです。
- 職場やサークルへ：同じサイズを5個まとめて注文できるので、全員に同じものを渡せます。
- 小さな子どもやペットのいる家へ：炎もコードもありません。オイルの瓶と石は手の届かない高い場所に置き、ラベルの注意に従ってください。

## お手入れと個体差

天然石なので、大きさや色に個体差があり、細かい粉が出ることがあります。香りを変えるときは、石をぬるま湯ですすぎ、完全に乾かしてから使ってください。敏感な肌や傷のある肌に長く触れないようにしてください。

## 日本から注文するには

- 日本への配送は、同じサイズ5個から、または20個以上で、日本円・送料込みで直接決済できます。[350g](/products/diffuser-350g)・[500g](/products/diffuser-500g)の商品ページで、その日の金額を確認できます。
- サイズを混ぜたい場合やほかの数量は、[お問い合わせ](/contact)からお見積もりします。
- 済州旅行中なら、[済州空港受け取り](/jeju/pickup)で1〜3個を事前予約で受け取れます。

クリスマス前に届けたい場合は12月4日まで、旧正月前は1月15日までのご注文をおすすめします。作っているのはStoneJeju、販売はHONDITで、HONDITは製造をしていません。`,
  },
  {
    ...BASE,
    id: '7d1f0f0a-0004-4a10-9a01-000000000003',
    content_id: 'S-JRN-HK-04',
    language: 'zh-HK',
    market: 'HK',
    slug: 'jeju-only-gift-guide-volcanic-stone-diffuser',
    title: '原本只喺濟州有得賣：StoneJeju 火山石香薰送邊個啱、點揀',
    dek: 'StoneJeju 火山石香薰原本只喺韓國濟州島實體店發售。2027 年 2 月底前，濟州大學學生團隊 HONDIT 例外地將佢賣去濟州以外，包括香港。以下按送禮對象講點揀。',
    hero_image_url: '/images/journal/hk-04-hero-diffuser.webp',
    hero_image_alt: 'StoneJeju 黑色玻璃容器火山石香薰，旁邊是包裝盒和柑橘香氛油',
    hero_image_caption: '350g 火山石香薰、包裝盒同附送嘅柑橘香氛油。',
    hero_image_credit: CREDIT,
    seo_title: '原本只喺濟州賣：StoneJeju 火山石香薰送禮點揀 | HONDIT Journal',
    seo_description: 'StoneJeju 火山石香薰原本只喺韓國濟州島實體店發售，2027 年 2 月底前由 HONDIT 賣去香港。送女朋友、屋企人、新屋入伙、同事同有細路寵物嘅家點揀。',
    body_md: `去韓國濟州島旅行，手信通常係柑橘朱古力、石頭公仔或者化妝品，返到香港好多都買得到。StoneJeju 火山石香薰唔同：製造商原本只喺濟州島嘅實體店發售。2027 年 2 月底前，濟州大學 GTEP 課程學生團隊 HONDIT 例外地將佢賣畀濟州以外嘅客人。有期限，送出去都多個話題。

## 係乜嘢

多孔嘅濟州火山石放喺容器入面，將附送嘅 10mL 柑橘香氛油滴 10 至 12 滴喺上層石頭就用得。唔使插電、唔使點火、唔使加水，亦冇藤枝。香味淡咗，再滴幾滴就得。

- 350g：約 75 × 100 × 75 mm，玻璃容器，啱書枱、床頭同細層架。
- 500g：約 100 × 105 × 100 mm，濟州甕器，啱客廳、玄關同屋企人一齊用嘅地方。

## 送邊個啱

- 女朋友：350g 放床頭剛好，冇大 logo 都睇得出係濟州嘢。附張卡寫低旅行日期，就變成紀念品。
- 屋企長輩：500g 甕器款擺喺層架好似一件陶器，冇開關又唔使充電，教佢哋用只係一句：滴幾滴油喺石頭上。
- 新屋入伙：唔係食物亦唔係蠟燭，啱仲執緊傢俬嘅新屋。
- 同事同團隊：同款可以一次訂 5 件，大家收到一樣嘅禮物，唔使拎重行李返港。
- 有細路或者寵物嘅家：冇火亦冇電線。油樽同石頭要放喺高處、細路同寵物掂唔到嘅地方，並按標籤使用。
- 香港細單位同寫字樓：唔使插頭，窗邊或者窄書枱都放得落。

## 保養同天然差異

天然石嘅大小同顏色會有少少唔同，亦可能有細粉。換香味前，用溫水沖洗石頭，完全乾透先再用。避免長時間接觸敏感或者有傷口嘅皮膚。

## 香港點買

- 寄香港：同款 5 件起，或者 20 件或以上，以港幣直接付款，已包由韓國寄出嘅運費。金額睇 [350g](/products/diffuser-350g) 同 [500g](/products/diffuser-500g) 商品頁。
- 混合款式或者其他數量：[查詢報價](/contact)。
- 去緊濟州：可以預約 [濟州機場交收](/jeju/pickup) 1 至 3 件。

聖誕節前收貨請喺 12 月 4 日前落單，農曆新年前請喺 1 月 15 日前。StoneJeju 係製造商，HONDIT 負責銷售，並唔係生產商。`,
  },
  {
    ...BASE,
    id: '7d1f0f0a-0004-4a10-9a01-000000000004',
    content_id: 'S-JRN-TW-04',
    language: 'zh-TW',
    market: 'TW',
    slug: 'jeju-only-gift-guide-volcanic-stone-diffuser',
    title: '原本只在濟州販售：StoneJeju 火山岩擴香適合送誰、怎麼挑',
    dek: 'StoneJeju 火山岩擴香原本只在韓國濟州島的實體店販售。2027 年 2 月底前，濟州大學學生團隊 HONDIT 例外地把它賣到濟州以外，包括台灣。以下依送禮對象整理挑選方式。',
    hero_image_url: '/images/journal/tw-04-hero-jeju-origin.webp',
    hero_image_alt: 'StoneJeju 黑色玻璃容器火山岩擴香與香氛油瓶，旁邊寫著 JEJU ORIGIN',
    hero_image_caption: '來自濟州的火山岩，裝在黑色玻璃容器裡。',
    hero_image_credit: CREDIT,
    seo_title: '原本只在濟州販售：StoneJeju 火山岩擴香送禮怎麼挑 | HONDIT Journal',
    seo_description: 'StoneJeju 火山岩擴香原本只在韓國濟州島實體店販售，2027 年 2 月底前由 HONDIT 賣到台灣。送女友、爸媽、新居落成、同事與有小孩寵物的家怎麼挑。',
    body_md: `到韓國濟州島旅行，伴手禮多半是柑橘巧克力、石爺爺小物或保養品，回台灣後很多都買得到。StoneJeju 火山岩擴香不太一樣：製造商原本只在濟州島的實體店販售。2027 年 2 月底前，濟州大學 GTEP 課程的學生團隊 HONDIT 以例外方式，把它賣給濟州以外的顧客。有期限這件事，本身就是送禮時可以說的故事。

## 它是什麼

把多孔的濟州火山岩放在容器裡，在上層石頭滴 10 到 12 滴隨附的 10mL 柑橘香氛油就能使用。不插電、不點火、不加水，也沒有擴香竹。香味變淡時，再滴幾滴即可。

- 350g：約 75 × 100 × 75 mm，玻璃容器，適合書桌、床頭與小層架。
- 500g：約 100 × 105 × 100 mm，濟州甕器，適合客廳、玄關與家人共用的空間。

## 適合送誰

- 女友或伴侶：350g 放床頭剛好，沒有明顯標誌也看得出是濟州的東西。附上一張寫著旅行日期的小卡，就成了紀念品。
- 爸媽與長輩：500g 甕器款放在層架上像一件陶器，沒有開關也不用充電，教學只要一句：在石頭上滴幾滴油。
- 新居落成：不是食物也不是蠟燭，適合還在布置家具的新家。
- 同事、尾牙或團隊：同款一次可訂 5 個，每個人收到一樣的禮物，也不用把重物塞進行李箱。
- 有小孩或寵物的家：沒有火焰也沒有電線。油瓶與石頭請放在高處、小孩和寵物碰不到的地方，並依標籤使用。
- 租屋套房：不需要插座，窗邊或窄書桌都放得下，搬家時連容器放回盒子就能帶走。

## 保養與天然差異

天然石的大小與顏色各有不同，也可能有細粉。想換香味時，先用溫水沖洗石頭，完全乾燥後再使用。避免長時間接觸敏感或有傷口的皮膚。

## 台灣怎麼買

- 寄台灣：同款 5 個起，或 20 個以上，以新台幣直接付款，已含從韓國寄出的運費。金額請看 [350g](/products/diffuser-350g) 與 [500g](/products/diffuser-500g) 商品頁。
- 混搭尺寸或其他數量：[詢問報價](/contact)。
- 正在濟州旅行：可預約 [濟州機場取貨](/jeju/pickup) 1 到 3 個。

聖誕節前收貨請在 12 月 4 日前下單，春節前請在 1 月 15 日前。StoneJeju 是製造商，HONDIT 負責銷售，並非生產者。`,
  },
];
