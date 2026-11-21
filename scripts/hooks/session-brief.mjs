// SessionStart hook: prints a short progress brief that Kiro adds to its context.
// Saves credits: the agent knows where it is without re-reading every spec.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readText } from './lib.mjs';

const specsDir = path.join(ROOT, '.kiro', 'specs');
const lines = ['Gravekeeper progress brief (from .kiro/specs/*/tasks.md):'];

let specs = [];
try { specs = fs.readdirSync(specsDir).filter((d) => fs.existsSync(path.join(specsDir, d, 'tasks.md'))); } catch {}

for (const spec of specs.sort()) {
  const text = readText(path.join(specsDir, spec, 'tasks.md')) ?? '';
  const tasks = [...text.matchAll(/^\s*- \[( |x|X|-)\](\*)? (.+)$/gm)];
  const done = tasks.filter((m) => m[1].toLowerCase() === 'x').length;
  const next = tasks.find((m) => m[1] === ' ' && !m[2]);
  lines.push(`- ${spec}: ${done}/${tasks.length} done${next ? ` · next: ${next[3].slice(0, 90)}` : ' · complete'}`);
}

const log = readText(path.join(ROOT, 'KIRO_LOG.md'));
if (log) {
  const entries = log.split('\n').filter((l) => /^- \d{4}-\d{2}-\d{2}/.test(l)).slice(-3);
  if (entries.length) lines.push('Last finished tasks:', ...entries);
}

lines.push('Rules: one task at a time; narrowest test first; stop and summarise if blocked (see .kiro/steering/credits.md).');
process.stdout.write(lines.join('\n') + '\n');
