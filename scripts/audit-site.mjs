import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
const site = (process.env.SITE_URL || 'https://wenbu.app').replace(/\/$/, '');
async function walk(d) {
  const out = [];
  for (const f of await readdir(d, { withFileTypes: true })) {
    const p = join(d, f.name);
    if (f.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}
const files = await walk('dist'),
  htmlFiles = files.filter((x) => x.endsWith('.html')),
  errors = [];
const exists = async (p) => {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
};
let links = 0;
for (const f of htmlFiles) {
  const html = await readFile(f, 'utf8');
  const url = f === 'dist/404.html' ? '/404/' : '/' + f.slice(5).replace(/index.html$/, '');
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
  if (canonical !== site + url) errors.push(f + ': wrong canonical ' + canonical);
  if (!/<meta name="description" content="[^"]{25,}"/.test(html))
    errors.push(f + ': missing/short description');
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) errors.push(f + ': must have one h1');
  if (!/<html lang="(en|zh-Hans)"/.test(html)) errors.push(f + ': language missing');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      errors.push(f + ': invalid JSON-LD');
    }
  }
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)[^"]*"/g)) {
    const path = decodeURIComponent(m[1]);
    if (path.startsWith('//')) continue;
    links++;
    const dest = 'dist' + path + (path.endsWith('/') ? 'index.html' : '');
    if (!(await exists(dest))) errors.push(f + ': broken asset/link ' + path);
  }
  if (!f.endsWith('/404.html')) {
    for (const lang of ['zh-Hans', 'en', 'x-default']) {
      const alt = html.match(new RegExp('hreflang="' + lang + '" href="([^"]+)"'))?.[1];
      if (!alt?.startsWith(site + '/')) errors.push(f + ': missing alternate ' + lang);
      else {
        const altPath = 'dist' + new URL(alt).pathname + 'index.html';
        if (!(await exists(altPath))) errors.push(f + ': missing alternate destination ' + alt);
      }
    }
  }
}
const robots = await readFile('dist/robots.txt', 'utf8');
if (!robots.includes('Sitemap: ' + site + '/sitemap.xml')) errors.push('Sitemap missing from robots');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
if (sitemap.includes('/journal/') || sitemap.includes('/404/') || sitemap.includes('/move/'))
  errors.push('Private/noindex pages in sitemap');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    JSON.stringify(
      {
        pages: htmlFiles.length,
        internalReferencesChecked: links,
        indexablePages: (sitemap.match(/<loc>/g) || []).length,
        result: 'passed',
      },
      null,
      2,
    ),
  );
