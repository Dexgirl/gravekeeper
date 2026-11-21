// PostFileSave hook: warns the agent if a saved file looks like it contains a secret.
// Gravekeeper promises never to hold keys, so its own repo must never contain any.
import { readStdinJson, targetFiles, readText, rel, IGNORED_DIRS } from './lib.mjs';

const patterns = [
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/, 'GitHub token'],
  [/\bgithub_pat_[A-Za-z0-9_]{60,}\b/, 'GitHub fine-grained token'],
  [/\bnpm_[A-Za-z0-9]{36}\b/, 'npm token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/, 'private key'],
  [/\bsk-(ant-)?[A-Za-z0-9_-]{32,}\b/, 'API secret key'],
  [/authorization:\s*(bearer|token)\s+[A-Za-z0-9._-]{30,}/i, 'hard-coded Authorization header'],
];

const ctx = readStdinJson();
const problems = [];

for (const file of targetFiles(ctx)) {
  const name = rel(file);
  if (IGNORED_DIRS.test(name) || /\.(png|jpe?g|gif|webp|ico|woff2?|zip|lock)$/i.test(name)) continue;
  const text = readText(file);
  if (!text || text.length > 2_000_000) continue;
  for (const [pattern, label] of patterns) {
    if (pattern.test(text)) problems.push(`${name}: looks like a ${label}`);
  }
}

if (problems.length) {
  process.stderr.write(
    'Gravekeeper guard-secrets hook found possible secrets:\n' +
      problems.map((p) => `- ${p}`).join('\n') +
      '\nRemove them now and read tokens from environment variables instead. Never commit credentials.\n',
  );
  process.exit(1);
}
process.exit(0);
