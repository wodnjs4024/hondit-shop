import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { termsFor } from "../../shared/market-overrides.js";
import { isDiffuser } from "../../shared/diffuser-quantity.js";
import { cleanProductUsage } from "../../shared/page-sales.js";
import { type BulkProduct } from "../data/bulkProducts";
import { productFacts } from "../data/productFacts";
import { productPhotoRoot, productPhotos } from "../data/productPhotos";
import { v23Products, type MarketMode, type ProductContent, type ProductMedia, type ProductStatus } from "../data/v23SiteData";
import { adminFetch } from "../lib/bulkApi";
import { AiTranslateButton } from "../components/AdminAiTools";
import { formatCurrency, marketCountryName, marketProductText, markets, type DisplayLanguage, type MarketCode } from "../lib/market";
import { composeStorefrontProducts } from "../lib/storefrontApi";

/* ---------- types ---------- */
type AdminProduct = BulkProduct & { hasApprovedTerms: boolean; draftSavedAt?: string | null };
type Lang = "ko" | "en" | "ja" | "zh" | "ms" | "th";
type Snapshot = {
  base: { category: string; volumeLabel: string; sku: string; sortOrder: number; status: ProductStatus; unitWeightKg?: number; packQuantity?: number };
  contents: Partial<Record<Lang, ProductContent>>;
  media: ProductMedia[];
  markets: Partial<Record<MarketCode, MarketMode>>;
};
type Revision = { id: string; state: string; note?: string | null; created_at: string; published_at?: string | null };
type Movement = { delta: number; reason: string; note?: string | null; order_id?: string | null; created_at: string };
type Detail = { product: AdminProduct; draft: { snapshot: Snapshot; created_at: string } | null; revisions: Revision[]; movements: Movement[] };

const LANGS: { key: Lang; label: string; display: DisplayLanguage }[] = [
  { key: "ko", label: "한국어", display: "ko" }, { key: "en", label: "English", display: "en" }, { key: "ja", label: "日本語", display: "ja" },
  { key: "zh", label: "中文(繁體)", display: "zh-HK" }, { key: "ms", label: "Melayu", display: "ms" }, { key: "th", label: "ไทย", display: "th" },
];
const MARKET_CODES: MarketCode[] = ["SG", "HK", "MO", "TW", "JP", "TH", "MY", "BN"];
const STATUS_LABEL: Record<ProductStatus, string> = { draft: "초안 (비공개)", published: "판매중", soldout: "일시품절 (보이지만 구매 불가)", hidden: "숨김" };
const STATUS_SHORT: Record<ProductStatus, string> = { draft: "초안", published: "판매중", soldout: "일시품절", hidden: "숨김" };
const ROLE_LABEL: Record<ProductMedia["role"], string> = { main: "대표 사진", gallery: "갤러리", detail: "상세 이미지" };
const MOVEMENT_LABEL: Record<string, string> = { stock_in: "입고", adjust: "조정", order: "주문 결제", order_reversal: "주문 취소 복원" };

const lines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }) : "");

/* The editor opens with what customers see today: admin text if any, otherwise the built-in copy in every language. */
function snapshotFromProduct(product: AdminProduct): Snapshot {
  const builtIn = v23Products.find((item) => item.apiSlug === product.slug);
  const contents: Snapshot["contents"] = {};
  for (const lang of LANGS) {
    const own = product.contents?.[lang.key];
    if (own && (own.name || own.description)) { contents[lang.key] = own; continue; }
    if (builtIn) {
      contents[lang.key] = {
        name: marketProductText(lang.display, builtIn.name),
        shortDescription: marketProductText(lang.display, builtIn.detail),
        description: marketProductText(lang.display, productFacts(builtIn.slug)?.description || builtIn.description),
        highlights: cleanProductUsage(builtIn.highlights).map((item: string) => marketProductText(lang.display, item)),
        howTo: cleanProductUsage(builtIn.howTo).map((item: string) => marketProductText(lang.display, item)),
      };
    } else if (lang.key === "en") {
      contents.en = { name: product.name, shortDescription: product.shortDescription, description: product.description, highlights: product.features || [], howTo: product.usage || [] };
    }
  }
  let media = product.media?.length ? product.media : [];
  if (!media.length && builtIn) {
    media = [{ url: builtIn.image, role: "main", sortOrder: 1 }, ...(productPhotos[builtIn.slug] || []).map((photo, index) => ({ url: productPhotoRoot + photo.file, role: "gallery" as const, sortOrder: index + 2 }))];
  } else if (!media.length && product.imageUrl) {
    media = [{ url: product.imageUrl, role: "main", sortOrder: 1 }];
  }
  return {
    base: { category: product.category, volumeLabel: product.volumeLabel || "", sku: product.sku || "", sortOrder: product.sortOrder, status: (product.status || "published") as ProductStatus, unitWeightKg: product.unitWeightKg, packQuantity: product.hasApprovedTerms ? undefined : product.packQuantity },
    contents,
    media,
    markets: (product.markets || {}) as Snapshot["markets"],
  };
}

