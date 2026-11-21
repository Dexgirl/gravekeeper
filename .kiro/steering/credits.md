---
inclusion: always
---

# How to work (credits are limited)

- Do one task at a time, in order, and mark it done in `tasks.md` when its tests pass.
- Keep changes inside the files the task names. No drive-by refactors.
- Run the narrowest check first (`npm run test:core`, one test file) before the full suite.
- If a task needs more than ~25 tool calls, or a test keeps failing after 3 fix attempts, stop and write a short summary of what is blocking instead of continuing.
- Do not install packages that are not in `tech.md`. Ask first.
- Do not run `npm publish`, `git push`, or destructive shell commands. A hook blocks them.
- Prefer small, readable code over clever code. The judges will read it.
