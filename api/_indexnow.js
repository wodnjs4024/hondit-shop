// IndexNow: tells Bing (and Yandex, Seznam, Naver) which pages exist, without a webmaster login.
// The key file public/c95191bd18b850b3eab150f12837d9b9.txt proves the site owns the key. Only this site's own sitemap URLs are sent.
// Triggered weekly by Vercel Cron and on demand at /api/products?indexnow=run. The response is cached at the edge for
// 6 hours, so repeated calls do not resend the list (IndexNow asks sites not to resubmit unchanged URLs too often).
export const INDEXNOW_KEY = 'c95191bd18b850b3eab150f12837d9b9';
const HOST = 'hondit-shop.vercel.app';

export function sitemapUrls(xml) {
  return [...new Set([...String(xml).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&')))]
    .filter((url) => url.startsWith(`https://${HOST}/`));
}

export function indexNowPayload(urls) {
  return { host: HOST, key: INDEXNOW_KEY, keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(0, 10000) };
}

export async function indexNowRoute(req, res, buildSitemap) {
  const send = (status, body, cache) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', cache);
    return res.end(JSON.stringify(body));
  };
  if (req.method !== 'GET') return send(405, { error: 'Method not allowed' }, 'no-store');
  // Any other query value is refused, so the edge cache cannot be bypassed by adding parameters.
  if (req.query?.indexnow !== 'run' || Object.keys(req.query || {}).length !== 1) return send(400, { error: 'Use ?indexnow=run' }, 'no-store');
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return send(503, { error: 'IndexNow runs on production only' }, 'no-store');
  const urls = sitemapUrls(await buildSitemap());
  try {
    const answer = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(indexNowPayload(urls)) });
    const ok = answer.status === 200 || answer.status === 202;
    return send(ok ? 200 : 502, { submitted: ok ? urls.length : 0, indexNowStatus: answer.status, at: new Date().toISOString() }, ok ? 'public, max-age=0, s-maxage=21600' : 'no-store');
  } catch (error) {
    return send(502, { error: 'IndexNow request failed', detail: String(error?.message || error) }, 'no-store');
  }
}
