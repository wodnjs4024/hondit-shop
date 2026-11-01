import { Fragment, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { trackEvent } from "../lib/analytics";
import { fetchJournalArticle, fetchJournalList, initialArticle, initialList, type JournalArticleResponse, type JournalListResponse } from "../lib/journal";
import { JOURNAL_LANGUAGES, articlePath, formatDate, inlineSegments, languageByCode, languageBySegment, marketLink, parseBody, usageNote, type JournalArticle } from "../../shared/journal";
import { JOURNAL_FEATURE_IMAGES, PRODUCT_IMAGES, PRODUCT_NAMES, copyFor, coverFor, isDiffuserStory } from "../../shared/journal-copy";
import { NotFoundPage } from "./NotFoundPage";

function Inline({ text, language }: { text: string; language?: string }) {
  return (
    <>
      {inlineSegments(text).map((segment, index) =>
        segment.href ? (
          segment.href.startsWith("/") ? <Link key={index} to={language ? marketLink(segment.href, language) : segment.href}>{segment.text}</Link> : <a key={index} href={segment.href} rel="noopener">{segment.text}</a>
        ) : <Fragment key={index}>{segment.text}</Fragment>,
      )}
    </>
  );
}

export function JournalBody({ markdown, language }: { markdown: string; language?: string }) {
  return (
    <div className="journal-body">
      {parseBody(markdown).map((block, index) => {
        if (block.type === "h2") return <h2 key={index}>{block.text}</h2>;
        if (block.type === "h3") return <h3 key={index}>{block.text}</h3>;
        if (block.type === "quote") return <blockquote key={index}><Inline text={block.text} language={language} /></blockquote>;
        if (block.type === "list") return <ul key={index}>{block.items.map((item, i) => <li key={i}><Inline text={item} language={language} /></li>)}</ul>;
        if (block.type === "image") return (
          <figure key={index}>
            <img src={block.src} alt={block.alt} loading="lazy" decoding="async" width={1200} height={900} />
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>
        );
        return <p key={index}><Inline text={block.text} language={language} /></p>;
      })}
    </div>
  );
}

function setArticleMeta(article: JournalArticle, preview: boolean) {
  document.title = article.seo_title || `${article.title} | HONDIT Journal`;
  const set = (selector: string, value: string) => document.head.querySelector(selector)?.setAttribute("content", value);
  set('meta[name="description"]', article.seo_description || article.dek);
  set('meta[property="og:title"]', document.title);
  set('meta[property="og:description"]', article.seo_description || article.dek);
  if (article.hero_image_url) set('meta[property="og:image"]', new URL(article.hero_image_url, window.location.origin).href.replace(window.location.origin, "https://hondit-shop.vercel.app"));
  set('meta[name="robots"]', preview ? "noindex,nofollow" : "index,follow,max-image-preview:large");
  document.documentElement.lang = article.language;
}

export function JournalArticleView({ article, translations = [], preview = false }: { article: JournalArticle; translations?: JournalArticleResponse["translations"]; preview?: boolean }) {
  const c = copyFor(article.language);
  const updated = article.updated_at && article.published_at && new Date(article.updated_at).getTime() - new Date(article.published_at).getTime() > 3600 * 1000;
  const cta = article.cta_type === "partners" ? { to: "/partners", label: c.partners } : { to: "/contact", label: c.contact };
  const track = (action: string, item?: string) => trackEvent("journal_cta_click", { action_name: action, placement_id: article.slug, item_id: item, page_type: "journal_article" });
  const diffuser = isDiffuserStory(article);
  const usage = usageNote(article.body_md);
  const usageImage = JOURNAL_FEATURE_IMAGES.usage;
  const cover = coverFor(article);
  // The article's own hero photo: full-bleed at the top, or (under a group cover) the first picture of the story.
  const heroFigure = (className: string, top: boolean) => article.hero_image_url && (
    <figure className={className}>
      {top
        ? <img src={article.hero_image_url} alt={article.hero_image_alt || ""} width={1600} height={1100} fetchPriority="high" />
        : <img src={article.hero_image_url} alt={article.hero_image_alt || ""} width={1600} height={1100} loading="lazy" decoding="async" />}
      {top && diffuser && <p className="journal-hero-tag" aria-hidden="true">{c.heroTag}</p>}
      {(article.hero_image_caption || article.hero_image_credit) && <figcaption>{article.hero_image_caption} {article.hero_image_credit && <small>{article.hero_image_credit}</small>}</figcaption>}
    </figure>
  );
  return (
    <main className="journal-article" lang={article.language}>
      {preview && <p className="journal-preview-flag">{c.preview}</p>}
      {cover ? (
        <figure className="journal-hero is-cover">
          <img src={cover.src} alt={c.coverAlt} width={cover.width} height={cover.height} fetchPriority="high" />
          {diffuser && <p className="journal-hero-tag" aria-hidden="true">{c.heroTag}</p>}
          <figcaption><small>{c.coverCredit}</small></figcaption>
        </figure>
      ) : heroFigure("journal-hero", true)}
      <div className={`journal-lead${usage ? " has-usage" : ""}`}>
        <header className="journal-article-head">
          <nav className="journal-crumbs"><Link to={`/journal/${languageByCode(article.language)?.segment || "en"}`}>{c.kicker}</Link></nav>
          <h1>{article.title}</h1>
          <p className="journal-dek">{article.dek}</p>
          <p className="journal-byline">
            <span>{c.by} {c.authorTypes[article.author_type] || article.author_name || "HONDIT"}</span>
            {article.published_at && <> · <time dateTime={article.published_at}>{c.published} {formatDate(article.published_at, article.language)}</time></>}
            {updated && <> · <time dateTime={article.updated_at}>{c.updated} {formatDate(article.updated_at, article.language)}</time></>}
          </p>
        </header>
        {usage && (
          <aside className="journal-howto">
            {diffuser && <img src={usageImage.src} alt={c.usageAlt} width={usageImage.width} height={usageImage.height} decoding="async" />}
            <h2>{c.howTo}</h2>
            <p>{usage}</p>
          </aside>
        )}
      </div>
      {cover && heroFigure("journal-lead-figure", false)}
      <JournalBody markdown={article.body_md} language={article.language} />
      {diffuser && (
        <section className="journal-materials">
          <h2>{c.materials}</h2>
          <div className="journal-materials-grid">
            {JOURNAL_FEATURE_IMAGES.materials.map((m) => (
              <figure key={m.key} className={`journal-material is-${m.key}`}>
                <img src={m.src} alt={c.materialAlt[m.key || ""]} width={m.width} height={m.height} loading="lazy" decoding="async" />
                <figcaption>{c.materialCaption[m.key || ""]}</figcaption>
              </figure>
            ))}
          </div>
          <p className="journal-materials-credit">{c.photoCredit}</p>
        </section>
      )}
      {article.related_products?.length > 0 && (
        <aside className="journal-related">
          <h2>{c.related}</h2>
          <ul>
            {article.related_products.map((slug) => (
              <li key={slug}>
                <Link className="journal-product" to={marketLink(`/products/${slug}`, article.language)} onClick={() => track("journal_product_click", slug)}>
                  <img src={PRODUCT_IMAGES[slug]} alt="" width={160} height={160} loading="lazy" />
                  <span>{PRODUCT_NAMES[slug] || slug}</span>
                  <b>{c.shop}</b>
                </Link>
              </li>
            ))}
          </ul>
          <Link className="journal-cta" to={marketLink(cta.to, article.language)} onClick={() => track(cta.to === "/contact" ? "journal_contact_click" : "journal_partners_click")}>{cta.label}</Link>
        </aside>
      )}
      {article.sources?.length > 0 && (
        <section className="journal-sources">
          <h2>{c.sources}</h2>
          <ol>{article.sources.map((source) => <li key={source.url}><a href={source.url} rel="noopener">{source.label}</a></li>)}</ol>
        </section>
      )}
      {translations.length > 0 && (
        <nav className="journal-translations">
          <span>{c.other}</span>
          {translations.map((t) => <Link key={t.id} to={articlePath(t)} hrefLang={t.language} lang={t.language}>{languageByCode(t.language)?.label}</Link>)}
        </nav>
      )}
    </main>
  );
}

export function JournalArticlePage() {
  const { lang = "", slug = "" } = useParams();
  const [params] = useSearchParams();
  const language = languageBySegment(lang)?.code || "";
  const adminPreview = params.get("preview") === "1";
  const [data, setData] = useState<JournalArticleResponse | null>(() => (adminPreview ? null : initialArticle(language, slug)));
  const [missing, setMissing] = useState(!language);

  useEffect(() => {
    if (!language) return;
    if (data && data.article.slug === slug && data.article.language === language) return;
    let live = true;
    fetchJournalArticle(language, slug, adminPreview).then((next) => live && setData(next)).catch(() => live && setMissing(true));
    return () => { live = false; };
  }, [language, slug, adminPreview]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!data) return;
    setArticleMeta(data.article, data.preview);
    trackEvent("journal_view", { page_type: "journal_article", placement_id: data.article.slug, market_code: data.article.market });
  }, [data]);

  if (missing) return <NotFoundPage />;
  return (
    <V23Page>
      {data ? <JournalArticleView article={data.article} translations={data.translations} preview={data.preview} /> : <main className="journal-article journal-loading" aria-busy="true" />}
    </V23Page>
  );
}

