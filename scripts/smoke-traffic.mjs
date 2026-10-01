import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const base = (process.env.WENBU_URL || 'https://wenbu.app').replace(/\/$/, '');
const token = (
  await readFile(process.env.WENBU_ANALYTICS_TOKEN_FILE || '.analytics-admin-token', 'utf8')
).trim();
const started = Date.now();
const browser = 'Mozilla/5.0 (Macintosh) Chrome/130.0 Safari/537.36';
const context = {
  session: randomUUID(),
  visitor: randomUUID(),
  page: '/learn/',
  entry: '/',
  locale: 'zh',
  source: 'chatgpt',
  medium: 'ai',
  campaign: 'developer-tools',
  test: true,
};
const evidence = {
  base,
  checkedAt: new Date().toISOString(),
  synthetic: true,
  realCrawlerIdentityVerified: false,
  checks: [],
  probes: [],
};
async function admin(path, params = {}) {
  const r = await fetch(base + '/api/admin/' + path + '?' + new URLSearchParams(params), {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(r.status, 200);
  return r.json();
}
async function post(path, body, ua = browser, extra = {}) {
  return fetch(base + path, {
    method: 'POST',
    headers: {
      Origin: base,
      'Content-Type': 'application/json',
      'User-Agent': ua,
      'X-Wenbu-Test': 'true',
      ...extra,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
}
for (const [ua, type, purpose, path] of [
  [browser, 'browser', 'browse', '/learn/'],
  ['Googlebot/2.1', 'search_crawler', 'search', '/en/learn/'],
  ['OAI-SearchBot/1.0', 'ai_crawler', 'search', '/llms.txt'],
  ['GPTBot/1.2', 'ai_crawler', 'training', '/knowledge/zh/bazi-basics.md'],
  ['ChatGPT-User/1.0', 'ai_agent', 'user_fetch', '/knowledge/en/bazi-basics.json'],
  ['HeadlessChrome/130', 'automation', 'other', '/learn/'],
  ['opaque-test-client', 'unknown', 'unknown', '/knowledge/index.json'],
]) {
  const r = await fetch(base + path + '?private=SYNTHETIC_NOT_STORED', {
    headers: { 'User-Agent': ua, 'X-Wenbu-Test': 'true', 'CF-Verified-Bot': 'true' },
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(r.status, 200);
  await r.arrayBuffer();
  evidence.probes.push({ type, purpose, path, status: r.status });
}
const event = { ...context, id: randomUUID(), event: 'page_view' };
assert.deepEqual(await (await post('/api/events', { events: [event] })).json(), { accepted: 1 });
assert.deepEqual(await (await post('/api/events', { events: [event] })).json(), { accepted: 0 });
const botEvent = { ...event, id: randomUUID() };
assert.deepEqual(await (await post('/api/events', { events: [botEvent] }, 'GPTBot/1.2')).json(), {
  accepted: 1,
});
assert.equal((await post('/api/events', { events: [{ ...event, actor_type: 'browser' }] })).status, 422);
assert.deepEqual(
  await (
    await post('/api/events', { events: [{ ...event, id: randomUUID() }] }, browser, {
      Cookie: 'wenbu_analytics=off',
    })
  ).json(),
  { accepted: 0 },
);
assert.equal(
  (
    await post('/api/v1/tarot', { count: 1, locale: 'zh' }, 'curl/8', {
      'X-Wenbu-Client': 'cli',
      'X-Wenbu-Analytics': JSON.stringify(context),
    })
  ).status,
  200,
);
await fetch(base + '/learn/', {
  method: 'HEAD',
  headers: { 'User-Agent': 'GPTBot/1.2', 'X-Wenbu-Test': 'true' },
});
await fetch(base + '/en/learn/', {
  headers: { 'User-Agent': 'GPTBot/1.2', 'X-Wenbu-Test': 'true', Cookie: 'wenbu_analytics=off' },
});
await fetch(base + '/insights/', { headers: { 'User-Agent': 'GPTBot/1.2', 'X-Wenbu-Test': 'true' } });
// waitUntil commits are asynchronous. Bound readback retries without resending writes.
let rows = [];
for (let attempt = 0; attempt < 5; attempt++) {
  rows = (
    await admin('events', { days: '1', test: 'true', event: 'page_request', limit: '100' })
  ).rows.filter((r) => r.received_at >= started && r.is_test === 1);
  if (rows.length >= 8) break;
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
assert.equal(rows.length, 8);
for (const probe of evidence.probes) {
  const row = rows.find(
    (r) => r.actor_type === probe.type && r.actor_purpose === probe.purpose && r.http_method === 'GET',
  );
  assert.ok(row, `missing ${probe.type}/${probe.purpose}`);
  assert.equal(row.visitor_id, null);
  assert.equal(row.session_id, null);
  assert.equal(row.classification_version, 1);
  // Spoofed verification HTTP headers cannot produce trusted edge evidence.
  assert.ok(
    ['ua_declared', 'browser_hint', 'unknown', 'cf_verified', 'cf_signed', 'cf_score'].includes(
      row.classification_evidence,
    ),
  );
  assert.ok(!JSON.stringify(row).includes('SYNTHETIC_NOT_STORED'));
}
assert.equal(rows.filter((r) => r.http_method === 'HEAD').length, 1);
assert.equal(rows.filter((r) => r.page === '/insights/').length, 0);
evidence.checks.push(
  'all seven declared actor/purpose probes recorded without raw query or visitor identity; HEAD separate; opt-out and private page excluded',
);
const clients = (await admin('events', { test: 'true', session: context.session })).rows;
assert.equal(clients.filter((r) => r.id === event.id).length, 1);
assert.ok(clients.some((r) => r.actor_name === 'cli_client' && r.channel === 'cli'));
const filtered = await admin('analytics', {
  days: '1',
  test: 'true',
  campaign: 'developer-tools',
  source: 'chatgpt',
});
assert.equal(clients.filter((r) => r.event === 'page_view' && r.actor_type === 'browser').length, 1);
assert.equal(clients.filter((r) => r.event === 'page_view' && r.actor_type === 'ai_crawler').length, 1);
assert.equal(clients.filter((r) => r.event === 'calculation_succeeded').length, 1);
assert.ok(Number(filtered.data.summary[0].pageviews) >= 1);
assert.ok(Number(filtered.data.summary[0].excluded_views) >= 1);
assert.ok(Number(filtered.data.summary[0].calculations) >= 1);
const clean = await admin('events', { session: context.session });
assert.equal(clean.rows.length, 0);
evidence.checks.push(
  'event UUID deduplication, forged classification rejection, browser/bot PV separation, CLI classification and default test exclusion',
);
for (const params of [
  {},
  { actor_type: 'ai_crawler' },
  { actor_purpose: 'training', resource_type: 'markdown' },
]) {
  const r = await admin('analytics', { days: '1', test: 'true', ...params });
  for (const metric of [
    'content_requests',
    'search_requests',
    'ai_requests',
    'service_requests',
    'pageviews',
  ])
    assert.equal(
      r.series.reduce((n, p) => n + Number(p[metric] ?? 0), 0),
      Number(r.data.summary[0][metric] ?? 0),
    );
  for (const key of ['actor_type', 'actor_name', 'actor_purpose', 'resource_type', 'classification_evidence'])
    assert.equal(
      r.data[key].reduce((n, p) => n + Number(p.requests), 0),
      Number(r.data.summary[0].content_requests ?? 0),
    );
}
evidence.checks.push(
  'summary, hourly curves and five classification rankings reconcile under combined filters',
);
evidence.result = 'passed';
if (process.env.WENBU_EVIDENCE)
  await writeFile(process.env.WENBU_EVIDENCE, JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
