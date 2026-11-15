# AstroMed (ASTROGIRLIES)

> NASA International Space Apps Challenge 2026 submission for "Create Health Monitoring Software for Astronauts
> on Space Missions". AstroMed is a health self-monitoring app for astronauts on missions in low Earth orbit, at
> the Moon or at Mars, where help from Earth is delayed or out of reach.

**Live site:** _add the public URL here once deployed._

AstroMed is a screening and self-monitoring aid. It is not a medical device and does not give a diagnosis.

## What the app does

The app has three places, reached from the top bar (a bottom tab bar on a phone), plus Emergency, always one click
or the `E` key away.

- **Home** says what to do today: a streak, today's completion ring, points, levels and badges, a readiness score
  (shown only when at least half of the due areas have a current record), the findings that need attention, each
  with a button to the matching emergency card, and the checks due today, ordered by NASA's risk rating for the
  chosen mission.
- **Check** is a deck of cards, one check per card, with a search to pick any of them:
  - **Body**: brain and sleep, thorax (heart, lungs), kidneys, temperature and glucose, bones, muscles, next to a
    3D model of the body with the organs in place.
  - **Vision**: an on-screen Amsler grid and near-vision chart for each eye, after a one-time screen calibration
    (spaceflight-associated neuro-ocular syndrome).
  - **Mind**: mood, depression and stress questionnaires.
  - **Immune**: infection signs and lab results (saliva, blood or urine).
  - **Radiation**: dose log against NASA's career limit, with a projected mission dose.
  - **Cabin conditions**: temperature, pressure, humidity, carbon dioxide, noise and dose rate.
  - **Nutrition**: meals by search, barcode or manual entry, against targets from the profile, with NASA's
    in-flight iron limit.
  - **Exercise**: ARED, T2 and CEVIS sessions and the VO2max test.
  - **Guides**: space anaemia and bone density loss.
- **Progress** holds all history: charts per measure with reference bands, a full record table with delete and
  undo, and a formal text-only report to print as PDF.
- **Emergency** is the team doctor's first-response guide: cards ordered by how fast you must act, searchable by
  symptom, with step-by-step instructions and pictures, and links to the related checks.

Every result ends in an action the astronaut can take alone. Lines about a crewmate appear only when the mission
has a crew; telling the flight surgeon is a second step, worded by the mission's link to Earth (live near Earth, a
short pause at the Moon, a 6 to 44 minute round trip at Mars).

**Profile.** The mission (destination, crew size, start date, length) is set once, in the profile. Several crew
members can share one device: the cover asks who is checking in, each person sees only their own records, and an
optional PIN keeps records out of casual view. **Load demo mission** fills 14 days of sample data as "Solange ·
Demo Astronaut" (simulated values, clearly marked); it leaves today's thorax, nutrition and exercise checks open.

**Offline.** After one visit the app works with no network connection. Data stays in the browser on this device;
**Export my data** and **Import data** in the profile move it, and **Export measurements as CSV** gives a
spreadsheet. There are no accounts and no server.

## Running it

You need Node 22 or newer and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:4321
```

Build and serve the static site that gets deployed:

```bash
pnpm build      # writes dist/
pnpm preview    # serves dist/
```

Tests:

```bash
pnpm test
```

`node tools/shot.mjs --serve dist --out shot.png` (after `pnpm build`) opens the built site in headless Chrome,
saves a screenshot and lists console errors and failed requests; `--eval "<js>"` drives the page first.

### Deploying

The site is static. On Cloudflare Pages (or any static host): build command `pnpm build`, output directory
`dist`. No server, database or environment variables are needed.

## How it is built

[Vite](https://vite.dev) and [Preact](https://preactjs.com), with `@preact/signals` for shared state,
[three.js](https://threejs.org) for the 3D body and the cover planet, [Chart.js](https://www.chartjs.org) for
Progress, and [lucide-preact](https://lucide.dev) for icons. All are MIT or ISC licensed and bundled, so nothing
is loaded from a CDN.

- `index.html`, `src/main.jsx`, `src/components/App.jsx`: entry and root component.
- `src/components/<section>/`: the interface, one Preact component per file; `src/components/ui/` is the shared
  kit (card, steps, terms, chips, tabs, dialog, search, toast).
- `src/scripts/`: logic per section, tested with `node:test` in `test/`.
- `src/data/`: the NASA risk ratings, topics, emergency guide, sources and figures.
- `src/styles/tokens.css`: the colour tokens for the dark and light themes.
- `docs/`: tickets, specs, decisions and references.

## Data sources

Numbers and thresholds come from a named source or are labelled in the app as our design choice.

- **NASA Human Research Roadmap**: the 22 risk pages and their likelihood x consequence ratings per mission type
  (in mission and long-term health), fetched into `src/data/hrr-risks.js` by `tools/fetch-hrr.mjs`. They rank the
  due checks and set how often each comes back (the interval mapping is our design choice).
- **NASA-STD-3001 Volume 1**: 4031, space flight radiation exposure (career limit); 4027, bone and mineral.
- **JSC-67378 Rev 1**, Nutritional Requirements for Exploration Missions up to 365 days (NASA, 2020): the in-flight
  iron limit.
- **English et al. 2020**, High intensity training during spaceflight (NASA Sprint Study), npj Microgravity 6:21:
  resistive exercise six days a week.
- **Crucian et al. 2018**: virus reactivation in spaceflight. **Space anaemia** (PMC10976580). **MR089S**: bone
  and mineral.
- Radiation dose rates: DOSIS 3D and Chang'e-4 LND (Zhang et al. 2020), MSL RAD cruise and surface (Zeitlin et
  al. 2013, Hassler et al. 2014). Signal delay to Earth: NASA NTRS 20220013418.
- First response: the team doctor's notes, the Glasgow Coma Scale, Stop the Bleed and Red Cross first aid steps.

The full list, with links, is in the app under Profile > Sources and in `docs/references.md`.

## Credits

3D models from Sketchfab under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): Astronaut by Jungle
Jim, Human Kidney by neshallads, Lungs by reynosa2000, Human Anatomy (muscles, skeleton) by mohamedhussien, Human
Brain by AH, Human Heart by TinkerLane Studio. Planet textures from NASA public-domain imagery (Blue Marble, the
SVS CGI Moon Kit, and a NASA/USGS Mars mosaic). Medical figures from Laboratoires Servier (CC BY-SA 3.0),
OpenStax (CC BY 4.0), the U.S. Navy (public domain) and Wikimedia Commons (CC0). Every asset, with its source
and licence, is listed in `docs/references.md`.

Team AstroGirlies, NASA Space Apps 2026.
