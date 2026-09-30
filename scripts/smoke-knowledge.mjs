import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const base = (process.env.WENBU_URL || 'https://wenbu.app').replace(/\/$/, '');
const request = async (path) =>
  fetch(base + path, { headers: { 'X-Wenbu-Test': 'true' }, signal: AbortSignal.timeout(30000) });
const indexResponse = await request('/knowledge/index.json');
assert.equal(indexResponse.status, 200);
const index = await indexResponse.json();
assert.deepEqual(index, JSON.parse(await readFile('dist/knowledge/index.json', 'utf8')));
const results = [];
const editions = index.guides.flatMap((g) => g.translations);
for (let i = 0; i < editions.length; i += 4)
  await Promise.all(
    editions.slice(i, i + 4).map(async (edition) => {
      for (const [key, mime] of [
        ['markdown', 'text/markdown'],
        ['json', 'application/json'],
      ]) {
        const path = new URL(edition[key]).pathname;
        const response = await request(path);
        const content = await response.text();
        assert.equal(response.status, 200, path);
        assert.ok(response.headers.get('content-type')?.includes(mime), path);
        assert.equal(response.headers.get('link'), `<${edition.html}>; rel="canonical"`, path);
        assert.equal(
          content,
          await readFile('dist' + path, 'utf8'),
          `${path}: must match this build completely`,
        );
        results.push({ path, status: 200, characters: content.length });
      }
    }),
  );
const mcp = async (method, params) => {
  const response = await fetch(base + '/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'X-Wenbu-Test': 'true',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.ok(!result.error && !result.result?.isError);
  return result.result;
};
const resource = await mcp('resources/read', { uri: 'wenbu://knowledge' });
assert.deepEqual(JSON.parse(resource.contents[0].text), index);
const sections = [];
for (const section of ['worked-example', 'questions']) {
  const result = await mcp('tools/call', {
    name: 'read_library',
    arguments: { id: 'guide-bazi-basics', locale: 'en', section },
  });
  const doc = result.structuredContent;
  assert.equal(doc.source.id, `guide-bazi-basics#${section}`);
  assert.equal(doc.scope, 'section');
  assert.equal(doc.truncated, false);
  assert.ok(doc.source.url.endsWith('#' + section));
  sections.push(doc.source.id);
}
const missing = await request('/knowledge/en/does-not-exist.md');
assert.equal(missing.status, 404);
const evidence = {
  base,
  checkedAt: new Date().toISOString(),
  editions: editions.length,
  resources: results.length + 1,
  results,
  mcp: { catalogue: true, distinctSections: sections },
  unknownGuide: 404,
};
if (process.env.WENBU_EVIDENCE)
  await writeFile(process.env.WENBU_EVIDENCE, JSON.stringify(evidence, null, 2) + '\n');
console.log(
  JSON.stringify(
    {
      base,
      editions: evidence.editions,
      resources: evidence.resources,
      mcp: evidence.mcp,
      unknownGuide: 404,
      result: 'passed',
    },
    null,
    2,
  ),
);
