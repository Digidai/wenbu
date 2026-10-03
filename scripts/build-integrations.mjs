import { mkdir, mkdtemp, readFile, writeFile, copyFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = new URL('../', import.meta.url);
const version = JSON.parse(await readFile(new URL('package.json', root), 'utf8')).version;
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Expected a stable release version.');
const args = process.argv.slice(2);
if (args.length && (args[0] !== '--out' || args.length !== 2)) throw new Error('Use --out <new-directory>.');
const out = args.length ? resolve(args[1]) : await mkdtemp(join(tmpdir(), 'wenbu-integrations-'));
if (args.length) await mkdir(out); // Refuse overwriting a prior release.
const stage = await mkdtemp(join(tmpdir(), 'wenbu-package-'));
await mkdir(join(stage, 'package'));
for (const file of ['wenbu.mjs'])
  await copyFile(new URL('public/' + file, root), join(stage, 'package', file));
await chmod(join(stage, 'package/wenbu.mjs'), 0o755);
await copyFile(new URL('LICENSE', root), join(stage, 'package/LICENSE'));
await copyFile(new URL('integrations/cli/README.md', root), join(stage, 'package/README.md'));
await writeFile(
  join(stage, 'package/package.json'),
  JSON.stringify(
    {
      name: 'wenbu-cli',
      version,
      type: 'module',
      bin: { wenbu: 'wenbu.mjs' },
      license: 'MIT',
      description:
        'Free Wenbu calculations and complete learning content, with an explicit optional AI workflow.',
      engines: { node: '>=22.12.0' },
      homepage: 'https://wenbu.app/en/agents/',
      repository: { type: 'git', url: 'https://github.com/wenbu-app/wenbu.git' },
    },
    null,
    2,
  ) + '\n',
);
const cli = `wenbu-cli-${version}.tgz`;
execFileSync('tar', ['-czf', join(out, cli), '-C', stage, 'package']);
for (const [name, folder] of [
  ['skill', 'skills/wenbu'],
  ['mcp', 'integrations/mcp'],
]) {
  execFileSync('tar', [
    '-czf',
    join(out, `wenbu-${name}-${version}.tgz`),
    '-C',
    new URL('.', root).pathname,
    folder,
    'LICENSE',
  ]);
}
const names = [cli, `wenbu-skill-${version}.tgz`, `wenbu-mcp-${version}.tgz`];
await writeFile(
  join(out, 'SHA256SUMS'),
  (
    await Promise.all(
      names.map(
        async (name) =>
          createHash('sha256')
            .update(await readFile(join(out, name)))
            .digest('hex') +
          '  ' +
          name,
      ),
    )
  ).join('\n') + '\n',
);
console.log(JSON.stringify({ version, out, artifacts: [...names, 'SHA256SUMS'] }));
