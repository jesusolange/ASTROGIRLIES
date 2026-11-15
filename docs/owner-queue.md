# Owner queue

Open items only. Resolved items are in git history and `docs/decisions.md`.

## In progress

| # | Item |
|---|---|
| O3 | The doctor is reviewing the Emergency guide (`src/data/emergencies.js`): the cards agents wrote from public first-aid sources (bleeding, fracture, vision change, cabin air, the self-harm response), the open CHECK items, and the owner's change to "Shortness of breath" step 1 (needle step removed, choice of drain site first, see `docs/decisions.md`). The chest pain steps say not to take aspirin unprompted, which is more cautious than the cited NHS page. |
| O4 | The doctor is reviewing the Vision self-test thresholds and the mental health urgent response wording; the depression and stress score bands are carried over from the old app and labelled as design choices. |

## Known limits (no action planned)

- The radiation dose rates for Mars cruise (1.84 mSv/day) and Mars surface (0.64 mSv/day) are quoted from the
  abstracts of Zeitlin et al. 2013 and Hassler et al. 2014 in Science; nobody on the team has journal access to
  re-read the full papers. The ISS rate (about 0.7 mSv/day, DOSIS 3D) is quoted from Zhang et al. 2020.
