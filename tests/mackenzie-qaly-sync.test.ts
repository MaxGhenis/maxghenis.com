import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const scratch: string[] = [];
const script = resolve('scripts/sync-mackenzie-qaly.mjs');
const paperScript = resolve('scripts/sync-mackenzie-paper.mjs');
const jsonSources = [
  'web/params.json', 'web/geo.json', 'web/allocation_v10.json',
  'web/allocation_v11.json', 'web/allocation_v12.json', 'results/summary.json',
  'web/matching_diagnostics.json',
];
function put(root: string, relative: string, contents: string | Buffer) {
  const path = join(root, relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'qaly-sync-test-'));
  scratch.push(root);
  const source = join(root, 'source');
  const destination = join(root, 'site');
  for (const path of jsonSources) put(source, path, '{"TEST_FIXTURE":true}\n');
  put(source, 'results/gift_ledger.csv', 'name,estimated_nominal_usd\nTEST_FIXTURE,1\n');
  put(source, 'docs/index.pdf', '%PDF-1.7\nTEST_FIXTURE');
  put(source, 'docs/index.html', '<header id="title-block-header"><h1 class="title">Title</h1><p class="subtitle">Subtitle</p><p>Author</p></header><main class="content"><script>unsafe()</script><img src="../results/figure.png"><img src="index_files/chart.png"><a href="./index-preview.html#cell-1">Notebook</a></main>');
  put(source, 'docs/results/figure.png', Buffer.from([0, 1, 2, 3]));
  put(source, 'docs/index_files/chart.png', Buffer.from([5, 6, 7]));
  return { source, destination };
}
function run(source: string, destination: string, args: string[] = [], entry = script) {
  return spawnSync('bun', [entry, '--source', source, '--destination', destination, ...args], { encoding: 'utf8' });
}
afterEach(() => { for (const root of scratch.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe('QALY source sync', () => {
  it('copies bytes, rewrites paper links, removes scripts and checks without writes', () => {
    const { source, destination } = fixture();
    expect(run(source, destination).status).toBe(0);
    const json = join(destination, 'src/data/mackenzie-qaly-params.json');
    expect(readFileSync(json)).toEqual(readFileSync(join(source, 'web/params.json')));
    const fragment = readFileSync(join(destination, 'src/data/mackenzie-qaly-paper.html'), 'utf8');
    expect(fragment).not.toContain('<script');
    expect(fragment).not.toContain('<h1');
    expect(fragment).toContain('/paper-assets/results/figure.png');
    expect(fragment).toContain('/paper-assets/index_files/chart.png');
    expect(fragment).toContain('https://maxghenis.github.io/mackenzie-scott-qaly/index-preview.html#cell-1');
    expect(run(source, destination, ['--check']).status).toBe(0);
    writeFileSync(json, '{"old":true}');
    const result = run(source, destination, ['--check']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('src/data/mackenzie-qaly-params.json');
    expect(readFileSync(json, 'utf8')).toBe('{"old":true}');
  });

  it('validates the entire source bundle before replacing existing destination data', () => {
    const { source, destination } = fixture();
    expect(run(source, destination).status).toBe(0);
    const original = readFileSync(join(destination, 'src/data/mackenzie-qaly-params.json'));
    put(source, 'web/params.json', '{"new":true}');
    put(source, 'web/geo.json', 'INVALID_JSON');
    expect(run(source, destination).status).toBe(1);
    expect(readFileSync(join(destination, 'src/data/mackenzie-qaly-params.json'))).toEqual(original);
  });

  it('reports and removes obsolete generated assets while preserving unrelated files', () => {
    const { source, destination } = fixture();
    expect(run(source, destination).status).toBe(0);
    put(destination, 'public/mackenzie-scott-qaly/paper-assets/obsolete.png', 'old');
    put(destination, 'public/unrelated.txt', 'keep');
    expect(run(source, destination, ['--check']).status).toBe(1);
    expect(run(source, destination).status).toBe(0);
    expect(run(source, destination, ['--check']).status).toBe(0);
    expect(readFileSync(join(destination, 'public/unrelated.txt'), 'utf8')).toBe('keep');
  });

  it('keeps the existing paper-only entry point portable', () => {
    const { source, destination } = fixture();
    rmSync(join(source, 'web'), { recursive: true });
    expect(run(source, destination, [], paperScript).status).toBe(0);
    expect(run(source, destination, ['--check'], paperScript).status).toBe(0);
  });

  it('preserves the working bundle when a referenced source figure disappears', () => {
    const { source, destination } = fixture();
    expect(run(source, destination).status).toBe(0);
    const image = join(destination, 'public/mackenzie-scott-qaly/paper-assets/results/figure.png');
    const original = readFileSync(image);
    rmSync(join(source, 'docs/results/figure.png'));
    put(source, 'web/params.json', '{"changed":true}');
    for (const args of [[], ['--check']]) {
      const result = run(source, destination, args);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Missing referenced paper asset');
    }
    expect(readFileSync(image)).toEqual(original);
    expect(readFileSync(join(destination, 'src/data/mackenzie-qaly-params.json'), 'utf8'))
      .toBe('{"TEST_FIXTURE":true}\n');
  });
});
