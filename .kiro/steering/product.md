---
inclusion: always
---

# Gravekeeper: product

**No code dies with its maker.**

## The problem

Most software is built on free open-source packages, and many of them are kept alive by one volunteer. When that person quits, burns out, loses their 2FA device or dies, the package stops being fixed, but millions of apps keep downloading it. Security holes stay open. Sometimes a stranger offers to "help", gets publish rights, and ships malware (event-stream, 2018). Registries have no proactive way to plan a handover before the maintainer is unreachable.

## What Gravekeeper does

1. **The Morgue (dead code).** Scans widely used npm packages, decides whether each is ALIVE, RESTING, DORMANT or DEAD from public evidence, and writes a plain-language case file: time of death, causes, evidence links.
2. **The Repair plan (revival).** For every DORMANT or DEAD package, generates a ready-to-run Kiro spec (requirements, design, tasks, steering) so anyone can revive it in Kiro.
3. **The Will (living code).** A maintainer commits a `GRAVEKEEPER.json` will naming heirs and witnesses. Gravekeeper watches for public activity. After a long silence it checks in, then asks the witnesses. If enough witnesses confirm, it publishes a handover letter and the repair plan for the heirs. It never holds anyone's keys or passwords.
4. **Agent access.** An MCP server and a Kiro Power let any agent ask "is this dependency dead?" and fetch a repair plan.

## Users

- Developers who depend on packages and want to know what is quietly rotting in their tree.
- Would-be maintainers who want a clear, safe path to revive something.
- Active maintainers who want a succession plan before they need one.

## Hackathon context

- Kiroween 2026, category **Resurrection** ("bring dead technology back to life").
- Judges score: impact, how thoroughly Kiro is used, design, novelty, presentation (equal weights).
- Must ship: live URL, public MIT repo with `.kiro/` committed, 3-minute video.
- Proof beats claims: real scan data, a real revived package, a real will.

## Non-goals (v1)

- Other ecosystems (PyPI, crates) — the code must allow adding them later.
- Transferring publish rights. Registries decide that. We provide evidence and a signed wish.
- Paid services, servers, databases or runtime AI calls. Everything is static, free and deterministic.

## Glossary (use these words exactly)

- **Case file**: everything known about one package at one scan.
- **Verdict**: ALIVE, RESTING (finished, no harm signals), DORMANT, DEAD.
- **Cause**: a coded reason (e.g. `UNPATCHED_VULN`) with evidence.
- **Evidence**: a fact plus the public URL it came from.
- **Time of death**: date of the last human commit (or last release when commits are unknown).
- **Repair plan**: generated Kiro spec files to revive one package.
- **Will**: `GRAVEKEEPER.json` in the maintainer's own repo.
- **Heir**: GitHub user who should take over.
- **Witness**: GitHub user who confirms the maintainer is unreachable. Must acknowledge first.
- **Quorum**: number of witness confirmations needed (minimum 2).
- **Check-in**: public issue asking the maintainer "still with us?".
- **Handover letter**: the public record released to heirs.
- **The Intern**: the mascot. A nervous, diligent coroner's intern who pulls case files. Appears in loading states, empty states and the video, never in safety-critical text.

## Credits we must keep visible

- Andrew Nesbitt's "Weekend at Bernie's" research and ecosyste.ms data inspired the Morgue.
- Data: npm registry, npm downloads API, OSV.dev, GitHub API, ecosyste.ms.
