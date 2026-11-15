# AstroMed: rules for agents

AstroMed is a NASA Space Apps submission: a health self-monitoring app for an astronaut on a mission in low Earth
orbit, at the Moon or at Mars. Crew size and the link to Earth depend on the mission and are read from the profile.
Read `docs/tickets.md` (the decisions there are binding) and `docs/decisions.md` before you start.

## 1. Product hard rules

- The user is the astronaut. No doctor view. Every action first says what the astronaut can do alone. Telling the
  flight surgeon is allowed as a second step, worded for the mission's link to Earth through `alsoTell()` from
  `src/scripts/mission.js`. Text about helping a crewmate is shown only when `hasCrew()` is true.
- Every indicator ends in a concrete action the astronaut can take.
- Record, History, What to do is app-wide: Check records, Progress holds all history, Home says what to do. A card
  shows its result and one action after saving, nothing more.
- Numbers and thresholds come from a named source (NASA-STD-3001, Human Research Roadmap, a cited paper) or are
  labelled on screen as our design choice. Never invent a medical threshold or a citation. If you do not have a
  source, write `SOURCE-NEEDED:` in your report and label the value on screen as a design choice.
- NASA risk ratings come only from `src/data/hrr-risks.js` through `src/scripts/risks.js`. Never type a rating by hand.
- Wearable or sensor data is simulated and labelled "simulated".
- The app is a screening and self-monitoring aid, not a medical device and not a diagnosis. Say so where a result
  could be read as a diagnosis.
- All user-facing text is English and professional. No emoji anywhere. Points, levels and badges are shown, static, on Home; no
  large celebration (a short toast or small animation when one is earned is allowed). No developer notes on screen. Icons come from `lucide-preact`.
- The app must keep working with no network connection once loaded. No CDN scripts, fonts or images: bundle them.
- Medical text is the team medic's. Do not rewrite it; move it or change who it addresses only where your task
  says so.
- "Not a medical device" appears once, in the footer. Sources and credits live in the Sources dialog.

## 2. Stack and layout

Vite with `@preact/preset-vite`. One `index.html`, one root component. pnpm only.

| Path | What | Owner |
|---|---|---|
| `index.html`, `src/main.jsx`, `src/components/App.jsx` | Entry and root component | coordinator |
| `src/lib/nav.js` | Hash routes | coordinator |
| `src/scripts/storage.js`, `sync.js` | Storage and optional sync | coordinator |
| `src/scripts/risks.js`, `src/data/hrr-risks.js` | NASA risk model (contract) | coordinator |
| `src/data/topics.js` | Topic, check, risk and emergency card in one table (contract) | coordinator |
| `src/styles/tokens.css` | Colour tokens (contract) | coordinator |
| `src/components/ui/**` | Shared kit | per task |
| `src/components/<section>/**` | Components, `cards.js` and one CSS file per section | per task |
| `src/scripts/<section>.js` | Logic per section, with tests | per task |
| `public/**` | Images, models, PDF bundle | per task |
| `functions/**`, `schema.sql` | Optional Cloudflare Pages server | coordinator |
| `docs/**`, `AGENTS.md`, `README.md`, `tools/**` | Docs and tooling | coordinator |

Your task spec lists the paths you own. Anything else: ask first.

## 3. Contracts

- **Storage:** read and write only through `window.AstroMedStore.store.get(key, fallback)` / `.set(key, value)`.
  Keys start with `astromed-`. Never call `localStorage` directly.
- **Routes:** `import { go, route, openCard, openEmergency } from "../lib/nav.js"`. Routes are URL hashes. Sections
  do not register themselves and there is no `window.AstroMedNav`.
- **Checks:** a section exports its deck cards from `src/components/<section>/cards.js`
  (`export const cards = [{ id, topic, title, Component, isDone }]`). The deck finds them; no shared file is edited.
- **Topics:** which check covers which NASA risk and which emergency card belongs to it is read from
  `src/data/topics.js`. Never write a cross-link by hand.
