import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { termsFor } from "../../shared/market-overrides.js";
import type { PriceKind, PriceSlot, PriceVersion } from "../../shared/price-versions.js";
import { type BulkProduct } from "../data/bulkProducts";
import { adminFetch, getAdminToken } from "../lib/bulkApi";
import { formatCurrency, marketCountryName, markets, type MarketCode } from "../lib/market";

/* Phase 2 price management: one new version per change, starting now or at a set time.
   The preview below runs the same shared checkout code the server uses, so what it shows is what will be charged. */
type Row = { id: string; product_id: string; market: string; kind: PriceKind; currency: string; amount: number; version: string; effective_from: string; cancelled_at: string | null; note: string | null; created_at: string };
type Slot = PriceSlot & { productId: string; productName: string; codeAmount: number | null; current: PriceVersion | null; scheduled: Row[] };
type Overview = { slots: Slot[]; history: Row[]; now: string };
type Draft = { amount: string; start: "now" | "later"; at: string; note: string };

const KIND_LABEL: Record<PriceKind, string> = { general: "일반 주문", trial: "10개 체험" };
const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" }) : "");
const money = (amount: number | null | undefined, currency: string) => (amount === null || amount === undefined ? "—" : formatCurrency(amount, currency, "ko-KR"));
const slotKey = (slot: { market: string; kind: string }) => `${slot.market}:${slot.kind}`;
const sampleQuantities = (slot: Slot) => (slot.kind === "trial" ? [10] : slot.sku.startsWith("diffuser") ? [20, 21, 50, 100] : [30, 40, 100]);

function rowState(row: Row, slots: Slot[], now: number) {
  if (row.cancelled_at) return "취소됨";
  if (new Date(row.effective_from).getTime() > now) return "예약";
  const live = slots.find((slot) => slot.productId === row.product_id && slot.market === row.market && slot.kind === row.kind)?.current?.version;
  return live === row.version ? "적용 중" : "지난 가격";
}

