# Requirements Document: Surfaces

## Introduction

Surfaces are the ways people and agents reach Gravekeeper: a static website (the coroner's office), an MCP server for agents, and a Kiro Power that bundles the MCP server with a skill. All of them read the static data produced by the Morgue and Will specs and reuse the pure core, so no logic is duplicated.

## Glossary

- **Site**: the Vite + React app in `web/`, deployed to GitHub Pages.
- **Case page**: the page for one package, laid out like a death certificate.
- **Plan preview**: an in-page viewer for a repair plan's files.
- **Will writer**: the form that produces a `GRAVEKEEPER.json`.
- **Will demo**: the simulated will that plays out in seconds.
- **MCP server**: a stdio Model Context Protocol server in `src/mcp/`.
- **Power**: a Kiro Power in `power/` packaging the MCP server and a skill.

## Requirements

### Requirement 1: Site foundation

**User Story:** As a visitor, I want a fast, readable site that works on my phone, so that I can use it anywhere.

#### Acceptance Criteria

1. THE Site SHALL build to static files and deploy to GitHub Pages with hash-based routing, so that every URL works on refresh.
2. THE Site SHALL read `data/morgue.json`, `data/cases/*.json`, `data/plans/*.json` and `data/registry.json` as static files and load case and plan files only when a page needs them.
3. THE Site SHALL be usable at 375 px width, reach WCAG AA colour contrast, show visible keyboard focus, and show verdicts as words as well as colours.
4. THE Site SHALL include no analytics, trackers or third-party scripts other than self-hosted fonts.
5. WHILE data is loading, THE Site SHALL show the Intern with a short loading line, and IF a data file fails to load, THEN THE Site SHALL show a plain-language error with a retry button.

### Requirement 2: Home page

**User Story:** As a first-time visitor, I want to understand Gravekeeper in ten seconds, so that I know why it matters.

#### Acceptance Criteria

1. THE Home page SHALL show the line "No code dies with its maker.", a one-sentence explanation, and two actions: "Open the morgue" and "Write your will".
2. THE Home page SHALL show live totals from `data/morgue.json`: packages examined, count per verdict, and combined weekly downloads of DORMANT and DEAD packages, with the scan date.
3. THE Home page SHALL show the three highest-risk case files as manila folders linking to their case pages.
4. THE Home page SHALL credit Andrew Nesbitt's research and the data sources, and state that the project was built with Kiro.

### Requirement 3: The Morgue list

**User Story:** As a developer, I want to browse and search the case files, so that I can find the packages I care about.

#### Acceptance Criteria

1. THE Morgue list SHALL show every summary row as a case folder with the package name on a toe tag, a verdict stamp, weekly downloads, time of death and cause codes in plain words.
2. THE Morgue list SHALL filter by verdict, search by package name, and sort by risk, weekly downloads or time of death.
3. THE Morgue list SHALL default to DORMANT and DEAD sorted by risk.
4. THE Morgue list SHALL keep filter, search and sort in the URL, so that a view can be shared.

### Requirement 4: Case page

**User Story:** As a developer, I want a clear death certificate for a package, so that I can understand and verify the verdict.

#### Acceptance Criteria

1. THE Case page SHALL show the package name, verdict stamp, confidence, time of death, risk and scan date in a death-certificate layout.
2. THE Case page SHALL list each cause with its plain-language summary and every evidence item linked to its public source.
3. WHEN the verdict is DORMANT or DEAD, THE Case page SHALL show the repair plan with a file preview, a "Download as zip" button, and three numbered steps for opening it in Kiro.
4. WHEN the verdict is ALIVE or RESTING, THE Case page SHALL show the "no revival needed" note instead of a plan.
5. WHEN the confidence is `partial`, THE Case page SHALL say which facts were unknown.

### Requirement 5: Will writer

**User Story:** As a maintainer, I want to fill in a form and get a valid will, so that I never have to write JSON by hand.

#### Acceptance Criteria

1. THE Will writer SHALL validate input with the same `WillSchema` used by the engine and show each error next to its field in plain language.
2. WHEN the form is valid, THE Will writer SHALL show the `GRAVEKEEPER.json` text with copy and download buttons, laid out as a signed will.
3. WHEN the form is valid, THE Will writer SHALL offer a "Register" link that opens a pre-filled `register-will` issue in this repository.
4. THE Will writer SHALL explain in three short points what Gravekeeper will do, and state that it never asks for or holds any keys or passwords.

### Requirement 6: Will demo

**User Story:** As a judge or visitor, I want to watch a will play out in seconds, so that I understand the safety design without reading docs.

#### Acceptance Criteria

1. THE Will demo SHALL run the real engine through `simulate()` with a simulated clock where one day passes in a configurable fraction of a second.
2. THE Will demo SHALL offer play, pause, speed and reset, plus buttons for "Maintainer posts on GitHub", "Witness confirms", "Witness says no" and "A stranger tries to confirm".
3. THE Will demo SHALL show the current phase, a timeline of every log entry, and the effects as the GitHub comments they would produce.
4. WHEN the demo reaches `RELEASED`, THE Will demo SHALL show the rendered handover letter.

### Requirement 7: Registry page

**User Story:** As anyone, I want to see which wills exist and their state, so that the process is transparent.

#### Acceptance Criteria

1. THE Registry page SHALL list every will from `data/registry.json` with its packages, phase and last change, linked to its public thread.
2. IF there are no wills yet, THEN THE Registry page SHALL show an empty state with a link to the Will writer.

### Requirement 8: MCP server

**User Story:** As an agent user, I want my coding agent to ask Gravekeeper about dependencies, so that it warns me before I build on dead code.

#### Acceptance Criteria

1. THE MCP server SHALL expose tools `get_case(name)`, `get_repair_plan(name)` and `check_dependencies(package_json)` over stdio.
2. THE MCP server SHALL read data from a local `data/` directory when available, otherwise from the published site's base URL set by `GRAVEKEEPER_DATA_URL`.
3. WHEN `check_dependencies` receives a `package.json`, THE MCP server SHALL return exactly the dependencies (including dev and peer) whose verdict is DORMANT or DEAD, each with verdict, top cause and case page URL.
4. IF a package is unknown to the morgue, THEN THE MCP server SHALL say so plainly rather than guess.

### Requirement 9: Kiro Power

**User Story:** As a Kiro user, I want to install Gravekeeper as a Power, so that Kiro can check my dependencies when I ask.

#### Acceptance Criteria

1. THE Power SHALL include a manifest, the MCP server configuration, and a `check-dependencies` skill, following Kiro's current Powers format.
2. THE Power's skill SHALL tell the agent when to call each tool and how to present dead dependencies with their repair plans.
3. THE repository README SHALL include install steps for the Power.

### Requirement 10: Deployment

**User Story:** As the operator, I want the site to redeploy itself, so that new data is live without manual steps.

#### Acceptance Criteria

1. WHEN `main` changes, THE pages workflow SHALL build the site with the latest `data/` and deploy it to GitHub Pages.
2. THE pages workflow SHALL declare only the permissions GitHub Pages deployment needs.
