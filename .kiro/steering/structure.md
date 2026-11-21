---
inclusion: always
---

# Project structure

```
gravekeeper/
├── .kiro/                  specs, steering, hooks, settings (always committed)
├── src/
│   ├── core/               PURE logic, no I/O
│   │   ├── shared/         file keys, time math, rank helpers
│   │   ├── coroner/        facts → verdict, causes, evidence, risk
│   │   ├── necromancer/    case file → repair plan (Kiro spec files)
│   │   └── succession/     will schema + succession engine + letter
│   ├── pipeline/           data sources (npm, osv, github, seed), batch runner, writers
│   ├── registry/           GitHub adapter for wills, the daily "tick"
│   ├── mcp/                MCP stdio server
│   └── cli.ts              `gk` command
├── web/                    Vite + React site (reads ../data at build time)
├── data/                   morgue.json, cases/<key>.json, plans/<key>.json, registry.json
├── registry/               wills/<id>.json, state/<id>.json, letters/<id>.md
├── seeds/                  npm-top.txt fallback seed list
├── power/                  Kiro Power: plugin.json, mcp.json, skills/
├── scripts/hooks/          small Node scripts called by .kiro/hooks (zero credits)
├── tests/fixtures/         recorded API responses
├── .github/workflows/      scan.yml, wills.yml, pages.yml
├── .github/ISSUE_TEMPLATE/ register-will.yml
├── GRAVEKEEPER.json        our own will (dogfooding)
├── KIRO_LOG.md             one line per finished Kiro task
└── README.md, LICENSE (MIT)
```

## Naming

- Files: kebab-case (`file-key.ts`). Types: PascalCase. Functions: camelCase verbs (`diagnose`, `renderPlan`).
- Tests sit next to code: `diagnose.test.ts`, `diagnose.prop.test.ts`.
- Package names become file keys with `toFileKey` (`@scope/name` → `@scope__name`). Never build file names by hand.
- A will's id is `<owner>__<repo>`.

## Imports

- `src/core/**` may import only from `src/core/**` and `zod`.
- `web/` may import from `src/core/**` (shared types, engine for the demo, schema for the form). Never from `src/pipeline` or `src/registry`.