export function AdminPricesPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [productId, setProductId] = useState("");
  const [open, setOpen] = useState("");
  const [draft, setDraft] = useState<Draft>({ amount: "", start: "now", at: "", note: "" });
  const [confirmLarge, setConfirmLarge] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = () =>
    Promise.all([adminFetch<Overview>("/api/admin/prices"), adminFetch<{ products: BulkProduct[] }>("/api/admin/catalog")])
      .then(([overview, catalog]) => {
        setData(overview);
        setProducts(catalog.products);
        setProductId((id) => id || overview.slots[0]?.productId || "");
      })
      .catch((error) => setMessage({ kind: "error", text: error.message }));
  useEffect(() => { load(); }, []);

  const productIds = useMemo(() => [...new Set((data?.slots || []).map((slot) => slot.productId))], [data]);
  const slots = (data?.slots || []).filter((slot) => slot.productId === productId);
  const product = products.find((item) => item.id === productId);
  const openSlot = slots.find((slot) => slotKey(slot) === open) || null;
  const now = data ? new Date(data.now).getTime() : Date.now();

  const startEdit = (slot: Slot) => {
    setOpen(slotKey(slot));
    setConfirmLarge("");
    setDraft({ amount: String(slot.current?.amount ?? slot.codeAmount ?? ""), start: "now", at: "", note: "" });
  };

  /* Today vs. after the change, for a few quantities, through the shared checkout rules. */
  const preview = useMemo(() => {
    if (!openSlot || !product || !(Number(draft.amount) > 0)) return [];
    const candidate = { ...product, prices: { ...(product.prices || {}), [openSlot.market]: { ...(product.prices?.[openSlot.market] || {}), [openSlot.kind]: { amount: Number(draft.amount), currency: openSlot.currency, version: "preview", effectiveFrom: new Date().toISOString() } } } };
    return sampleQuantities(openSlot).map((quantity) => {
      const before = termsFor(product, openSlot.market, quantity);
      const after = termsFor(candidate, openSlot.market, quantity);
      const total = (d: typeof before) => (d.status === "direct" && d.totalMinor !== null ? { amount: d.totalMinor / 10 ** d.referenceDigits, label: "결제" } : d.referenceTotalMinor !== null ? { amount: d.referenceTotalMinor / 10 ** d.referenceDigits, label: "견적 참고" } : null);
      return { quantity, before: total(before), after: total(after), currency: after.displayCurrency || openSlot.currency };
    });
  }, [openSlot, product, draft.amount]);

  async function save() {
    if (!openSlot) return;
    setBusy(true);
    setMessage(null);
    const body = {
      productId: openSlot.productId, market: openSlot.market, kind: openSlot.kind, amount: draft.amount, note: draft.note,
      effectiveFrom: draft.start === "later" && draft.at ? new Date(draft.at).toISOString() : undefined,
      confirmLargeChange: confirmLarge === draft.amount,
    };
    const response = await fetch("/api/admin/prices", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAdminToken()}` }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (response.status === 409 && result.code === "LARGE_CHANGE") {
      setConfirmLarge(draft.amount);
      setMessage({ kind: "error", text: result.error });
      return;
    }
    if (!response.ok) return setMessage({ kind: "error", text: result.error || "저장하지 못했습니다." });
    setMessage({ kind: "ok", text: `${marketCountryName(markets[openSlot.market as MarketCode], "ko")} ${KIND_LABEL[openSlot.kind]} 가격을 ${money(Number(draft.amount), openSlot.currency)}(으)로 ${body.effectiveFrom ? `${when(body.effectiveFrom)}부터 적용되도록 예약했습니다` : "바꿨습니다. 1~2분 안에 고객 사이트에 반영됩니다"}.` });
    setOpen("");
    load();
  }

  async function cancel(row: Row) {
    if (!window.confirm(`${when(row.effective_from)}에 적용될 ${money(row.amount, row.currency)} 가격을 취소할까요?`)) return;
    try {
      await adminFetch(`/api/admin/prices/${encodeURIComponent(row.id)}/cancel`, { method: "POST" });
      setMessage({ kind: "ok", text: "예약을 취소했습니다." });
      load();
    } catch (error) {
      setMessage({ kind: "error", text: (error as Error).message });
    }
  }

  const history = (data?.history || []).filter((row) => row.product_id === productId);

  return (
    <section className="admin-catalog admin-prices">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">상품 관리</p>
          <h1>국가별 가격</h1>
          <p className="admin-muted">새 가격은 정한 시각부터 적용됩니다. 이미 받은 주문의 금액은 바뀌지 않습니다. <strong>결제</strong> 표시가 있는 곳은 실제 결제 금액이, <strong>견적</strong> 표시가 있는 곳은 고객에게 보이는 참고가가 바뀝니다.</p>
        </div>
        <Link className="button button--ghost" to="/admin/products">상품 목록으로</Link>
      </div>

      {message && <p className={message.kind === "ok" ? "form-success" : "form-error"} role="status">{message.text}</p>}
      {!data && !message && <p className="admin-muted">불러오는 중…</p>}

      {data && (
        <>
          <div className="admin-prices__tabs" role="tablist" aria-label="상품 선택">
            {productIds.map((id) => (
              <button key={id} type="button" role="tab" aria-selected={id === productId} className={id === productId ? "is-active" : ""} onClick={() => { setProductId(id); setOpen(""); }}>
                {data.slots.find((slot) => slot.productId === id)?.productName}
              </button>
            ))}
          </div>

          <div className="admin-panel">
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--compact">
                <thead><tr><th>국가</th><th>주문</th><th>현재 가격 (1개당)</th><th>예약</th><th /></tr></thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slotKey(slot)} className={slotKey(slot) === open ? "is-open" : ""}>
                      <td>{marketCountryName(markets[slot.market as MarketCode], "ko")} <small>{slot.market}</small></td>
                      <td>{KIND_LABEL[slot.kind]} <span className={`admin-chip ${slot.chargeable ? "admin-chip--published" : ""}`}>{slot.chargeable ? "결제" : "견적"}</span></td>
                      <td>
                        <strong>{money(slot.current?.amount ?? slot.codeAmount, slot.currency)}</strong>
                        <small className="admin-prices__source">{slot.current ? `관리자 변경 · ${when(slot.current.effectiveFrom)}부터` : "기본 가격"}</small>
                      </td>
                      <td>
                        {slot.scheduled.length ? slot.scheduled.map((row) => (
                          <span key={row.id} className="admin-prices__scheduled">{money(row.amount, row.currency)} · {when(row.effective_from)} <button type="button" className="button button--ghost button--small" onClick={() => cancel(row)}>취소</button></span>
                        )) : <small className="admin-muted">없음</small>}
                      </td>
                      <td><button type="button" className="button button--ghost button--small" onClick={() => (slotKey(slot) === open ? setOpen("") : startEdit(slot))}>{slotKey(slot) === open ? "닫기" : "가격 변경"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {openSlot && (
            <form className="admin-panel admin-catalog__confirm admin-prices__editor" onSubmit={(event) => { event.preventDefault(); save(); }}>
              <h2>{marketCountryName(markets[openSlot.market as MarketCode], "ko")} · {KIND_LABEL[openSlot.kind]} 가격 변경</h2>
              <div className="admin-prices__fields">
                <label>새 가격 (1개당, {openSlot.currency})
                  <input inputMode="decimal" required value={draft.amount} onChange={(e) => { setDraft({ ...draft, amount: e.target.value.trim() }); setConfirmLarge(""); }} />
                  <small>지금 {money(openSlot.current?.amount ?? openSlot.codeAmount, openSlot.currency)} · 기본 {money(openSlot.codeAmount, openSlot.currency)}</small>
                </label>
                <fieldset>
                  <legend>적용 시작</legend>
                  <label className="admin-prices__radio"><input type="radio" checked={draft.start === "now"} onChange={() => setDraft({ ...draft, start: "now" })} /> 지금 바로</label>
                  <label className="admin-prices__radio"><input type="radio" checked={draft.start === "later"} onChange={() => setDraft({ ...draft, start: "later" })} /> 날짜·시간 지정</label>
                  {draft.start === "later" && <input type="datetime-local" required value={draft.at} onChange={(e) => setDraft({ ...draft, at: e.target.value })} />}
                </fieldset>
                <label>메모 (선택)<input value={draft.note} maxLength={200} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="예: 2027년 1월 환율 반영" /></label>
              </div>

              {preview.length > 0 && (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-table--compact">
                    <caption>미리보기 · 고객이 내는 총액 ({openSlot.chargeable ? "배송 포함 결제 금액" : "견적 참고 금액"})</caption>
                    <thead><tr><th>수량</th><th>지금</th><th>변경 후</th></tr></thead>
                    <tbody>
                      {preview.map((row) => (
                        <tr key={row.quantity}>
                          <td>{row.quantity}개</td>
                          <td>{row.before ? money(row.before.amount, row.currency) : "—"}</td>
                          <td><strong>{row.after ? money(row.after.amount, row.currency) : "—"}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {confirmLarge === draft.amount && <p className="form-error">가격이 크게 바뀝니다. 금액이 맞으면 아래 버튼을 한 번 더 눌러 주세요.</p>}
              <div className="admin-row-actions">
                <button className="button button--primary" disabled={busy}>{busy ? "저장 중…" : confirmLarge === draft.amount ? "이 금액이 맞습니다 · 저장" : draft.start === "later" ? "예약 저장" : "지금 적용"}</button>
                <button className="button button--ghost" type="button" onClick={() => setOpen("")}>취소</button>
              </div>
            </form>
          )}

          <div className="admin-panel">
            <h2>변경 기록</h2>
            {history.length === 0 ? <p className="admin-muted">아직 바꾼 가격이 없습니다. 지금은 모두 기본 가격으로 판매 중입니다.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-table--compact">
                  <thead><tr><th>적용 시작</th><th>국가 · 주문</th><th>가격</th><th>상태</th><th>메모</th><th>저장 시각</th></tr></thead>
                  <tbody>
                    {history.map((row) => (
                      <tr key={row.id}>
                        <td>{when(row.effective_from)}</td>
                        <td>{marketCountryName(markets[row.market as MarketCode], "ko")} · {KIND_LABEL[row.kind]}</td>
                        <td>{money(Number(row.amount), row.currency)}</td>
                        <td>{rowState(row, data.slots, now)}</td>
                        <td>{row.note || ""}</td>
                        <td>{when(row.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
