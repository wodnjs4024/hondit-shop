import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "../lib/analytics";
import { useMarket, type DisplayLanguage } from "../lib/market";

/* Shop chat assistant (GPT, server side). Shown only when the server has a key. Messages live in this tab only. */

type Message = { role: "user" | "assistant"; content: string };
type Copy = { open: string; title: string; hello: string; placeholder: string; send: string; chips: string[]; note: string; error: string; close: string };

const copy: Record<string, Copy> = {
  en: { open: "Ask HONDIT", title: "HONDIT assistant", hello: "Hi! Ask me about prices, minimum quantities, delivery or how to order.", placeholder: "Type your question…", send: "Send", chips: ["How much for 20 diffusers?", "Is shipping included?", "Can I order a small trial?"], note: "AI answers from our current price list. The team confirms anything not listed.", error: "Sorry, I couldn't answer just now. Please try again or use the contact form.", close: "Close" },
  ko: { open: "HONDIT에 질문", title: "HONDIT 상담", hello: "안녕하세요! 가격, 최소 수량, 배송, 주문 방법을 물어보세요.", placeholder: "질문을 입력하세요…", send: "보내기", chips: ["디퓨저 20개는 얼마예요?", "배송비 포함인가요?", "소량 체험 주문 되나요?"], note: "AI가 현재 가격표를 기준으로 답합니다. 표에 없는 내용은 담당자가 확인해 드립니다.", error: "지금은 답변하지 못했습니다. 다시 시도하거나 문의하기를 이용해 주세요.", close: "닫기" },
  ja: { open: "HONDITに質問", title: "HONDIT アシスタント", hello: "こんにちは。価格、最小数量、配送、ご注文方法についてお気軽にどうぞ。", placeholder: "ご質問を入力…", send: "送信", chips: ["ディフューザー20個はいくら？", "送料は含まれますか？", "少量のお試し注文はできますか？"], note: "AIが現在の価格表をもとに回答します。記載のない内容は担当者が確認します。", error: "申し訳ありません、ただいま回答できません。もう一度お試しいただくか、お問い合わせフォームをご利用ください。", close: "閉じる" },
  zh: { open: "詢問 HONDIT", title: "HONDIT 助理", hello: "您好！歡迎詢問價格、最低數量、運送或訂購方式。", placeholder: "輸入您的問題…", send: "送出", chips: ["20 個擴香石多少錢？", "運費包含在內嗎？", "可以小量試訂嗎？"], note: "AI 根據目前價目表回答。未列出的內容由團隊確認。", error: "抱歉，暫時無法回答。請再試一次或使用聯絡表單。", close: "關閉" },
  ms: { open: "Tanya HONDIT", title: "Pembantu HONDIT", hello: "Hai! Tanya tentang harga, kuantiti minimum, penghantaran atau cara membuat pesanan.", placeholder: "Taip soalan anda…", send: "Hantar", chips: ["Berapa harga 20 diffuser?", "Adakah penghantaran termasuk?", "Boleh pesan percubaan kecil?"], note: "AI menjawab berdasarkan senarai harga semasa. Pasukan kami mengesahkan perkara lain.", error: "Maaf, tidak dapat menjawab sekarang. Cuba lagi atau gunakan borang hubungan.", close: "Tutup" },
  th: { open: "ถาม HONDIT", title: "ผู้ช่วย HONDIT", hello: "สวัสดีค่ะ สอบถามราคา จำนวนขั้นต่ำ การจัดส่ง หรือวิธีสั่งซื้อได้เลย", placeholder: "พิมพ์คำถาม…", send: "ส่ง", chips: ["ดิฟฟิวเซอร์ 20 ชิ้นราคาเท่าไร?", "รวมค่าส่งไหม?", "สั่งทดลองจำนวนน้อยได้ไหม?"], note: "AI ตอบจากรายการราคาปัจจุบัน เรื่องอื่นทีมงานจะยืนยันให้", error: "ขออภัย ตอนนี้ตอบไม่ได้ ลองอีกครั้งหรือใช้แบบฟอร์มติดต่อ", close: "ปิด" },
};
const copyFor = (language: DisplayLanguage) => copy[language.startsWith("zh") ? "zh" : language] || copy.en;

/* Renders [label](/path) as in-site links; everything else stays plain text. */
function Rich({ text }: { text: string }) {
  const parts: (string | { label: string; href: string })[] = [];
  const pattern = /\[([^\]]{1,80})\]\((\/[^\s)]{0,200})\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    parts.push(text.slice(last, match.index));
    parts.push({ label: match[1], href: match[2] });
    last = (match.index ?? 0) + match[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts.map((part, i) => (typeof part === "string" ? <span key={i}>{part.replace(/\*\*/g, "")}</span> : <Link key={i} to={part.href}>{part.label}</Link>))}</>;
}

let availability: Promise<boolean> | null = null;

export function ShopAssistant() {
  const { market, language } = useMarket();
  const t = copyFor(language);
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    availability ??= fetch("/api/contact?assistant=1").then((r) => (r.ok ? r.json() : null)).then((d) => Boolean(d?.available)).catch(() => false);
    availability.then(setAvailable);
  }, []);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!available) return null;

  const ask = async (question: string) => {
    const text = question.trim().slice(0, 600);
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setFailed(false);
    trackEvent("assistant_message", { market: market.code, message_count: next.length });
    try {
      const response = await fetch("/api/contact?assistant=1", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next.slice(-8), language, market: market.code }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.reply) throw new Error("assistant");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => { event.preventDefault(); void ask(input); };

  return (
    <div className={`shop-assistant${open ? " is-open" : ""}`}>
      {open && (
        <section className="shop-assistant__panel" role="dialog" aria-label={t.title}>
          <header>
            <strong>{t.title}</strong>
            <button type="button" className="shop-assistant__close" onClick={() => setOpen(false)} aria-label={t.close}>×</button>
          </header>
          <div className="shop-assistant__list" ref={listRef} aria-live="polite">
            <p className="shop-assistant__msg is-assistant">{t.hello}</p>
            {messages.map((m, i) => <p key={i} className={`shop-assistant__msg is-${m.role}`}>{m.role === "assistant" ? <Rich text={m.content} /> : m.content}</p>)}
            {busy && <p className="shop-assistant__msg is-assistant is-typing" aria-label="…"><span /><span /><span /></p>}
            {failed && <p className="shop-assistant__msg is-error">{t.error} <Link to="/contact">/contact</Link></p>}
            {messages.length === 0 && (
              <div className="shop-assistant__chips">
                {t.chips.map((chip) => <button key={chip} type="button" onClick={() => void ask(chip)}>{chip}</button>)}
              </div>
            )}
          </div>
          <form onSubmit={submit}>
            <input ref={inputRef} value={input} maxLength={600} onChange={(e) => setInput(e.target.value)} placeholder={t.placeholder} aria-label={t.placeholder} />
            <button type="submit" disabled={busy || !input.trim()}>{t.send}</button>
          </form>
          <small className="shop-assistant__note">{t.note}</small>
        </section>
      )}
      <button type="button" className="shop-assistant__launcher" aria-expanded={open} onClick={() => { setOpen((v) => !v); if (!open) trackEvent("assistant_open", { market: market.code }); }}>
        {open ? t.close : t.open}
      </button>
    </div>
  );
}
