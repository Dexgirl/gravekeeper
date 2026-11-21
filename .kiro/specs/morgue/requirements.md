# Requirements Document: Morgue

## Introduction

The Morgue finds open-source packages that are still widely used but no longer cared for, explains in plain language why each one died, and generates a repair plan in Kiro spec format so anyone can revive it. Version 1 covers npm. All analysis is deterministic (rules and templates, no AI) and runs on free public data.

## Glossary

- **Scan**: the batch pipeline that turns a list of package names into case files.
- **Facts**: normalized public data about one package at one moment. Each fact is either known (value plus source URL) or unknown.
- **Coroner**: the pure rule engine that turns Facts into a case file.
- **Case file**: facts, verdict, confidence, causes, evidence, risk, time of death and scan time for one package.
- **Verdict**: one of ALIVE, RESTING, DORMANT, DEAD.
- **Cause**: one of `ARCHIVED`, `REPO_MISSING`, `NPM_DEPRECATED`, `ABANDONED`, `STALE`, `UNPATCHED_VULN`, `ISSUE_PILEUP`, `SINGLE_KEYHOLDER`.
- **Evidence**: a labelled fact value with the public URL it came from.
- **Human commit**: a commit whose author is not a bot account.
- **Necromancer**: the pure generator that turns a case file into a repair plan.
- **Repair plan**: Kiro spec files (`requirements.md`, `design.md`, `tasks.md`) plus a steering file for reviving one package.
- **File key**: a reversible, file-system-safe encoding of a package name.

## Requirements

### Requirement 1: Gather public facts

**User Story:** As a developer, I want Gravekeeper to collect public signals about a package, so that every verdict rests on evidence anyone can check.

#### Acceptance Criteria

1. WHEN the Scan processes a package, THE Scan SHALL collect the npm registry document, last-week downloads, linked GitHub repository metadata, the latest human commit date, and known vulnerabilities affecting the latest version from OSV.
2. THE Scan SHALL store the public source URL alongside every known fact.
3. IF a source request still fails after 3 attempts with exponential backoff, THEN THE Scan SHALL mark the affected facts as unknown, keep all other facts, and continue with the next package.
4. IF the package has no repository link, or the linked repository returns HTTP 404, THEN THE Scan SHALL record the repository as missing.
5. WHEN determining the latest human commit, THE Scan SHALL ignore commits whose author login ends in `[bot]` or whose author account type is `Bot`.
6. THE Scan SHALL send a User-Agent header that names Gravekeeper and its repository URL on every request.

### Requirement 2: Diagnose (the Coroner)

**User Story:** As a developer, I want a clear verdict, causes and a time of death for each package, so that I know what is quietly rotting in my dependency tree and why.

#### Acceptance Criteria

1. THE Coroner SHALL assign exactly one verdict per case file using the rules defined in design.md.
2. THE Coroner SHALL attach every cause that applies, and every cause SHALL carry at least one evidence item with a source URL.
3. WHEN a package has no human commit for 12 months or more AND has no unpatched vulnerability AND no issue pile-up AND is not archived, missing or deprecated, THE Coroner SHALL assign RESTING.
4. IF the repository is archived or missing, or the package is deprecated on npm, THEN THE Coroner SHALL assign DEAD.
5. THE Coroner SHALL return identical case files for identical facts and scan time.
6. IF a fact needed by a rule is unknown, THEN THE Coroner SHALL not use it as evidence and SHALL set confidence to `partial`.
7. WHEN the latest human commit date is unknown, THE Coroner SHALL use the latest release date as the age signal and label the evidence accordingly.
8. THE Coroner SHALL compute a risk score that is 0 for ALIVE packages and never decreases as weekly downloads increase.
9. WHEN the verdict is DORMANT or DEAD, THE Coroner SHALL set time of death to the date used as the age signal.

### Requirement 3: Repair plan (the Necromancer)

**User Story:** As a would-be maintainer, I want a ready-to-run Kiro spec for a dead package, so that I can start reviving it in minutes instead of days.

