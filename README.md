# AstroMed (ASTROGIRLIES)

NASA International Space Apps Challenge submission. AstroMed is a self-monitoring health dashboard for astronauts: a 3D body scan, a guided daily checkup, exercise, mental health, nutrition, radiation, environment and readiness tracking, and a printable health report.

**Live site:** _add the public URL here once deployed (see issue #1)._

## Challenge

_Add the exact challenge name from the Space Apps challenge page here._ The app lets a crew member monitor their own health on a long mission, without relying on a ground connection.

## What the app does

- **Daily Checkup:** click the 3D astronaut and log measurements organ by organ (brain, lungs, heart, kidneys, pulse, muscles, bones). Each system turns from red to green as it is logged.
- **Exercise:** log sessions and see weekly overviews.
- **Mental Health, Overview, Protocols:** stress and mood tracking, a summary of all body systems, and suggested protocols.
- **Nutrition, Radiation, Environment, Missions, Progress, Readiness:** extra modules that feed a 0-100 readiness score.
- **PDF report:** generated in the browser from the saved data.

Readiness weights and bands are design choices of this prototype, not NASA values. The app uses published NASA standards and reference values only. It does not use real crew data.

## Running it

There is no build step and no server. Open `index.html` in a browser, or serve the folder with any static host.

```bash
python -m http.server 8000
```

### Deploying (Cloudflare Pages)

Create a Pages project from this repo (private repos work). Framework preset: none. Build command: empty. Build output directory: `/`. Then open the `*.pages.dev` URL in a private window to confirm it loads with no login.

### Tests

```bash
npm test
```

All data is stored in your browser (`localStorage`) and never sent to a server. Use **Settings > Export / Import my data** to back up or move a record.

## Data sources

_List the NASA standards and reference documents the thresholds come from here (for example the NASA-STD-3001 volumes)._

## References and credits

3D models (Sketchfab, licensed [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)):

| Model | Author | Source |
| --- | --- | --- |
| Astronaut | Jungle Jim | https://sketchfab.com/3d-models/astronaut-by-jungle-jim-c775a977606a4e4e990afe783c6bc845 |
| Human Kidney | neshallads | https://sketchfab.com/3d-models/human-kidney-e1476ceb1e3b4412af5418eee9c5ed08 |
| Lungs | reynosa2000 | https://sketchfab.com/3d-models/lungs-981d026657984895a90422d5e99e7ac2 |
| Human Anatomy (muscles, skeleton) | mohamedhussien | https://sketchfab.com/3d-models/human-anatomy-faf0f3eaec554bcf854be2038993024f |
| Human Brain | AH | Sketchfab (CC BY) |
| Human Heart | TinkerLane Studio | Sketchfab (CC BY) |

Brain and heart credits come from `LEEME.txt`; their model files carry no embedded license data, so confirm the Sketchfab URLs before submitting.

Other resources: image assets in `assets/` (ARED, CEVIS, T2, organ and environment images), PDF generation library bundled in `astromed-pro.js`, and the 3D engine bundled in `astronaut3d.js`. _Confirm the names, licenses and sources of these before submitting._
