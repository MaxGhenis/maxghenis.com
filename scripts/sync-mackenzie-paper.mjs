import {
  copyFileSync,
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = '/Users/maxghenis/mackenzie-scott-qaly/docs';
const fragmentPath = join(repoRoot, 'src/data/mackenzie-qaly-paper.html');
const assetRoot = join(
  repoRoot,
  'public/mackenzie-scott-qaly/paper-assets',
);
const paperRoot = join(repoRoot, 'public/mackenzie-scott-qaly/paper');

const sourceHtml = readFileSync(join(sourceRoot, 'index.html'), 'utf8');
const header = sourceHtml.match(
  /<header\b[^>]*\bid=["']title-block-header["'][^>]*>[\s\S]*?<\/header>/i,
)?.[0];
const main = sourceHtml.match(
  /<main\b[^>]*\bclass=["'][^"']*\bcontent\b[^"']*["'][^>]*>[\s\S]*?<\/main>/i,
)?.[0];

if (!header || !main) {
  throw new Error('Could not find the Quarto title header and content main.');
}

const stripScripts = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
const stripTitleElement = (html, tag, className) =>
  html.replace(
    new RegExp(
      `<${tag}\\b(?=[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'])[^>]*>[\\s\\S]*?<\\/${tag}>`,
      'gi',
    ),
    '',
  );
const rewriteAssets = (html) =>
  html
    .replace(
      /(\b(?:src|href)\s*=\s*["'])(?:\.\/)?results\//gi,
      '$1/mackenzie-scott-qaly/paper-assets/results/',
    )
    .replace(
      /(\b(?:src|href)\s*=\s*["'])(?:\.\/)?index_files\//gi,
      '$1/mackenzie-scott-qaly/paper-assets/index_files/',
    );

const cleanHeader = stripTitleElement(
  stripTitleElement(stripScripts(header), 'h1', 'title'),
  'p',
  'subtitle',
);
const fragment = `${rewriteAssets(cleanHeader)}\n${rewriteAssets(
  stripScripts(main),
)}`.replace(/[ \t]+$/gm, '') + '\n';

mkdirSync(dirname(fragmentPath), { recursive: true });
writeFileSync(fragmentPath, fragment);

rmSync(assetRoot, { recursive: true, force: true });
mkdirSync(assetRoot, { recursive: true });
cpSync(join(sourceRoot, 'results'), join(assetRoot, 'results'), {
  recursive: true,
});
cpSync(join(sourceRoot, 'index_files'), join(assetRoot, 'index_files'), {
  recursive: true,
});

mkdirSync(paperRoot, { recursive: true });
copyFileSync(join(sourceRoot, 'index.pdf'), join(paperRoot, 'index.pdf'));

console.log(`Synced paper fragment to ${fragmentPath}`);
