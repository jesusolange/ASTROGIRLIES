# T18 — App shell as layout and Preact components

## What changed

- `src/layouts/App.astro` now holds the document frame: head, theme bootstrap, icon sprite, script entry and the PDF bundle.
- `src/pages/index.astro` composes the layout, the shell and `Sections`. The legacy Daily Checkup and Exercise markup stays here for now (owned by T09 and T17).
- `src/lib/nav.js` is the one source of truth: the ordered section list as data, `currentSection`, `show`, `has`, `current`, hash handling and `apply()`. `window.AstroMedNav` stays as a thin wrapper for older modules and the PDF bundle.
- Shell components: `src/components/shell/{Sidebar,Header,Toasts,Modal,Footer}.jsx` (Modal is a native `<dialog>`).
- Settings: `src/components/settings/SettingsView.jsx` (data statement, account and sync, JSON backup/restore, CSV export).
- Progress: `src/components/progress/*` with the logic and tests moved to `src/scripts/progress.js`; chart colours use the `--am-*` tokens.
- Protocols: `src/components/protocols/ProtocolsView.jsx`; the PDF button still calls the legacy bundle.

## Removed after searching for callers

- `index.astro`: the hidden `#legacyJsBindings` block (`coveragePercent`, `coverageList`, `recentRecords`, `systemList`, `runSim`, `viewReport`, `allRecords`, `exportCsv`).
- `checkup.js`: the radiation "what-if" dialog, the reports dialog, the old Settings modal, its CSV exporter, `buildSystemList()` and `renderOverview()` (they only filled the hidden block). Toasts now go through `window.AstroMedToast`.
- `style.css`: rules for the removed `.system-btn`/`.sys-symbol`, `.readiness-line`/`.meter`, `.modal*`, `.close`, `.slider-row`, `.sim-result` and `.report-list`.
- `sections.css`: `.am-consult`/`.am-report`, now owned by the Protocols component CSS.
- Nav registration calls in `today.js`, `emergencies.js`, `immune.js`, `riskmap.js`, `vision.js` (sections now come from the data list).

## Kept on purpose

- `window.AstroMedNav.register()` as a no-op so the modules still being converted (T16 Environment/Radiation, T17 Nutrition/Exercise) do not break; it goes away after they merge.
- `METRIC_RULES` and `analyze()` stay in `sections.js` until T09 merges, per the coordinator.
- The checkup and exercise markup in `index.astro`, so T09 and T17 can move their own blocks.

## Verification

- `pnpm test`: 83 pass, 0 fail (new `test/nav.test.js`, `test/progress.test.js`).
- `pnpm build`: passes.
- `node tools/shot.mjs --serve dist --strict`: no console errors, no failed requests.
- `show(id)` for all 13 page sections: exactly one page visible each time.
- URL hash: `#progress` reloads into Progress; a hash change switches section.
- Settings opens from the sidebar button and from `show("settings")`.

## Screenshots (dark and light)

Before: `before-{shell,settings,progress,protocols}-{dark,light}.png` (from the pre-refactor T04 evidence).
After: `after-{shell,settings,progress,protocols}-{dark,light}.png`.
