# AstroMed remaster: tickets T21 to T40

Written 15 Nov 2026 from the design critique and the owner's review. Submission closes tonight, 23:59 local time.
These replace the earlier tickets (see git history of this file). One spec per ticket in `docs/specs/T21.md` to
`T40.md`. `docs/specs/RULES.md` is the new text for `AGENTS.md` and `docs/decisions.md`; T21 applies it.

## How to run them

- Batches run in order. Inside a batch the five tickets run in parallel; their owned paths do not overlap.
- A batch starts only after the one before it is merged into `name15`, `pnpm test` and `pnpm build` pass, the
  coordinator has told the owner what changed, and the owner has reviewed the app and said to go on.
- If time runs out, the last merged batch is the submission. Each batch leaves the app working.
- T30 (3D repair) has no dependencies and may start with batch 1 if a sixth agent is free.
- Evidence: no screenshots, from workers or the coordinator; skip every screenshot item in "Done when". The owner
  reviews the running app after each batch. `pnpm test` and `pnpm build` remain the gate.

| Batch | Tickets | What the app gains |
|---|---|---|
| 1 | T21 T22 T23 T24 T25 | Vite and Preact only; mission fields; mission-worded copy; no false reassurance; 11 emergency cards |
| 2 | T26 T27 T28 T29 T30 | Top bar with three destinations; Home; shared kit and deck frame; profile and cover; 3D repair |
| 3 | T31 T32 T33 T34 T35 | Every check as cards in the deck; Emergency screen rebuilt |
| 4 | T36 T37 T38 T39 | Progress with charts; formal report; one stylesheet system; phone and keyboard pass |
| last | T40 | Demo mission walk-through, dead code removed, offline check |

## Decisions these tickets rest on

**Product**
- The mission is set only in the profile: destination, crew size, start date, duration in days. The link to Earth is
  derived from the destination (`comm()`), never chosen separately.
- Copy follows the mission. Every action first says what the astronaut can do alone. "Tell the flight surgeon" may
  follow as a second step, worded by the link delay. Content about helping a crewmate shows only when crew size is
  over 1.
- Professional tone. One visual system, the current palette. No celebration, mascot, emoji or developer notes
  ("CHECK", "SOURCE-NEEDED", "pending review", "not yet reviewed") on screen. Points, levels and badges stay,
  static, on Home. The only demo name is the demo mission's astronaut, "Solange · Demo Astronaut".
- The medical text is the team medic's and is kept as written. Agents do not rewrite medical content; they move it
  and change who it addresses.
- "Not a medical device" appears once, in the fixed footer. Sources, study references, reference tables and asset
  credits live in one Sources dialog in the profile; a card keeps at most a short "Source" link that opens it.

**Structure**
- Vite with the Preact plugin; a minimal `index.html`; one root component. Astro is removed.
- Dependencies added: `lucide-preact` (icons, ISC), `chart.js` (charts, MIT). Bundled, no CDN. No tooltip library:
  term definitions use the HTML `popover` attribute.
- Top bar, full width, no outer margin: brand, Home / Check / Progress, mission chip, red Emergency button
  (key `E`), theme, profile. On phone the three destinations are a bottom tab bar.
- Routes are URL hashes: `#/home`, `#/check`, `#/check/<card id>`, `#/progress`, `#/emergency`,
  `#/emergency/<card id>`. Back and forward work everywhere.
- From Environment, the cabin readings stay as a "Cabin conditions" check card (T33) and the "Keep in mind at
  <place>" notes move to the profile's Mission section (T29). Its pickers and demo fill are deleted.
- Deleted as pages: Overview, Readiness, Missions, Settings, Environment, Mission risks, Daily Checkup, Protocols
  (becomes the report export on Progress). The "Next destination" card is deleted.
- Record, History, What to do is app-wide, not per section: Check records, Progress holds all history, Home says
  what to do.

**Screens**
- Home: streak and completion ring at the top (static, no animation of reward), what is due, "Needs attention"
  linking to the matching emergency card. The score shows only when at least 50% of the due areas are recorded;
  below that it says how many are recorded and lists the missing checks.
- Intervals come from the NASA risk score of each topic for the chosen mission (as `today.js` does now), labelled
  as our design choice.
- Check: a deck of cards built from one shared card component. A card has inputs, an inline error under the field
  with focus, Save, then the result and one action, then it leaves the deck. A toast offers Undo after each save.
  Records are for today only; no date picker.
- Progress: Chart.js line charts per measure, filter chips, the full history with Delete (and Undo), report export.
- Emergency: 11 cards, search, one step style, links to and from checks.
- Profile: all personal fields, required at first run, no "Later"; initials avatar; "Load demo mission";
  import and export; Sources.
- Cover: a planet for the destination; shown once per day.
- Report: formal, text-only.
- The 3D astronaut is an illustration beside the body cards. Every card must work without it.

**Kept on purpose**
- Barcode lookup through Open Food Facts stays. It needs the network, so offline it says so and offers manual
  entry and CSV import (`src/lib/csv.js`).
