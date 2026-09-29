#!/usr/bin/env node
// Private, paginated exports. No credentials or user records are printed.
import { mkdir, open, readFile, rename } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { setTimeout as pause } from 'node:timers/promises';
const args = new Map(
  process.argv.slice(2).map((arg) => {
    const i = arg.indexOf('=');
    return [arg.slice(0, i), arg.slice(i + 1)];
  }),
);
const kind = args.get('--kind') || 'events';
const output = args.get('--out');
if (!['events', 'feedback', 'archives', 'all'].includes(kind) || !output || !isAbsolute(output))
  throw new Error(
    'Use --kind=events|feedback|archives|all --out=/absolute/private/directory. Optional --days=90 --test=true --operation=UUID.',
  );
const base = args.get('--base') || 'https://wenbu.genedai.me';
if (!/^https:\/\/wenbu\.genedai\.me$/.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base))
  throw new Error('Only the production origin or local preview is supported.');
const token = (
  process.env.WENBU_ANALYTICS_ADMIN_TOKEN ||
  (await readFile(new URL('../.analytics-admin-token', import.meta.url), 'utf8'))
).trim();
if (!token) throw new Error('Administrator token is required.');
await mkdir(output, { recursive: false, mode: 0o700 });
async function request(path) {
  for (let attempt = 0; attempt < 5; attempt++) {
    await pause(1250);
    const r = await fetch(base + '/api/admin/' + path, {
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'error',
      signal: AbortSignal.timeout(60000),
    });
    if (r.ok) return r;
    if (r.status === 429 || r.status >= 500) {
      await pause(Math.min(30000, 2000 * 2 ** attempt));
      continue;
    }
    throw new Error(`Export request failed (${r.status}); partial files are incomplete.`);
  }
  throw new Error('Export paused after repeated server failures; partial files are incomplete.');
}
let total = 0;
for (const type of kind === 'all' ? ['events', 'feedback', 'archives'] : [kind]) {
  const file = resolve(output, `${type}.ndjson`),
    partial = file + '.partial',
    handle = await open(partial, 'wx', 0o600);
  try {
    let cursor = '';
    do {
      const q = new URLSearchParams({
        limit: '100',
        days: args.get('--days') || (type === 'feedback' ? '3650' : '90'),
        test: args.get('--test') || 'false',
        cursor,
      });
      for (const k of [
        'operation',
        'session',
        'conversation',
        'visitor',
        'locale',
        'tool',
        'source',
        'campaign',
        'channel',
        'status',
        'state',
      ])
        if (args.has('--' + k)) q.set(k, args.get('--' + k));
      const page = await (await request(type + '?' + q)).json();
      for (const row of page.rows) {
        await handle.write(JSON.stringify(row) + '\n');
        total++;
        if (type === 'archives') {
          const data = Buffer.from(
            await (await request('archive?key=' + encodeURIComponent(row.key))).arrayBuffer(),
          );
          if (
            createHash('sha256').update(data).digest('hex') !== row.sha256 ||
            data.length !== row.byte_count
          )
            throw new Error('Archive integrity verification failed.');
          const item = await open(resolve(output, row.sha256 + '.ndjson'), 'wx', 0o600);
          try {
            await item.writeFile(data);
          } finally {
            await item.close();
          }
        }
      }
      cursor = page.next || '';
    } while (cursor);
  } finally {
    await handle.close();
  }
  await rename(partial, file);
}
console.log(
  `Export complete: ${total} records/manifests. Private files saved to the selected directory. Deduplicate combined events by id; archive files include test traffic.`,
);