#### Acceptance Criteria

1. WHEN a case file has verdict DORMANT or DEAD, THE Necromancer SHALL generate `.kiro/specs/revive-<slug>/requirements.md`, `.kiro/specs/revive-<slug>/design.md`, `.kiro/specs/revive-<slug>/tasks.md` and `.kiro/steering/revival.md`.
2. THE Necromancer SHALL produce at least one requirement and at least one task for every cause in the case file.
3. THE Necromancer SHALL write every acceptance criterion in EARS form.
4. THE Necromancer SHALL reference only requirement IDs that exist in the same plan.
5. WHEN the npm deprecation message names a replacement package, THE Necromancer SHALL include a first requirement recommending migration to that replacement before any revival work.
6. THE Necromancer SHALL produce identical output for identical case files and SHALL NOT call any AI model or network service.
7. WHEN the verdict is ALIVE or RESTING, THE Necromancer SHALL return a short "no revival needed" note instead of a plan.

### Requirement 4: Batched, resumable scans

**User Story:** As the operator, I want scans to run in small batches that can resume after a failure, so that a long scan never has to start over or silently skip packages.

#### Acceptance Criteria

1. THE Scan SHALL process packages in batches of a configurable size, defaulting to 50.
2. WHEN a batch finishes, THE Scan SHALL write that batch's case files and then a checkpoint before starting the next batch.
3. WHEN a scan restarts after an interruption, THE Scan SHALL resume after the last checkpointed batch, producing exactly one case file per seed package with no duplicates and no gaps.
4. THE Scan SHALL accept a seed list from a local text file or from the ecosyste.ms packages API sorted by downloads.
5. THE Scan SHALL pace requests with a configurable delay and SHALL wait for the duration in any `Retry-After` header before retrying.

### Requirement 5: Published data

**User Story:** As a site visitor or agent, I want the results as simple static files, so that the site and MCP server can read them without a server.

#### Acceptance Criteria

1. WHEN a scan completes, THE Scan SHALL write `data/morgue.json`, one `data/cases/<file-key>.json` per package, and one `data/plans/<file-key>.json` per DORMANT or DEAD package.
2. THE Scan SHALL derive file keys with a reversible encoding in which `@scope/name` becomes `@scope__name` and every key contains only characters safe on Windows, macOS and Linux file systems.
3. THE Scan SHALL include in `data/morgue.json` the scan time, the data sources, the number of packages examined, the count per verdict, and the combined weekly downloads of DORMANT and DEAD packages.
4. THE Scan SHALL include one summary row per package in `data/morgue.json` with name, file key, verdict, risk, weekly downloads, time of death and cause codes.

### Requirement 6: Command line

**User Story:** As a developer, I want a small CLI, so that I can scan, read a case and get a repair plan from my terminal.

#### Acceptance Criteria

1. THE CLI SHALL provide `gk scan [--limit N] [--batch-size N] [--seed <file>] [--delay-ms N]`.
2. THE CLI SHALL provide `gk case <package>` that prints the verdict, time of death, causes and evidence in plain language.
3. THE CLI SHALL provide `gk plan <package> --out <dir>` that writes the repair plan files to disk.
4. THE CLI SHALL provide `gk deps-check <path-to-package.json>` that lists dependencies whose morgue verdict is DORMANT or DEAD and always exits with code 0.
5. IF a package is not in the morgue data, THEN THE CLI SHALL say so plainly and suggest running `gk scan --seed` with that name.

### Requirement 7: Scheduled refresh

**User Story:** As the operator, I want the morgue to refresh itself for free, so that the data stays current without me.

#### Acceptance Criteria

1. THE repository SHALL include a GitHub Actions workflow that runs the scan weekly and on manual dispatch, committing updated data after each batch.
2. THE workflow SHALL use only the built-in `GITHUB_TOKEN`, declare `contents: write` as its only permission, and use a concurrency group so two scans never run at once.
