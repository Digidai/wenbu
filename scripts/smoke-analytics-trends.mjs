import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const base = (process.env.WENBU_URL || 'https://wenbu.app').replace(/\/$/, '');
const token = (
  process.env.WENBU_ANALYTICS_ADMIN_TOKEN ||
  (await readFile(process.env.WENBU_ANALYTICS_TOKEN_FILE || '.analytics-admin-token', 'utf8'))
).trim();
const includeTest = process.env.WENBU_INCLUDE_TEST === 'true';
const evidence = { base, checkedAt: new Date().toISOString(), readOnly: true, checks: [] };
const day = 86400000;
const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);

async function request(params, authenticated = true) {
  return fetch(base + '/api/admin/analytics?' + new URLSearchParams(params), {
    headers: authenticated ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(30000),
  });
}
async function report(params) {
  const response = await request({ test: String(includeTest), ...params });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match(response.headers.get('X-Robots-Tag') || '', /noindex/);
  const data = await response.json();
  const offset = data.timezone === 'Asia/Shanghai' ? 8 * 3600000 : 0;
  assert.equal((data.range.start + offset) % day, 0);
  assert.equal((data.range.end + offset) % day, 0);
  assert.equal(data.range.end - data.range.start, data.days * day);
  assert.equal(data.includeTest, includeTest);
  assert.equal(data.series.length, data.days * (data.range.granularity === 'hour' ? 24 : 1));
  assert.equal(data.data.hours.length, 24);
  const summary = data.data.summary[0];
  for (const key of [
    'content_requests',
    'search_requests',
    'ai_requests',
    'service_requests',
    'pageviews',
    'calculations',
    'agent_complete',
    'failures',
  ]) {
    assert.equal(sum(data.series, key), Number(summary[key] ?? 0));
  }
  for (const key of ['actor_type', 'actor_name', 'actor_purpose', 'classification_evidence', 'resource_type'])
    assert.equal(sum(data.data[key], 'requests'), Number(summary.content_requests ?? 0));
  for (const key of ['source', 'page', 'device']) {
    assert.equal(sum(data.data[key], 'views'), Number(summary.pageviews ?? 0));
  }
  assert.equal(sum(data.data.hours, 'views'), Number(summary.pageviews ?? 0));
  for (const point of data.series) {
    assert.equal(
      point.state,
      point.bucket > data.range.asOf ? 'future' : point.end > data.range.asOf ? 'partial' : 'observed',
    );
    if (point.state === 'future') {
      for (const metric of [
        'pageviews',
        'visitors',
        'sessions',
        'calculations',
        'agent_complete',
        'failures',
      ]) {
        assert.equal(point[metric], null);
      }
    }
  }
  return data;
}

assert.equal((await request({ days: '1' }, false)).status, 401);
evidence.checks.push('unauthenticated requests rejected');
for (const days of [1, 3, 7, 14, 30, 90]) {
  const data = await report({ days: String(days) });
  assert.equal(data.range.granularity, days <= 3 ? 'hour' : 'day');
  evidence.checks.push(`${days}-day range, dense buckets and reconciled totals`);
}
await report({ days: '1', timezone: 'UTC' });
await report({ days: '7', granularity: 'hour' });
evidence.checks.push('UTC midnight boundaries and manual hourly detail');
const end = new Date(Date.now() - day).toISOString().slice(0, 10);
const start = new Date(Date.now() - 2 * day).toISOString().slice(0, 10);
const custom = await report({ start, end, timezone: 'UTC', granularity: 'hour' });
assert.equal(custom.series.length, 48);
assert.equal(custom.range.startDate, start);
assert.equal(custom.range.endDate, end);
evidence.checks.push('inclusive custom date range');
const filters = {
  actor_type: 'browser',
  classification_evidence: 'browser_hint',
  resource_type: 'client_event',
  http_method: 'POST',
  source: 'google',
  medium: 'organic',
  campaign: 'none',
  page: '/tarot/',
  entry_page: '/',
  locale: 'en',
  device: 'mobile',
  channel: 'web',
  tool: 'none',
  mode: 'none',
  browser: 'chrome',
  os: 'android',
  country: 'US',
};
const filtered = await report({ days: '3', ...filters });
for (const [key, value] of Object.entries(filters)) assert.equal(filtered.filters[key], value);
evidence.checks.push('all dimension filters accepted and retained');
for (const query of [
  { days: '8', granularity: 'hour' },
  { days: '1', timezone: 'Europe/London' },
  { start: '2026-02-30', end },
  { source: "';DROP TABLE events;--" },
])
  assert.equal((await request(query)).status, 400);
evidence.checks.push('invalid ranges, timezone, dates and dimensions rejected');
evidence.result = 'passed';
if (process.env.WENBU_EVIDENCE) {
  await writeFile(process.env.WENBU_EVIDENCE, JSON.stringify(evidence, null, 2) + '\n');
}
console.log(JSON.stringify(evidence, null, 2));
