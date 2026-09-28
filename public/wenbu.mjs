#!/usr/bin/env node
// Wenbu CLI · Node.js 22+ · MIT · No dependencies, account or API key.
import { readFile } from 'node:fs/promises';
const [command, arg, ...extra] = process.argv.slice(2);
if (!command || ['help', '--help', '-h'].includes(command)) {
  console.log(
    'Wenbu CLI\n\n  node wenbu.mjs bazi \'{"date":"2000-08-16","time":"03:30","timezone":"Asia/Shanghai"}\'\n  node wenbu.mjs iching \'{}\'\n  node wenbu.mjs tarot \'{"count":3}\'\n  node wenbu.mjs ziwei --file private-input.json\n  cat private-input.json | node wenbu.mjs bazi -\n\nUse a file or stdin to keep personal information out of shell history.\nWENBU_URL may select another HTTPS deployment or a local development server.\nThese tools calculate cultural symbols, not factual predictions.',
  );
  process.exit(0);
}
if (!['bazi', 'iching', 'tarot', 'ziwei'].includes(command)) throw new Error('Unknown tool. Run --help.');
try {
  const base = new URL(process.env.WENBU_URL || 'https://wenbu.genedai.me');
  if (
    base.protocol !== 'https:' &&
    !(base.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname))
  )
    throw new Error('Use HTTPS or a local development endpoint.');
  if (base.username || base.password || base.search || base.hash || base.pathname !== '/')
    throw new Error('WENBU_URL must be an origin without credentials or a path.');
  let raw = arg || '{}';
  if (arg === '--file') {
    if (!extra[0] || extra.length > 1) throw new Error('Provide one input file.');
    raw = await readFile(extra[0], 'utf8');
  } else if (arg === '-') {
    if (extra.length) throw new Error('Unexpected argument.');
    raw = '';
    for await (const chunk of process.stdin) {
      raw += chunk;
      if (Buffer.byteLength(raw) > 8192) throw new Error('Input exceeds 8192 bytes.');
    }
  } else if (extra.length) throw new Error('Unexpected argument.');
  if (Buffer.byteLength(raw) > 8192) throw new Error('Input exceeds 8192 bytes.');
  const input = JSON.parse(raw);
  const res = await fetch(new URL('/api/v1/' + command, base), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'HTTP ' + res.status);
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
} catch (e) {
  console.error('Wenbu: ' + e.message);
  process.exitCode = 1;
}
