---
inclusion: fileMatch
fileMatchPattern: ["web/**/*.tsx", "web/**/*.ts", "web/**/*.css", "README.md", "src/core/necromancer/templates/**", "src/core/succession/letter*.ts", "src/core/succession/messages*.ts"]
---

# Voice and look

## Voice

- Plain English a non-native speaker understands. Short sentences. No jargon without a one-line explanation.
- We are a coroner, not a judge: we report **public signals**, never blame people. Say "no human commit since March 2021", not "the maintainer abandoned it".
- Calm and kind about maintainers. Many stopped for good reasons.
- Dark humour only in the theme (case files, stamps, the Intern), never at a person's expense.
- Safety text (wills, letters, witness calls) is serious, precise and joke-free.

## Words

- Use: case file, verdict, time of death, cause, evidence, repair plan, will, heir, witness, handover letter, revive.
- Avoid: "killed", "abandoned by", "RIP", "graveyard", "headstone", "tombstone" (another Kiroween entry owns that look), skull emojis, "AI-powered".

## Look: a coroner's office, not a cemetery

- Paper `#F4F1EA`, manila `#E7D7A6`, ink `#1C1B19`, stamp red `#B3261E`, dormant amber `#B7791F`, resting slate `#5B6770`, alive green `#2F7D4F`.
- Typewriter mono for case data (IBM Plex Mono), serif headings (Fraunces), sans body (Inter). Load with `font-display: swap`.
- Signature elements: manila case folders, rubber-stamp verdicts (rotated −4°, slightly uneven), toe-tag labels for package names, a death-certificate layout on case pages, a signed-will layout on will pages.
- Verdicts are never colour-only: always show the word too.
- Mobile first (375 px). WCAG AA contrast. Visible focus rings.

## The Intern (mascot)

- A small SVG character with a clipboard and oversized glasses.
- Says one short line in loading and empty states, e.g. "Pulling the file…", "No bodies here. Good news, honestly."
- Never appears in will, witness or letter screens.
