// Runs the Apps Script printed in docs/journal-pr-system.md against an in-memory copy of the real sheet layout
// (02_CAMPAIGNS A, 03_LINKS with H/I/R formulas prefilled, 01_RULES!B2/B3, CONTENT_PIPELINE 13 columns), checked 2026-10-23.
import fs from 'node:fs'; import vm from 'node:vm'; import assert from 'node:assert/strict'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const J = await import(repo + '/shared/journal.js');
const S = await import(repo + '/shared/journal-seed.js');
const doc = fs.readFileSync(repo + '/docs/journal-pr-system.md', 'utf8');
const src = doc.slice(doc.indexOf('```js') + 5, doc.indexOf('```', doc.indexOf('```js') + 5));
const BASE = 'https://hondit-shop.vercel.app';
const enc = (s) => encodeURIComponent(String(s)).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
function makeWorld(opts = {}) {
  const campaigns = ['campaign', 'sg_pr_202610','jp_pr_202610','hk_pr_202610','tw_pr_202610','sg_journal_202610','jp_journal_202610','hk_journal_202610','tw_journal_202610'];
  const cmarket = Object.fromEntries(campaigns.slice(1).map((c) => [c, c.slice(0, 2)]));
  const links = [Array(20).fill('h')]; for (let i = 1; i <= 43; i++) { const r = Array(20).fill(''); r[0] = 'l' + String(i).padStart(4, '0'); links.push(r); }
  while (links.length < 100) links.push(Array(20).fill(''));
  const pipe = [Array(13).fill('h'), ['C-001', ...Array(12).fill('x')]]; while (pipe.length < 50) pipe.push(Array(13).fill(''));
  const rules = { B2: BASE, B3: 'l0044' }; let writes = 0, throwAt = opts.throwAt ?? -1;
  const linkDisplay = (r, c) => { // 1-based
    const row = links[r - 1]; if (!row) return '';
    if (c === 8) return row[1] ? (cmarket[row[1]] || '') : '';
    if (c === 9) { const [A,B,C,D,,F,G] = row; const H = linkDisplay(r, 8), L = row[11];
      if (!A||!B||!C||!D||!F||!H||!L) return '';
      return (opts.base || BASE) + F + '?' + (H === 'jeju' ? '' : 'market=' + H.toUpperCase() + '&') + 'lang=' + enc(L) + '&utm_source=' + enc(D) + '&utm_medium=' + enc(C) + '&utm_campaign=' + enc(B) + '&utm_content=' + enc(A) + '&link_id=' + enc(A) + (G ? '#' + enc(G) : ''); }
    const v = row[c - 1]; return v === true ? 'TRUE' : v === false ? 'FALSE' : String(v ?? '');
  };
  const range = (grid, display, r, c, nr = 1, nc = 1, formulaCols = []) => ({
    getDisplayValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => display(r + i, c + j))),
    getDisplayValue: () => display(r, c),
    setNumberFormat() { return this; },
    setValues(v) { v.forEach((row, i) => row.forEach((x, j) => { if (formulaCols.includes(c + j)) throw new Error('wrote formula col'); grid[r - 1 + i][c - 1 + j] = x; writes++; })); return this; },
    setValue(x) { if (writes === throwAt) { throwAt = -1; throw new Error('simulated quota error'); } if (formulaCols.includes(c)) throw new Error('wrote formula col ' + c); grid[r - 1][c - 1] = x; writes++; return this; },
    clearContent() { grid[r - 1][c - 1] = ''; return this; },
  });
  const sheets = {
    '03_LINKS': { getMaxRows: () => links.length, getRange: (r, c, nr, nc) => range(links, linkDisplay, r, c, nr, nc, [8, 9, 18]) },
    CONTENT_PIPELINE: { getMaxRows: () => pipe.length, getRange: (r, c, nr, nc) => range(pipe, (rr, cc) => String(pipe[rr - 1]?.[cc - 1] ?? ''), r, c, nr, nc) },
    '02_CAMPAIGNS': { getRange: () => ({ getDisplayValues: () => campaigns.map((x) => [x]) }) },
    '01_RULES': { getRange: (a) => ({ setValue: (v) => { rules[a] = v; } }) },
  };
  let locked = false;
  const ctx = {
    JSON, String, Number, Math, Array,
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ setMimeType: () => ({ body: JSON.parse(t) }) }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => opts.secret === undefined ? 'hook-secret-long-value' : opts.secret }) },
    LockService: { getScriptLock: () => ({ tryLock: () => (locked ? false : (locked = true)), releaseLock: () => { locked = false; } }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: (n) => sheets[n] }), flush() {} },
  };
  vm.createContext(ctx); vm.runInContext(src, ctx);
  const post = (body) => ctx.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } }).body;
  return { post, links, pipe, rules, linkDisplay, get writes() { return writes; }, get locked() { return locked; } };
}
const SECRET = 'hook-secret-long-value'; let n = 0; const ok = (m) => { n++; console.log('ok', n, m); };

