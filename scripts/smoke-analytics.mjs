import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const base = process.env.WENBU_URL || 'https://wenbu.app';
const token = (
  await readFile(process.env.WENBU_ANALYTICS_TOKEN_FILE || '.analytics-admin-token', 'utf8')
).trim();
const context = {
  session: randomUUID(),
  visitor: randomUUID(),
  page: '/tarot/',
  entry: '/tarot/deck/',
  locale: 'zh',
  source: 'github',
  medium: 'referral',
  campaign: 'tarot-deck',
  test: true,
};
const evidence = { base, checkedAt: new Date().toISOString(), checks: {} };
async function request(path, body, extra = {}) {
  return fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base, 'X-Wenbu-Test': 'true', ...extra },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
}
async function report(query = '') {
  const r = await fetch(base + '/api/admin/analytics?days=1' + query, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
  return r.json();
}
const defaultBefore = await report();
const batch = {
  events: ['page_view', 'tool_started'].map((event) => ({
    ...context,
    event,
    id: randomUUID(),
    tool: 'tarot',
    action: event === 'tool_started' ? 'calculate' : 'none',
  })),
};
const accepted = await request('/api/events', batch);
assert.equal(accepted.status, 200);
assert.deepEqual(await accepted.json(), { accepted: 2 });
const duplicate = await request('/api/events', batch);
assert.deepEqual(await duplicate.json(), { accepted: 0 });
evidence.checks.deduplication = true;
const invalid = await request('/api/events', {
  events: [{ ...batch.events[0], id: randomUUID(), question: 'SYNTHETIC_NOT_ALLOWED' }],
});
assert.equal(invalid.status, 422);
const forged = await request('/api/events', {
  events: [{ ...batch.events[0], id: randomUUID(), event: 'calculation_succeeded' }],
});
assert.equal(forged.status, 422);
assert.equal((await request('/api/events', batch, { Origin: 'https://untrusted.example' })).status, 403);
assert.equal((await fetch(base + '/api/admin/analytics')).status, 401);
evidence.checks.privateTextRejected = true;
evidence.checks.forgedServerEventRejected = true;
evidence.checks.originAndAdminAuth = true;

const off = await request(
  '/api/events',
  { events: [{ ...batch.events[0], id: randomUUID() }] },
  { 'X-Wenbu-Analytics': 'off' },
);
assert.deepEqual(await off.json(), { accepted: 0 });
const tarot = await request(
  '/api/v1/tarot',
  { count: 3, locale: 'zh' },
  { 'X-Wenbu-Analytics': JSON.stringify(context) },
);
assert.equal(tarot.status, 200);
const drawn = await tarot.json();
assert.equal(drawn.cards.length, 3);
assert.equal(new Set(drawn.cards.map((card) => card.id)).size, 3);
const saved = await request('/api/events', {
  events: [
    { ...context, id: randomUUID(), event: 'result_viewed', tool: 'tarot' },
    { ...context, id: randomUUID(), event: 'journal_saved', tool: 'tarot', action: 'save' },
  ],
});
assert.equal(saved.status, 200);
const bazi = await request(
  '/api/v1/bazi',
  { date: '1988-05-05', time: '15:30', timezone: 'Asia/Shanghai', locale: 'zh' },
  { 'X-Wenbu-Analytics': 'off' },
);
assert.equal(bazi.status, 200);
const chart = await bazi.json();
assert.equal(chart.pillars[1].value, '丙辰');
evidence.checks.historicalDstBoundary = { monthPillar: chart.pillars[1].value };
evidence.checks.optOutAcceptedZero = true;

// A separate authenticated read verifies actual D1 receipts, not just HTTP acceptance.
const withTest = await report('&test=true&source=github&campaign=tarot-deck');
assert.ok(
  withTest.data.events.some(
    (row) => row.label === 'calculation_succeeded' && row.origin === 'server' && row.count >= 1,
  ),
);
assert.ok(withTest.data.funnel[0].saved >= 1);
const defaultAfter = await report();
evidence.checks.receipts = withTest.data.events;
evidence.checks.sessionCoverage = withTest.data.funnel[0];
evidence.checks.testExcludedByDefault = defaultAfter.includeTest === false;
evidence.defaultTraffic = { before: defaultBefore.data.summary[0], after: defaultAfter.data.summary[0] };
evidence.result = 'passed';
await writeFile(
  process.env.WENBU_EVIDENCE || 'docs/reviews/deck-analytics-live.json',
  JSON.stringify(evidence, null, 2) + '\n',
);
console.log(JSON.stringify({ base, result: evidence.result, checks: Object.keys(evidence.checks) }));
