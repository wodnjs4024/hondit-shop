import test from 'node:test';
import assert from 'node:assert/strict';
import { giftSeasonNotice } from '../shared/gift-season.js';

test('the seasonal order-by line shows in every language until 15 January 2027, then disappears', () => {
  for (const lang of ['en', 'ko', 'ja', 'zh-HK', 'zh-TW', 'zh', 'th', 'ms']) assert.ok(giftSeasonNotice(lang, '2026-11-15').length > 20, lang);
  assert.equal(giftSeasonNotice('fr', '2026-11-15'), giftSeasonNotice('en', '2026-11-15'));
  assert.ok(giftSeasonNotice('en', '2027-01-15'));
  assert.equal(giftSeasonNotice('en', '2027-01-16'), '');
});
