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

The Amsler grid is drawn in `src/components/vision/GridTest.jsx`; no image is needed. The exercise
equipment illustrations already exist in `public/assets/exercise/` and were not re-sourced here.
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
The brain and heart files carry no embedded licence data, so their Sketchfab URLs still need to be
confirmed before submission.

| Model | Author | Source | Licence |
|---|---|---|---|
| Astronaut | Jungle Jim | https://sketchfab.com/3d-models/astronaut-by-jungle-jim-c775a977606a4e4e990afe783c6bc845 | CC BY 4.0 |
| Human Kidney | neshallads | https://sketchfab.com/3d-models/human-kidney-e1476ceb1e3b4412af5418eee9c5ed08 | CC BY 4.0 |
| Lungs | reynosa2000 | https://sketchfab.com/3d-models/lungs-981d026657984895a90422d5e99e7ac2 | CC BY 4.0 |
| Human Anatomy (muscles, skeleton) | mohamedhussien | https://sketchfab.com/3d-models/human-anatomy-faf0f3eaec554bcf854be2038993024f | CC BY 4.0 |
| Human Brain | AH | Sketchfab (URL to confirm) | CC BY 4.0 |
| Human Heart | TinkerLane Studio | Sketchfab (URL to confirm) | CC BY 4.0 |

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
- **Five emergency guide photographs** (`chest.jpg`, `drain.jpg`, `belly-rovsing.jpg`,
  `belly-murphy.jpg`, `dermatome.jpg` in commit `1e536a5`). The commit states no origin or licence.
  T14 copies them to `public/assets/emergency/`; their source still needs to be recorded by the owner.
- **Exercise equipment illustrations** (`public/assets/exercise/ared.png`, `cevis.png`, `t2.png`).
  They are generated illustrations with no stated source or licence. They were not re-sourced here
  because this task owns only the medical figures; the Exercise owner should replace or credit them.
- **Organ illustrations already in `public/assets/`** (`heart.png`, `lungs.png`, `kidneys.png`,
  `brain.png`, `skeleton.png`, `muscles.png`). Their origin is not documented. The new figures above
  are cleared replacements; the old files should be removed when the sections are rewired.
