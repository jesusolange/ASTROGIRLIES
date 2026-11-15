# Submission form text

Text for the Space Apps project form, one section per field. Copy, check, and paste.

Live: https://astrogirlies.pages.dev · Demo: https://youtu.be/v9RPcG16UKM

## Summary

AstroMed is a health monitoring app designed for astronauts on missions in low Earth orbit, on the Moon or on Mars,
where assistance from Earth may be delayed or unavailable. It is Team AstroGirlies' entry for the 2026 NASA Space
Apps challenge.

The 'Home' screen shows what to check today, ranked by NASA's Human Research Roadmap risk ratings for the mission,
and flags anything that needs attention. Check records your body's condition (beside a 3D anatomical model),
vision, mental state, signs of infection, radiation exposure, cabin air quality, nutritional intake and exercise
levels, one category at a time. Progress stores all the user's history in the form of charts and a printable
report. The Emergency (E key) feature provides the team medic's step-by-step first-response guide.

The app works offline and supports several crew members on one device. It describes every action in terms of what
the astronaut can do alone, taking into account the mission's real signal delay to Earth. Thresholds are based on
NASA standards and cited papers. This is a self-monitoring aid, not a medical device.

## Project Details

**What it does and how it works.** The astronaut sets the mission once in the profile: destination (low Earth
orbit, lunar orbit, lunar surface or Mars), crew size, start date and length. From that, AstroMed loads NASA's
Human Research Roadmap ratings for that mission type and ranks 22 health risks. Home turns the ranking into a daily
list of checks, brings each check back on an interval set by its rating, shows a readiness score only once at least
half of the due areas are measured, and lists findings that need attention, each with a button to the matching
emergency card. Check is a deck of cards, one check per card: body systems next to a 3D anatomical model, an
on-screen Amsler grid and near-vision chart per eye, mood and mental health questionnaires, infection signs and lab
results, radiation dose against NASA's career limit, cabin conditions, meals (with NASA's in-flight iron limit) and
ARED, T2 and CEVIS training. Every result ends in one concrete action. Progress keeps all history as charts and a
table and prints a formal report. Emergency, one key away, is the team medic's first-response guide, searchable by
symptom and ordered by how fast the astronaut must act.

**Benefits and intended impact.** On a long mission the crew has to notice health changes themselves, and help
from Earth arrives minutes later or not at all. AstroMed tells the astronaut what matters most for their mission,
makes recording it quick, and says what to do next on their own; when the mission has a crew or a link to Earth,
it adds who else to tell, worded for the real delay (live near Earth, a few seconds at the Moon, up to 44 minutes
round trip at Mars). It works fully offline, keeps each crew member's records separate on a shared device, and
never shows a reassuring score without measurements behind it.

**Tools and languages.** JavaScript, HTML and CSS; Vite and Preact with @preact/signals; three.js for the 3D body
and a rotating planet textured with NASA imagery; Chart.js; lucide icons; a service worker for offline use;
node:test for 313 automated tests. Hosted as a static site on Cloudflare Pages. No server, account or database:
records stay on the device, with export, import and CSV. Built with AI coding agents (see Use of AI).

**Creativity.** The app adapts to the mission instead of assuming one: crew size and the link to Earth change the
wording of every action, and NASA's own risk ratings decide what the astronaut checks first. Several crew members
can share one tablet with an optional PIN. The emergency guide is linked both ways with the checks, so a worrying
reading leads straight to what to do.

**Factors we considered.** Signal delay and loss of contact; working with no network; screening, not diagnosis
(every threshold comes from a named source or is labelled as our design choice); no false reassurance; privacy on a
shared device; accessibility (keyboard, screen reader, phone and tablet, light and dark themes, reduced motion);
and honest sourcing, with AI-generated images marked on screen.

## NASA Data

| Link Text | Link Url |
|---|---|
| NASA Human Research Roadmap: human health and performance risks and ratings | https://humanresearchroadmap.nasa.gov/ |
| NASA-STD-3001 Space Flight Human-System Standard, Volume 1 (4031 radiation exposure, 4027 bone and mineral) | https://standards.nasa.gov/standard/NASA/NASA-STD-3001 |
| JSC-67378 Rev 1: Nutritional Requirements for Exploration Missions up to 365 days | https://ntrs.nasa.gov/api/citations/20205008306/downloads/JSC67378%20Expl%20Nutr%20Reqs%20042020.pdf |
| English et al. 2020: High intensity training during spaceflight (NASA Sprint Study) | https://pmc.ncbi.nlm.nih.gov/articles/PMC7434884/ |
| NASA Technical Reports Server 20220013418: signal delay to Earth | https://ntrs.nasa.gov/citations/20220013418 |
| Zeitlin et al. 2013: radiation measured by MSL RAD in Mars cruise | https://doi.org/10.1126/science.1235989 |
| Hassler et al. 2014: radiation measured by MSL RAD on the Martian surface | https://doi.org/10.1126/science.1244797 |
| NASA Blue Marble Next Generation (Earth texture) | https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/ |
| NASA Scientific Visualization Studio, CGI Moon Kit (Moon texture, LRO data) | https://svs.gsfc.nasa.gov/4720 |
| NASA/USGS Mars Viking MDIM2.1 global colour mosaic (Mars texture) | https://astrogeology.usgs.gov/search/details/Mars/Viking/MDIM21/Mars_Viking_MDIM21_ClrMosaic_global_232m/cub |

