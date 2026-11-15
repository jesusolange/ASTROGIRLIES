# Owner queue

Open items only. Resolved items are in git history and `docs/decisions.md`.

## Decide

| # | Question | Default if no answer |
|---|---|---|
| D7 | Demo slides (issue 5): story, team member names, who builds them. The video voiceover is updated. | Not started. |
| D9 | `playwright-core` is in `package.json` and `pnpm-lock.yaml` in the main checkout, uncommitted. Keep it (then it needs a line in `docs/decisions.md`) or drop it? | Left uncommitted. |

## Do

| # | Item |
|---|---|
| O3 | Medic review of the Emergency guide (`src/data/emergencies.js`): the cards agents wrote from public first-aid sources (bleeding, fracture, vision change, cabin air, the self-harm response), which show like the doctor's own since the "not yet reviewed" label was removed; the open CHECK items; the owner's change to "Shortness of breath" step 1 (needle step removed, choice of drain site first, see `docs/decisions.md`). The chest pain steps say not to take aspirin unprompted, which is more cautious than the cited NHS page. |
| O4 | Medic review of the Vision self-test thresholds and of the mental health urgent response wording; the depression and stress score bands are carried over from the old app and labelled as design choices. |
| O5 | Radiation: the ISS rate is about 0.7 mSv/day (731 µSv/day, DOSIS 3D, as quoted in Zhang et al. 2020); the worker could not open the two Science papers (paywall) to re-read 1.84 and 0.64 mSv/day. Someone with access should confirm the three figures. |
| O1 | Confirm the Sketchfab URLs and licences for the brain and heart models (README credits). |
| O10 | The four destination pictures in `public/assets/environment/` (iss, moon, mars, rover) came in the team's first commit with no source or licence; Sources credits them as team assets. Who made them? If they are AI-generated they need the "AI-generated" badge like the Emergency and exercise pictures. |
| O11 | Add the live site URL to the top of `README.md` (and team member names, if wanted). |
| O12 | If a Cloudflare D1 database or a sign-in mail key was ever created, delete them in the Cloudflare dashboard; the app no longer uses them. |
