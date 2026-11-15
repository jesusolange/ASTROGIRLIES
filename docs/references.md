# References: images, models and fonts

One row per asset: title, author, source page, licence, licence URL, date accessed and what changed.
"Authored" means made by the team for this project.

## Figures the app needs

Each figure was chosen against the sections that will show it. The section owners wire them in from
`src/data/figures.js`; this task only sources and records them.

| Figure | Where it will be used | What it must show |
|---|---|---|
| Dermatome map, anterior and posterior | Emergencies: numbness, weakness or a suspected spinal injury | Front and back of the body with the skin areas of C2 to S5 labelled |
| Heart | Daily Checkup: Cardiovascular | A whole heart with the great vessels, on a plain background |
| Lungs | Daily Checkup: Respiratory | Both lungs and the trachea, on a plain background |
| Kidney and urinary tract | Daily Checkup: Renal and urinary | Both kidneys, ureters, bladder and urethra |
| Brain | Daily Checkup: Neurological | A whole brain, clearly a human brain, on a plain background |
| Skeleton | Daily Checkup: Musculoskeletal | A front view of the whole skeleton |
| Skeleton with common fracture sites | Emergencies: suspected fracture | Wrist, hip, spine and ankle marked on a whole skeleton |
| Closed fracture | Emergencies: suspected fracture | A limb with a closed (skin not broken) fracture |
| Eye cross-section with the optic nerve | Vision (SANS): before the grid and near-vision tests | Labelled cornea, lens, retina and optic nerve |
| Amsler grid | Vision (SANS): grid distortion test | A square grid with a centre dot, drawn in code (no image needed) |
| Pressure points for bleeding control | Emergencies: bleeding that will not stop | The arterial pressure points on the body |
| Recovery position | Emergencies: a person who is breathing but not awake | A person on their side with the airway open |
| ARED, CEVIS and T2 exercise equipment | Exercise & Recovery | The three exercise machines used on the station |

The Amsler grid is drawn in `src/components/vision/GridTest.jsx`; no image is needed. The ARED, CEVIS
and T2 illustrations are AI-generated; they are recorded in the AI-generated illustrations table below.
Protocols has no figure of its own: it lists saved results and builds the PDF report, so it uses the
same organ figures as Daily Checkup.

## Sourced figures

All files are in `public/assets/medical/`. "Original file" is the file name on Wikimedia Commons, kept
so the licence page can be found again. Only the files whose "Change" says so were resized; the resize
kept each PNG or JPEG under the 400 KB limit.

**CC BY-SA 3.0 notice:** these figures are share-alike. Any image derived from them must be released
under CC BY-SA 3.0 as well. Attribution must name Laboratoires Servier (or the author named in the row).

