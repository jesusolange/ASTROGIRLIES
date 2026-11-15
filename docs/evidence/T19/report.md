# T19 · First integration pass

## What changed

- **Today · Vision in the queue.** `src/scripts/today.js` now takes the Vision interval from the mission risk
  model (`areaWeights` / `rankedRisks`, SANS risk 105). The last Vision result date comes from the Vision store, so
  saving a check removes it from the queue the same day. The row labels the interval as our design choice.
- **Today · urgent findings open a card.** `src/scripts/today.js` maps a finding's subject to an Emergency card id
  (plain data, first match wins), and `UrgentFindings.jsx` shows "Open the emergency guide". It uses the existing
  public `window.AstroMedEmergencies.open(id)`, which was already available, so no Emergencies view change was
  needed. Daily checkup findings are read through `window.AstroMedData.analyze()`.
- **Protocols · wording.** The section now frames the PDF as the astronaut's own mission health report first,
  then offers sending as an optional step derived from `window.AstroMedEnv.comm()` in the tested module
  `src/components/protocols/report-wording.js`: near Earth "send it now", Moon "replies come after a short pause",
  Mars/cruise "one complete message; a reply takes 6 to 44 minutes or more; do not wait", no Environment set or a
  place without a defined link "if you have contact with Earth, you can send it".
- **Vision · action wording.** The primary actions are self-care first (open Emergencies, repeat the check, keep
  sharp-vision tasks light). The urgent result button opens the matching "Sudden change in vision" card.
- **Figures.** New shared `src/components/ui/Figure.jsx` (image, caption, credit line "Title, Author, Licence"
  linking to the source page) using `src/data/figures.js`. Vision shows the eye cross-section before calibration,
  the grid and the near-vision chart.

## Screenshots

- `today-vision-queued.png` — Today's work queue with "Vision self-check", NASA rating 4×4, interval our design choice.
- `urgent-finding.png` — body temperature 39.2 shown under "Needs attention now" with "Open the emergency guide".
- `emergency-card.png` — the Fever or infection card opened from that button.
- `protocols.png` — the mission health report framing with the Mars link wording.
- `vision-figure.png` — the eye cross-section with its caption and credit line.

Verified by script: with a saved Vision result dated today, "Vision self-check" disappears from the queue; the
urgent button opens `emergenciesPage` with `data-card="fever"`; the Protocols text contains no "ground team" or
"doctor" wording.

## Where the other figures should go (sections not owned by this task)

- Daily Checkup panels: `heart` (Cardiovascular), `lungs` (Respiratory), `urinary-tract` (Renal and urinary),
  `brain` (Neurological), `skeleton` (Musculoskeletal), `muscles` (Muscle health).
- Emergencies: `dermatomes-anterior` and `dermatomes-posterior` (numbness, weakness, suspected spinal injury),
  `fracture-closed` and `skeleton` (suspected fracture), `pressure-points` (bleeding that will not stop),
  `recovery-position` (breathing but not awake).

## Notes

- MISSING: none.
- SOURCE-NEEDED: none added. The Vision thresholds and the check cadence remain labelled as design choices.
- The Daily Checkup high-temperature action ("Contact your flight surgeon now.") lives in `src/scripts/sections.js`,
  which this task does not own; it still puts the Earth contact first.