## Space Agency Partner & Other Data

| Link Text | Link Url |
|---|---|
| Zhang et al. 2020: DOSIS 3D (DLR/ESA) ISS and Chang'e-4 LND (CNSA) lunar dose rates | https://doi.org/10.1126/sciadv.aaz1334 |
| Space anaemia study (PMC10976580) | https://pmc.ncbi.nlm.nih.gov/articles/PMC10976580/ |
| Crucian et al. 2018: virus reactivation in spaceflight | _URL needed_ |
| MR089S: bone and mineral | _URL needed_ |
| Glasgow Coma Scale | https://www.glasgowcomascale.org/ |
| Amboss: chest drain | https://www.amboss.com/us |
| Stop the Bleed | https://www.stopthebleed.org/ |
| American Red Cross: First Aid Steps | https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps |
| Open Food Facts product database (barcode lookup) | https://world.openfoodfacts.org/ |
| 3D model: Astronaut by Jungle Jim (Sketchfab, CC BY 4.0) | https://sketchfab.com/3d-models/astronaut-by-jungle-jim-c775a977606a4e4e990afe783c6bc845 |
| 3D model: Human Kidney by neshallads (Sketchfab, CC BY 4.0) | https://sketchfab.com/3d-models/human-kidney-e1476ceb1e3b4412af5418eee9c5ed08 |
| 3D model: Lungs by reynosa2000 (Sketchfab, CC BY 4.0) | https://sketchfab.com/3d-models/lungs-981d026657984895a90422d5e99e7ac2 |
| 3D model: Human Anatomy, muscles and skeleton, by mohamedhussien (Sketchfab, CC BY 4.0) | https://sketchfab.com/3d-models/human-anatomy-faf0f3eaec554bcf854be2038993024f |
| 3D model: Human Brain by AH (Sketchfab, CC BY 4.0) | _URL needed_ |
| 3D model: Human Heart by TinkerLane Studio (Sketchfab, CC BY 4.0) | _URL needed_ |
| Figure: dermatomes, front (Laboratoires Servier, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:Nervous_system_-_Dermatomes_1_--_Smart-Servier.png |
| Figure: dermatomes, back (Laboratoires Servier, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:Nervous_system_-_Dermatomes_2_--_Smart-Servier.png |
| Figure: heart (Laboratoires Servier, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:Cardiovascular_system_-_Heart_1_--_Smart-Servier.png |
| Figure: lungs (Laboratoires Servier, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:Respiratory_system_-_Lungs_--_Smart-Servier.png |
| Figure: urinary tract (Laboratoires Servier, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:Urinary_system_-_Urinary_tract_1_--_Smart-Servier.png |
| Figure: brain (Laboratoires Servier, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:Nervous_system_-_Brain_1_--_Smart-Servier.png |
| Figure: skeleton (Laboratoires Servier, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:Skeleton_1_--_Smart-Servier.png |
| Figure: closed fracture (Laboratoires Servier, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:Kind_of_fractures_-_Closed_fracture_--_Smart-Servier.png |
| Figure: cross-section of the eye (Rhcastilhos and Jmarchn, CC BY-SA 3.0) | https://commons.wikimedia.org/wiki/File:Schematic_diagram_of_the_human_eye_en.svg |
| Figure: pressure points (U.S. Navy, public domain) | https://commons.wikimedia.org/wiki/File:Pressure_points.jpg |
| Figure: recovery position (Mrmw, CC0) | https://commons.wikimedia.org/wiki/File:Recovery_position_02.svg |
| Figure: major muscles (OpenStax, CC BY 4.0) | https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles.jpg |
| Vite (build tool, MIT) | https://vite.dev/ |
| Preact (interface library, MIT) | https://preactjs.com/ |
| Preact Signals (state, MIT) | https://github.com/preactjs/signals |
| three.js (3D, MIT) | https://threejs.org/ |
| Chart.js (charts, MIT) | https://www.chartjs.org/ |
| Lucide icons (ISC) | https://lucide.dev/ |

Not listed as links: the team medic's notes (the Emergency guide, written by the team) and eleven AI-generated
illustrations made for this project (see Use of AI).

## Use of AI

- **Code:** the app was written with AI coding assistants, with Anthropic's Claude (Claude Code) coordinating and
  reviewing the work. The team set the goals,
  made every product and medical decision, reviewed each change in the running app, and the team medicine student
  wrote and reviewed the medical content.
- **Images:** eleven illustrations are AI-generated and marked "AI-generated" on screen: the five Emergency guide
  pictures (chest, chest drain, two abdomen examinations, dermatome map), the ARED, T2 and CEVIS exercise pictures,
  and the four destination pictures (ISS, Moon, Mars, rover). Their alt text also says "AI-generated illustration".
- **Research:** an AI research agent found and quoted the NASA iron requirement (JSC-67378) and the Sprint Study
  exercise schedule; both are cited with their source documents.
- **Demo video:** AI was used to make the demo video; its AI-generated images and footage carry a visible
  watermark, as the Space Apps rules require.
- No AI makes decisions inside the app: every threshold and rating comes from a named source or is labelled as our
  design choice.
