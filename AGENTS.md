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

Astro static site, vanilla JavaScript modules, no UI framework. pnpm only.

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

## 3a. Sections are Astro components

Markup belongs in `.astro` files, not in JavaScript strings. This is what lets a developer (and Astro's dev tools)
find the source of an element.

- Each section has one component, `src/components/sections/<Name>.astro`, whose root is
  `<section id="<id>Page" class="am-page" hidden>`. It is listed once in `src/components/Sections.astro`
  (coordinator-owned; stubs exist for Emergencies, Today, RiskMap, Vision, Immune; ask for a new line).
  `AstroMedNav.register` picks up that element instead of creating one.
- Split a large section into child components under `src/components/<section>/`. Keep each file under 200 lines.
- Content known at build time is rendered by Astro: import the data in the component frontmatter and loop in the
  template (risk table, emergency cards, questionnaire items, reference tables, static help text, SVG diagrams).
- Content that depends on what the astronaut stored is filled in by the section's module at run time. Put the shape
  of each repeated item in a `<template id="...">` inside the component and clone it
  (`template.content.cloneNode(true)`), setting text with `textContent`. Do not build HTML in strings, and do not
  use `innerHTML` with stored or typed values.
- Styles go in the component's `<style>` block (scoped; cloned `<template>` content is covered). Shared rules stay
  in `src/styles/`. Colours only through the `--am-*` tokens.
- Behaviour stays in `src/scripts/<section>.js` as functions that take the page element; the component ends with
  `<script>import { init } from "../../scripts/<section>.js"; init();</script>` or the module keeps its
  `DOMContentLoaded` handler. Pure logic (scoring, comparison, ranking) stays free of DOM code and keeps its tests.
- A module that still builds a section from strings is legacy: when you touch such a section, move its markup into
  a component as part of the task.

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
