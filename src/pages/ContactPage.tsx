import { FormEvent, useState } from "react";
import { V23Page } from "../components/v23/SiteChrome";
import { EMAIL, INSTAGRAM, SHOPEE } from "../data/v23SiteData";
import { trackEvent } from "../lib/analytics";
import { marketCountryName, marketText, useMarket } from "../lib/market";

const inquiryTypes = ["General", "Product question", "Order support", "Bulk order", "Partnership"];

export function ContactPage() {
  const { market, language } = useMarket();
  const countryName = marketCountryName(market, language);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") || "")) return;
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          company: form.get("company"),
          orderNumber: form.get("orderNumber"),
          inquiryType: form.get("inquiryType"),
          message: form.get("message"),
          market: market.code,
          countryCode: market.countryCode,
          currency: market.currency,
          language,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Message could not be saved.");
      setStatus("success");
      setMessage(
        data.referenceNumber
          ? marketText(language, `Your message has been saved. Reference: ${data.referenceNumber}`, `문의가 저장되었습니다. 접수번호: ${data.referenceNumber}`)
          : marketText(language, "Your message has been saved. hondit will reply by email.", "문의가 저장되었습니다. hondit이 이메일로 답변드립니다."),
      );
      trackEvent("submit_inquiry", {
        lead_source: "contact_form",
        inquiry_type: String(form.get("inquiryType") || "General"),
        reference_number: data.referenceNumber || "",
      });
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : marketText(language, "Message could not be sent. Please try again or email hondit.", "문의 전송에 실패했습니다. 다시 시도하거나 이메일로 문의해주세요."));
    }
  }

  return (
    <V23Page>
      <main className="v23-contact-page">
        <section className="v23-contact-hero">
          <div>
            <p className="v23-eyebrow"><span /> {marketText(language, "CONTACT HONDIT", "HONDIT 문의")}</p>
            <h1>{marketText(language, "A real inbox,\nwith a clear route for every question.", "운영팀으로 바로 닿는\n명확한 문의 경로.")}</h1>
            <p>
              {market.hasShopee
                ? marketText(language, `Send a message directly to the hondit admin inbox for ${countryName} bulk orders, or use Shopee Chat for an existing Shopee order.`, `${countryName} 대량주문 문의는 hondit 관리자 문의함에 바로 저장됩니다. 이미 진행 중인 Shopee 주문은 Shopee Chat을 이용해주세요.`)
                : marketText(language, `${countryName} orders are handled by hondit bulk checkout only. Every question sent here is saved to the protected admin inbox.`, `${countryName} 주문은 hondit 대량주문으로만 운영됩니다. 이곳의 모든 문의는 관리자 문의함에 저장됩니다.`)}
            </p>
          </div>
          <img src="/images/jeju-field-university.webp" alt="Jeju National University Ara Campus." />
        </section>

        <section className="v23-contact-grid">
          <form onSubmit={submit}>
            <p className="v23-eyebrow"><span /> {marketText(language, "SEND A MESSAGE", "문의 보내기")}</p>
            <h2>{marketText(language, "Tell us what you need.", "필요한 내용을 알려주세요.")}</h2>
            <p>{marketText(language, `This form is saved to hondit's protected admin inbox with the ${countryName} market tag.`, `이 문의는 ${countryName} 판매 태그와 함께 hondit 관리자 문의함에 저장됩니다.`)}</p>
            <div className="v23-form-two">
              <label>{marketText(language, "Name", "이름")} *<input name="name" required placeholder={marketText(language, "Your name", "이름")} /></label>
              <label>Email *<input name="email" type="email" required placeholder="you@example.com" /></label>
            </div>
            <div className="v23-form-two">
              <label>{marketText(language, "Company", "회사명")}<input name="company" placeholder={marketText(language, "Optional", "선택")} /></label>
              <label>{marketText(language, "Order number", "주문번호")}<input name="orderNumber" placeholder="HON reference" /></label>
            </div>
            <label>{marketText(language, "Enquiry type", "문의 유형")} *
              <select name="inquiryType" required>{inquiryTypes.map((type) => <option key={type}>{type}</option>)}</select>
            </label>
            <label>{marketText(language, "Message", "문의 내용")} *<textarea name="message" required placeholder={marketText(language, "Include the product, order reference or question so we can help quickly.", "상품명, 주문번호, 질문 내용을 함께 적어주시면 더 빠르게 확인할 수 있습니다.")} /></label>
            <input className="v23-honeypot" name="website" tabIndex={-1} autoComplete="off" />
            <button type="submit" disabled={status === "sending"}>{status === "sending" ? marketText(language, "Sending...", "전송 중...") : marketText(language, "Send to hondit", "hondit에 보내기")}</button>
            {message && <p className={`v23-form-status is-${status}`}>{message}</p>}
          </form>

          <aside>
            <p className="v23-eyebrow is-light"><span /> {marketText(language, "QUICK ROUTES", "빠른 경로")}</p>
            <h2>{marketText(language, "Use the right channel.", "상황에 맞는 채널을 선택하세요.")}</h2>
            {market.hasShopee && (
              <a href={SHOPEE} target="_blank" rel="noreferrer">
                <small>EXISTING SHOPEE ORDER</small>
                <b>Shopee Chat</b>
                <span>{marketText(language, "Payment, voucher, delivery tracking or address changes for Shopee orders. ->", "Shopee 주문 결제, 쿠폰, 배송 추적, 주소 변경 문의. ->")}</span>
              </a>
            )}
            <a href={INSTAGRAM} target="_blank" rel="noreferrer">
              <small>PRODUCT AND SOCIAL</small>
              <b>Instagram</b>
              <span>{marketText(language, "Short product questions, social content and informal collaborations. ->", "간단한 상품 문의, 소셜 콘텐츠, 협업 문의. ->")}</span>
            </a>
            <a href={`mailto:${EMAIL}`}>
              <small>FORMAL DOCUMENTS</small>
              <b>Email</b>
              <span>{marketText(language, "Attachments and formal records can still be sent by email.", "첨부파일이나 공식 문서는 이메일로 보낼 수 있습니다.")}</span>
            </a>
            <a href="/bulk-orders">
              <small>DIRECT BULK ORDER</small>
              <b>PayPal checkout</b>
              <span>{marketText(language, `Choose an MOQ quantity and create a tracked ${market.currency} order. ->`, `최소 주문 수량을 선택하고 추적 가능한 ${market.currency} 주문을 생성합니다. ->`)}</span>
            </a>
          </aside>
        </section>
      </main>
    </V23Page>
  );
}