export function JournalIndexPage() {
  const { lang } = useParams();
  const language = lang ? languageBySegment(lang)?.code || null : null;
  const [data, setData] = useState<JournalListResponse | null>(() => initialList(language));
  const c = copyFor(language || "en");

  useEffect(() => {
    if (data && initialList(language) === data) return;
    let live = true;
    fetchJournalList(language).then((next) => live && setData(next)).catch(() => live && setData({ articles: [], preview: false }));
    return () => { live = false; };
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = `${c.listTitle} | HONDIT Journal`;
    document.head.querySelector('meta[name="description"]')?.setAttribute("content", c.listDek);
    document.head.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
    document.head.querySelector('meta[name="robots"]')?.setAttribute("content", !data || data.preview || !data.articles.length ? "noindex,follow" : "index,follow");
  }, [c.listTitle, data]);

  if (lang && !language) return <NotFoundPage />;
  return (
    <V23Page>
      <main className="journal-index">
        {data?.preview && <p className="journal-preview-flag">{c.preview}</p>}
        <header className="journal-index-head">
          <p className="v23-eyebrow"><span /> {c.kicker}</p>
          <h1>{c.listTitle}</h1>
          <p>{c.listDek}</p>
        </header>
        <nav className="journal-tabs">
          <Link to="/journal" aria-current={!language ? "page" : undefined}>All</Link>
          {JOURNAL_LANGUAGES.map((l) => <Link key={l.code} to={`/journal/${l.segment}`} lang={l.code} aria-current={language === l.code ? "page" : undefined}>{l.label}</Link>)}
        </nav>
        {data && (data.articles.length ? (
          <ul className="journal-grid">
            {data.articles.map((a) => (
              <li className="journal-card" key={a.id}>
                <Link to={articlePath(a)} lang={a.language}>
                  <img src={a.hero_image_url || "/images/hondit-collection-hero.webp"} alt={a.hero_image_alt || ""} width={800} height={600} loading="lazy" />
                  <span className="journal-card-lang">{languageByCode(a.language)?.label}</span>
                  <h2>{a.title}</h2>
                  <p>{a.dek}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="journal-empty">{c.empty}</p>)}
      </main>
    </V23Page>
  );
}
