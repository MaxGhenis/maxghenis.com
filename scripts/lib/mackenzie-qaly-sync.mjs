import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const JSON_COPIES = [
  ['web/params.json', 'src/data/mackenzie-qaly-params.json'],
  ['web/geo.json', 'src/data/mackenzie-qaly-geo.json'],
  ['web/allocation_v10.json', 'src/data/mackenzie-qaly-allocation-v10.json'],
  ['web/allocation_v11.json', 'src/data/mackenzie-qaly-allocation-v11.json'],
  ['web/allocation_v12.json', 'src/data/mackenzie-qaly-allocation-v12.json'],
  ['results/summary.json', 'src/data/mackenzie-qaly-summary.json'],
  ['web/matching_diagnostics.json', 'src/data/mackenzie-qaly-matching-diagnostics.json'],
];

export function paperFragment(html) {
  const header = html.match(/<header\b[^>]*\bid=["']title-block-header["'][^>]*>[\s\S]*?<\/header>/i)?.[0];
  const main = html.match(/<main\b[^>]*\bclass=["'][^"']*\bcontent\b[^"']*["'][^>]*>[\s\S]*?<\/main>/i)?.[0];
  if (!header || !main) throw new Error('Could not find the Quarto title header and content main.');
  const stripScripts = (text) => text.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  const stripTitle = (text, tag, className) => text.replace(new RegExp(
    `<${tag}\\b(?=[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'])[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
  const cleanHeader = stripTitle(stripTitle(stripScripts(header), 'h1', 'title'), 'p', 'subtitle');
  return `${cleanHeader}\n${stripScripts(main)}`
    .replace(/(\b(?:src|href)\s*=\s*["'])(?:\.\.\/|\.\/)?results\//gi,
      '$1/mackenzie-scott-qaly/paper-assets/results/')
    .replace(/(\b(?:src|href)\s*=\s*["'])(?:\.\/)?index_files\//gi,
      '$1/mackenzie-scott-qaly/paper-assets/index_files/')
    .replace(/(\bhref\s*=\s*["'])(?:\.\/)?index-preview\.html(?=["'#?])/gi,
      '$1https://maxghenis.github.io/mackenzie-scott-qaly/index-preview.html')
    .replace(/[ \t]+$/gm, '') + '\n';
}

function filesBelow(root, prefix = '') {
  return readdirSync(join(root, prefix), { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const name = join(prefix, entry.name);
      if (entry.isDirectory()) return filesBelow(root, name);
      if (!entry.isFile()) throw new Error(`Expected a regular source file: ${join(root, name)}`);
      return [name];
    });
}

export function buildPlan(sourceRepo, { paperOnly = false } = {}) {
  const files = new Map();
  if (!paperOnly) {
    for (const [source, destination] of JSON_COPIES) {
      const bytes = readFileSync(join(sourceRepo, source));
      JSON.parse(bytes.toString('utf8')); // Validate every input before any destination write.
      files.set(destination, bytes);
    }
    files.set('public/mackenzie-scott-qaly/gift-ledger.csv',
      readFileSync(join(sourceRepo, 'results/gift_ledger.csv')));
  }
  const docs = join(sourceRepo, 'docs');
  files.set('src/data/mackenzie-qaly-paper.html',
    Buffer.from(paperFragment(readFileSync(join(docs, 'index.html'), 'utf8'))));
  files.set('public/mackenzie-scott-qaly/paper/index.pdf', readFileSync(join(docs, 'index.pdf')));
  for (const folder of ['results', 'index_files']) {
    for (const file of filesBelow(join(docs, folder))) {
      files.set(join('public/mackenzie-scott-qaly/paper-assets', folder, file),
        readFileSync(join(docs, folder, file)));
    }
  }
  const fragment = files.get('src/data/mackenzie-qaly-paper.html').toString('utf8');
  const prefix = '/mackenzie-scott-qaly/paper-assets/';
  for (const match of fragment.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    if (!match[1].startsWith(prefix)) continue;
    const relative = decodeURIComponent(match[1].split(/[?#]/)[0].slice(1));
    if (!files.has(join('public', relative))) {
      throw new Error(`Missing referenced paper asset: ${relative}`);
    }
  }
  return files;
}

export function syncQaly({ sourceRepo, destinationRepo, checkOnly = false, paperOnly = false }) {
  const files = buildPlan(resolve(sourceRepo), { paperOnly });
  const destination = resolve(destinationRepo);
  const stale = [];
  for (const [relative, expected] of files) {
    try {
      if (!readFileSync(join(destination, relative)).equals(expected)) stale.push(relative);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      stale.push(relative);
    }
  }
  const assetRoot = 'public/mackenzie-scott-qaly/paper-assets';
  let extra = [];
  try {
    extra = filesBelow(join(destination, assetRoot))
      .map((file) => join(assetRoot, file)).filter((file) => !files.has(file));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (checkOnly) return { changed: false, stale: [...stale, ...extra], count: files.size };
  // All source inputs have parsed/read successfully before replacing task-owned assets.
  for (const relative of extra) rmSync(join(destination, relative));
  for (const relative of stale) {
    const target = join(destination, relative);
    mkdirSync(dirname(target), { recursive: true });
    const pending = target + '.tmp';
    writeFileSync(pending, files.get(relative));
    // Rename keeps each destination complete if the copy process stops.
    // The complete set remains a git-reviewed bundle, not a filesystem transaction.
    renameSync(pending, target);
  }
  return { changed: stale.length > 0 || extra.length > 0, stale, count: files.size };
}
