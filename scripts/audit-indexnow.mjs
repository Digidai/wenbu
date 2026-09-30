import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexNowManifest } from './lib/indexnow.mjs';
const config = JSON.parse(await readFile('src/data/indexnow.json', 'utf8'));
const manifest = JSON.parse(await readFile('dist' + config.manifestPath, 'utf8'));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.deepEqual([...urls].sort(), manifest.pages.map((p) => p.url).sort());
const pages = await Promise.all(
  manifest.pages.map(async (p) => ({
    url: p.url,
    html: await readFile('dist' + new URL(p.url).pathname + 'index.html', 'utf8'),
  })),
);
assert.deepEqual(manifest, indexNowManifest(pages, config.origin));
assert.match(config.key, /^[a-f0-9]{32}$/);
assert.equal(await readFile(`dist/${config.key}.txt`, 'utf8'), config.key);
console.log(
  JSON.stringify({
    result: 'passed',
    pages: pages.length,
    revision: manifest.revision,
    checks: ['sitemap parity', 'deployed HTML fingerprints', 'private route exclusion', 'verification file'],
  }),
);
