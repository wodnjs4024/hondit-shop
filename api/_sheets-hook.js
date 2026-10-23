// Bridge to the Google Sheets the team already runs, through one Apps Script web app (script in docs/journal-pr-system.md):
//   pipeline_row  -> update or append a CONTENT_PIPELINE row (03_HONDIT_검색_AEO_성과측정)
//   links_list    -> every link_id in 03_LINKS (HONDIT UTM sheet)
//   reserve_link  -> under the script's lock: refuse an ID already in 03_LINKS, otherwise append its row and advance NEXT_LINK_ID
// A call only counts as done when the script answers JSON with ok:true and echoes what it stored. A bare HTTP 200 (an Apps
// Script error page, a login page, an old script that answers "ok" or "forbidden" as text) is a failure.
import { PIPELINE_COLUMNS } from '../shared/journal.js';

export class SheetsHookError extends Error {
  constructor(message, code = 'failed') { super(message); this.code = code; }
}

export const sheetsHookConfigured = () => Boolean(process.env.CONTENT_PIPELINE_WEBHOOK_URL && process.env.CONTENT_PIPELINE_WEBHOOK_SECRET);

async function callHook(action, payload = {}) {
  if (!sheetsHookConfigured()) throw new SheetsHookError('시트 연동(CONTENT_PIPELINE_WEBHOOK_URL·SECRET)이 설정되지 않았습니다.', 'not_configured');
  let response;
  try {
    response = await fetch(process.env.CONTENT_PIPELINE_WEBHOOK_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.CONTENT_PIPELINE_WEBHOOK_SECRET, action, ...payload }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new SheetsHookError(`시트 연동에 연결하지 못했습니다: ${error.message}`, 'unreachable');
  }
  const text = await response.text().catch(() => '');
  if (!response.ok) throw new SheetsHookError(`시트 연동이 HTTP ${response.status}로 응답했습니다.`, 'http');
  let data;
  try { data = JSON.parse(text); } catch { throw new SheetsHookError('시트 연동 응답이 JSON이 아닙니다. Apps Script를 문서의 최신 버전으로 다시 배포하세요.', 'bad_response'); }
  if (!data || data.ok !== true) throw new SheetsHookError(`시트가 저장하지 못했다고 응답했습니다: ${String(data?.error || 'unknown').slice(0, 200)}`, String(data?.error || 'failed'));
  return data;
}

const cells = (values) => (Array.isArray(values) ? values.map((v) => String(v ?? '')) : null);

/* Writes one CONTENT_PIPELINE row and checks that the script read back exactly what was sent for the columns it owns (I–M). */
export async function syncPipelineRow(row) {
  const data = await callHook('pipeline_row', { columns: PIPELINE_COLUMNS, row });
  if (data.id !== row[0]) throw new SheetsHookError(`시트 행이 일치하지 않습니다 (요청 ${row[0]}, 응답 ${data.id || '없음'}).`, 'row_mismatch');
  if (!['updated', 'appended'].includes(data.result)) throw new SheetsHookError('시트 응답에 저장 결과(updated/appended)가 없습니다.', 'bad_response');
  const expected = cells(row.slice(8, 13));
  if (JSON.stringify(cells(data.written)) !== JSON.stringify(expected)) throw new SheetsHookError('시트에 저장된 값이 보낸 값과 다릅니다.', 'value_mismatch');
  return { result: data.result, rowNumber: data.row_number ?? null };
}

/* The full 03_LINKS link_id column, as the sheet holds it now. */
export async function fetchSheetLinkIds() {
  const data = await callHook('links_list');
  if (!Array.isArray(data.link_ids) || !data.link_ids.length) throw new SheetsHookError('03_LINKS link_id 목록을 받지 못했습니다.', 'bad_response');
  return { linkIds: data.link_ids.map(String), next: data.next_link_id ? String(data.next_link_id) : null };
}

/* Issues linkId in 03_LINKS itself (atomic in the script), so the sheet and this system can never hand out the same ID. */
export async function reserveSheetLink(linkId, linksRow) {
  const data = await callHook('reserve_link', { link_id: linkId, row: linksRow });
  if (data.link_id !== linkId) throw new SheetsHookError(`03_LINKS 응답의 link_id가 다릅니다 (${data.link_id || '없음'}).`, 'row_mismatch');
  return { rowNumber: data.row_number ?? null, next: data.next_link_id ?? null };
}