- **Mission:** `import { crewSize, hasCrew, link, alsoTell } from "./mission.js"`.
- **Start-up:** components render from the root. No `DOMContentLoaded` handlers, no new `window.*` globals.
- **Risk model:** `import { currentMission, rankedRisks, areaWeights, MISSION_TYPES } from "./risks.js"`.
  The chosen mission is the `missionType` field of the `astromed-profile` record.
- **Findings:** a section exposes `findings()` returning `[{ level, title, saw, todo }]` with `level` one of
  `ok`, `info`, `warn`, `urgent`. `todo` is the concrete action. Existing sections already do this.
- **Colour:** new CSS uses only the `--am-*` variables from `src/styles/tokens.css`. No literal colours.
- **Modules talk through imports** where the other side is already a module with exports; `window.AstroMed*`
  globals remain for the older modules. Do not add new globals except the one public object of your section.

## 3a. The interface is Preact components

The interface is written as Preact components rendered from `src/main.jsx`. Do not build HTML in strings, do not
write your own rendering, templating or component helper, and do not clone `<template>` elements. Use what Preact
provides.

- There are no mount points. A section is components under `src/components/<section>/`, each under 200 lines, one
  component per file. Shared pieces come from `src/components/ui/`; do not write a second tab, chip, step, dialog,
  toast or card.
- The section itself is Preact components under `src/components/<section>/*.jsx`, each under 200 lines, one
  component per file, named after what it shows (`RiskRow.jsx`, `GcsPicker.jsx`). Shared pieces go in
  `src/components/ui/`.
- State lives in components (`useState`, `useMemo`, or `@preact/signals` for state shared between components).
  Stored data: `const [value, save] = useStored("astromed-<key>", fallback)` from `src/lib/use-stored.js`.
  Never read or write the DOM by hand (`querySelector`, `innerHTML`, `addEventListener`) inside a section.
- Logic that is not interface (scoring, ranking, comparison, thresholds, data) stays in plain modules under
  `src/scripts/` or `src/data/`, with `node:test` tests, and is imported by the components. Tests do not import
  `.jsx` files.
- Styles: one CSS file per section next to its components, imported from the view (`import "./vision.css";`),
  class names prefixed with the section name, colours only through the `--am-*` tokens.
- Text in JSX is escaped. Never use `dangerouslySetInnerHTML` with stored or typed values.
- Charts use `chart.js`. Icons use `lucide-preact`. Term definitions use `Term` from the kit.
- A module that still builds a section from strings is legacy. When your task touches such a section, convert it
  to components as part of the task and delete the string-building code.

## 4. Process rules

- Stay inside your worktree. Scratch files go in `.tmp/` inside it.
- Never use `git stash`. Use a WIP commit.
- Do not start a dev server or any other background process: on this machine a background process blocks your
  shell for good, whatever redirection you use. To look at the app, build it and let the screenshot tool serve it:
  `pnpm build` then `node tools/shot.mjs --serve dist --out docs/evidence/<task>/<name>.png`
  (`--eval "<js>"` clicks through the app first and prints the result; it also prints console errors and failed
  requests; `--size 390x800` for a phone). Never kill a process you did not start.
- Evidence for any visible change is a screenshot taken that way. Open your own screenshots and check they show
  what you claim.
- Files under 400 lines. No task IDs, history or narrating comments in code. Reuse existing helpers.
- New dependency: allowed only if your task names it, and it must be bundled (no CDN). Report name, licence, size.
- Every image, model or font you add: one line in `docs/references.md` (title, author, URL, licence).

## 5. Definition of done

1. `pnpm test` and `pnpm build` pass.
2. `node tools/shot.mjs --serve dist --strict` (after `pnpm build`) shows no new console error or failed request.
3. The "Done when" of your task is true when you use the app as the astronaut, from the cover page.
4. Screenshots of every changed screen are in `docs/evidence/<task>/`.
5. Work is committed on your branch as `T##: Imperative sentence`, with `name15` merged in.
6. Every process you started is stopped.