/* Shrink to WebP in the browser (long side 1600px) so uploads stay small and pages stay fast. */
async function toWebp(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url; });
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("변환 실패"))), "image/webp", 0.86));
  } finally { URL.revokeObjectURL(url); }
}

/* ---------- page ---------- */
export function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [dirty, setDirty] = useState(false);
  const [lang, setLang] = useState<Lang>("ko");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const say = (kind: "ok" | "error", text: string) => setMessage({ kind, text });
  const loadList = () => adminFetch<{ products: AdminProduct[] }>("/api/admin/catalog").then((data) => setProducts(data.products)).catch((error) => say("error", error.message));
  const loadDetail = (id: string) => adminFetch<Detail>(`/api/admin/catalog/${encodeURIComponent(id)}`).then((data) => {
    setDetail(data); setSnap(data.draft?.snapshot ? { ...snapshotFromProduct(data.product), ...data.draft.snapshot } : snapshotFromProduct(data.product)); setDirty(false);
  }).catch((error) => say("error", error.message));

  useEffect(() => { loadList(); }, []);
  useEffect(() => { if (selectedId) loadDetail(selectedId); }, [selectedId]);

  const edit = (next: (current: Snapshot) => Snapshot) => { setSnap((current) => (current ? next(current) : current)); setDirty(true); setMessage(null); };
  const product = detail?.product;

  /* What customers would get with the current editor contents: same composition and terms as the live shop. */
  const previewProduct = useMemo(() => {
    if (!product || !snap) return null;
    return composeStorefrontProducts([{ ...product, status: "published", active: true, contents: snap.contents, media: snap.media, markets: snap.markets, packQuantity: snap.base.packQuantity ?? product.packQuantity }])[0] || null;
  }, [product, snap]);

  async function run(label: string, task: () => Promise<void>) {
    setBusy(label); setMessage(null);
    try { await task(); } catch (error) { say("error", error instanceof Error ? error.message : "실패했습니다."); } finally { setBusy(""); }
  }
  const saveDraft = () => run("save", async () => {
    await adminFetch(`/api/admin/catalog/${encodeURIComponent(selectedId)}/draft`, { method: "PUT", body: JSON.stringify({ snapshot: snap }) });
    setDirty(false); await loadDetail(selectedId); await loadList(); say("ok", "임시저장했습니다. 고객 사이트에는 아직 반영되지 않았습니다.");
  });
  const openPreview = () => run("preview", async () => {
    if (dirty) await adminFetch(`/api/admin/catalog/${encodeURIComponent(selectedId)}/draft`, { method: "PUT", body: JSON.stringify({ snapshot: snap }) });
    setDirty(false); await loadList();
    window.open(`/products/${encodeURIComponent(product!.slug)}?preview=1&market=SG&lang=ko`, "_blank", "noopener");
  });
  const publish = () => run("publish", async () => {
    await adminFetch(`/api/admin/catalog/${encodeURIComponent(selectedId)}/publish`, { method: "POST", body: JSON.stringify({ snapshot: snap }) });
    setConfirmPublish(false); setDirty(false); await loadDetail(selectedId); await loadList();
    say("ok", "게시했습니다. 고객 사이트에 1분 안에 반영됩니다.");
  });
  const discard = () => run("discard", async () => {
    await adminFetch(`/api/admin/catalog/${encodeURIComponent(selectedId)}/draft`, { method: "DELETE" });
    await loadDetail(selectedId); await loadList(); say("ok", "임시저장 내용을 지우고 게시된 상태로 되돌렸습니다.");
  });
  const revert = (revisionId: string) => run("revert", async () => {
    await adminFetch(`/api/admin/catalog/${encodeURIComponent(selectedId)}/revert`, { method: "POST", body: JSON.stringify({ revisionId }) });
    await loadDetail(selectedId); say("ok", "이전 버전을 임시저장으로 불러왔습니다. 확인 후 게시하세요.");
  });

  /* ---------- photo upload ---------- */
  const fileInput = useRef<HTMLInputElement>(null);
  async function upload(files: FileList | File[]) {
    await run("upload", async () => {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const webp = await toWebp(file);
        const target = await adminFetch<{ uploadUrl: string; publicUrl: string; storagePath: string }>("/api/admin/catalog/upload-url", { method: "POST", body: JSON.stringify({ productId: product!.slug, contentType: "image/webp" }) });
        const put = await fetch(target.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/webp", "x-upsert": "false" }, body: webp });
        if (!put.ok) throw new Error("사진을 올리지 못했습니다. 잠시 후 다시 시도해 주세요.");
        edit((current) => ({ ...current, media: [...current.media, { url: target.publicUrl, storagePath: target.storagePath, role: current.media.some((m) => m.role === "main") ? "gallery" : "main", sortOrder: current.media.length + 1 }] }));
      }
      say("ok", "사진을 올렸습니다. 임시저장 또는 게시해야 반영됩니다.");
    });
  }
  const onDrop = (event: DragEvent) => { event.preventDefault(); if (event.dataTransfer.files.length) upload(event.dataTransfer.files); };
  const moveMedia = (index: number, step: number) => edit((current) => { const media = [...current.media]; const [item] = media.splice(index, 1); media.splice(index + step, 0, item); return { ...current, media }; });

  /* ---------- create ---------- */
  const [draftNew, setDraftNew] = useState({ name: "", slug: "", category: "diffuser", volumeLabel: "" });
  const create = (event: FormEvent) => { event.preventDefault(); run("create", async () => {
    const data = await adminFetch<{ product: { id: string } }>("/api/admin/catalog", { method: "POST", body: JSON.stringify({ ...draftNew, slug: draftNew.slug || slugify(draftNew.name) }) });
    setCreating(false); setDraftNew({ name: "", slug: "", category: "diffuser", volumeLabel: "" }); await loadList(); setSelectedId(data.product.id);
    say("ok", "새 상품을 초안으로 만들었습니다. 사진과 문구를 채운 뒤 게시하세요.");
  }); };

  /* ---------- stock ---------- */
  const [stockForm, setStockForm] = useState({ amount: "", kind: "stock_in", note: "" });
  const saveStock = (event: FormEvent) => { event.preventDefault(); run("stock", async () => {
    const amount = Number(stockForm.amount);
    const delta = stockForm.kind === "stock_in" ? Math.abs(amount) : amount;
    await adminFetch(`/api/admin/catalog/${encodeURIComponent(selectedId)}/stock`, { method: "POST", body: JSON.stringify({ delta, reason: stockForm.kind, note: stockForm.note }) });
    setStockForm({ amount: "", kind: "stock_in", note: "" }); await loadDetail(selectedId); await loadList(); say("ok", "재고를 바꿨습니다. 바로 반영됩니다.");
  }); };

  const missingLangs = snap ? LANGS.filter((l) => !snap.contents[l.key]?.name || !snap.contents[l.key]?.description).map((l) => l.label) : [];
  const content = snap?.contents[lang] || {};
  const setContent = (patch: Partial<ProductContent>) => edit((current) => ({ ...current, contents: { ...current.contents, [lang]: { ...current.contents[lang], ...patch } } }));

  return (
    <section className="admin-catalog">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">상품 관리</p>
          <h1>상품</h1>
          <p className="admin-muted">문구·사진·국가별 판매·재고를 여기서 바꿉니다. 임시저장 → 미리보기 → 게시 순서로 진행하면 고객 사이트에 반영됩니다.</p>
        </div>
        <div className="admin-row-actions">
          <Link className="button button--ghost" to="/admin/products/prices">국가별 가격</Link>
          <button className="button button--primary" type="button" onClick={() => setCreating((v) => !v)}>새 상품 등록</button>
        </div>
      </div>

      {message && <p className={message.kind === "ok" ? "form-success" : "form-error"} role="status">{message.text}</p>}

      {creating && (
        <form className="admin-panel admin-catalog__create" onSubmit={create}>
          <h2>새 상품</h2>
          <label>상품명 (영어)<input required value={draftNew.name} onChange={(e) => setDraftNew({ ...draftNew, name: e.target.value, slug: draftNew.slug || "" })} placeholder="예: Volcanic Stone Candle" /></label>
          <label>주소 이름 (영문)<input value={draftNew.slug || slugify(draftNew.name)} onChange={(e) => setDraftNew({ ...draftNew, slug: slugify(e.target.value) })} placeholder="volcanic-stone-candle" /><small>고객 주소가 /products/{draftNew.slug || slugify(draftNew.name) || "…"} 가 됩니다. 나중에 바꿀 수 없습니다.</small></label>
          <label>종류<select value={draftNew.category} onChange={(e) => setDraftNew({ ...draftNew, category: e.target.value })}><option value="diffuser">향 · 디퓨저</option><option value="cleansing">케어 · 클렌징</option></select></label>
          <label>용량 표기<input value={draftNew.volumeLabel} onChange={(e) => setDraftNew({ ...draftNew, volumeLabel: e.target.value })} placeholder="예: 300g" /></label>
          <p className="admin-muted">새 상품은 우선 <strong>견적 문의 상품</strong>으로 판매됩니다(가격 미표시). 기존 5개 상품의 가격은 <Link to="/admin/products/prices">국가별 가격</Link>에서 바꿉니다.</p>
          <div className="admin-row-actions"><button className="button button--primary" disabled={busy === "create"}>초안 만들기</button><button className="button button--ghost" type="button" onClick={() => setCreating(false)}>취소</button></div>
        </form>
      )}

      <div className="admin-catalog__layout">
        <ul className="admin-catalog__list" aria-label="상품 목록">
          {products.map((item) => (
            <li key={item.id}>
              <button type="button" className={item.id === selectedId ? "is-active" : ""} onClick={() => { if (dirty && !window.confirm("저장하지 않은 변경이 있습니다. 이동할까요?")) return; setSelectedId(item.id); }}>
                <img src={item.media?.find((m) => m.role === "main")?.url || item.imageUrl} alt="" width={56} height={56} />
                <span><strong>{item.contents?.ko?.name || marketProductText("ko", v23Products.find((p) => p.apiSlug === item.slug)?.name || item.name)}</strong><small>{item.volumeLabel} · 재고 {item.stockUnits ?? "관리 안 함"}</small></span>
                <em className={`admin-chip admin-chip--${item.status || "published"}`}>{STATUS_SHORT[(item.status || "published") as ProductStatus]}</em>
                {item.draftSavedAt && <em className="admin-chip admin-chip--draftsaved">임시저장 있음</em>}
              </button>
            </li>
          ))}
        </ul>

        {!snap || !product ? <p className="admin-panel admin-muted">왼쪽에서 상품을 고르세요.</p> : (
          <div className="admin-catalog__editor">
            <div className="admin-catalog__bar">
              <div><strong>{snap.contents.ko?.name || snap.contents.en?.name || product.name}</strong><small>{product.hasApprovedTerms ? "결제 조건 승인됨 · 바로 결제 가능" : "견적 문의 전용 상품"}{detail?.draft ? ` · 임시저장 ${when(detail.draft.created_at)}` : ""}{dirty ? " · 저장 안 한 변경 있음" : ""}</small></div>
              <div className="admin-row-actions">
                <button className="button button--ghost" type="button" disabled={!!busy} onClick={saveDraft}>임시저장</button>
                <button className="button button--ghost" type="button" disabled={!!busy} onClick={openPreview}>미리보기</button>
                <button className="button button--primary" type="button" disabled={!!busy} onClick={() => setConfirmPublish(true)}>게시하기</button>
                {detail?.draft && <button className="button button--ghost" type="button" disabled={!!busy} onClick={discard}>임시저장 지우기</button>}
              </div>
            </div>

            {confirmPublish && (
              <div className="admin-panel admin-catalog__confirm" role="alertdialog" aria-label="게시 확인">
                <strong>게시하면 고객 사이트에 바로 반영됩니다.</strong>
                <ul>
                  <li>상태: {STATUS_LABEL[snap.base.status]}</li>
                  <li>사진 {snap.media.length}장 (대표 {snap.media.filter((m) => m.role === "main").length}장)</li>
                  <li>문구가 비어 있는 언어: {missingLangs.length ? missingLangs.join(", ") + " (영어 문구로 표시됨)" : "없음"}</li>
                  <li>국가별 설정: {Object.keys(snap.markets).length ? Object.entries(snap.markets).map(([m, mode]) => `${m} ${mode === "hidden" ? "숨김" : mode === "quote" ? "견적" : "바로 결제"}`).join(", ") : "모두 기본 규칙"}</li>
                  <li>가격·결제 조건은 바뀌지 않습니다.</li>
                </ul>
                <div className="admin-row-actions"><button className="button button--primary" type="button" disabled={!!busy} onClick={publish}>게시</button><button className="button button--ghost" type="button" onClick={() => setConfirmPublish(false)}>취소</button></div>
              </div>
            )}

            <section className="admin-panel" aria-labelledby="sec-basic">
              <h2 id="sec-basic">1. 기본 정보</h2>
              <div className="admin-inline-grid">
                <label>판매 상태<select value={snap.base.status} onChange={(e) => edit((c) => ({ ...c, base: { ...c.base, status: e.target.value as ProductStatus } }))}>{(Object.keys(STATUS_LABEL) as ProductStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></label>
                <label>종류<select value={snap.base.category} onChange={(e) => edit((c) => ({ ...c, base: { ...c.base, category: e.target.value } }))} disabled={product.hasApprovedTerms}><option value="diffuser">향 · 디퓨저</option><option value="cleansing">케어 · 클렌징</option></select></label>
                <label>용량 표기<input value={snap.base.volumeLabel} onChange={(e) => edit((c) => ({ ...c, base: { ...c.base, volumeLabel: e.target.value } }))} /></label>
                <label>상품 코드(SKU)<input value={snap.base.sku} onChange={(e) => edit((c) => ({ ...c, base: { ...c.base, sku: e.target.value.toUpperCase() } }))} /></label>
                <label>목록 순서 (작을수록 앞)<input type="number" value={snap.base.sortOrder} onChange={(e) => edit((c) => ({ ...c, base: { ...c.base, sortOrder: Number(e.target.value) } }))} /></label>
                {product.hasApprovedTerms
                  ? <label>최소 주문 수량(MOQ)<input value={`${product.packQuantity}개 (승인된 결제 조건)`} readOnly /></label>
                  : <label>최소 주문 수량(MOQ)<input type="number" min={1} value={snap.base.packQuantity ?? product.packQuantity} onChange={(e) => edit((c) => ({ ...c, base: { ...c.base, packQuantity: Math.max(1, Number(e.target.value)) } }))} /></label>}
              </div>
            </section>

            <section className="admin-panel" aria-labelledby="sec-photos" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
              <h2 id="sec-photos">2. 사진</h2>
              <div className="admin-catalog__drop">
                <p>사진을 여기로 끌어다 놓거나 <button type="button" className="button button--ghost" onClick={() => fileInput.current?.click()} disabled={busy === "upload"}>사진 고르기</button></p>
                <small>자동으로 WebP(긴 변 1600px)로 줄여 올립니다. 대표 사진 1장 + 갤러리 여러 장을 권장합니다.</small>
                <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
              </div>
              <ol className="admin-catalog__media">
                {snap.media.map((item, index) => (
                  <li key={item.url + index}>
                    <img src={item.url} alt="" width={96} height={96} />
                    <select value={item.role} onChange={(e) => edit((c) => ({ ...c, media: c.media.map((m, i) => (i === index ? { ...m, role: e.target.value as ProductMedia["role"] } : e.target.value === "main" && m.role === "main" ? { ...m, role: "gallery" } : m)) }))}>
                      {(Object.keys(ROLE_LABEL) as ProductMedia["role"][]).map((role) => <option key={role} value={role}>{ROLE_LABEL[role]}</option>)}
                    </select>
                    <input aria-label="사진 설명(한국어)" placeholder="사진 설명 (화면 낭독용)" value={item.alt?.ko || ""} onChange={(e) => edit((c) => ({ ...c, media: c.media.map((m, i) => (i === index ? { ...m, alt: { ...m.alt, ko: e.target.value } } : m)) }))} />
                    <span className="admin-row-actions">
                      <button type="button" onClick={() => moveMedia(index, -1)} disabled={index === 0}>위로</button>
                      <button type="button" onClick={() => moveMedia(index, 1)} disabled={index === snap.media.length - 1}>아래로</button>
                      <button type="button" className="is-danger" onClick={() => edit((c) => ({ ...c, media: c.media.filter((_, i) => i !== index) }))}>빼기</button>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="admin-panel" aria-labelledby="sec-text">
              <h2 id="sec-text">3. 언어별 문구</h2>
              <div className="admin-catalog__tabs" role="tablist">
                {LANGS.map((l) => (
                  <button key={l.key} type="button" role="tab" aria-selected={lang === l.key} className={lang === l.key ? "is-active" : ""} onClick={() => setLang(l.key)}>
                    {l.label}{!(snap.contents[l.key]?.name && snap.contents[l.key]?.description) && <em title="비어 있음">●</em>}
                  </button>
                ))}
              </div>
              {missingLangs.length > 0 && <p className="admin-muted">● 표시 언어는 문구가 비어 있어 고객에게 영어로 보입니다.</p>}
              <AiTranslateButton
                source={snap.contents.ko as Parameters<typeof AiTranslateButton>[0]["source"]}
                onResult={(translations) => edit((current) => {
                  const next = { ...current.contents };
                  for (const [key, value] of Object.entries(translations)) if (value.name || value.description) next[key as Lang] = value;
                  return { ...current, contents: next };
                })}
              />
              <label>상품명<input value={content.name || ""} onChange={(e) => setContent({ name: e.target.value })} /></label>
              <label>짧은 설명 (목록 카드)<input value={content.shortDescription || ""} onChange={(e) => setContent({ shortDescription: e.target.value })} /></label>
              <label>상세 설명<textarea rows={4} value={content.description || ""} onChange={(e) => setContent({ description: e.target.value })} /></label>
              <label>특징 (한 줄에 하나)<textarea rows={4} value={(content.highlights || []).join("\n")} onChange={(e) => setContent({ highlights: lines(e.target.value) })} /></label>
              <label>사용 방법 (한 줄에 하나)<textarea rows={4} value={(content.howTo || []).join("\n")} onChange={(e) => setContent({ howTo: lines(e.target.value) })} /></label>
            </section>

            <section className="admin-panel" aria-labelledby="sec-markets">
              <h2 id="sec-markets">4. 국가별 판매</h2>
              <p className="admin-muted">"기본"은 지금 사이트 규칙 그대로입니다. "바로 결제"는 승인된 가격·결제 조건이 있는 국가에서만 동작하고, 없는 국가는 견적 문의로 처리됩니다.</p>
              <div className="admin-table-wrap">
                <table className="admin-table admin-table--compact">
                  <thead><tr><th>국가</th><th>설정</th><th>고객에게 보이는 결과</th></tr></thead>
                  <tbody>
                    {MARKET_CODES.map((code) => {
                      const market = markets[code];
                      const qty = String(previewProduct?.bulkMoq ?? 1);
                      const result = previewProduct ? termsFor(previewProduct, code, qty) : null;
                      const outcome = !result ? "" : result.status === "direct" ? `바로 결제 · ${qty}개 ${formatCurrency((result.totalMinor ?? 0) / 10 ** result.referenceDigits, result.billingCurrency || market.currency, market.locale)}` : result.status === "request" ? "견적 문의" : "판매 안 함";
                      return (
                        <tr key={code}>
                          <td>{marketCountryName(market, "ko")} <small>{code}</small></td>
                          <td><select value={snap.markets[code] || ""} onChange={(e) => edit((c) => { const next = { ...c.markets }; if (e.target.value) next[code] = e.target.value as MarketMode; else delete next[code]; return { ...c, markets: next }; })}>
                            <option value="">기본</option><option value="hidden">숨김</option><option value="quote">견적 문의</option><option value="direct">바로 결제</option>
                          </select></td>
                          <td>{outcome}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-panel" aria-labelledby="sec-prices">
              <h2 id="sec-prices">5. 가격 · 결제 조건 (보기 전용)</h2>
              <p className="admin-muted">실제 결제에 쓰이는 값입니다. 가격 수정 기능은 2차 업데이트에서 추가되며, 그 전까지는 바뀌지 않습니다.</p>
              <div className="admin-table-wrap">
                <table className="admin-table admin-table--compact">
                  <thead><tr><th>국가</th><th>10개 체험 개당</th><th>최소 수량 개당</th><th>배송비</th><th>결제</th></tr></thead>
                  <tbody>
                    {previewProduct && MARKET_CODES.map((code) => {
                      const market = markets[code];
                      const fmt = (minor: number | null | undefined, digits: number, currency?: string | null) => (minor === null || minor === undefined || !currency ? "—" : formatCurrency(minor / 10 ** digits, currency, market.locale));
                      const trial = termsFor(previewProduct, code, "10");
                      const general = termsFor(previewProduct, code, String(previewProduct.bulkMoq));
                      return (
                        <tr key={code}>
                          <td>{marketCountryName(market, "ko")}</td>
                          <td>{!isDiffuser(previewProduct) || trial.status === "unavailable" ? "—" : fmt(trial.referenceUnitMinor, trial.referenceDigits, trial.displayCurrency)}</td>
                          <td>{general.status === "unavailable" ? "—" : `${fmt(general.referenceUnitMinor, general.referenceDigits, general.displayCurrency)} (${previewProduct.bulkMoq}개~)`}</td>
                          <td>{general.status === "direct" ? (general.shippingIncluded ? "포함" : fmt(general.shippingMinor, general.referenceDigits, general.billingCurrency)) : "결제 전 확인"}</td>
                          <td>{general.status === "direct" ? "바로 결제" : general.status === "request" ? "견적 문의" : "판매 안 함"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-panel" aria-labelledby="sec-stock">
              <h2 id="sec-stock">6. 재고</h2>
              <p><strong>현재 재고: {product.stockUnits ?? "관리 안 함 (수량 제한 없음)"}{typeof product.stockUnits === "number" ? "개" : ""}</strong> <small className="admin-muted">결제가 완료되면 자동으로 줄어듭니다. 재고 변경은 게시와 관계없이 바로 반영됩니다.</small></p>
              <form className="admin-inline-grid" onSubmit={saveStock}>
                <label>종류<select value={stockForm.kind} onChange={(e) => setStockForm({ ...stockForm, kind: e.target.value })}><option value="stock_in">입고 (+)</option><option value="adjust">조정 (+/−)</option></select></label>
                <label>수량<input required type="number" value={stockForm.amount} onChange={(e) => setStockForm({ ...stockForm, amount: e.target.value })} placeholder={stockForm.kind === "stock_in" ? "예: 50" : "예: -3"} /></label>
                <label>메모<input value={stockForm.note} onChange={(e) => setStockForm({ ...stockForm, note: e.target.value })} placeholder="예: 10월 입고, 파손 2개" /></label>
                <div className="admin-row-actions"><button className="button button--primary" disabled={busy === "stock"}>재고 반영</button></div>
              </form>
              {!!detail?.movements.length && (
                <ul className="admin-catalog__history">
                  {detail.movements.map((m, i) => <li key={i}><span>{when(m.created_at)}</span><strong>{m.delta > 0 ? `+${m.delta}` : m.delta}</strong><span>{MOVEMENT_LABEL[m.reason] || m.reason}{m.note ? ` · ${m.note}` : ""}</span></li>)}
                </ul>
              )}
            </section>

            <section className="admin-panel" aria-labelledby="sec-history">
              <h2 id="sec-history">7. 이전 버전</h2>
              {detail?.revisions.length ? (
                <ul className="admin-catalog__history">
                  {detail.revisions.map((r) => <li key={r.id}><span>{when(r.published_at || r.created_at)}</span><strong>{r.state === "published" ? "현재 게시본" : "이전 게시본"}</strong><span>{r.note || ""}</span>{r.state !== "published" && <button type="button" className="button button--ghost" onClick={() => revert(r.id)}>이 버전 불러오기</button>}</li>)}
                </ul>
              ) : <p className="admin-muted">아직 게시 기록이 없습니다. 처음 게시하면 여기에 버전이 남습니다.</p>}
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
