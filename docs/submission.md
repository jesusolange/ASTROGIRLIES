# Submission form text

Draft answers for the three Space Apps form fields (GitHub issue #4). Copy, check, and paste.

## NASA Data

- **NASA Human Research Roadmap** (humanresearchroadmap.nasa.gov): the 22 human health and performance risks and
  their likelihood x consequence ratings for each mission type (low Earth orbit, lunar, Mars), both in mission and
  for long-term health. The app ranks the astronaut's daily checks by these ratings, sets how often each check comes
  back from them, and explains the ranking on Home ("How this score is made", "Why this order").
- **NASA-STD-3001 Volume 1** (Space Flight Human-System Standard): 4031, space flight radiation exposure (the career
  dose limit the Radiation card measures against), and 4027, bone and mineral.
- **JSC-67378 Rev 1**, Nutritional Requirements for Exploration Missions up to 365 days (NASA Johnson Space Center,
  2020): the in-flight iron limit of 8 mg a day used on the meal card.
- **English et al. 2020**, High intensity training during spaceflight: results from the NASA Sprint Study (npj
  Microgravity 6:21): resistive exercise six days a week, the exercise target.
- **NASA Technical Reports Server 20220013418**: signal delay between Earth and the Moon or Mars, used to word every
  "tell the flight surgeon" step by the mission's link to Earth.
- **Mars Science Laboratory RAD** measurements (Zeitlin et al. 2013, Hassler et al. 2014, Science): radiation dose
  rates in Mars cruise and on the Martian surface.
- **NASA imagery** for the cover planet: Blue Marble (Earth), the Scientific Visualization Studio CGI Moon Kit
  (Lunar Reconnaissance Orbiter data), and a NASA/USGS Mars global colour mosaic.

## Space Agency Partner Data and Other References

Space agency partner data:
- **DOSIS 3D** dose measurements on the ISS (DLR/ESA), and **Chang'e-4 LND** dose on the Moon (CNSA), both as quoted
  in Zhang et al. 2020 (Science Advances).

Medical and scientific references:
- The team doctor's emergency notes (the Emergency guide).
- Crucian et al. 2018, virus reactivation in spaceflight; the space anaemia study (PMC10976580); MR089S, bone and
  mineral; the Glasgow Coma Scale; Stop the Bleed; Red Cross first aid steps; Amboss, chest drain.

Images, models and data:
- 3D models from Sketchfab under CC BY 4.0: Astronaut (Jungle Jim), Human Kidney (neshallads), Lungs
  (reynosa2000), Human Anatomy, muscles and skeleton (mohamedhussien), Human Brain (AH), Human Heart (TinkerLane
  Studio).
- Medical figures: Laboratoires Servier (CC BY-SA 3.0), OpenStax (CC BY 4.0), U.S. Navy (public domain), Wikimedia
  Commons (CC0).
- Open Food Facts product database (barcode lookup, ODbL).

Code libraries (all bundled, MIT or ISC): Vite, Preact, @preact/signals, three.js, Chart.js, lucide-preact.

The full list with links and licences is in the app (Profile > Sources) and in `docs/references.md`.

## Use of AI

- **Code:** the app was written with AI coding assistants: Anthropic's Claude (Claude Code) coordinating and
  reviewing the work, and OpenCode agents running DeepSeek models implementing tickets. The team set the goals,
  made every product and medical decision, reviewed each change in the running app, and the team doctor wrote and
  reviewed the medical content.
- **Images:** eleven illustrations are AI-generated and marked "AI-generated" on screen: the five Emergency guide
  pictures (chest, chest drain, two abdomen examinations, dermatome map), the ARED, T2 and CEVIS exercise pictures,
  and the four destination pictures (ISS, Moon, Mars, rover). Their alt text also says "AI-generated illustration".
- **Research:** an AI research agent found and quoted the NASA iron requirement (JSC-67378) and the Sprint Study
  exercise schedule; both are cited with their source documents.
- **Demo video:** _say whether AI was used in the video; AI-generated images or video in it need a visible
  watermark._
- No AI makes decisions inside the app: every threshold and rating comes from a named source or is labelled as our
  design choice.
