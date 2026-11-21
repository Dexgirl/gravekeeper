# Requirements Document: Will

## Introduction

The Will lets an active maintainer plan a safe handover before they become unreachable. The maintainer commits a `GRAVEKEEPER.json` will to their own repository, naming heirs and witnesses. Gravekeeper watches for public signs of life. After a long silence it opens a public check-in; if there is still no answer, it asks the witnesses; when enough witnesses confirm, it releases a handover letter and a repair plan to the heirs. Everything runs on GitHub Actions in this repository, in public, and Gravekeeper never holds anyone's keys.

## Glossary

- **Will**: a `GRAVEKEEPER.json` file at the root of the maintainer's repository.
- **Maintainer**: the GitHub user who wrote the will.
- **Heir**: a GitHub user the maintainer wants to take over.
- **Witness**: a GitHub user who can confirm the maintainer is unreachable. Counts only after acknowledging.
- **Quorum**: number of witness confirmations needed to release (at least 2).
- **Silence period**: days without a sign of life before a check-in (90–730).
- **Grace period**: days the maintainer has to answer a check-in (7–90).
- **Witness window**: days the witnesses have to confirm once called (7–90).
- **Thread**: the public GitHub issue in this repository where a will's check-ins and witness calls happen.
- **Engine**: the pure succession state machine in `src/core/succession/`.
- **Tick**: a daily evaluation of a will with fresh data.
- **Phases**: `PENDING_ACK`, `ALIVE`, `QUIET`, `CALLING`, `RELEASED`, `REVOKED`.
- **Handover letter**: the public markdown record published on release.

## Requirements

### Requirement 1: Will file

**User Story:** As a maintainer, I want to write my succession wishes in a small file in my own repo, so that they are public, versioned and clearly mine.

#### Acceptance Criteria

1. THE Will schema SHALL require `version` (1), `maintainer`, `packages` (at least one `{ registry: "npm", name }`), `heirs` (at least one), `witnesses`, `quorum`, `silenceDays`, `graceDays` and `witnessWindowDays`, and SHALL allow an optional `message` of at most 2,000 characters.
2. IF `quorum` is less than 2 or greater than the number of witnesses, THEN THE Will schema SHALL reject the will.
3. IF any person appears in more than one of maintainer, heirs and witnesses, THEN THE Will schema SHALL reject the will.
4. IF `silenceDays` is outside 90–730, or `graceDays` or `witnessWindowDays` is outside 7–90, THEN THE Will schema SHALL reject the will.
5. THE Will schema SHALL treat GitHub usernames case-insensitively.

### Requirement 2: Registration

**User Story:** As a maintainer, I want to register my will by opening an issue, so that I need no account, token or server.

#### Acceptance Criteria

1. WHEN an issue labelled `register-will` is opened in this repository with a repository URL, THE Registry SHALL fetch `GRAVEKEEPER.json` from that repository's default branch.
2. IF the will is missing or invalid, THEN THE Registry SHALL comment the exact validation errors in plain language and close the issue.
3. IF the latest commit that changed `GRAVEKEEPER.json` was not authored by the will's `maintainer`, THEN THE Registry SHALL reject the registration.
4. WHEN a will is valid and authored by its maintainer, THE Registry SHALL store it in `registry/wills/<owner>__<repo>.json`, create its state in phase `PENDING_ACK`, keep the issue open as the will's thread, and mention each witness asking them to reply `/ack`.

### Requirement 3: Witness acknowledgement

**User Story:** As a maintainer, I want witnesses to agree to the role first, so that nobody is named a witness without knowing it.

#### Acceptance Criteria

1. WHEN a listed witness comments `/ack` on the will's thread, THE Engine SHALL record that witness as acknowledged.
2. WHEN the number of acknowledged witnesses reaches the quorum, THE Engine SHALL move the will from `PENDING_ACK` to `ALIVE`.
3. WHILE a will is in `PENDING_ACK`, THE Engine SHALL never open a check-in or call witnesses.

### Requirement 4: Watching for signs of life

**User Story:** As a maintainer, I want my normal GitHub activity to count as proof of life, so that I never have to remember to check in.

#### Acceptance Criteria

