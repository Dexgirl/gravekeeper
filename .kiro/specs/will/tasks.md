# Implementation Plan: Will

- [ ] 1. Will schema
- [ ] 1.1 Implement `WillSchema`, `GitHubLogin` and `parseWill` in `src/core/succession/will.ts`
  - Plain-language error messages, e.g. "quorum is 3 but only 2 witnesses are listed"
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
- [ ] 1.2 Build `arbWill` and `arbInvalidWill` in `src/core/succession/arbitraries.ts`
  - _Requirements: 1.1_
- [ ] 1.3 Write property test for the schema
  - **Property W9: The schema guards the roles**
  - **Validates: Requirements 1.2, 1.3, 1.5**

- [ ] 2. Succession engine
- [ ] 2.1 Define types and `initialState` in `src/core/succession/types.ts`
  - _Requirements: 9.2_
- [ ] 2.2 Implement `step` in `src/core/succession/engine.ts` following the transition table exactly
  - Keep one small function per phase; `lastSignOfLifeAt` only moves forward
  - _Requirements: 3.1, 3.2, 3.3, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.4, 8.1, 8.2, 9.1, 9.2_
- [ ] 2.3 Implement `run` (total-order sort + de-duplication) and `simulate`
  - _Requirements: 9.4, 10.1, 10.2_
- [ ] 2.4 Write the five scenario tests from design.md (holiday, real handover, rogue stranger, late confirm, witness says no)
  - _Requirements: 5.2, 5.3, 6.2, 7.1, 9.1_
- [ ] 2.5 Build `arbScript` in `src/core/succession/arbitraries.ts`
  - _Requirements: 10.1_
- [ ] 2.6 Write property tests for the engine (1,000 runs each)
  - **Property W1: No release while the maintainer is alive**
  - **Property W2: Release needs a real quorum**
  - **Property W3: Release happens once and is final**
  - **Property W4: Strangers cannot move a will**
  - **Property W5: Revocation wins**
  - **Property W6: Missing data never moves a will forward**
  - **Property W7: Order does not matter**
  - **Property W8: Any sign of life resets**
  - **Property W10: Every change is logged**
  - **Validates: Requirements 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 7.1, 7.4, 8.1, 8.2, 9.1, 9.2, 9.4**

- [ ] 3. Checkpoint: `npm run test:core` passes. If a property fails, read the shrunk counterexample, fix the engine, and note the bug in `KIRO_LOG.md` (these make great demo material). Stop and report if stuck.

- [ ] 4. Handover letter
  - Implement `renderLetter` in `src/core/succession/letter.ts` with all sections from design.md
  - Snapshot test using the "real handover" scenario
  - _Requirements: 7.3_

- [ ] 5. Registry shell
- [ ] 5.1 Define `RegistryIO`, implement `fakeIO` and `parseCommand` in `src/registry/io.ts`
  - `parseCommand` reads only the first line and only the five exact commands
  - _Requirements: 3.1, 4.2, 9.1_
- [ ] 5.2 Write plain-language messages in `src/core/succession/messages.ts` (pure, so the website demo can reuse them) (check-in, welcome back, ask to ack, witness call, call expired, release, registration errors)
  - Each message says what happens next and on which date
  - _Requirements: 2.2, 5.1, 6.1, 7.2_
- [ ] 5.3 Implement `registerWill` with tests (valid, invalid, wrong author)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_
- [ ] 5.4 Implement `tickWill` and `tickAll` with tests
  - Build events since `lastTickAt`; `data_unavailable` on any fetch failure; write state after each effect so a crash never double-posts
  - _Requirements: 4.1, 4.3, 5.1, 6.1, 6.3, 7.2, 8.1_
- [ ] 5.5 Implement `githubIO(token)` in `src/registry/github-io.ts` using `fetch` (no Octokit)
  - Fixture tests for events, comments and the will-author lookup
  - _Requirements: 2.1, 2.3, 4.1, 9.3_
- [ ] 5.6 Implement `exportRegistry()` writing `data/registry.json`
  - _Requirements: 9.5_

- [ ] 6. CLI and automation
- [ ] 6.1 Add `gk wills register --issue <n>`, `gk wills tick --id <id>`, `gk wills tick-all` to `src/cli.ts`
  - _Requirements: 2.1, 4.4_
- [ ] 6.2 Add `.github/ISSUE_TEMPLATE/register-will.yml`
  - _Requirements: 2.1_
- [ ] 6.3 Add `.github/workflows/wills.yml` (triggers, permissions, concurrency as in design.md)
  - _Requirements: 4.4, 9.3_

- [ ] 7. Dogfood
  - Commit our own `GRAVEKEEPER.json` naming real heirs and witnesses (ask the user for their GitHub usernames before writing it)
  - Register it through the issue form once the workflow is live, and add the result to `KIRO_LOG.md`
  - _Requirements: 2.4_

- [ ] 8. Final checkpoint: `npm test` and `npm run typecheck` pass; tick every finished task.
