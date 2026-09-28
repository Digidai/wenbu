import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const directory = 'public/images/tarot';
const files = (await readdir(directory))
  .filter((name) => name.endsWith('.webp') && !name.includes('-small'))
  .sort();
assert.equal(files.length, 79, '78 distinct cards plus one back are required');
const prompts = JSON.parse(await readFile('docs/art/tarot-prompts.json', 'utf8'));
assert.equal(prompts.assets.length, 78);
const assets = [];
for (const name of files) {
  const bytes = await readFile(`${directory}/${name}`);
  const meta = await sharp(bytes).metadata();
  assert.equal(meta.width, 600, name);
  assert.equal(meta.height, 900, name);
  assert(bytes.length < 250000, `Oversized card: ${name}`);
  if (name !== 'back.webp') {
    assert(
      prompts.assets.some((asset) => `${asset.slug}.webp` === name),
      `Missing prompt: ${name}`,
    );
    const thumbnail = await sharp(`${directory}/${name.replace('.webp', '-small.webp')}`).metadata();
    assert.equal(thumbnail.width, 260, name);
    assert.equal(thumbnail.height, 390, name);
  }
  assets.push({
    file: name,
    width: meta.width,
    height: meta.height,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
}
assert.equal(new Set(assets.map((asset) => asset.sha256)).size, 79, 'No duplicated card images');
await writeFile(
  'docs/art/tarot-assets.json',
  JSON.stringify(
    {
      generatedWith: 'built-in image_gen',
      finalSize: [600, 900],
      thumbnailSize: [260, 390],
      total: files.length,
      assets,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    cards: 78,
    backs: 1,
    thumbnails: 78,
    maxBytes: Math.max(...assets.map((asset) => asset.bytes)),
    totalBytes: assets.reduce((sum, asset) => sum + asset.bytes, 0),
    result: 'passed',
  }),
);
