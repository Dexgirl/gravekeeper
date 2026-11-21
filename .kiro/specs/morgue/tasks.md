# Implementation Plan: Morgue

- [ ] 1. Scaffold the project
  - Create `package.json` (`"type": "module"`, `"bin": { "gk": "dist/cli.js", "gravekeeper-mcp": "dist/mcp/server.js" }`, a `prepare` script that runs the build) with scripts `test`, `test:core`, `typecheck`, `build`, `gk` (tsx), `web:dev`, `web:build` as described in `tech.md`
  - Add dev dependencies: typescript, tsx, vitest, fast-check, @types/node; dependency: zod
  - Add `tsconfig.json` (strict, ES2022, NodeNext), `vitest.config.ts`, `.gitignore` (node_modules, dist, web/dist; do NOT ignore `.kiro/`), MIT `LICENSE`
  - Create the empty folders from `structure.md` with a `.gitkeep` where needed
  - Run `npm install` and `npm test` (zero tests is fine)
  - _Requirements: 6.1_

- [ ] 2. Shared helpers
- [ ] 2.1 Implement `toFileKey` / `fromFileKey` in `src/core/shared/file-key.ts`
  - Follow the three encoding steps and the rejection rules in design.md
  - Example tests: `left-pad`, `@babel/core`, `JSONStream`, `con`, `_con`
  - _Requirements: 5.2_
- [ ] 2.2 Write property test for file keys
  - **Property 10: File keys round trip safely**
  - Build `arbPackageName` in `src/core/shared/arbitraries.ts` (scoped, unscoped, legacy mixed-case) so later tests can reuse it
  - **Validates: Requirements 5.2**
- [ ] 2.3 Implement `daysBetween` and `monthsBetween` in `src/core/shared/time.ts` with example tests
  - _Requirements: 2.1_

- [ ] 3. The Coroner
- [ ] 3.1 Define types and the zod schema for `Facts` in `src/core/coroner/types.ts`
  - Include `VERDICT_RANK` and `rulesVersion`
  - _Requirements: 2.1_
- [ ] 3.2 Implement cause detection in `src/core/coroner/causes.ts`
  - One small function per cause code; each returns the cause with evidence built only from known facts
  - Plain-language summaries in `src/core/coroner/summaries.ts` (follow `voice.md`)
  - _Requirements: 1.2, 2.2, 2.6, 2.7_
- [ ] 3.3 Implement `diagnose` in `src/core/coroner/diagnose.ts`
  - Age signal fallback, verdict table, confidence, time of death
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.7, 2.9_
- [ ] 3.4 Implement the risk score in `src/core/coroner/risk.ts`
  - _Requirements: 2.8_
- [ ] 3.5 Build `arbFacts` and `arbNow` in `src/core/coroner/arbitraries.ts`
  - Every field independently known or unknown; dates 2012-01-01 to 2026-11-01; `arbNow` always after every generated date
  - _Requirements: 2.1_
- [ ] 3.6 Write property tests for the Coroner
  - **Property 1: Every cause has evidence**
  - **Property 2: Verdict follows the rule table**
  - **Property 3: Age never improves a verdict**
  - **Property 5: Risk is sane**
  - **Property 6: Unknown facts are never evidence**
  - **Validates: Requirements 1.2, 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8**
- [ ] 3.7 Add four example fixtures (one per verdict) in `tests/fixtures/cases/` with expected case files
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 4. Checkpoint: `npm run test:core` and `npm run typecheck` pass. Stop and report if not.

- [ ] 5. The Necromancer
- [ ] 5.1 Implement the plan model and `EARS` regex in `src/core/necromancer/plan.ts`
  - Small helpers `when(cond, subject, action)`, `ifThen(...)`, `the(subject, action)` that always produce valid EARS sentences
  - _Requirements: 3.3_
- [ ] 5.2 Implement cause templates in `src/core/necromancer/templates/` (one file per cause group, per the mapping table)
  - Baseline requirement first; migration requirement first when a replacement is named
  - _Requirements: 3.1, 3.2, 3.5_
- [ ] 5.3 Implement `prescribe` in `src/core/necromancer/prescribe.ts`
  - Return `not_needed` with a friendly note for ALIVE and RESTING
  - _Requirements: 3.1, 3.6, 3.7_
