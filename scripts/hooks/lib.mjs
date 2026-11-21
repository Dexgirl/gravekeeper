// Shared helpers for Gravekeeper's Kiro hook scripts.
// These scripts run as "command" hooks, so they cost zero Kiro credits.
// They must be fast, dependency-free and cross-platform (Windows, macOS, Linux).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export const ROOT = process.cwd();

/** Read the hook context Kiro sends on stdin. Returns null if there is none. */
export function readStdinJson() {
  if (process.stdin.isTTY) return null;
  try {
    const raw = fs.readFileSync(0, 'utf8');
    return raw.trim() ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Recursively collect values whose key matches `keyPattern`. */
export function collect(value, keyPattern, out = []) {
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (keyPattern.test(key) && (typeof child === 'string' || typeof child === 'number')) out.push(child);
      collect(child, keyPattern, out);
    }
  }
  return out;
}

/** Recursively collect every string in a value. */
export function allStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (value && typeof value === 'object') for (const child of Object.values(value)) allStrings(child, out);
  return out;
}

/** Files the hook is about: paths found in the context that exist on disk, else files changed in git. */
export function targetFiles(ctx) {
  const fromCtx = allStrings(ctx ?? {})
    .filter((s) => s.length < 500 && /[\\/]|\.\w+$/.test(s))
    .map((s) => (path.isAbsolute(s) ? s : path.join(ROOT, s)))
    .filter((p) => {
      try { return fs.statSync(p).isFile(); } catch { return false; }
    });
  if (fromCtx.length) return [...new Set(fromCtx)];
  return changedFiles();
}

export function changedFiles() {
  const out = git('git status --porcelain');
  if (!out) return [];
  return out
    .split('\n')
    .map((line) => line.slice(3).trim().replace(/^"|"$/g, ''))
    .filter(Boolean)
    .map((p) => path.join(ROOT, p.includes(' -> ') ? p.split(' -> ')[1] : p))
    .filter((p) => {
      try { return fs.statSync(p).isFile(); } catch { return false; }
    });
}

export function git(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

export function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

export function readText(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

export const IGNORED_DIRS = /(^|\/)(node_modules|dist|\.git|web\/public\/data)(\/|$)/;
