// PreToolUse hook: blocks dangerous shell commands before they run.
// Exit code 2 tells Kiro to refuse the tool call and shows the agent our reason.
import { readStdinJson, collect, allStrings } from './lib.mjs';

const ctx = readStdinJson();
if (!ctx) process.exit(0);

const toolName = String(collect(ctx, /^tool_?name$/i)[0] ?? '');
// Only inspect shell-like tools, so writing docs that mention "git push" is never blocked.
if (!/shell|bash|exec|command|terminal|run/i.test(toolName)) process.exit(0);

const input = ctx.tool_input ?? ctx.toolInput ?? ctx.input ?? ctx;
const commands = collect(input, /^(command|cmd|script|commandLine)$/i).map(String);
const text = (commands.length ? commands : allStrings(input)).join('\n');

const rules = [
  [/\bnpm\s+publish\b/i, 'Publishing to npm is a human decision.'],
  [/\bgit\s+push\b/i, 'Pushing is done by a human after review.'],
  [/\bgit\s+reset\s+--hard\b/i, 'Hard resets can destroy work.'],
  [/\bgit\s+clean\s+-[a-z]*f/i, 'git clean -f deletes untracked files.'],
  [/\brm\s+-[a-z]*r[a-z]*f?\s+(\/|~|\*|\.\s*$|\.\/?\s*$)/i, 'Recursive delete of a root, home or whole folder.'],
  [/\b(rmdir|rd)\s+\/s\b/i, 'Recursive delete on Windows.'],
  [/(curl|wget|iwr|Invoke-WebRequest)[^|\n]*\|\s*(sh|bash|zsh|iex|Invoke-Expression)\b/i, 'Piping a download into a shell.'],
  [/\b(npm|yarn|pnpm)\s+(i|install|add)\b(?![^\n]*--(save-)?dev)[^\n]*\b(axios|octokit|@octokit\/rest|openai|@anthropic-ai\/sdk|langchain)\b/i, 'This dependency is not allowed by .kiro/steering/tech.md.'],
];

for (const [pattern, reason] of rules) {
  if (pattern.test(text)) {
    process.stderr.write(`Blocked by Gravekeeper guard-shell hook: ${reason}\nCommand: ${text.slice(0, 200)}\nAsk the human to run it if it is really needed.\n`);
    process.exit(2);
  }
}
process.exit(0);
