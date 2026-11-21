# Implementation Plan: Surfaces

Run this spec after the Morgue spec (needs `data/`) and after Will tasks 1–2 (needs the schema and engine).

- [ ] 1. Site scaffold
- [ ] 1.1 Create the Vite + React + TypeScript app in `web/` with HashRouter and the routes from design.md
  - `npm run web:dev` / `web:build` from the root; `scripts/copy-data.mjs` copies `data/` to `web/public/data/` before build
  - Vite `base` set for GitHub Pages (`/gravekeeper/`)
  - Vite alias `@core` → `../src/core` (and `server.fs.allow` for the parent folder) so the site reuses the pure core
  - No analytics or third-party scripts; fonts self-hosted
  - _Requirements: 1.1, 1.2, 1.4_
- [ ] 1.2 Add design tokens, fonts and global styles in `web/src/styles/` per `voice.md`
  - _Requirements: 1.3_
- [ ] 1.3 Build `Layout`, `Intern`, `Stamp`, `ToeTag`, `CaseFolder`
  - `Stamp` always renders the verdict word; reduced-motion respected
  - _Requirements: 1.3, 1.5, 3.1_
- [ ] 1.4 Implement `useJson` with cache, loading state (Intern line), error state with retry
  - _Requirements: 1.2, 1.5_

- [ ] 2. Home page
  - Headline, explanation, two actions, live totals with scan date, top-3 risk folders, credits
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Morgue list
  - Folders grid, verdict filter, name search, sort; state in the URL query; default DORMANT+DEAD by risk
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Case page
- [ ] 4.1 Build `DeathCertificate` and `EvidenceList`; partial-confidence notice
  - _Requirements: 4.1, 4.2, 4.5_
- [ ] 4.2 Build `PlanPreview` with file tabs, zip download (`buildZip` as a plain function) and the three Kiro steps; "no revival needed" note for ALIVE/RESTING
  - _Requirements: 4.3, 4.4_
- [ ] 4.3 Write property test for the zip
  - **Property S4: The zip is the plan**
  - **Validates: Requirements 4.3**

- [ ] 5. Checkpoint: build the site, open Home, Morgue and two Case pages at 375 px and desktop. Stop and report if anything is broken.

- [ ] 6. Will writer
- [ ] 6.1 Implement `willToForm` / `formToWill` and `registerIssueUrl` as plain functions in `web/src/will/`
  - _Requirements: 5.1, 5.3_
- [ ] 6.2 Write property tests for the will writer
  - **Property S1: The form and the schema agree**
  - **Property S2: Register links are well-formed**
  - **Validates: Requirements 5.1, 5.2, 5.3**
- [ ] 6.3 Build `WillForm` and `SignedWill` (copy, download, register) with the three-point explanation and the "never holds keys" promise
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 7. Will demo
- [ ] 7.1 Implement `demoReducer` wrapping `simulate()`; default `demoWill` and script
  - _Requirements: 6.1_
- [ ] 7.2 Write property test for the demo
  - **Property S5: The demo is the engine**
  - **Validates: Requirements 6.1, 6.3**
- [ ] 7.3 Build `WillDemo` controls, `Timeline`, `CommentFeed` (real messages) and `LetterView` on release
  - _Requirements: 6.2, 6.3, 6.4_

- [ ] 8. Registry page with empty state
  - _Requirements: 7.1, 7.2_

- [ ]* 9. About page: method (rules table in plain words), rules version, data sources, credits
  - _Requirements: 2.4_

- [ ] 10. MCP server
- [ ] 10.1 Implement `DataSource` (local and remote) and the three tools in `src/mcp/server.ts` with `@modelcontextprotocol/sdk`
  - _Requirements: 8.1, 8.2, 8.4_
- [ ] 10.2 Implement `checkDependencies` as a plain function and write its property test
  - **Property S3: Dependency checks are exact**
  - **Validates: Requirements 8.3**
- [ ] 10.3 Enable the server in `.kiro/settings/mcp.json` (set `"disabled": false`), then ask Kiro chat "Which of this repo's dependencies are dead?" and paste the answer into `KIRO_LOG.md`
  - _Requirements: 8.1_

- [ ] 11. Kiro Power
  - Read kiro.dev/docs/powers first and follow its current format; build `power/` per design.md; add install steps to the README
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 12. Pages workflow
  - `.github/workflows/pages.yml` as in design.md; confirm the live URL loads
  - _Requirements: 10.1, 10.2_

- [ ] 13. Polish pass
  - Keyboard-only walk-through, 375 px check, reduced motion, Lighthouse accessibility ≥ 95; fix what fails
  - _Requirements: 1.3_

- [ ] 14. Final checkpoint: `npm test`, `npm run typecheck` and `npm run web:build` pass; tick every finished task.