- [ ] 5.4 Implement `renderPlan` and `parsePlan` in `src/core/necromancer/render.ts`
  - Output paths exactly as in Requirement 3.1; `tasks.md` uses numbered checkbox lines (`1.1 Title`) with a requirements-reference line under each task, in the same format as this file
  - Include the `revival.md` steering file with `inclusion: always` front matter
  - _Requirements: 3.1, 3.3, 3.4_
- [ ] 5.5 Write property tests for the Necromancer
  - **Property 4: Determinism** (covers `diagnose` and `prescribe`)
  - **Property 7: Plans cover every cause**
  - **Property 8: Plans are valid Kiro specs**
  - **Property 9: Render/parse round trip**
  - **Validates: Requirements 2.5, 3.1, 3.2, 3.3, 3.4, 3.6**

- [ ] 6. Checkpoint: all core tests pass. Stop and report if not.

- [ ] 7. Data sources
- [ ] 7.1 Implement `makeHttp` in `src/pipeline/http.ts`
  - User-Agent, pacing delay, 3 retries with exponential backoff on 429/5xx, `Retry-After` (seconds or date), no retry on 404, optional `GITHUB_TOKEN`
  - Tests with a fake `fetch`
  - _Requirements: 1.3, 1.6, 4.5_
- [ ] 7.2 Implement `npmFacts` and `downloadsBulk` in `src/pipeline/sources/npm.ts` with fixture tests
  - Scoped-name URL encoding, repository URL normalisation, deprecation message, maintainers count
  - _Requirements: 1.1, 1.2, 1.4_
- [ ] 7.3 Implement `githubFacts` in `src/pipeline/sources/github.ts` with fixture tests
  - Archived, open issues + PRs, latest human commit (skip `[bot]` logins and `type: "Bot"`), 404 → `repoMissing: true`
  - _Requirements: 1.1, 1.4, 1.5_
- [ ] 7.4 Implement `osvFacts` in `src/pipeline/sources/osv.ts` with fixture tests
  - One `querybatch` per batch; details fetched once per id; map severity and first fixed version
  - _Requirements: 1.1, 1.2_
- [ ] 7.5 Implement seed loading in `src/pipeline/sources/seed.ts`
  - First, call the ecosyste.ms endpoint once by hand and save the response as a fixture. If the shape differs from `tech.md`, adapt the parser and note it in `KIRO_LOG.md`
  - Add `seeds/npm-top.txt` with 100 well-known package names as the fallback
  - _Requirements: 4.4_
- [ ] 7.6 Implement `gatherFacts(names)` in `src/pipeline/gather.ts` combining all sources into validated `Facts`
  - A failing source only makes its own fields unknown
  - _Requirements: 1.1, 1.3_

- [ ] 8. Batch runner
- [ ] 8.1 Implement `runBatches` with checkpoint in `src/pipeline/batch.ts`
  - _Requirements: 4.1, 4.2, 4.3_
- [ ] 8.2 Write property test for batching
  - **Property 11: Batches run exactly once**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 9. Writers
  - Implement `src/pipeline/write.ts`: case files, plan files, and a full rebuild of `data/morgue.json` from all case files
  - Unit test in a temp directory
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 10. The `gk` CLI
- [ ] 10.1 Implement `gk scan`, `gk case`, `gk plan` in `src/cli.ts` (no CLI framework, a small argument parser is enough)
  - _Requirements: 6.1, 6.2, 6.3, 6.5_
- [ ] 10.2 Implement `gk deps-check <package.json>`
  - Reads `data/morgue.json`; prints one line per DORMANT/DEAD dependency with its verdict and top cause; always exits 0
  - _Requirements: 6.4_
- [ ] 10.3 Smoke test: `gk case` on a fixture prints a verdict line
  - _Requirements: 6.2_

- [ ] 11. First real scan (manual checkpoint)
  - Run `npm run gk -- scan --limit 100 --batch-size 50`
  - Open 5 case files by hand (at least one DEAD and one RESTING) and check that each verdict and its evidence links make sense
  - Commit `data/` and add a line to `KIRO_LOG.md` with the totals
  - _Requirements: 4.1, 5.1, 5.3_

- [ ] 12. Scheduled refresh workflow
  - `.github/workflows/scan.yml`: weekly cron plus `workflow_dispatch` (inputs: limit, batch size); `permissions: contents: write`; `concurrency: scan`; commits after each batch
  - _Requirements: 7.1, 7.2_

- [ ] 13. Final checkpoint: `npm test` and `npm run typecheck` pass; tick every finished task.
