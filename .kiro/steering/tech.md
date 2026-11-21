---
inclusion: always
---

# Tech stack and rules

## Stack (do not add other runtime dependencies without asking)

- Node.js 20+ and TypeScript (strict, ESM, `"type": "module"`).
- Tests: Vitest + fast-check. Property tests live in `*.prop.test.ts`.
- Validation: zod.
- Scripts and CLI: `tsx` to run TypeScript directly in dev; `tsc` builds to `dist/`.
- Website: Vite + React + TypeScript + `react-router-dom` (HashRouter, so GitHub Pages works without a server). Plain CSS with variables, no CSS framework.
- Zip downloads in the browser: JSZip.
- MCP server: `@modelcontextprotocol/sdk` (stdio transport).
- HTTP: built-in `fetch`. No axios, no Octokit.
- Hosting: GitHub Pages. Automation: GitHub Actions with the built-in `GITHUB_TOKEN` only.

## Hard constraints

- **No runtime AI calls.** Diagnosis and repair plans come from rules and templates.
- **No servers, no database.** Data is JSON files committed to the repo.
- **`src/core/` is pure.** No network, no file system, no `Date.now()`. Time is passed in as an ISO string. This is what makes property tests possible.
- All I/O lives in `src/pipeline/`, `src/registry/`, `src/mcp/` and `src/cli.ts`, behind small interfaces that tests can fake.
- Tests never touch the live network. Use recorded fixtures in `tests/fixtures/`.

## Data sources (public, free)

| Data | Endpoint |
|---|---|
| npm package document | `https://registry.npmjs.org/<name>` (scoped: encode `/` as `%2F`) |
| Weekly downloads | `https://api.npmjs.org/downloads/point/last-week/<name>` (comma-separated bulk for unscoped names, max 128) |
| Vulnerabilities | `POST https://api.osv.dev/v1/querybatch`, details at `https://api.osv.dev/v1/vulns/<id>` |
| Repo metadata | `https://api.github.com/repos/<owner>/<repo>` |
| Recent commits | `https://api.github.com/repos/<owner>/<repo>/commits?per_page=50` |
| Seed list | `https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages?sort=downloads&order=desc&per_page=100&page=<n>` (verify shape before relying on it; fall back to `seeds/npm-top.txt`) |

Every request sends `User-Agent: gravekeeper (+https://github.com/<owner>/gravekeeper)`. Pace requests (default 250 ms), retry 3 times with exponential backoff, honour `Retry-After`. Use `GITHUB_TOKEN` from the environment when present.

## Commands

- `npm test` — all tests once.
- `npm run test:core` — `vitest run src/core`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run gk -- <command>` — run the CLI with tsx.
- `npm run web:dev` / `npm run web:build`.

## Property tests

- At least 200 runs per property; 1,000 for the succession engine.
- Name each test after its property, e.g. `Property 3: age never improves a verdict`.
- When a property fails, fix the code, not the property, unless the property contradicts the requirement. Then stop and ask.
