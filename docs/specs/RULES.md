# New rules text (applied by T21)

T21 replaces the matching parts of `AGENTS.md` with the text below and appends the decision rows to
`docs/decisions.md`. Sections of `AGENTS.md` not mentioned here (storage contract, findings contract, colour,
process rules, definition of done) stay as they are.

## AGENTS.md: opening paragraph

AstroMed is a NASA Space Apps submission: a health self-monitoring app for an astronaut on a mission in low Earth
orbit, at the Moon or at Mars. Crew size and the link to Earth depend on the mission and are read from the profile.
Read `docs/tickets.md` (the decisions there are binding) and `docs/decisions.md` before you start.

## AGENTS.md: section 1, Product hard rules (replace the first, third and eighth bullets)

- The user is the astronaut. No doctor view. Every action first says what the astronaut can do alone. Telling the
  flight surgeon is allowed as a second step, worded for the mission's link to Earth through `alsoTell()` from
  `src/scripts/mission.js`. Text about helping a crewmate is shown only when `hasCrew()` is true.
- Record, History, What to do is app-wide: Check records, Progress holds all history, Home says what to do. A card
  shows its result and one action after saving, nothing more.
- All user-facing text is English and professional. No emoji anywhere. No celebration. No developer notes on
  screen. Icons come from `lucide-preact`.
- Medical text is the team medic's. Do not rewrite it; move it or change who it addresses only where your task
  says so.
- "Not a medical device" appears once, in the footer. Sources and credits live in the Sources dialog.

## AGENTS.md: section 2, Stack and layout (replace)

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

## AGENTS.md: section 3, replace the Navigation and Start-up bullets

- **Routes:** `import { go, route, openCard, openEmergency } from "../lib/nav.js"`. Routes are URL hashes. Sections
  do not register themselves and there is no `window.AstroMedNav`.
- **Checks:** a section exports its deck cards from `src/components/<section>/cards.js`
  (`export const cards = [{ id, topic, title, Component, isDone }]`). The deck finds them; no shared file is edited.
- **Topics:** which check covers which NASA risk and which emergency card belongs to it is read from
  `src/data/topics.js`. Never write a cross-link by hand.
- **Mission:** `import { crewSize, hasCrew, link, alsoTell } from "./mission.js"`.
- **Start-up:** components render from the root. No `DOMContentLoaded` handlers, no new `window.*` globals.

## AGENTS.md: section 3a (replace the mount-point bullet and the registration bullet)

- There are no mount points. A section is components under `src/components/<section>/`, each under 200 lines, one
  component per file. Shared pieces come from `src/components/ui/`; do not write a second tab, chip, step, dialog,
  toast or card.
- Charts use `chart.js`. Icons use `lucide-preact`. Term definitions use `Term` from the kit.

## AGENTS.md: section 4, replace the build line

`pnpm build` then `node tools/shot.mjs --serve dist --out docs/evidence/<task>/<name>.png`. Unchanged otherwise.

## docs/decisions.md: rows to append (date 15 Nov 2026)

| Decision | Why |
|---|---|
| Crew size and the link to Earth come from the mission in the profile. The "astronaut is alone" rule is withdrawn. | ISS has a crew and a live link; Mars may not. Owner decision. |
| Astro is removed; the app is Vite and Preact with a minimal `index.html`. | Everything is Preact already. Owner decision. |
| Navigation is Home, Check, Progress, plus a pinned Emergency button. Overview, Readiness, Missions, Settings, Environment, Mission risks, Daily Checkup and Protocols stop being pages. | Reduction. Owner decision. |
| Every check is a card in one deck; Record, History, What to do is app-wide. | One pattern instead of one per section. |
| One table (`src/data/topics.js`) ties topic, check, NASA risk and emergency card. | Cross-links are generated, not hand-written. |
| No readiness score under 50% coverage of the due areas. No pre-filled or default answers. | A green signal with no measurement behind it is the most dangerous output of a self-monitoring aid. |
| Dependencies: `lucide-preact` (ISC), `chart.js` (MIT), `vite`, `@preact/preset-vite` (MIT). | Icons, charts, build. |
| Professional tone: no emoji, celebration, levels or points. A streak and a completion ring stay. | Owner decision. |
| Barcode lookup through Open Food Facts stays and needs the network; offline it says so. | Owner decision. |
| The current colour palette stays. | Owner decision. |
