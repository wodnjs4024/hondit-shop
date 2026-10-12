import {useSearchParams} from "react-router-dom";
import {ConsultationPanel} from "../components/ConsultationPanel";
import {consultationContext} from "../../shared/consultation.js";
import {v23Products} from "../data/v23SiteData";
import { useState } from "react";
import { V23Page } from "../components/v23/SiteChrome";
import { EMAIL, INSTAGRAM, SHOPEE } from "../data/v23SiteData";
import { trackEvent } from "../lib/analytics";
import { marketCountryName, marketText, useMarket, type DisplayLanguage } from "../lib/market";

const openLabel: Record<DisplayLanguage, string> = {
  en: "Open",
  ko: "열기",
  zh: "打开",
  "zh-HK": "開啟",
  "zh-TW": "開啟",
  ja: "開く",
  ms: "Buka",
  th: "เปิด",
};

const channelCopy = (text: string) => text.replace(/\s*(?:->|→)\s*$/, "");

export function ContactPage() {
  const { market, language } = useMarket();
  const [params]=useSearchParams();
  const context=consultationContext(params,v23Products,market.code,language);
  const countryName = marketCountryName(market, language);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  async function copyEmail() {
    try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setCopyFailed(false); }
    catch { setCopyFailed(true); }
  }
  const trackChannel = (channel: string, destination: string) => trackEvent("contact_channel_click", {
    contact_channel: channel,
    link_url: destination,
    market_code: market.code,
  });

  return (
    <V23Page>
      <main className="v23-contact-page">
        <section className="v23-contact-hero">
          <div>
            <p className="v23-eyebrow"><span /> {marketText(language, "CONTACT HONDIT", "HONDIT 문의")}</p>
            <h1>{marketText(language, "Questions about your order?\nContact hondit.", "상품과 주문에 대해\nhondit에 문의하세요.")}</h1>
            <p>
              {market.hasShopee
                ? marketText(language, `Ask about ${countryName} bulk orders here, or use Shopee Chat for an existing Shopee order.`, `${countryName} 대량주문 조건을 문의해주세요. 이미 진행 중인 Shopee 주문은 Shopee Chat을 이용해주세요.`)
                : marketText(language, `Ask about ${countryName} bulk orders and delivery conditions. Email is also available below.`, `${countryName} 주문은 hondit 대량주문으로만 운영됩니다. 아래 이메일 동선도 이용할 수 있습니다.`)}
            </p>
          </div>
          <img src="/images/jeju-field-university.webp" alt="Jeju National University Ara Campus." />
        </section>

        <section className="v23-contact-grid">
          <section className="v23-email-inquiry" aria-label={marketText(language,"EMAIL HONDIT")}>
            <p className="v23-eyebrow"><span /> {marketText(language, "EMAIL HONDIT", "이메일 문의")}</p>
            <h2>{marketText(language, "Contact us by email.", "이메일로 문의해주세요.")}</h2>
            <p>{marketText(language, "The online enquiry form is temporarily unavailable. Please use the existing email address below.", "온라인 문의 폼은 임시 비활성화 상태입니다. 아래 기존 운영 이메일을 이용해주세요.")}</p>
            <p><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            <div className="v23-email-actions">

              <button type="button" className="button button--ghost" onClick={copyEmail}>{marketText(language, "Copy email address", "이메일 주소 복사")}</button>
            </div>
            <p role="status">{copied ? marketText(language, "Email address copied.", "이메일 주소를 복사했습니다.") : copyFailed ? marketText(language, "Copy unavailable. Please select and copy the email address above.", "복사 기능을 사용할 수 없습니다. 위 이메일 주소를 선택해 복사해주세요.") : ""}</p>
            <p>{marketText(language, "Opening your email app creates a draft only. Review and send it yourself; opening a draft does not confirm receipt.", "이메일 앱 실행은 초안 열기만 수행합니다. 내용을 확인한 후 직접 발송해주세요. 초안을 여는 것은 문의 접수 완료가 아닙니다.")}</p>

          </section>

          <ConsultationPanel lines={context.product?[{name:context.product.name,quantity:context.quantity}]:[]} reason={context.reason} country={`${countryName} (${market.code})`}/>
          <aside>
            <p className="v23-eyebrow is-light"><span /> {marketText(language, "QUICK ROUTES", "빠른 경로")}</p>
            <h2>{marketText(language, "Use the right channel.", "상황에 맞는 채널을 선택하세요.")}</h2>
            {market.hasShopee && (
              <a className="v23-contact-channel" href={SHOPEE} target="_blank" rel="noreferrer" onClick={() => trackChannel("shopee_chat", SHOPEE)}>
                <small>{marketText(language,"EXISTING SHOPEE ORDER")}</small>
                <span className="v23-contact-channel-head"><b>{marketText(language,"Shopee Chat")}</b><i>{openLabel[language]} <em aria-hidden="true">↗</em></i></span>
                <strong>shopee.sg/hondit.office.sg</strong>
                <span>{channelCopy(marketText(language, "Payment, voucher, delivery tracking or address changes for Shopee orders. ->", "Shopee 주문 결제, 쿠폰, 배송 추적, 주소 변경 문의. ->"))}</span>
              </a>
            )}
            <a className="v23-contact-channel" href={INSTAGRAM} target="_blank" rel="noreferrer" onClick={() => trackChannel("instagram", INSTAGRAM)}>
              <small>{marketText(language,"PRODUCT AND SOCIAL")}</small>
              <span className="v23-contact-channel-head"><b>Instagram</b><i>{openLabel[language]} <em aria-hidden="true">↗</em></i></span>
              <strong>@hondit.office</strong>
              <span>{channelCopy(marketText(language, "Short product questions, social content and informal collaborations. ->", "간단한 상품 문의, 소셜 콘텐츠, 협업 문의. ->"))}</span>
            </a>
            <a className="v23-contact-channel" href={`mailto:${EMAIL}`} onClick={() => trackChannel("email", `mailto:${EMAIL}`)}>
              <small>{marketText(language,"FORMAL DOCUMENTS")}</small>
              <span className="v23-contact-channel-head"><b>{marketText(language,"Email")}</b><i>{openLabel[language]} <em aria-hidden="true">↗</em></i></span>
              <strong>{EMAIL}</strong>
              <span>{marketText(language, "Attachments and formal records can still be sent by email.", "첨부파일이나 공식 문서는 이메일로 보낼 수 있습니다.")}</span>
            </a>
            <a className="v23-contact-channel" href="/bulk-orders" onClick={() => trackChannel("bulk_checkout", "/bulk-orders")}>
              <small>{marketText(language,"DIRECT BULK ORDER")}</small>
              <span className="v23-contact-channel-head"><b>{marketText(language,"PayPal checkout")}</b><i>{openLabel[language]} <em aria-hidden="true">→</em></i></span>
              <span>{channelCopy(marketText(language, `Choose the minimum order quantity and create a tracked ${market.currency} order. ->`, `최소 주문 수량을 선택하고 추적 가능한 ${market.currency} 주문을 생성합니다. ->`))}</span>
            </a>
          </aside>
        </section>
      </main>
    </V23Page>
  );
}
