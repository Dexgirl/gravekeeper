// PostFileSave hook on package.json: Gravekeeper checks its own dependencies (dogfooding).
// Reads data/morgue.json; prints DORMANT/DEAD dependencies into the agent's context. Always exits 0.
import path from 'node:path';
import { ROOT, readText } from './lib.mjs';

const morgue = JSON.parse(readText(path.join(ROOT, 'data', 'morgue.json')) ?? 'null');
const pkg = JSON.parse(readText(path.join(ROOT, 'package.json')) ?? 'null');
if (!morgue?.rows || !pkg) process.exit(0);

const deps = new Set(
  ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].flatMap((k) => Object.keys(pkg[k] ?? {})),
);
const flagged = morgue.rows.filter((r) => deps.has(r.name) && (r.verdict === 'DORMANT' || r.verdict === 'DEAD'));

if (flagged.length) {
  process.stdout.write(
    'Gravekeeper deps-check: these dependencies look unmaintained:\n' +
      flagged.map((r) => `- ${r.name}: ${r.verdict}${r.causes?.length ? ` (${r.causes.join(', ')})` : ''}`).join('\n') +
      '\nConsider an alternative, or run `npm run gk -- plan <name> --out revive/` to get a repair plan.\n',
  );
} else {
  process.stdout.write(`Gravekeeper deps-check: none of ${deps.size} dependencies are in the morgue as DORMANT or DEAD.\n`);
}
process.exit(0);