// auth
{ const w = makeWorld(); assert.deepEqual(w.post({ secret: 'wrong', action: 'links_list' }), { ok: false, error: 'forbidden' }); assert.equal(w.writes, 0); ok('wrong secret: forbidden, 0 writes'); }
{ const w = makeWorld({ secret: null }); assert.equal(w.post({ secret: '', action: 'links_list' }).error, 'forbidden'); ok('no SECRET property: forbidden'); }
{ const w = makeWorld(); assert.equal(w.post('not json').error, 'bad_json'); ok('bad json refused'); }
// links_list
{ const w = makeWorld(); const r = w.post({ secret: SECRET, action: 'links_list' }); assert.equal(r.link_ids.length, 43); assert.equal(r.next_link_id, 'l0044'); ok('links_list: 43 ids l0001–l0043, next l0044 (formula rows ignored)'); }
// pipeline
{ const w = makeWorld(); const row = ['J-SG-001','직접게재','SG','HONDIT /journal','t','d','u','', '검수 대기','2026-10-30 09:00','r','', 'n'];
  const a = w.post({ secret: SECRET, action: 'pipeline_row', row }); assert.equal(a.result, 'appended'); assert.equal(a.row_number, 3); assert.deepEqual(a.written, row.slice(8, 13));
  const row2 = [...row]; row2[8] = '공개'; row2[11] = 'https://x';
  const b = w.post({ secret: SECRET, action: 'pipeline_row', row: row2 }); assert.equal(b.result, 'updated'); assert.equal(b.row_number, 3); assert.deepEqual(b.written, row2.slice(8, 13));
  assert.equal(w.pipe[2][4], 't'); assert.equal(w.post({ secret: SECRET, action: 'pipeline_row', row: row.slice(0, 12) }).error, 'bad_row');
  ok('pipeline_row: append, then update only I–M, 12-col row refused'); }
// reserve for every seed article × channel and press link; final URL from the sheet formula must equal the code's
{ const w = makeWorld(); let id = 44; const now = new Date('2026-10-23T03:00:00Z');
  for (const a of S.seedArticles) for (const ch of Object.keys(J.CHANNELS)) {
    const art = { ...a, id: 'x', status: 'published', published_at: now.toISOString() };
    const linkId = 'l' + String(id++).padStart(4, '0'); const d = J.buildDistribution(art, ch, linkId, now);
    const r = w.post({ secret: SECRET, action: 'reserve_link', link_id: linkId, row: d.links_row });
    assert.equal(r.ok, true, linkId + ' ' + JSON.stringify(r)); assert.equal(w.linkDisplay(r.row_number, 9), d.final_url); assert.equal(w.rules.B3, 'l' + String(id).padStart(4, '0')); }
  for (const p of S.seedPress.slice(5)) { const linkId = 'l' + String(id++).padStart(4, '0'); const { linksRow, url } = J.pressLink(p, linkId, now);
    const r = w.post({ secret: SECRET, action: 'reserve_link', link_id: linkId, row: linksRow }); assert.equal(r.ok, true, linkId + JSON.stringify(r)); assert.equal(w.linkDisplay(r.row_number, 9), url); }
  assert.equal(w.links[44][13], false); assert.equal(w.locked, false);
  ok(`reserve_link: ${id - 44} new rows (12 journal + 10 press), sheet I formula == code final_url every time, B3 advances, N stays FALSE`);
  const again = w.post({ secret: SECRET, action: 'reserve_link', link_id: 'l0044', row: w.links[44].map(String) });
  assert.equal(again.error, 'taken'); ok('duplicate reserve of l0044: taken'); }
{ const w = makeWorld(); const r = Array(20).fill(''); r[0] = 'l0044'; r[1] = 'sg_journal_202611'; assert.equal(w.post({ secret: SECRET, action: 'reserve_link', link_id: 'l0044', row: r }).error, 'campaign_missing'); assert.equal(w.writes, 0); ok('campaign not in 02_CAMPAIGNS (202611): refused before any write'); }
{ const w = makeWorld({ base: 'https://other.example' }); const now = new Date('2026-10-23T03:00:00Z');
  const d = J.buildDistribution({ ...S.seedArticles[0], id: 'x', status: 'published', published_at: now.toISOString() }, 'pinterest', 'l0044', now);
  const r = w.post({ secret: SECRET, action: 'reserve_link', link_id: 'l0044', row: d.links_row }); assert.equal(r.error, 'final_url_mismatch');
  assert.equal(w.links[44][0], ''); assert.equal(w.links[44][1], ''); assert.equal(w.rules.B3, 'l0044'); ok('final URL mismatch (01_RULES!B2 changed): row rolled back, B3 unchanged'); }
{ const w = makeWorld({ throwAt: 3 }); const now = new Date('2026-10-23T03:00:00Z');
  const d = J.buildDistribution({ ...S.seedArticles[0], id: 'x', status: 'published', published_at: now.toISOString() }, 'pinterest', 'l0044', now);
  const r = w.post({ secret: SECRET, action: 'reserve_link', link_id: 'l0044', row: d.links_row });
  assert.equal(r.error, 'write_failed'); assert.deepEqual(w.links[44].filter((v, i) => v !== '' && i !== 13), []); assert.equal(w.links[44][13], false); assert.equal(w.rules.B3, 'l0044'); assert.equal(w.locked, false); ok('exception mid-write: partial row rolled back, B3 unchanged, lock released'); }
