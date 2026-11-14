# AstroMed: rules for agents

AstroMed is a NASA Space Apps submission: a health self-monitoring app for one astronaut on a long Moon or Mars
mission with delayed or no contact with Earth. Submission closes Sunday 15 Nov 2026, 23:59 local time.
Read `docs/tickets.md` (the decisions at the top are binding) and `docs/decisions.md` before you start.

## 1. Product hard rules

- The user is the astronaut, alone. No doctor view, no "call a doctor", no "send to your doctor".
- Every indicator ends in a concrete action the astronaut can take.
- Every section follows Record, History, What to do.
- Numbers and thresholds come from a named source (NASA-STD-3001, Human Research Roadmap, a cited paper) or are
  labelled on screen as our design choice. Never invent a medical threshold or a citation. If you do not have a
  source, write `SOURCE-NEEDED:` in your report and label the value on screen as a design choice.
- NASA risk ratings come only from `src/data/hrr-risks.js` through `src/scripts/risks.js`. Never type a rating by hand.
- Wearable or sensor data is simulated and labelled "simulated".
- The app is a screening and self-monitoring aid, not a medical device and not a diagnosis. Say so where a result
  could be read as a diagnosis.
- All user-facing text is English. No emoji as icons in new UI; use the SVG symbols in `src/pages/index.astro`.
- The app must keep working with no network connection once loaded. No CDN scripts, fonts or images: bundle them.

## 2. Stack and layout

Astro static site with Preact components (`@astrojs/preact`). Older sections are still vanilla JavaScript modules that build HTML from strings; they are being converted. pnpm only.

| Path | What | Owner |
|---|---|---|
| `src/pages/index.astro` | The page shell, sidebar, icon symbols | coordinator (ask; small edits are granted per task) |
| `src/scripts/main.js` | Module entry and import order | coordinator (ask for one import line) |
| `src/scripts/storage.js`, `sync.js` | Storage and optional sync | coordinator |
| `src/scripts/risks.js`, `src/data/**` | NASA risk model (contract) | coordinator |
| `src/styles/tokens.css` | Colour tokens (contract) | coordinator |
| `src/scripts/sections.js` | Navigation (`AstroMedNav`), mental health, protocols, shared analysis | per task |
| `src/scripts/<section>.js` | One module per section | per task |
| `src/styles/<section>.css` | Styles for a new section, imported from its module | per task |
| `public/legacy/*.js` | Prebuilt bundles without source (3D astronaut, PDF report) | per task |
| `public/assets/**` | Images and 3D models | per task |
| `functions/**`, `schema.sql` | Optional Cloudflare Pages server | coordinator |
| `test/**` | Node unit tests | whoever owns the code under test |
| `docs/**`, `AGENTS.md`, `README.md`, `tools/**` | Docs and tooling | coordinator |

Your task spec lists the paths you own. Anything else: ask first.

## 3. Contracts

- **Storage:** read and write only through `window.AstroMedStore.store.get(key, fallback)` / `.set(key, value)`.
  Keys start with `astromed-`. Never call `localStorage` directly.
- **Navigation:** a new section registers itself, it does not edit the navigation code:
  `window.AstroMedNav.register({ id, label, icon, render, before })` inside a `DOMContentLoaded` handler.
  `render(pageElement)` runs every time the section opens. `window.AstroMedNav.show(id)` opens any section;
  `window.AstroMedNav.has(id)` says whether a section exists (other sections may register after yours).
- **Start-up:** modules load through `src/scripts/main.js` and run before `DOMContentLoaded`. Do your DOM work in a
  `DOMContentLoaded` handler. Do not branch on `document.readyState`.
- **Risk model:** `import { currentMission, rankedRisks, areaWeights, MISSION_TYPES } from "./risks.js"`.
  The chosen mission is the `missionType` field of the `astromed-profile` record.
- **Findings:** a section exposes `findings()` returning `[{ level, title, saw, todo }]` with `level` one of
  `ok`, `info`, `warn`, `urgent`. `todo` is the concrete action. Existing sections already do this.
- **Colour:** new CSS uses only the `--am-*` variables from `src/styles/tokens.css`. No literal colours.
- **Modules talk through imports** where the other side is already a module with exports; `window.AstroMed*`
  globals remain for the older modules. Do not add new globals except the one public object of your section.

## 3a. The interface is Preact components

The interface is written as Preact components mounted from Astro as islands (`@astrojs/preact`). Do not build HTML
in strings, do not write your own rendering, templating or component helper, and do not clone `<template>`
elements. Use what Preact and Astro provide.

- Each section has a mount point, `src/components/sections/<Name>.astro`, listed once in
  `src/components/Sections.astro` (coordinator-owned; ask for a new line). It contains only:
  `<section id="<id>Page" class="am-page" hidden><NameView client:only="preact" /></section>` with
  `import NameView from "../<section>/<Name>View.jsx";` in its frontmatter.
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
- The section still registers its sidebar entry with `window.AstroMedNav.register({ id, label, before })` (no
  `render`) from a `DOMContentLoaded` handler in its logic module, and keeps its one public object
  (`window.AstroMed<Section>` with `findings()` and whatever other modules call) set from that module.
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
