---
inclusion: fileMatch
fileMatchPattern: ["src/core/succession/**", "src/registry/**", ".github/workflows/**", ".github/ISSUE_TEMPLATE/**", "GRAVEKEEPER.json"]
---

# Safety rules for wills and automation

These rules are product promises. Breaking one is a bug even if tests pass.

1. **Never hold keys.** Gravekeeper never asks for, stores or uses anyone's npm token, GitHub token, password or 2FA code. Workflows use only the built-in `GITHUB_TOKEN` of this repo.
2. **Fail closed.** If maintainer activity or comments cannot be fetched, emit a `data_unavailable` event, never a `tick`. Missing data must never move a will toward release.
3. **Only listed people count.** `alive` and `revoke` count only from the maintainer. `ack`, `confirm` and `deny` count only from listed witnesses, and `confirm`/`deny` only after that witness has acknowledged. Everyone else is ignored and logged.
4. **Quorum is at least 2**, and witnesses cannot be heirs or the maintainer.
5. **Release happens once.** `RELEASED` and `REVOKED` are terminal. The letter is published at most once.
6. **Confirmations expire.** A `confirm` counts only inside the current call's window.
7. **Any sign of life wins.** Maintainer activity, `alive`, or a witness `deny` returns the will to `ALIVE`.
8. **Everything is public and logged.** Every state change is appended to the will's log with time, cause and actor.
9. **Honest letters.** The handover letter states that it records the maintainer's wish and does not itself transfer publish rights; the registry decides.
10. **Least privilege in workflows.** Declare `permissions:` explicitly, use `concurrency:` so two runs never edit the same state, and pin actions to a major version.
