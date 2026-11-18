import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncQaly } from './lib/mackenzie-qaly-sync.mjs';

export function main(argv = process.argv.slice(2), { paperOnly = false } = {}) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  let sourceRepo = resolve(repoRoot, '..', 'mackenzie-scott-qaly');
  let destinationRepo = repoRoot;
  let checkOnly = false;
  for (let index = 0; index < argv.length; index++) {
    const option = argv[index];
    if (option === '--check') checkOnly = true;
    else if (['--source', '--destination'].includes(option) && argv[index + 1] && !argv[index + 1].startsWith('--')) {
      const path = resolve(argv[++index]);
      if (option === '--source') sourceRepo = path;
      else destinationRepo = path;
    } else throw new Error(`Unknown or incomplete option: ${option}`);
  }
  const result = syncQaly({ sourceRepo, destinationRepo, checkOnly, paperOnly });
  if (checkOnly && result.stale.length) {
    console.error(`Stale QALY artifacts (${result.stale.length}):\n${result.stale.join('\n')}`);
    return 1;
  }
  console.log(checkOnly ? `All ${result.count} QALY artifacts match their source.`
    : `Synced ${result.count} QALY artifacts${result.changed ? '.' : ' (already current).'}`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