1. WHEN a tick runs, THE Registry SHALL collect the maintainer's public GitHub activity since the previous tick, plus new comments on the will's thread.
2. THE Engine SHALL treat any public GitHub event by the maintainer, or a `/alive` comment by the maintainer, as a sign of life.
3. IF activity or comments cannot be fetched, THEN THE Registry SHALL send the Engine a `data_unavailable` event instead of a tick.
4. THE wills workflow SHALL run a tick daily and whenever a comment is created on a will thread.

### Requirement 5: Check-in

**User Story:** As a maintainer, I want a public, friendly check-in after a long silence, so that a holiday never triggers a handover.

#### Acceptance Criteria

1. WHEN a tick finds no sign of life for `silenceDays` while the will is `ALIVE`, THE Engine SHALL move the will to `QUIET` and the Registry SHALL post a check-in comment mentioning the maintainer.
2. WHEN the maintainer shows any sign of life while the will is `QUIET` or `CALLING`, THE Engine SHALL move the will to `ALIVE` and the Registry SHALL post a short "welcome back" comment.
3. WHEN an acknowledged witness comments `/deny` while the will is `QUIET` or `CALLING`, THE Engine SHALL move the will to `ALIVE` and treat the comment time as the last sign of life.

### Requirement 6: Witness call

**User Story:** As an heir, I want trusted people, not a timer alone, to decide that the maintainer is gone, so that a handover is never automatic.

#### Acceptance Criteria

1. WHEN a tick finds the will `QUIET` for `graceDays` with no sign of life, THE Engine SHALL move the will to `CALLING` and the Registry SHALL mention every acknowledged witness asking them to reply `/confirm` or `/deny`.
2. THE Engine SHALL count a `/confirm` only from an acknowledged witness, only once per witness, and only if it was made after the call started and before the witness window ended.
3. WHEN a tick finds the witness window has ended without quorum, THE Engine SHALL move the will back to `QUIET` and the Registry SHALL post a fresh check-in.

### Requirement 7: Release

**User Story:** As an heir, I want a clear public record when the handover happens, so that I can show it to the registry and the community.

#### Acceptance Criteria

1. WHEN confirmations from distinct acknowledged witnesses reach the quorum while the will is `CALLING`, THE Engine SHALL move the will to `RELEASED`.
2. WHEN a will is released, THE Registry SHALL publish `registry/letters/<id>.md`, mention every heir on the thread with a link to the letter and to each package's repair plan, and close the thread.
3. THE handover letter SHALL include the will, the maintainer's message, the full timeline with links to each comment, the witnesses who confirmed, and a plain statement that the letter records the maintainer's wish and does not itself transfer publish rights.
4. THE Engine SHALL release a will at most once, and `RELEASED` SHALL be terminal.

### Requirement 8: Revocation

**User Story:** As a maintainer, I want to cancel my will at any time, so that I stay in control.

#### Acceptance Criteria

1. WHEN the maintainer comments `/revoke` on the thread, or a tick finds `GRAVEKEEPER.json` deleted from the repository, THE Engine SHALL move the will to `REVOKED`, unless it is already `RELEASED`.
2. THE Engine SHALL treat `REVOKED` as terminal, so a maintainer who wants to start again registers a new will.

### Requirement 9: Safety and transparency

**User Story:** As anyone, I want to see exactly what Gravekeeper did and why, so that I can trust it.

#### Acceptance Criteria

1. THE Engine SHALL ignore commands from anyone who is not the maintainer or a listed witness, and SHALL log each ignored command with its author.
2. THE Engine SHALL append a log entry with time, phase change, cause and actor for every state change.
3. THE Registry SHALL never request, store or use any credential other than this repository's built-in `GITHUB_TOKEN`.
4. THE Engine SHALL be a pure function: the same will, starting state and events SHALL always produce the same final state and effects, regardless of the order in which events were supplied.
5. THE Registry SHALL export `data/registry.json` listing every will's id, packages, phase and last change, for the website.

### Requirement 10: Simulation

**User Story:** As a judge or visitor, I want to watch a will play out in seconds, so that I understand it without waiting months.

#### Acceptance Criteria

1. THE Engine SHALL accept any event timeline with explicit timestamps, so that a simulated clock can drive it without code changes.
2. THE Engine SHALL expose a `simulate(will, script)` helper that returns every intermediate state and effect for display.
