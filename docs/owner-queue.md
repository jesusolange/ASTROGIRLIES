# Owner queue

## Decide

| # | Question | Default if no answer |
|---|---|---|
| D1 | Does readable source for the 3D astronaut and the PDF report exist on a teammate's machine? | T02 recovers the 3D source from the bundle; the PDF report stays a prebuilt bundle. |
| D2 | Emergencies (ticket 7) is marked as a colleague's work. Build it here anyway? | Built here as T06 on `name15`; the colleague's version wins if it arrives. |
| D3 | Medic content: Vision self-test thresholds (ticket 6) and the wording of the mental health urgent response (ticket 12). | Published screening basis (Amsler grid, near-vision card), labelled "screening aid, not a diagnosis"; placeholder wording kept in one constant. |
| D4 | Push `name15` to GitHub and deploy it to Cloudflare Pages (issue 1)? The build settings changed: preset Astro, command `pnpm build`, output `dist`. | Not pushed, not deployed. |
| D5 | Switch sign-in on for the public demo (issue 1)? It needs the D1 database id, the mail key and the site URL. | Left off. |
| D6 | Points, streaks and badges in Missions: keep or drop (ticket 5)? | Kept, moved under the Today page. |
| D7 | Demo slides (issue 5): story, team member names, who builds them. | Not started. |
| D8 | Cut line for Sunday night. | Order of dispatch: 3D source, risk map, theme, mental health, emergencies, vision, today, checkup flow, cover, images, offline. |

## Do

| # | Item |
|---|---|
| O3 | Medic review of `src/data/emergencies.js`: every situation, and first the five marked as design choice (vision change, headache or confusion, flank pain, thoughts of self-harm, cabin air). The chest pain steps say not to take aspirin unprompted, which is more cautious than the cited NHS page. |
| O4 | Medic review of the urgent wording in `SUICIDAL_RESPONSE` (`src/scripts/mental.js`); the depression and stress score bands are carried over from the old app and labelled as design choices. |
| O5 | Radiation: the ISS rate is now about 0.7 mSv/day (731 µSv/day, DOSIS 3D, as quoted in Zhang et al. 2020) instead of 0.2 to 0.5; the worker could not open the two Science papers (paywall) to re-read 1.84 and 0.64 mSv/day. Someone with access should confirm the three figures. |
| O1 | Confirm the Sketchfab URLs and licences for the brain and heart models (README credits). |
| O2 | In Cloudflare Pages, change the build settings before the next deploy (see D4). |
