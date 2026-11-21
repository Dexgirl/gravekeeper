// PostTaskExec hook: appends one line to KIRO_LOG.md each time a spec task finishes.
// Gives judges a precise, automatic record of how Kiro built the project.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readStdinJson, collect, git } from './lib.mjs';

const ctx = readStdinJson() ?? {};
const first = (re) => String(collect(ctx, re)[0] ?? '').replace(/\s+/g, ' ').trim();

const spec = first(/^(spec|spec_?name|specName|feature)$/i);
const id = first(/^(task_?id|taskId|id)$/i);
const title = first(/^(task_?title|taskTitle|title|name|description)$/i);
const stat = git('git diff --shortstat') || git('git diff --cached --shortstat');

const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
const parts = [date, spec || 'spec ?', [id, title].filter(Boolean).join(' ') || 'task finished', stat || 'no diff yet'];
const line = `- ${parts.join(' · ')}\n`;

const file = path.join(ROOT, 'KIRO_LOG.md');
if (!fs.existsSync(file)) fs.writeFileSync(file, '# Kiro build log\n\n## Log\n\n');
fs.appendFileSync(file, line);
process.stdout.write(`Logged to KIRO_LOG.md: ${line}`);
