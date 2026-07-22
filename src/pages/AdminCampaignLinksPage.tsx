import { useMemo, useState } from "react";

const baseUrl = "https://hondit-shop.vercel.app";

const presets = [
  {
    label: "인스타그램 프로필",
    source: "instagram",
    medium: "bio",
    campaign: "sg_launch_202607",
    content: "instagram_bio",
  },
  {
    label: "인스타그램 스토리",
    source: "instagram",
    medium: "story",
    campaign: "sg_launch_202607",
    content: "instagram_story_01",
  },
  {
    label: "페이스북 페이지",
    source: "facebook",
    medium: "page_post",
    campaign: "sg_launch_202607",
    content: "facebook_page_post_01",
  },
  {
    label: "페이스북 한인 커뮤니티",
    source: "facebook",
    medium: "community",
    campaign: "sg_launch_202607",
    content: "facebook_korean_community_01",
  },
  {
    label: "한인 커뮤니티 게시글",
    source: "korean_community",
    medium: "community_post",
    campaign: "sg_launch_202607",
    content: "community_post_01",
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function analyticsToken(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);
}

function trackingEventName(source: string, medium: string) {
  return `landing_${analyticsToken(source) || "direct"}_${analyticsToken(medium) || "none"}`.slice(0, 40);
}

function buildUrl(path: string, values: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value.trim()) params.set(key, normalize(value));
  });
  return `${baseUrl}${path}?${params.toString()}`;
}

export function AdminCampaignLinksPage() {
  const [path, setPath] = useState("/");
  const [source, setSource] = useState("facebook");
  const [medium, setMedium] = useState("community");
  const [campaign, setCampaign] = useState("sg_launch_202607");
  const [content, setContent] = useState("facebook_korean_community_01");
  const [term, setTerm] = useState("");
  const [copied, setCopied] = useState("");

  const generatedUrl = useMemo(
    () =>
      buildUrl(path, {
        utm_source: source,
        utm_medium: medium,
        utm_campaign: campaign,
        utm_content: content,
        utm_term: term,
      }),
    [campaign, content, medium, path, source, term],
  );

  const generatedEvent = trackingEventName(source, medium);

  const copyUrl = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(""), 1800);
  };

  return (
    <>
      <header className="admin-heading">
        <span className="eyebrow">Campaign links</span>
        <h1>홍보 링크 생성기</h1>
        <p>
          GA4 기본 카드에서는 소셜 유입이 묶여 보일 수 있습니다. 아래 링크를 쓰면 방문 시
          <strong> campaign_landing</strong>과 함께 <strong>landing_facebook_community</strong> 같은 출처별 이벤트가 같이 기록됩니다.
        </p>
      </header>

      <section className="admin-panel">
        <h2>바로 쓰는 링크</h2>
        <div className="admin-campaign-grid">
          {presets.map((preset) => {
            const url = buildUrl("/", {
              utm_source: preset.source,
              utm_medium: preset.medium,
              utm_campaign: preset.campaign,
              utm_content: preset.content,
            });
            const eventName = trackingEventName(preset.source, preset.medium);
            return (
              <article key={preset.label}>
                <strong>{preset.label}</strong>
                <span>{`${preset.source} / ${preset.medium} / ${preset.content}`}</span>
                <span>GA4 이벤트: {eventName}</span>
                <code>{url}</code>
                <button type="button" className="button button--outline" onClick={() => copyUrl(url)}>
                  {copied === url ? "복사됨" : "링크 복사"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="admin-panel">
        <h2>직접 만들기</h2>
        <div className="admin-form admin-form--campaign">
          <label>
            연결할 페이지
            <select value={path} onChange={(event) => setPath(event.target.value)}>
              <option value="/">Home</option>
              <option value="/products">Products</option>
              <option value="/bulk-orders">Bulk Orders</option>
              <option value="/shipping">Shipping</option>
              <option value="/contact">Contact</option>
            </select>
          </label>
          <label>
            소스
            <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="facebook" />
          </label>
          <label>
            위치 / 방식
            <input value={medium} onChange={(event) => setMedium(event.target.value)} placeholder="community" />
          </label>
          <label>
            캠페인
            <input value={campaign} onChange={(event) => setCampaign(event.target.value)} placeholder="sg_launch_202607" />
          </label>
          <label>
            게시물 구분
            <input value={content} onChange={(event) => setContent(event.target.value)} placeholder="facebook_korean_community_01" />
          </label>
          <label>
            검색어 / 메모
            <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="optional" />
          </label>
        </div>
        <div className="admin-campaign-result">
          <code>{generatedUrl}</code>
          <span>GA4 이벤트: {generatedEvent}</span>
          <button type="button" className="button" onClick={() => copyUrl(generatedUrl)}>
            {copied === generatedUrl ? "복사됨" : "생성 링크 복사"}
          </button>
        </div>
      </section>

      <section className="admin-panel admin-panel--analytics">
        <h2>GA4에서 보는 위치</h2>
        <div className="admin-analytics-grid">
          <article>
            <strong>실시간 이벤트</strong>
            <p>보고서의 실시간 화면에서 campaign_landing 또는 landing_facebook_community 같은 이벤트명을 확인하세요.</p>
          </article>
          <article>
            <strong>채널별 확인</strong>
            <p>트래픽 획득 보고서에서는 세션 소스/매체를 기준으로 facebook / community처럼 볼 수 있습니다.</p>
          </article>
          <article>
            <strong>게시물별 확인</strong>
            <p>utm_content 값으로 facebook_korean_community_01 같은 게시물 단위 비교가 가능합니다.</p>
          </article>
        </div>
      </section>
    </>
  );
}
