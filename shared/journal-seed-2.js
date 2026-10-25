// Second Journal batch: one article per market, each answering a different question (AEO), not a translation.
// Usage and care always sit inside the product description, never as a separate topic.
// Rows start "in_review"; supabase/seeds/011_journal_batch2.sql is generated from this file by scripts/journal-batch2-sql.mjs.
import { JOURNAL_FACTS, SOURCE_DOC } from './journal-seed.js';

const PACK = '/images/hondit-pack/hondit_codex_image_pack/01_product_originals';
const SOURCES = (...ids) => JOURNAL_FACTS.filter((f) => ids.includes(f.id)).map(({ label, url }) => ({ label, url }));
const REVIEW_DONE = { facts: true, claims: true, images: true, notes: '사진: StoneJeju 공식 제품 사진 (협업 파트너 허락, 대표님 확인 2026-10-25). 상자 표기 충돌 없는 사진만 사용. 사실: StoneJeju 공식 상세·사이트 결제 규칙 대조. 표현: 자동 검수 오류 0.', reviewer: 'JW (Claude 대행 검수)' };
const BASE = { status: 'in_review', author_type: 'hondit_editorial', author_name: 'HONDIT editorial team', image_rights: 'confirmed', review: REVIEW_DONE, source_doc: SOURCE_DOC };