| File | Original file | Title | Author | Source page | Licence | Licence URL | Accessed | Change |
|---|---|---|---|---|---|---|---|---|
| `dermatome-anterior.png` | `Nervous system - Dermatomes 1 -- Smart-Servier.png` | Dermatomes, anterior view | Laboratoires Servier | https://commons.wikimedia.org/wiki/File:Nervous_system_-_Dermatomes_1_--_Smart-Servier.png | CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0/ | 2026-11-14 | None |
| `dermatome-posterior.png` | `Nervous system - Dermatomes 2 -- Smart-Servier.png` | Dermatomes, posterior view | Laboratoires Servier | https://commons.wikimedia.org/wiki/File:Nervous_system_-_Dermatomes_2_--_Smart-Servier.png | CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0/ | 2026-11-14 | None |
| `heart.png` | `Cardiovascular system - Heart 1 -- Smart-Servier.png` | Human heart | Laboratoires Servier | https://commons.wikimedia.org/wiki/File:Cardiovascular_system_-_Heart_1_--_Smart-Servier.png | CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0/ | 2026-11-14 | None |
| `lungs.png` | `Respiratory system - Lungs -- Smart-Servier.png` | Human lungs | Laboratoires Servier | https://commons.wikimedia.org/wiki/File:Respiratory_system_-_Lungs_--_Smart-Servier.png | CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0/ | 2026-11-14 | None |
| `urinary-tract.png` | `Urinary system - Urinary tract 1 -- Smart-Servier.png` | Kidneys and urinary tract | Laboratoires Servier | https://commons.wikimedia.org/wiki/File:Urinary_system_-_Urinary_tract_1_--_Smart-Servier.png | CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0/ | 2026-11-14 | None |
| `brain.png` | `Nervous system - Brain 1 -- Smart-Servier.png` | Human brain, sagittal section | Laboratoires Servier | https://commons.wikimedia.org/wiki/File:Nervous_system_-_Brain_1_--_Smart-Servier.png | CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0/ | 2026-11-14 | None |
| `skeleton.png` | `Skeleton 1 -- Smart-Servier.png` | Human skeleton | Laboratoires Servier | https://commons.wikimedia.org/wiki/File:Skeleton_1_--_Smart-Servier.png | CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0/ | 2026-11-14 | Resized to 500 px wide |
| `fracture-closed.png` | `Kind of fractures - Closed fracture -- Smart-Servier.png` | Closed fracture | Laboratoires Servier | https://commons.wikimedia.org/wiki/File:Kind_of_fractures_-_Closed_fracture_--_Smart-Servier.png | CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0/ | 2026-11-14 | Resized to 1280 px wide |
| `eye-cross-section.svg` | `Schematic diagram of the human eye en.svg` | Cross-section of the human eye | Rhcastilhos and Jmarchn | https://commons.wikimedia.org/wiki/File:Schematic_diagram_of_the_human_eye_en.svg | CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0/ | 2026-11-14 | None |
| `pressure-points.jpg` | `Pressure points.jpg` | Pressure points for bleeding control | U.S. Navy | https://commons.wikimedia.org/wiki/File:Pressure_points.jpg | Public domain (work of the U.S. Navy) | https://commons.wikimedia.org/wiki/Template:PD-USGov-Military-Navy | 2026-11-14 | None |
| `recovery-position.svg` | `Recovery position 02.svg` | Recovery position | Mrmw | https://commons.wikimedia.org/wiki/File:Recovery_position_02.svg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 2026-11-14 | None |
| `muscles.jpg` | `1105 Anterior and Posterior Views of Muscles.jpg` | Major muscles of the body | OpenStax | https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles.jpg | CC BY 4.0 | https://creativecommons.org/licenses/by/4.0/ | 2026-11-14 | Resized to 600 px wide, JPEG quality 80 |

## 3D models

Copied from `README.md`; the README is not changed. All are credited there as CC BY 4.0 on Sketchfab.
The brain and heart Sketchfab URLs were confirmed by the team on 15 Nov 2026.

| Model | Author | Source | Licence |
|---|---|---|---|
| Astronaut | Jungle Jim | https://sketchfab.com/3d-models/astronaut-by-jungle-jim-c775a977606a4e4e990afe783c6bc845 | CC BY 4.0 |
| Human Kidney | neshallads | https://sketchfab.com/3d-models/human-kidney-e1476ceb1e3b4412af5418eee9c5ed08 | CC BY 4.0 |
| Lungs | reynosa2000 | https://sketchfab.com/3d-models/lungs-981d026657984895a90422d5e99e7ac2 | CC BY 4.0 |
| Human Anatomy (muscles, skeleton) | mohamedhussien | https://sketchfab.com/3d-models/human-anatomy-faf0f3eaec554bcf854be2038993024f | CC BY 4.0 |
| Human Brain | AH | https://sketchfab.com/3d-models/human-brain-7a27c17fd6c0488bb31ab093236a47fb | CC BY 4.0 |
| Human Heart | TinkerLane Studio | https://sketchfab.com/3d-models/heart-764e3bbc71664221bb123eef5c47fee8 | CC BY 4.0 |

## Planet textures

The cover globe is textured with public-domain NASA and NASA/USGS imagery. Each map is an
equirectangular colour map, bundled in `public/assets/planets/` and loaded from the app, never from
the network. The credit lines below are the ones the source pages ask for.

| File | Title | Author | Source page | Licence | Licence URL | Accessed | Change |
|---|---|---|---|---|---|---|---|
| `earth.jpg` | Blue Marble: land surface, shallow water and shaded topography | NASA Visible Earth; Reto Stöckli and Robert Simmon, NASA Goddard Space Flight Center | https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/ | Public domain (NASA) | https://www.nasa.gov/nasa-brand-center/images-and-media/ | 2026-11-15 | Downscaled from 21600 by 10800 pixels to 1920 by 960 and saved as JPEG. |
| `moon.jpg` | CGI Moon Kit: LROC color map | NASA Scientific Visualization Studio; Ernie Wright | https://svs.gsfc.nasa.gov/4720 | Public domain (NASA) | https://www.nasa.gov/nasa-brand-center/images-and-media/ | 2026-11-15 | Downscaled to 2048 by 1024 and saved as JPEG. |
| `mars.jpg` | Mars Viking MDIM21 color mosaic | NASA, Jet Propulsion Laboratory and USGS Astrogeology | https://astrogeology.usgs.gov/search/details/Mars/Viking/MDIM21/Mars_Viking_MDIM21_ClrMosaic_global_232m/cub | Public domain (NASA/USGS) | https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits | 2026-11-15 | Downscaled from 21339 by 10670 pixels to 1920 by 960 and saved as JPEG. |

