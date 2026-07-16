import { FormEvent, useEffect, useState } from "react";
import { bulkProducts, formatSgd, type BulkCategory, type BulkProduct } from "../data/bulkProducts";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";

const categoryOptions: BulkCategory[] = ["cleansing", "diffuser"];
const editableListFields = ["features", "usage", "galleryImages", "detailImages", "detailHighlights", "detailHowToUse"] as const;
type EditableListField = (typeof editableListFields)[number];

const packRoot = "/images/hondit-pack/hondit_codex_image_pack";

const imagePresets = [
  `${packRoot}/02_brand_lifestyle/01_home_hero_full_line_coast.webp`,
  `${packRoot}/02_brand_lifestyle/02_home_hero_full_line_stone.webp`,
  `${packRoot}/02_brand_lifestyle/03_cleansing_trio_ice.webp`,
  `${packRoot}/02_brand_lifestyle/04_diffuser_pair_editorial_text.webp`,
  `${packRoot}/02_brand_lifestyle/09_full_line_shipping.webp`,
  `${packRoot}/01_product_originals/02_diffuser_350_studio.webp`,
  `${packRoot}/01_product_originals/03_diffuser_350_window.webp`,
  `${packRoot}/01_product_originals/04_diffuser_350_stone.webp`,
  `${packRoot}/01_product_originals/05_diffuser_350_shelf.webp`,
  `${packRoot}/01_product_originals/06_diffuser_500_studio.webp`,
  `${packRoot}/01_product_originals/07_diffuser_500_window.webp`,
  `${packRoot}/01_product_originals/08_diffuser_500_wood.webp`,
  `${packRoot}/01_product_originals/09_foaming_cleanser_cutout.webp`,
  `${packRoot}/01_product_originals/10_foaming_cleanser_pack.webp`,
  `${packRoot}/01_product_originals/11_foaming_cleanser_lifestyle.webp`,
  `${packRoot}/01_product_originals/12_foam_oil_cleanser.webp`,
  `${packRoot}/01_product_originals/13_cleansing_water_pack.webp`,
  `${packRoot}/01_product_originals/14_cleansing_water_cutout.webp`,
  `${packRoot}/01_product_originals/15_full_product_line_real.webp`,
  `${packRoot}/03_jeju_real_photos/01_jeju_black_coast_wide.webp`,
  `${packRoot}/03_jeju_real_photos/03_jeju_black_rocks_sea.webp`,
  `${packRoot}/03_jeju_real_photos/05_jeju_silver_grass_wind.webp`,
  `${packRoot}/03_jeju_real_photos/06_jeju_basalt_texture.webp`,
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function createProductDraft(products: BulkProduct[]): BulkProduct {
  const nextOrder = Math.max(0, ...products.map((product) => Number(product.sortOrder) || 0)) + 10;
  const seed = `new-product-${Date.now().toString(36)}`;
  return {
    id: seed,
    slug: seed,
    name: "새 hondit 상품",
    category: "cleansing",
    volumeLabel: "100ml",
    shortDescription: "제품 카드에 표시할 짧은 설명을 입력하세요.",
    description: "상품 상세페이지에 표시할 자세한 설명을 입력하세요.",
    imageUrl: `${packRoot}/01_product_originals/15_full_product_line_real.webp`,
    unitPriceSgd: 0,
    packQuantity: 1,
    packPriceSgd: 0,
    unitWeightKg: 0,
    inventoryPacks: 0,
    active: false,
    purchaseEnabled: false,
    sortOrder: nextOrder,
    features: ["특징"],
    usage: ["주문 안내"],
    galleryImages: [`${packRoot}/01_product_originals/15_full_product_line_real.webp`],
    detailImages: [],
    detailHighlights: ["상세 핵심 문구"],
    detailHowToUse: ["사용 단계"],
  };
}

function listToText(items: string[]) {
  return (items || []).join("\n");
}

function textToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function productList(product: BulkProduct, key: EditableListField) {
  const value = product[key];
  return Array.isArray(value) ? value : [];
}

function AdminMediaEditor({
  product,
  title,
  help,
  field,
  onAdd,
  onRemove,
  onMove,
  onUpdate,
}: {
  product: BulkProduct;
  title: string;
  help: string;
  field: "galleryImages" | "detailImages";
  onAdd: (slug: string, field: EditableListField, value?: string) => void;
  onRemove: (slug: string, field: EditableListField, index: number) => void;
  onMove: (slug: string, field: EditableListField, index: number, direction: -1 | 1) => void;
  onUpdate: (slug: string, field: EditableListField, index: number, value: string) => void;
}) {
  const images = productList(product, field);
  return (
    <section className="admin-media-editor">
      <div className="admin-media-editor__head">
        <div>
          <h3>{title}</h3>
          <p>{help}</p>
        </div>
        <button className="button button--ghost" type="button" onClick={() => onAdd(product.slug, field)}>이미지 URL 추가</button>
      </div>
      <div className="admin-media-presets" aria-label="기존 hondit 이미지 빠르게 추가">
        {imagePresets.map((image) => (
          <button type="button" key={image} onClick={() => onAdd(product.slug, field, image)}>
            <img src={image} alt="" loading="lazy" decoding="async" />
            <span>추가</span>
          </button>
        ))}
      </div>
      <div className="admin-media-list">
        {images.length === 0 && <p className="admin-muted">아직 이미지가 없습니다. 위 이미지팩에서 고르거나 외부 이미지 URL을 붙여넣으세요.</p>}
        {images.map((image, index) => (
          <div className="admin-media-row" key={`${field}-${index}`}>
            <img src={image || `${packRoot}/01_product_originals/15_full_product_line_real.webp`} alt="" loading="lazy" decoding="async" />
            <input value={image} onChange={(event) => onUpdate(product.slug, field, index, event.target.value)} placeholder="/images/example.png or https://..." />
            <button type="button" onClick={() => onMove(product.slug, field, index, -1)} disabled={index === 0}>위로</button>
            <button type="button" onClick={() => onMove(product.slug, field, index, 1)} disabled={index === images.length - 1}>아래로</button>
            <button type="button" className="is-danger" onClick={() => onRemove(product.slug, field, index)}>삭제</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  const load = () => {
    adminFetch<{ products: BulkProduct[] }>("/api/admin/products")
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const update = (slug: string, key: keyof BulkProduct, value: string | number | boolean | string[]) => {
    setProducts((current) => current.map((product) => (product.slug === slug ? { ...product, [key]: value } : product)));
  };

  const updateListItem = (slug: string, field: EditableListField, index: number, value: string) => {
    setProducts((current) => current.map((product) => {
      if (product.slug !== slug) return product;
      const next = [...productList(product, field)];
      next[index] = value;
      return { ...product, [field]: next };
    }));
  };

  const addListItem = (slug: string, field: EditableListField, value = "") => {
    setProducts((current) => current.map((product) => {
      if (product.slug !== slug) return product;
      const next = [...productList(product, field), value];
      return { ...product, [field]: next };
    }));
  };

  const removeListItem = (slug: string, field: EditableListField, index: number) => {
    setProducts((current) => current.map((product) => {
      if (product.slug !== slug) return product;
      const next = productList(product, field).filter((_, itemIndex) => itemIndex !== index);
      return { ...product, [field]: next };
    }));
  };

  const moveListItem = (slug: string, field: EditableListField, index: number, direction: -1 | 1) => {
    setProducts((current) => current.map((product) => {
      if (product.slug !== slug) return product;
      const next = [...productList(product, field)];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return product;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return { ...product, [field]: next };
    }));
  };

  const addProduct = () => {
    setProducts((current) => [createProductDraft(current), ...current]);
    setSaving("새 상품 초안을 추가했습니다. 내용을 채운 뒤 저장하세요.");
  };

  const duplicateProduct = (product: BulkProduct) => {
    const seedSlug = slugify(`${product.slug}-copy-${Date.now().toString(36)}`);
    setProducts((current) => [
      {
        ...product,
        id: seedSlug,
        slug: seedSlug,
        name: `${product.name} 복사본`,
        active: false,
        purchaseEnabled: false,
        sortOrder: Math.max(0, ...current.map((entry) => Number(entry.sortOrder) || 0)) + 10,
      },
      ...current,
    ]);
    setSaving("상품 복사본을 만들었습니다. 내용을 확인한 뒤 저장하세요.");
  };

  const removeDraft = (slug: string) => {
    setProducts((current) => current.filter((product) => product.slug !== slug));
    setSaving("이 편집 화면에서 초안을 제거했습니다. 다른 상품 변경사항은 저장 버튼을 눌러 반영하세요.");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving("상품 정보를 저장하는 중입니다...");
    const normalizedProducts = products.map((product) => {
      const slug = slugify(product.slug || product.name);
      return {
        ...product,
        id: product.id || slug,
        slug,
        unitPriceSgd: Number(product.unitPriceSgd) || 0,
        packQuantity: Math.max(1, Math.floor(Number(product.packQuantity) || 1)),
        packPriceSgd: Number(product.packPriceSgd) || 0,
        unitWeightKg: Number(product.unitWeightKg) || 0,
        inventoryPacks: Math.max(0, Math.floor(Number(product.inventoryPacks) || 0)),
        sortOrder: Math.floor(Number(product.sortOrder) || 100),
        galleryImages: textToList(listToText(product.galleryImages || [])),
        detailImages: textToList(listToText(product.detailImages || [])),
        detailHighlights: textToList(listToText(product.detailHighlights || [])),
        detailHowToUse: textToList(listToText(product.detailHowToUse || [])),
      };
    });
    await adminFetch("/api/admin/products", {
      method: "PATCH",
      body: JSON.stringify({ products: normalizedProducts }),
    });
    setSaving("저장되었습니다.");
    load();
  };

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">상품 / 이미지 관리</p>
        <h1>상품 정보와 상세 이미지를 관리합니다</h1>
        <p>상품명, 가격, 재고, 대표 이미지, 상세 갤러리와 세로형 상세 이미지를 이 화면에서 수정할 수 있습니다.</p>
      </div>
      <div className="admin-toolbar">
        <button className="button button--primary" type="button" onClick={addProduct}>새 상품 추가</button>
        <a className="button button--ghost" href="/bulk-orders" target="_blank" rel="noreferrer">대량구매 페이지 보기</a>
      </div>
      <form className="admin-panel admin-product-list" onSubmit={submit}>
        {products.map((product) => {
          const expected = Number((product.unitPriceSgd * product.packQuantity).toFixed(2));
          const mismatch = expected !== product.packPriceSgd;
          return (
            <article className="admin-product-row" key={product.slug}>
              <img src={product.imageUrl} alt={product.name} />
              <div>
                <div className="admin-product-row__head">
                  <div>
                    <p className={`admin-product-status ${product.active && product.purchaseEnabled ? "is-live" : ""}`}>
                      {product.active && product.purchaseEnabled ? "사이트에 노출 중" : "초안 또는 숨김"}
                    </p>
                    <h2>{product.name} {product.volumeLabel}</h2>
                  </div>
                  <div className="admin-row-actions">
                    <button className="button button--ghost" type="button" onClick={() => duplicateProduct(product)}>복제</button>
                    {!product.active && <button className="button button--danger" type="button" onClick={() => removeDraft(product.slug)}>초안 제거</button>}
                  </div>
                </div>
                <div className="admin-inline-grid admin-inline-grid--product-main">
                  <label>상품명<input value={product.name} onChange={(event) => update(product.slug, "name", event.target.value)} /></label>
                  <label>페이지 주소용 이름<input value={product.slug} onChange={(event) => update(product.slug, "slug", slugify(event.target.value))} /></label>
                  <label>카테고리
                    <select value={product.category} onChange={(event) => update(product.slug, "category", event.target.value as BulkCategory)}>
                      {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <label>용량 표기<input value={product.volumeLabel} onChange={(event) => update(product.slug, "volumeLabel", event.target.value)} /></label>
                  <label>대표 이미지 URL<input value={product.imageUrl} onChange={(event) => update(product.slug, "imageUrl", event.target.value)} /></label>
                  <label>개당 무게 kg<input type="number" step="0.001" value={product.unitWeightKg} onChange={(event) => update(product.slug, "unitWeightKg", Number(event.target.value))} /></label>
                </div>
                <label>상품 카드 짧은 설명<textarea value={product.shortDescription} onChange={(event) => update(product.slug, "shortDescription", event.target.value)} /></label>
                <label>상품 상세 설명<textarea value={product.description} onChange={(event) => update(product.slug, "description", event.target.value)} /></label>
                <div className="admin-inline-grid">
                  <label>개당 가격<input type="number" step="0.01" value={product.unitPriceSgd} onChange={(event) => update(product.slug, "unitPriceSgd", Number(event.target.value))} /></label>
                  <label>최소 주문 수량<input type="number" value={product.packQuantity} onChange={(event) => update(product.slug, "packQuantity", Number(event.target.value))} /></label>
                  <label>최소 주문 총액<input type="number" step="0.01" value={product.packPriceSgd} onChange={(event) => update(product.slug, "packPriceSgd", Number(event.target.value))} /></label>
                  <label>재고 팩 수<input type="number" value={product.inventoryPacks} onChange={(event) => update(product.slug, "inventoryPacks", Number(event.target.value))} /></label>
                  <label>정렬 순서<input type="number" value={product.sortOrder} onChange={(event) => update(product.slug, "sortOrder", Number(event.target.value))} /></label>
                </div>
                <div className="admin-inline-grid admin-inline-grid--textarea">
                  <label>특징 문구, 한 줄에 하나씩<textarea value={listToText(product.features)} onChange={(event) => update(product.slug, "features", textToList(event.target.value))} /></label>
                  <label>사용/주문 안내, 한 줄에 하나씩<textarea value={listToText(product.usage)} onChange={(event) => update(product.slug, "usage", textToList(event.target.value))} /></label>
                </div>
                <details className="admin-product-media" open>
                  <summary>상품 상세 이미지와 콘텐츠</summary>
                  <p className="admin-muted">
                    상단 갤러리는 상세페이지 첫 화면에 보입니다. 세로형 상세 이미지는 아래쪽 긴 상세 설명 영역에 표시됩니다.
                  </p>
                  <AdminMediaEditor
                    product={product}
                    field="galleryImages"
                    title="상단 상품 갤러리"
                    help="권장: 제품 정면, 질감, 크기/사용 맥락, 패키지 또는 무드컷 4-6장."
                    onAdd={addListItem}
                    onRemove={removeListItem}
                    onMove={moveListItem}
                    onUpdate={updateListItem}
                  />
                  <AdminMediaEditor
                    product={product}
                    field="detailImages"
                    title="세로형 상세 이미지"
                    help="권장: 제품 질감, 사용법, 비교, 구성품, 제주 무드 이미지를 아래 상세 영역에 사용."
                    onAdd={addListItem}
                    onRemove={removeListItem}
                    onMove={moveListItem}
                    onUpdate={updateListItem}
                  />
                  <div className="admin-inline-grid admin-inline-grid--textarea">
                    <label>상세 핵심 문구, 한 줄에 하나씩<textarea value={listToText(product.detailHighlights || [])} onChange={(event) => update(product.slug, "detailHighlights", textToList(event.target.value))} /></label>
                    <label>사용 단계, 한 줄에 하나씩<textarea value={listToText(product.detailHowToUse || [])} onChange={(event) => update(product.slug, "detailHowToUse", textToList(event.target.value))} /></label>
                  </div>
                </details>
                {mismatch && <p className="setup-warning">가격 확인 필요: {formatSgd(product.unitPriceSgd)} x {product.packQuantity} = {formatSgd(expected)}인데, 현재 최소 주문 총액은 {formatSgd(product.packPriceSgd)}입니다.</p>}
                <div className="admin-switches">
                  <label><input type="checkbox" checked={product.purchaseEnabled} onChange={(event) => update(product.slug, "purchaseEnabled", event.target.checked)} /> 구매 가능</label>
                  <label><input type="checkbox" checked={product.active} onChange={(event) => update(product.slug, "active", event.target.checked)} /> 사이트 노출</label>
                </div>
              </div>
            </article>
          );
        })}
        {saving && <p>{saving}</p>}
        <button className="button button--primary" type="submit">상품 정보 저장</button>
      </form>
    </>
  );
}