export const seedArticles2 = [
  {
    ...BASE,
    id: '7d1f0f0a-0001-4a10-9a01-000000000005',
    content_id: 'S-JRN-SG-02',
    group_key: 'jeju-scoria-material-2026-10',
    language: 'en',
    market: 'SG',
    slug: 'why-jeju-volcanic-stone-has-holes',
    title: 'Why is Jeju volcanic stone full of tiny holes?',
    dek: "The dark stone seen all over Jeju is covered in small pores. Here is where they come from, why they matter for a fragrance object, and how StoneJeju puts the stone to work.",
    hero_image_url: '/images/journal/sg-01-diffuser-350-vessel.webp',
    hero_image_alt: 'A black glass vessel holding pieces of dark, porous Jeju volcanic scoria',
    hero_image_caption: 'Porous Jeju scoria in the 350 size glass vessel.',
    hero_image_credit: 'Photo: StoneJeju official product photograph, cropped. Used with permission.',
    related_products: ['diffuser-350g', 'diffuser-500g'],
    cta_type: 'product',
    seo_title: 'Why Jeju volcanic stone has holes, and what that means for a diffuser | HONDIT Journal',
    seo_description: 'Where the pores in Jeju volcanic scoria come from and why a porous stone can hold fragrance oil, explained through the StoneJeju diffuser, with how to order from Singapore.',
    sources: SOURCES('diffuser-350g', 'diffuser-500g', 'care', 'brand'),
    body_md: `Pick up a piece of the dark stone that Jeju Island is known for and the first thing you notice is how light it feels, and how many small holes it has. Those holes are not damage. They are the story of how the stone was made.

## Where the holes come from

Jeju was formed by volcanic eruptions. Molten rock carries dissolved gas, and when that rock is thrown out and cools quickly, the gas is trapped as bubbles before the stone sets. The result is scoria: a dark, rough rock full of small air pockets. That is why Jeju's field walls and coastal rocks look so textured, and why a handful of the stone weighs less than you would expect.

## Why pores matter for a fragrance object

A stone with many small openings has a lot of surface for its size. When a few drops of fragrance oil land on it, the oil is taken up into those openings and then leaves the surface slowly into the air. A smooth, dense stone could not do this. The porous structure is what turns a rock into something that can hold a scent.

## How StoneJeju uses it

StoneJeju, a maker on Jeju, fills a vessel with pieces of this scoria and pairs it with 10mL of citrus fragrance oil. You put 10 to 12 drops on the upper stones and add a few more whenever you want the scent back. There is no flame and no plug. Because it is natural stone, size and colour differ from set to set and a little fine powder may come off; to change to another fragrance, rinse the stone in warm water and let it dry completely first.

- 350g: about 75 × 100 × 75 mm in a glass vessel, sized for a desk or shelf.
- 500g: about 100 × 105 × 100 mm in Jeju onggi, the traditional Korean earthenware, for a larger space.

![The 500 size in its onggi vessel by a window](${PACK}/07_diffuser_500_window.webp "The 500 size sits in a Jeju onggi vessel. Photo: StoneJeju, used with permission.")

HONDIT, a student-operated curation team from Jeju National University's GTEP programme, introduces the product overseas. StoneJeju makes it; HONDIT is not the manufacturer.

## Ordering from Singapore

Orders from Singapore start at 10 units of one size, and international delivery to Singapore is included in the price shown on the product page. You can pay directly on the [350g diffuser page](/products/diffuser-350g) or the [500g diffuser page](/products/diffuser-500g) for exactly 10 units, or for 20 units or more, of one size per order.

A quantity between 11 and 19, an order that mixes the two sizes, or a quantity above the stock shown is handled as a separate quote: [send an enquiry](/contact) with the sizes and quantities you need. Any import duties or taxes are paid by the recipient.`,
  },
  {
    ...BASE,
    id: '7d1f0f0a-0001-4a10-9a01-000000000006',
    content_id: 'S-JRN-JP-02',
    group_key: 'jeju-onggi-craft-2026-10',
    language: 'ja',
    market: 'JP',
    slug: 'jeju-onggi-diffuser-vessel',
    title: '済州のオンギとは――500gディフューザーの器の話',
    dek: '韓国の伝統的な陶器「オンギ（甕器）」を器にしたStoneJejuの500gディフューザー。オンギとは何か、なぜ火山石と合うのか、使い方と日本でのご注文方法をまとめました。',
    hero_image_url: `${PACK}/06_diffuser_500_studio.webp`,
    hero_image_alt: 'スタジオで撮影した、済州オンギの器に入ったStoneJeju火山石ディフューザー500g',
    hero_image_caption: '500g：済州オンギの器。約100 × 105 × 100mm。',
    hero_image_credit: '写真：StoneJeju 公式製品写真（許諾を得て使用）',
    related_products: ['diffuser-500g', 'diffuser-350g'],
    cta_type: 'product',
    seo_title: '済州オンギとは？火山石ディフューザー500gの器 | HONDIT Journal',
    seo_description: '韓国の伝統的な陶器オンギを器にしたStoneJejuの火山石ディフューザー500g。オンギの特徴、使い方とお手入れ、日本からのご注文方法をご紹介します。',
    sources: SOURCES('diffuser-500g', 'care', 'brand'),
    body_md: `韓国には、昔から食べ物や水を入れる器として使われてきた「オンギ（甕器）」と呼ばれる陶器があります。済州島のオンギは、その土地の素材と暮らしに寄り添って作られてきました。StoneJejuの500gディフューザーは、このオンギを器に使っています。

## オンギとはどんな器か

オンギは、韓国で長く使われてきた素焼きに近い質感の伝統的な陶器です。釉薬のつややかさよりも、土そのものの素朴な風合いが魅力で、一つひとつの表情が少しずつ違います。同じ形でも、色合いや手触りに個体差があるのは、自然素材の器ならではです。

## 火山石との相性

器の中には、黒い多孔質の済州の火山石が入っています。土の色をした器と黒い石の組み合わせは、飾り気がなく、棚や窓辺に置いても主張しすぎません。島の土と島の石、どちらも済州のものを合わせたところに、この商品らしさがあります。

![窓辺に置かれた済州オンギの器のディフューザー](${PACK}/07_diffuser_500_window.webp "500g：窓辺に置いたオンギの器。写真：StoneJeju（許諾を得て使用）")

## 製品について（使い方とお手入れ）

- サイズ：約100 × 105 × 100mm、中身は約500gの済州火山石。350gのガラス容器タイプ（約75 × 100 × 75mm）もあります。
- 使い方：火山石の上の方に、付属の10mLシトラス系フレグランスオイルを10〜12滴垂らします。香りを足したいときは、数滴だけ足してください。火も電気も使いません。
- お手入れ：石は天然素材のため、大きさや色に差があり、細かい粉が出ることがあります。香りを替えるときは、石をぬるま湯で洗ってよく乾かしてから使います。敏感な肌や傷のある肌には長く触れないようにし、オイルの表示に従ってください。

## つくり手と届け手

製品ブランドとつくり手はStoneJejuです。HONDITは済州大学GTEPの学生チームが運営し、海外向けの商品情報とご注文・お問い合わせを担当しています。HONDITは製造元ではありません。

## 日本からのご注文

日本へのご注文は、1回のご注文につき1サイズを20個から、[500gの商品ページ](/products/diffuser-500g)または[350gの商品ページ](/products/diffuser-350g)で円建てで直接お支払いいただけます。表示価格には韓国から日本への国際配送料が含まれます。

10個のお試し、2サイズの混在、ページに表示された在庫を超える数量は、個別のお見積もりになります。サイズと数量を添えて[お問い合わせ](/contact)ください。関税や輸入時の税金が発生する場合は、受取人のご負担です。`,
  },
  {
    ...BASE,
    id: '7d1f0f0a-0001-4a10-9a01-000000000007',
    content_id: 'S-JRN-HK-02',
    group_key: 'jeju-corporate-gift-2026-10',
    language: 'zh-HK',
    market: 'HK',
    slug: 'jeju-volcanic-stone-corporate-gift',
    title: '公司禮品與團體訂購：用濟州火山石擴香送一份韓國手信',
    dek: '想送客戶、同事或活動嘉賓一份不太俗套、又有韓國濟州特色的小禮物？這篇介紹 StoneJeju 火山石擴香適合送禮的原因、兩種規格、使用方法，以及香港團體訂購的方式。',
    hero_image_url: `${PACK}/07_diffuser_500_window.webp`,
    hero_image_alt: '放在窗邊的 StoneJeju 500g 火山石擴香，濟州甕器容器',
    hero_image_caption: '500g：濟州甕器容器，約 100 × 105 × 100 毫米。',
    hero_image_credit: '相片：StoneJeju 官方產品相片（已獲授權使用）',
    related_products: ['diffuser-500g', 'diffuser-350g'],
    cta_type: 'product',
    seo_title: '公司禮品與團體訂購：濟州火山石擴香 | HONDIT Journal',
    seo_description: 'StoneJeju 濟州火山石擴香適合作公司禮品與團體贈禮：350g 玻璃容器與 500g 濟州甕器兩款，附 10mL 柑橘香氛油，並說明香港團體訂購方式。',
    sources: SOURCES('diffuser-350g', 'diffuser-500g', 'care', 'brand'),
    body_md: `送禮給客戶或同事，最難的是既要得體，又不想跟別人送的一樣。StoneJeju 的火山石擴香來自韓國濟州島，不用插電、不用點火，外形簡單，放在辦公桌或接待處都不顯得突兀，是一份有故事的韓國手信。

## 為什麼適合作禮物

- 有地方特色：用的是濟州的多孔火山石，500g 款的容器是濟州甕器（韓國傳統陶器），拿出來就有話題可講。
- 容易收下：不需要插座，不需要點火，收禮的人放在桌面、書架或櫃檯即可。
- 不搶眼：黑色的石頭與素色的容器，配搭任何辦公室或家居都自然。

## 兩種規格，兩種送禮場合

- 350g：約 75 × 100 × 75 毫米，玻璃容器，適合送給個人，放在書桌或床頭。
- 500g：約 100 × 105 × 100 毫米，濟州甕器容器，體積較大，適合放在公司接待處、會議室或共用空間，也適合作較隆重的贈禮。

![攝影棚拍攝的 StoneJeju 500g 火山石擴香](${PACK}/06_diffuser_500_studio.webp "500g 款的濟州甕器容器。相片：StoneJeju（已獲授權使用）")

## 產品簡介（包括使用與保養）

每組附 10mL 柑橘香氛油。使用時，把 10 至 12 滴香氛油滴在上層的火山石上；想補香時再加幾滴即可。石頭是天然材質，大小與顏色會有差異，也可能掉落少量細粉。要換成另一種香氛時，先用溫水沖洗石頭，完全晾乾後再使用。避免長時間接觸敏感或受損的皮膚，並依香氛油標示使用。

## 關於 HONDIT

產品品牌與製造方是 StoneJeju。HONDIT 由濟州大學 GTEP 學生團隊營運，負責海外商品資訊及銷售洽詢，並非製造商。

## 團體與公司訂購（香港）

寄往香港的訂單，每筆訂單選一種規格、20 件起，可以在[500g 商品頁](/products/diffuser-500g)或[350g 商品頁](/products/diffuser-350g)直接以港幣付款。標示價格已包含從韓國寄到香港的國際運費。

10 件試購、兩種規格混合，或超過頁面顯示庫存的數量，需要另行報價：請[聯絡我們](/contact)並寫明規格、數量與用途。如有進口稅或關稅，由收件人支付。`,
  },
  {
    ...BASE,
    id: '7d1f0f0a-0001-4a10-9a01-000000000008',
    content_id: 'S-JRN-TW-02',
    group_key: 'jeju-student-export-2026-10',
    language: 'zh-TW',
    market: 'TW',
    slug: 'jeju-student-team-export-project',
    title: '一群濟州大學學生，怎麼把一件濟州小物介紹到台灣？',
    dek: '把地方商品賣到海外，要先搞懂語言、市場和訂購規則。這篇說明 HONDIT 學生團隊在做什麼、不做什麼，以及 StoneJeju 火山石擴香如何走到台灣。',
    hero_image_url: `${PACK}/07_diffuser_500_window.webp`,
    hero_image_alt: '窗邊的 StoneJeju 500g 火山石擴香，濟州甕器容器',
    hero_image_caption: '500g：濟州甕器容器，約 100 × 105 × 100 公釐。',
    hero_image_credit: '照片：StoneJeju 官方產品照片（已取得授權使用）',
    related_products: ['diffuser-500g', 'diffuser-350g'],
    cta_type: 'product',
    seo_title: '濟州大學學生如何把濟州商品介紹到台灣 | HONDIT Journal',
    seo_description: 'HONDIT 是濟州大學 GTEP 學生團隊，負責把 StoneJeju 火山石擴香介紹到海外。了解學生團隊的分工、各市場的訂購規則，以及台灣訂購方式。',
    sources: SOURCES('diffuser-350g', 'diffuser-500g', 'care', 'brand'),
    body_md: `一件在濟州島做出來的小商品，要走到台灣的桌面上，中間需要的不只是運送。它需要有人把資訊翻成當地的語言，弄清楚當地的訂購與付款方式，還要說清楚誰是製造者、誰是銷售窗口。HONDIT 是一支濟州大學 GTEP 學生團隊，正在用 StoneJeju 的火山石擴香練習這件事。

## 這個團隊是誰

GTEP 是濟州大學的貿易人才培養課程。HONDIT 由修課的學生營運，負責整理海外商品資訊、製作多語內容，並處理海外的銷售洽詢。產品的品牌與製造方是 StoneJeju，HONDIT 並不是製造商。

## 學生團隊實際做什麼

- 整理商品資訊：把規格、使用方式與保養方法寫清楚，並與原廠資料核對。
- 製作多語內容：同一件商品，針對日本、香港、台灣、新加坡等不同市場，用當地讀者的角度說明。
- 弄清楚各市場的規則：訂購數量、付款與運送方式會因市場與商品而不同，必須逐一確認，不能一體適用。
- 回覆洽詢：有特殊需求的客人，由團隊另外報價與說明。

## 從一件商品學到的事

學生們發現，介紹商品最難的往往不是商品本身，而是把「能買、怎麼買、多少錢、誰負責」這些條件講得準確。因此在每個市場的文章裡，團隊都把訂購條件單獨寫清楚，也不寫沒有根據的說法。

## 這件商品是什麼

StoneJeju 火山石擴香把多孔的濟州火山渣放進容器，搭配隨附的 10mL 柑橘香氛油使用，不需要插電或點火。

- 350g：約 75 × 100 × 75 公釐，玻璃容器。
- 500g：約 100 × 105 × 100 公釐，容器為濟州甕器（韓國傳統陶器）。

使用時，在上層石頭滴 10 到 12 滴香氛油，想補香時再加幾滴。石頭是天然材質，大小與顏色會有差異，也可能掉落少量細粉；要更換其他香氛時，請先用溫水沖洗石頭並完全晾乾。避免長時間接觸敏感或受損的皮膚，並依照香氛油標示使用。

![攝影棚拍攝的 StoneJeju 500g 火山石擴香](${PACK}/06_diffuser_500_studio.webp "500g 規格的濟州甕器容器。照片：StoneJeju（已取得授權使用）")

## 在台灣訂購

寄往台灣的訂單，每筆訂單選一種規格、20 件起，可以在[500g 商品頁](/products/diffuser-500g)或[350g 商品頁](/products/diffuser-350g)直接以新台幣付款。標示價格已包含從韓國寄到台灣的國際運費。

10 件試購、兩種規格混合，或超過頁面顯示庫存的數量，需要另外報價：請[聯絡我們](/contact)並寫明規格與數量。如有關稅或進口稅費，由收件人負擔。`,
  },
];