- The term "flight surgeon" stays.

## Owner answers, 15 Nov 2026 (binding; they override the ticket text where they differ)

- The group label "General first response (not yet reviewed by the team doctor)" goes, as T25 says. The
  agent-written cards (bleeding, fracture, vision-change, cabin-air, self-harm) are shown like the others.
- The doctor's four flight-surgeon lines are worded by the mission's link (`tell: "flight-surgeon"`, T25 and T35).
- Belly pain keeps both pictures, one beside each stage: they show different examinations (appendix points; Murphy's
  sign). T35's "one picture" item is withdrawn.
- The doctor's "Blood loss and shock" table moves from the vitals card into the bleeding card, text unchanged (T25).
- Body cards use the 3D model (T31); the old organ PNGs may be deleted when nothing uses them.
- First-run profile: every field is required (owner, after the batch 1 review); sex keeps "Prefer not to say" as
  an answer, and menopause is asked only for women (T29).
- Batch 1 review: the Emergency index plan stands (10 or 11 tiles, Vital signs entry on top, bone loss and
  anaemia as Guides in Check). Points, levels and badges are wanted.
- Pictograph characters inside the medic's text (for example in the kidney stone flow) are icons, not words: T25
  removes them and keeps every word.
- `cabin-air` has `topic: null`: there is no environment topic or check after T26.
## Already on name15 before batch 1

Reuse these; do not rebuild them. Today has the 50% coverage rule, Vision in the due list, and urgent findings
with a button to the matching emergency card (`src/scripts/today.js`, `src/components/today/`). Protocols has
mission-worded sending (`src/components/protocols/report-wording.js`). The profile has the menopause field and
`ntxRange(profile)` for N-telopeptide (T20). The app is offline-ready (`tools/service-worker.mjs`). The checkup is
one guided flow (`src/scripts/checkup-flow.js`); T31 replaces its step pane and keeps its record shape.

## Contracts between tickets

These names are fixed so parallel tickets can rely on them before the other side is merged.

- **Profile record** (`astromed-profile`): `missionType` (existing), `crew` (integer, 1 or more; missing means 1),
  start date and duration in days (reuse the existing fields behind `totalFor` and `missionDayFor` in
  `src/scripts/profile.js`).
- **`src/scripts/mission.js`** (T23 creates): `crewSize()`, `hasCrew()`, `link()` returning
  `{ kind: "live" | "delayed" | "none", oneWay, roundTrip }`, `alsoTell(who)` returning the second-step sentence
  for the current link or an empty string when there is no link. `comm()` moves here from `environment.js` in T26.
- **`src/data/topics.js`** (T27 creates, replaces `src/data/risk-coverage.js`): one row per topic,
  `{ id, label, riskIds: [], emergency: "<card id>" | null }`, with `topicFor(riskId)`, `emergencyFor(topicId)`,
  `topicsFor(emergencyId)`. Cards name their own topic; `cardsForTopic(topicId)` comes from
  `src/components/check/deck.js`. Home, the deck, "Why this order" and every cross-link read these.
- **Deck cards** (T28 creates the frame): each section exports its cards from `src/components/<section>/cards.js`
  as `export const cards = [{ id, topic, title, Component, isDone }]`. The deck collects them with
  `import.meta.glob("../*/cards.js", { eager: true })`, so no shared file is edited. `Component` receives
  `{ onSaved }`; `isDone()` says whether today's record exists.
- **Shared kit** (`src/components/ui/`, T28): `CheckCard`, `Steps`, `Term`, `Chips`, `Tabs`, `Field` (with
  `error`), `SourceLink`, `Dialog`, and `toast({ text, undo })` from `src/lib/ui.js`.
- **Emergency data** (`src/data/emergencies.js`, T25): each card may carry `crewOnly: true`; every card has
  `topic` matching a row in `topics.js` where one exists.
- **Emergency exports, as merged (T25):** `src/data/emergencies.js` exports `CARDS`, `CARD_BY_ID`,
  `resolveCardId(id)`, `indexCards(crew)`, `situations(crew)`, `VITALS_REFERENCE`, `BLOOD_LOSS`, `STORM_STEPS`,
  `STORM_NOTE`. `src/data/slow-risks.js` exports `BONE_LOSS`, `ANEMIA`, `SLOW_RISKS`, `SLOW_RISK_BY_ID`,
  `NTX_RANGES`. `src/data/sources.js` exports `SOURCES`, `SOURCE_BY_ID`, `sourcesFor(cardId)`. Read these files
  for the field names; do not change their shapes.
- **Mission, as merged (T23):** `src/scripts/mission.js` exports `crewSize`, `hasCrew`, `link`, `alsoTell`,
  `readComm`, `profileRecord`; each takes the profile or link as an optional argument for tests.
- **Routes** (`src/lib/nav.js`, T26): `go(path)`, `route` signal `{ area, id }`, `openEmergency(id)`,
  `openCard(id)`.
