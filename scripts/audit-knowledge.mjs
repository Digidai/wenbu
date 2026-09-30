import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const catalogue = JSON.parse(await readFile('dist/knowledge/index.json', 'utf8'));
assert.equal(catalogue.guides.length, 21);
let editions = 0;
for (const guide of catalogue.guides)
  for (const edition of guide.translations) {
    const local = (url) => 'dist' + new URL(url).pathname;
    const html = await readFile(local(edition.html) + 'index.html', 'utf8');
    const markdown = await readFile(local(edition.markdown), 'utf8');
    const json = JSON.parse(await readFile(local(edition.json), 'utf8'));
    assert.equal(json.id, guide.id);
    assert.ok(html.includes('type="text/markdown"'));
    assert.ok(html.includes('type="application/json"'));
    assert.ok(html.includes('class="knowledge-figure"'));
    for (const section of json.outline)
      assert.ok(html.includes(`id="${section.id}"`), `${guide.slug}: missing visible section ${section.id}`);
    for (const source of json.sources)
      assert.ok(markdown.includes(source.url), `${guide.slug}: missing source`);
    assert.ok(markdown.includes(json.example.conclusion), `${guide.slug}: truncated example`);
    assert.ok(markdown.includes(json.faq.at(-1).answer), `${guide.slug}: truncated FAQ`);
    for (const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
      const graph = JSON.parse(match[1])['@graph'];
      const article = graph.find((x) => x['@type'] === 'Article');
      assert.equal(article.dateModified, json.updated);
      assert.equal(article.url, edition.html);
      assert.equal(article.encoding[0].contentUrl, edition.markdown);
    }
    editions++;
  }
console.log(
  `Knowledge audit passed: ${editions} complete HTML/Markdown/JSON editions, anchors, sources and Article metadata.`,
);