The Earth and Mars files are 1920-pixel renditions of the same public-domain originals, fetched from
Wikimedia Commons (`File:Land shallow topo 2048.jpg` and `File:Mars Viking MDIM21 ClrMosaic 1km.jpg`)
because the NASA and USGS download hosts did not complete the transfer from this network. The Moon
map was fetched directly from the Scientific Visualization Studio. The same rows are exported from
`src/scripts/planet.js` and listed in the Sources dialog under "Planet textures".

## Authored by the team

| File | Title | Author | Licence |
|---|---|---|---|
| `public/icons/icon.svg` | AstroMed app icon, vector source | AstroGirlies team | Project |
| `public/icons/icon-192.png` | AstroMed app icon, 192 px | AstroGirlies team | Project |
| `public/icons/icon-512.png` | AstroMed app icon, 512 px | AstroGirlies team | Project |
| `public/favicon.svg` | AstroMed favicon | AstroGirlies team | Project |

### AI-generated illustrations

These pictures were generated with an image model for this project. The app marks them on screen with
an "AI-generated" badge, and their alt text ends in "(AI-generated illustration)".

| File | Title | Author | Licence |
|---|---|---|---|
| `public/assets/emergency/chest.jpg` | Chest: the two chest drain sites | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/emergency/drain.jpg` | Chest drain: tip at the top for air, low for fluid | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/emergency/belly-rovsing.jpg` | Abdomen with the McBurney, Lanz and Blumberg points | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/emergency/belly-murphy.jpg` | Abdomen with the Murphy point | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/emergency/dermatome.jpg` | Body map: front and back, skin areas by nerve level | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/ARED.png` | ARED resistance machine in use | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/T2.png` | T2 treadmill in use | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/CEVIS.png` | CEVIS exercise bike in use | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/environment/iss.png` | International Space Station | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/environment/moon.png` | Moon | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/environment/mars.png` | Mars | AstroGirlies team | AI-generated illustration, made for this project |
| `public/assets/environment/rover.png` | Pressurized rover | AstroGirlies team | AI-generated illustration, made for this project |


## Fonts and libraries

No web fonts are bundled: the app uses the system UI font stack, so it works offline with no font
request. Library versions are from `package.json`; all are MIT.

| Library | Version | Licence | Used for |
|---|---|---|---|
| astro | 7.4.11 | MIT | Build tool and static site |
| @astrojs/preact | 6.1.6 | MIT | Astro integration for the Preact islands |
| preact | 11.2.0 | MIT | Interface components |
| @preact/signals | 2.11.4 | MIT | State shared between components |
| three | 0.187.0 | MIT | 3D astronaut and organs |
| three.js in `public/legacy/astronaut3d.js` | bundled build | MIT | Prebuilt 3D bundle; source not in the repo |
| jsPDF in `public/legacy/astromed-pro.js` | bundled build | MIT | Prebuilt PDF report bundle; source not in the repo |

## Not sourced

- **Skeleton with common fracture sites.** Searched Wikimedia Commons for "fracture sites",
  "common fracture sites", "skeletal trauma", "osteoporotic fracture" and "fragility fracture". Checked
  the 20-page Servier "Bones - Bone fractures" set and the OpenStax fracture figures. No file with a
  clear licence marks the common sites on a whole skeleton. The plain skeleton and a closed-fracture
  illustration were sourced instead; a later task can place markers on the skeleton.
- **Amsler grid.** No image needed: it is drawn in code in `src/components/vision/GridTest.jsx`.
- **Organ illustrations formerly in `public/assets/`** (`heart.png`, `lungs.png`, `kidneys.png`,
  `brain.png`, `skeleton.png`, `muscles.png`, `liver.png`, `pulse.png`). Removed in batch 3: the body cards
  use the 3D model instead.
