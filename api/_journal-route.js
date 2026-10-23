// Public Journal entry points, dispatched from api/products.js:
//   /journal, /journal/:lang          -> server-rendered list   (journalPage=list)
//   /journal/:lang/:slug              -> server-rendered article (journalPage=article)
//   /api/journal?lang=&slug=          -> JSON for the React pages (journalApi=1)
//   /api/products?journalCron=1       -> scheduled publisher (Vercel Cron; CRON_SECRET when set)
import { languageBySegment, languageByCode } from '../shared/journal.js';
import { getPublicArticle, listPublicArticles, publishDueQuietly, runPublisher } from './_journal.js';
import { renderArticlePage, renderListPage, renderNotFound } from './_journal-html.js';
import { json, verifyAdmin } from './_utils.js';

const q = (req, key) => (typeof req.query?.[key] === 'string' ? req.query[key] : '');

async function isAdmin(req) {
  if (!req.headers?.authorization && !req.headers?.Authorization) return false;
  try { await verifyAdmin(req); return true; } catch { return false; }
}

function send(res, status, html, { cache }) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.end(html);
}

export async function journalArticlesForSitemap() {
  try { await publishDueQuietly(); return (await listPublicArticles()).articles.filter((a) => !a.previewOnly); } catch { return []; }
}

export async function journalRoute(req, res) {
  if (req.query?.journalCron !== undefined) {
    const secret = process.env.CRON_SECRET;
    const header = String(req.headers?.authorization || '');
    if (secret && header !== `Bearer ${secret}`) return json(res, 401, { error: 'Unauthorized' });
    res.setHeader('Cache-Control', 'no-store');
    try { return json(res, 200, await runPublisher({ actor: 'publisher:cron' })); } catch (error) { return json(res, 500, { error: error.message }); }
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return json(res, 405, { error: 'Method not allowed' }); }
  // Publish anything that became due before serving, so a 09:00 KST article is live at 09:00 without a minute-level cron.
  await publishDueQuietly();

  if (req.query?.journalApi !== undefined) {
    res.setHeader('Cache-Control', 'no-store');
    const language = q(req, 'lang');
    if (language && !languageByCode(language)) return json(res, 400, { error: 'Unsupported language' });
    try {
      if (q(req, 'slug')) {
        const found = await getPublicArticle(language, q(req, 'slug'), { admin: q(req, 'preview') === '1' && (await isAdmin(req)) });
        return found ? json(res, 200, found) : json(res, 404, { error: 'Article not found' });
      }
      return json(res, 200, await listPublicArticles(language || undefined));
    } catch { return json(res, 503, { error: 'Journal unavailable' }); }
  }

  const segment = q(req, 'lang');
  const lang = segment ? languageBySegment(segment) : null;
  try {
    if (q(req, 'journalPage') === 'article') {
      const found = lang ? await getPublicArticle(lang.code, q(req, 'slug')) : null;
      if (!found) return send(res, 404, await renderNotFound(), { cache: 'no-store' });
      return send(res, 200, await renderArticlePage(found), { cache: found.preview ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' });
    }
    if (segment && !lang) return send(res, 404, await renderNotFound(), { cache: 'no-store' });
    const { articles, preview } = await listPublicArticles(lang?.code);
    return send(res, 200, await renderListPage({ articles, language: lang?.code, preview }), { cache: preview ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' });
  } catch {
    return send(res, 503, await renderNotFound(), { cache: 'no-store' });
  }
}
