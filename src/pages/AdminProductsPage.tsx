import { FormEvent, useEffect, useState } from "react";
import { bulkProducts, formatSgd, type BulkCategory, type BulkProduct } from "../data/bulkProducts";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";

const categoryOptions: BulkCategory[] = ["cleansing", "diffuser"];

type EditableListField = "features" | "usage" | "galleryImages" | "detailImages" | "detailHighlights" | "detailHowToUse";

const fallbackImage = "/images/hondit-collection-hero.webp";
const imagePresets = [
  "/images/hondit-collection-hero.webp",
  "/images/hondit-jeju-dawn-hero-v2.webp",
  "/images/hondit-cleansing-trio.webp",
  "/images/hondit-diffuser-detail.webp",
  "/images/diffuser-350g.webp",
  "/images/diffuser-500g.webp",
  "/images/foam-oil.webp",
  "/images/foaming-cleanser.webp",
  "/images/cleansing-water.webp",
  "/images/jnu-campus.webp",
  "/images/jeju-field-sea.webp",
  "/images/jeju-water-basalt-v2.webp",
  "/images/jeju-field-bijarim.webp",
  "/images/jeju-field-hallasan.webp",
  "/images/jeju-field-seongsan.webp",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function listToText(items: string[] = []) {
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

function createProductDraft(products: BulkProduct[]): BulkProduct {
  const nextOrder = Math.max(0, ...products.map((product) => Number(product.sortOrder) || 0)) + 10;
  const seed = `new-product-${Date.now().toString(36)}`;
  return {
    id: seed,
    slug: seed,
    name: "New hondit product",
    category: "cleansing",
    volumeLabel: "100ml",
    shortDescription: "Short product card description.",
    description: "Write the full product detail description here.",
    imageUrl: fallbackImage,
    unitPriceSgd: 0,
    packQuantity: 1,
    packPriceSgd: 0,
    unitWeightKg: 0,
    inventoryPacks: 0,
    active: false,
    purchaseEnabled: false,
    sortOrder: nextOrder,
    features: ["Feature"],
    usage: ["Usage or order note"],
    galleryImages: [fallbackImage],
    detailImages: [],
    detailHighlights: ["Detail highlight"],
    detailHowToUse: ["How to use step"],
  };
}

function sanitizeProduct(product: BulkProduct): BulkProduct {
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
    features: textToList(listToText(product.features || [])),
    usage: textToList(listToText(product.usage || [])),
    galleryImages: textToList(listToText(product.galleryImages || [])),
    detailImages: textToList(listToText(product.detailImages || [])),
    detailHighlights: textToList(listToText(product.detailHighlights || [])),
    detailHowToUse: textToList(listToText(product.detailHowToUse || [])),
  };
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<BulkProduct[]>(bulkProducts);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  const load = () => {
    adminFetch<{ products: BulkProduct[] }>("/api/admin/products")
      .then((data) => {
        setProducts(data.products);
        setError("");
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const update = (slug: string, key: keyof BulkProduct, value: string | number | boolean | string[]) => {
    setProducts((current) => current.map((product) => (product.slug === slug ? { ...product, [key]: value } : product)));
  };

  const updateListText = (slug: string, field: EditableListField, value: string) => update(slug, field, textToList(value));

  const appendMedia = (slug: string, field: "galleryImages" | "detailImages", image: string) => {
    setProducts((current) =>
      current.map((product) => {
        if (product.slug !== slug) return product;
        const currentList = productList(product, field);
        return { ...product, [field]: currentList.includes(image) ? currentList : [...currentList, image] };
      }),
    );
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
        name: `${product.name} copy`,
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
    setSaving("초안을 화면에서 제거했습니다. 저장하면 목록에 반영됩니다.");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving("상품 정보를 저장하는 중입니다...");
    await adminFetch("/api/admin/products", {
      method: "PATCH",
      body: JSON.stringify({ products: products.map(sanitizeProduct) }),
    });
    setSaving("저장되었습니다.");
    load();
  };

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">상품 관리</p>
        <h1>상품, 이미지, 상세페이지 관리</h1>
        <p>고객 페이지에 표시되는 상품명, 가격, MOQ, 재고, 대표 이미지, 갤러리와 상세 이미지를 이곳에서 수정합니다.</p>
      </div>

      <div className="admin-toolbar">
        <button className="button button--primary" type="button" onClick={addProduct}>
          새 상품 추가
        </button>
        <a className="button button--ghost" href="/products" target="_blank" rel="noreferrer">
          상품 목록 보기
        </a>
        <a className="button button--ghost" href="/bulk-orders" target="_blank" rel="noreferrer">
          대량구매 보기
        </a>
      </div>

      <form className="admin-panel admin-product-list" onSubmit={submit}>
        {products.map((product) => {
          const expected = Number((product.unitPriceSgd * product.packQuantity).toFixed(2));
          const mismatch = expected !== Number(product.packPriceSgd);
          return (
            <article className="admin-product-row" key={product.slug}>
              <img src={product.imageUrl || fallbackImage} alt={product.name} />
              <div>
                <div className="admin-product-row__head">
                  <div>
                    <p className={`admin-product-status ${product.active && product.purchaseEnabled ? "is-live" : ""}`}>
                      {product.active && product.purchaseEnabled ? "사이트 노출 중" : "초안 또는 숨김"}
                    </p>
                    <h2>
                      {product.name} {product.volumeLabel}
                    </h2>
                  </div>
                  <div className="admin-row-actions">
                    <button className="button button--ghost" type="button" onClick={() => duplicateProduct(product)}>
                      복제
                    </button>
                    {!product.active && (
                      <button className="button button--danger" type="button" onClick={() => removeDraft(product.slug)}>
                        초안 제거
                      </button>
                    )}
                  </div>
                </div>

                <div className="admin-inline-grid admin-inline-grid--product-main">
                  <label>
                    상품명
                    <input value={product.name} onChange={(event) => update(product.slug, "name", event.target.value)} />
                  </label>
                  <label>
                    페이지 주소 이름
                    <input value={product.slug} onChange={(event) => update(product.slug, "slug", slugify(event.target.value))} />
                  </label>
                  <label>
                    카테고리
                    <select value={product.category} onChange={(event) => update(product.slug, "category", event.target.value as BulkCategory)}>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    용량 표시
                    <input value={product.volumeLabel} onChange={(event) => update(product.slug, "volumeLabel", event.target.value)} />
                  </label>
                  <label>
                    대표 이미지 URL
                    <input value={product.imageUrl} onChange={(event) => update(product.slug, "imageUrl", event.target.value)} />
                  </label>
                  <label>
                    개당 무게 kg
                    <input type="number" step="0.001" value={product.unitWeightKg} onChange={(event) => update(product.slug, "unitWeightKg", Number(event.target.value))} />
                  </label>
                </div>

                <label>
                  상품 카드 짧은 설명
                  <textarea value={product.shortDescription} onChange={(event) => update(product.slug, "shortDescription", event.target.value)} />
                </label>
                <label>
                  상품 상세 설명
                  <textarea value={product.description} onChange={(event) => update(product.slug, "description", event.target.value)} />
                </label>

                <div className="admin-inline-grid">
                  <label>
                    개당 가격 SGD
                    <input type="number" step="0.01" value={product.unitPriceSgd} onChange={(event) => update(product.slug, "unitPriceSgd", Number(event.target.value))} />
                  </label>
                  <label>
                    MOQ / 최소 주문 수량
                    <input type="number" value={product.packQuantity} onChange={(event) => update(product.slug, "packQuantity", Number(event.target.value))} />
                  </label>
                  <label>
                    MOQ 총액 SGD
                    <input type="number" step="0.01" value={product.packPriceSgd} onChange={(event) => update(product.slug, "packPriceSgd", Number(event.target.value))} />
                  </label>
                  <label>
                    재고 팩 수
                    <input type="number" value={product.inventoryPacks} onChange={(event) => update(product.slug, "inventoryPacks", Number(event.target.value))} />
                  </label>
                  <label>
                    정렬 순서
                    <input type="number" value={product.sortOrder} onChange={(event) => update(product.slug, "sortOrder", Number(event.target.value))} />
                  </label>
                </div>

                <div className="admin-inline-grid admin-inline-grid--textarea">
                  <label>
                    특징 문구, 한 줄에 하나씩
                    <textarea value={listToText(product.features)} onChange={(event) => updateListText(product.slug, "features", event.target.value)} />
                  </label>
                  <label>
                    사용 / 주문 안내, 한 줄에 하나씩
                    <textarea value={listToText(product.usage)} onChange={(event) => updateListText(product.slug, "usage", event.target.value)} />
                  </label>
                </div>

                <details className="admin-product-media" open>
                  <summary>상품 갤러리와 상세 이미지</summary>
                  <p className="admin-muted">위쪽 갤러리는 상품 상세 첫 화면에, 세로형 상세 이미지는 아래 설명 영역에 표시됩니다.</p>

                  <div className="admin-media-presets" aria-label="hondit 이미지 빠르게 추가">
                    {imagePresets.map((image) => (
                      <div className="admin-media-preset" key={image}>
                        <img src={image} alt="" loading="lazy" decoding="async" />
                        <button type="button" onClick={() => update(product.slug, "imageUrl", image)}>
                          대표
                        </button>
                        <button type="button" onClick={() => appendMedia(product.slug, "galleryImages", image)}>
                          갤러리
                        </button>
                        <button type="button" onClick={() => appendMedia(product.slug, "detailImages", image)}>
                          상세
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="admin-inline-grid admin-inline-grid--textarea">
                    <label>
                      상단 상품 갤러리 이미지 URL
                      <textarea value={listToText(product.galleryImages || [])} onChange={(event) => updateListText(product.slug, "galleryImages", event.target.value)} />
                    </label>
                    <label>
                      세로형 상세 이미지 URL
                      <textarea value={listToText(product.detailImages || [])} onChange={(event) => updateListText(product.slug, "detailImages", event.target.value)} />
                    </label>
                    <label>
                      상세 핵심 문구
                      <textarea value={listToText(product.detailHighlights || [])} onChange={(event) => updateListText(product.slug, "detailHighlights", event.target.value)} />
                    </label>
                    <label>
                      사용 단계
                      <textarea value={listToText(product.detailHowToUse || [])} onChange={(event) => updateListText(product.slug, "detailHowToUse", event.target.value)} />
                    </label>
                  </div>
                </details>

                {mismatch && (
                  <p className="setup-warning">
                    가격 확인 필요: {formatSgd(product.unitPriceSgd)} x {product.packQuantity} = {formatSgd(expected)}인데, 현재 MOQ 총액은 {formatSgd(product.packPriceSgd)}입니다.
                  </p>
                )}

                <div className="admin-switches">
                  <label>
                    <input type="checkbox" checked={product.purchaseEnabled} onChange={(event) => update(product.slug, "purchaseEnabled", event.target.checked)} /> 구매 가능
                  </label>
                  <label>
                    <input type="checkbox" checked={product.active} onChange={(event) => update(product.slug, "active", event.target.checked)} /> 사이트 노출
                  </label>
                </div>
              </div>
            </article>
          );
        })}
        {saving && <p>{saving}</p>}
        <button className="button button--primary" type="submit">
          상품 정보 저장
        </button>
      </form>
    </>
  );
}
