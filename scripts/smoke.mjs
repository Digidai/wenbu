import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const base = process.env.WENBU_URL || 'https://wenbu.genedai.me';
const evidence = { base, checkedAt: new Date().toISOString(), pages: [], api: [], mcp: [], ai: null };
const fetchSafe = (url, init = {}) => fetch(url, { ...init, signal: AbortSignal.timeout(50000) });
async function post(path, body, extra = {}) {
  return fetchSafe(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extra },
    body: JSON.stringify(body),
  });
}
const health = await fetchSafe(base + '/api/health');
assert.equal(health.status, 200);
evidence.health = await health.json();
const sitemap = await (await fetchSafe(base + '/sitemap.xml')).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => new URL(x[1]).pathname);
assert.equal(urls.length, 60);
for (let i = 0; i < urls.length; i += 4) {
  await Promise.all(
    urls.slice(i, i + 4).map(async (path) => {
      const response = await fetchSafe(base + path);
      const html = await response.text();
      assert.equal(response.status, 200, path);
      assert.ok(html.includes('rel="canonical"'), path);
      assert.ok(response.headers.get('Content-Security-Policy')?.includes("script-src 'self'"), path);
      evidence.pages.push({ path, status: response.status });
    }),
  );
}
for (const [path, expected] of [
  ['/missing-wenbu-verification-page/', 404],
  ['/robots.txt', 200],
  ['/og.png', 200],
  ['/openapi.json', 200],
  ['/SKILL.md', 200],
  ['/wenbu.mjs', 200],
  ['/feed.xml', 200],
  ['/en/feed.xml', 200],
]) {
  const r = await fetchSafe(base + path);
  assert.equal(r.status, expected, path);
  evidence.pages.push({ path, status: r.status });
}
for (const [kind, input] of [
  ['bazi', { date: '2005-12-23', time: '08:37' }],
  ['iching', { lines: [7, 7, 7, 7, 7, 7] }],
  ['tarot', { count: 3 }],
  ['ziwei', { date: '2000-08-16', time: '03:30', sex: 'female' }],
]) {
  const r = await post('/api/v1/' + kind, input);
  const d = await r.json();
  assert.equal(r.status, 200, JSON.stringify(d));
  assert.equal(d.kind, kind);
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
  if (kind === 'bazi')
    assert.deepEqual(
      d.pillars.map((x) => x.value),
      ['乙酉', '戊子', '辛巳', '壬辰'],
    );
  evidence.api.push({ kind, status: r.status });
}
assert.equal((await post('/api/v1/bazi', { date: '2023-02-29' })).status, 422);
assert.equal(
  (await post('/api/v1/bazi', { date: '2000-01-01' }, { Origin: 'https://untrusted.example' })).status,
  403,
);
assert.equal((await post('/api/v1/bazi', { oversize: 'x'.repeat(9000) })).status, 413);
const client = new Client({ name: 'wenbu-release-verification', version: '1.0' });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(base + '/mcp')));
  const listed = await client.listTools();
  assert.equal(listed.tools.length, 4);
  for (const tool of listed.tools) evidence.mcp.push(tool.name);
  const result = await client.callTool({ name: 'cast_iching', arguments: { lines: [7, 7, 7, 7, 7, 7] } });
  assert.equal(result.structuredContent.original.number, 1);
  const resources = await client.listResources();
  assert.ok(resources.resources.some((x) => x.uri === 'wenbu://methodology'));
} finally {
  await client.close();
}
if (process.argv.includes('--ai')) {
  const res = await post('/api/v1/interpret', {
    kind: 'bazi',
    input: { date: '2000-08-16', time: '03:30', timezone: 'Asia/Shanghai' },
    question: 'Synthetic release test: how can a fictional new teammate express ideas clearly?',
    context: 'Fictional quality assurance scenario only.',
    locale: 'en',
    consent: true,
  });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  assert.ok(data.answer.nextSteps.length);
  assert.equal(data.provenance.requestedModel, 'deepseek-v4-flash');
  evidence.ai = { status: res.status, provenance: data.provenance, answerTitle: data.answer.title };
}
evidence.result = 'passed';
evidence.pages.sort((a, b) => a.path.localeCompare(b.path));
const output = process.env.WENBU_EVIDENCE || 'docs/reviews/live-smoke.json';
await writeFile(output, JSON.stringify(evidence, null, 2) + '\n');
console.log(
  JSON.stringify(
    {
      base,
      pages: evidence.pages.length,
      api: evidence.api,
      mcp: evidence.mcp,
      ai: evidence.ai,
      result: evidence.result,
    },
    null,
    2,
  ),
);
