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
| O1 | Confirm the Sketchfab URLs and licences for the brain and heart models (README credits). |
| O2 | In Cloudflare Pages, change the build settings before the next deploy (see D4). |
