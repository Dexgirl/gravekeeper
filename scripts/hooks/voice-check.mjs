// PostFileSave hook for website copy and README: enforces .kiro/steering/voice.md.
// Zero credits: a word list, not a model.
import { readStdinJson, targetFiles, readText, rel } from './lib.mjs';

const banned = [
  [/\bgraveyard\b/i, 'say "morgue" (we are a coroner\'s office, not a cemetery)'],
  [/\bhead ?stones?\b/i, 'use case folders and stamps, not headstones'],
  [/\btombstones?\b/i, 'another Kiroween entry owns the tombstone look'],
  [/\bR\.?I\.?P\.?\b/, 'too flippant for maintainers'],
  [/\bkilled\b/i, 'we report signals, we do not blame'],
  [/\babandoned by\b/i, 'blames a person; say "no human commit since …"'],
  [/\bAI[- ]powered\b/i, 'Gravekeeper uses rules, not AI, at runtime'],
  [/[\u{1F480}\u{2620}]/u, 'no skull emojis'],
];

const ctx = readStdinJson();
const notes = [];
for (const file of targetFiles(ctx)) {
  const name = rel(file);
  if (!/^(web\/src\/.+\.(tsx?|css)|README\.md)$/.test(name)) continue;
  const text = readText(file) ?? '';
  text.split('\n').forEach((line, i) => {
    for (const [pattern, why] of banned) {
      if (pattern.test(line)) notes.push(`${name}:${i + 1}: "${line.trim().slice(0, 80)}" — ${why}`);
    }
  });
}

if (notes.length) {
  process.stderr.write('Voice check (see .kiro/steering/voice.md):\n' + notes.slice(0, 15).map((n) => `- ${n}`).join('\n') + '\nPlease reword these lines.\n');
  process.exit(1);
}
process.exit(0);
