# T15 report: shared interface components, Mission risks and Mental Health as Preact

## What changed

- New shared components in `src/components/ui/`: `Panel`, `Button`, `Pill`, `Field`, `Tabs`, `LevelBadge`,
  `SourceLink`, `Findings`, with styles in `ui.css` using only `--am-*` tokens.
- Mission risks is now `RiskMapView.jsx` with `MissionPicker`, `RiskRow` and `RatingChip`. The mission comes from
  `useStored("astromed-profile", null)`; ratings and ranking still come from `src/scripts/risks.js`. The string
  renderer and its event wiring are gone from `src/scripts/riskmap.js`, which keeps the sidebar registration and
  the `missionField` / `missionOptions` / `setMissionType` helpers the legacy Environment page imports.
- Mental Health is now `MentalHealthView.jsx` with `MoodCheckIn`, `Questionnaire`, `Result`, `UrgentResponse` and
  `History`. Scoring, bands, the flag rule, history and `analyze` stay in `src/scripts/mental.js` with the same
  behaviour; `MOODS` and `MOOD_REPLIES` are exported for the view. `src/scripts/mental-page.js` is deleted and
  removed from `sections.js`.
- No HTML is built in strings, and no `innerHTML`, `querySelector` or `addEventListener` remains in either
  section's components.

## Before and after screenshots

Both sets are in this folder: `before-*.png` from the branch before the conversion, `after-*.png` from the
merged build. The pairs are mood, both questionnaires, a result, the urgent response, history, and Mission risks
for Mars planetary (default) and LEO short.

- Layout, wording, ranks, ratings and colours match.
- The history rows show the run's own date and time, so the timestamps differ between the two runs.
- The footer model credit differs: the after shots are from the build after merging `name15`, which brought the
  T02 3D model rebuild.

`after-urgent.png` shows the safety rule from ticket 12: answering "On certain days" to the suicidal-thoughts
item shows the immediate response above the result, at 1/27.

## Checks

- `pnpm test`: 44 pass, 0 fail.
- `pnpm build`: passes.
- `node tools/shot.mjs --serve dist --strict`: two failed requests remain, both pre-existing and outside this
  task: `/assets/space-background.jpg` (legacy image removed by T02, still referenced in `style.css`) and
  `/favicon.ico`. No console errors or exceptions.

## How to convert a section

1. Ask the coordinator for the section's line in `src/components/Sections.astro`; point it at a
   `src/components/sections/<Name>.astro` shell containing only the `am-page` section and the `client:only`
   view. Keep the component under `src/components/<section>/*.jsx`, one component per file.
2. Move pure logic (scoring, ranking, thresholds, data) into `src/scripts/` first, with `node:test` tests. Add
   exports the view needs; do not change behaviour.
3. Split the old string renderer into components by what the user sees: one for the picker or form, one per row
   or result, one for history. Lift state with `useState` / `useMemo` / `useStored`; never touch the DOM by hand.
4. Import `ui.css` in the view and use the shared `Panel`, `Button`, `Pill`, `Field`, `Tabs`, `LevelBadge`,
   `SourceLink` and `Findings` instead of section-local copies. Keep the section's own classes prefixed with its
   name and use only `--am-*` tokens.
5. Keep the section's logic module registering the sidebar entry (no `render`) and exposing the public
   `window.AstroMed<Section>` object with `findings()`.
6. Delete the old page module and its import, then take before/after screenshots with `node tools/shot.mjs
   --serve dist` and compare them before committing.
