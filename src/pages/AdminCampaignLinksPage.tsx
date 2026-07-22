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

function buildUrl(path: string, values: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value.trim()) params.set(key, value.trim().toLowerCase().replace(/\s+/g, "_"));
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
          GA4 기본 화면은 방문을 크게 묶어서 보여주기 때문에, 이곳에서 채널별 링크를 따로 만들어 사용합니다. 보고서에서는
          <strong> 세션 소스/매체</strong>, <strong>세션 캠페인</strong>, <strong>수동 광고 콘텐츠</strong> 기준으로
          페이스북 커뮤니티, 인스타그램, 한인 커뮤니티를 구분하면 됩니다.
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
            return (
              <article key={preset.label}>
                <strong>{preset.label}</strong>
                <span>{`${preset.source} / ${preset.medium} / ${preset.content}`}</span>
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
            위치/방식
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
            검색어/메모
            <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="optional" />
          </label>
        </div>
        <div className="admin-campaign-result">
          <code>{generatedUrl}</code>
          <button type="button" className="button" onClick={() => copyUrl(generatedUrl)}>
            {copied === generatedUrl ? "복사됨" : "생성 링크 복사"}
          </button>
        </div>
      </section>

      <section className="admin-panel admin-panel--analytics">
        <h2>GA4에서 볼 위치</h2>
        <div className="admin-analytics-grid">
          <article>
            <strong>실시간 확인</strong>
            <p>보고서의 실시간 화면에서 방금 들어온 방문과 campaign_landing 이벤트를 확인할 수 있습니다.</p>
          </article>
          <article>
            <strong>채널별 확인</strong>
            <p>보고서의 트래픽 획득에서 기준을 세션 소스/매체로 바꾸면 facebook / community처럼 더 자세히 보입니다.</p>
          </article>
          <article>
            <strong>게시물별 확인</strong>
            <p>탐색 분석에서 수동 광고 콘텐츠를 추가하면 community_post_01 같은 게시물 단위로 비교할 수 있습니다.</p>
          </article>
        </div>
      </section>
    </>
  );
}
