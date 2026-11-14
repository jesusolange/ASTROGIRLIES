# AstroMed tickets (draft, not yet filed on GitHub)

Written 14 Nov 2026 from the app review and the vision discussion. Submission closes Sunday 15 Nov, 23:59 local time.

## Decisions these tickets rest on

- **User:** the astronaut, alone. No doctor view, no live "call a doctor".
- **Setting:** long Moon or Mars mission with delayed or missing contact with Earth. ISS is the source of reference data.
- **Differentiator:** every indicator ends in a concrete action.
- **NASA data:** Human Research Roadmap risk ratings and NASA-STD-3001 drive the evaluation. The submission does not depend on the pending NLSP access request.
- **Wearables:** simulated data only, labelled as simulated.
- **Home:** one "Today" page replaces Overview, Readiness and the Missions task list.
- **Section pattern:** every section has Record, History and What to do.
- **Demo:** a slide presentation of at most 7 slides (title and intro slides count), in English, not a video.

## Still open

- Priority and cut line for Sunday night (which tickets are must-have).
- Who owns what (2 developers, 1 medic).
- Demo story and who builds the slides.
- Whether to add a build tool before the deadline (to be reconsidered Sunday).

---

## 1. Daily checkup: make the guided flow work

**Problem.** The 3D checklist on the left and the measurement form on the right run separately. The checklist says "click the glowing brain" while the form stays on Cardiovascular. Saving ticks Heart, does not advance, and the form never changes. Each click on "Save measurements" stores another identical reading. The coloured indicator bars look like sliders but are read-only.

**Do.**
- [ ] One source of truth for the current step; selecting an organ (3D or list) switches the form, and saving advances both to the next step in list order.
- [ ] One reading per system per save; a second save the same minute replaces instead of duplicating.
- [ ] Remove the duplicate "Demo values" pill and button, or keep one that fills typical (mean) values.
- [ ] Make the bars clearly read-only, or make them real inputs. Pick one.
- [ ] When all steps are done, return to the suited astronaut view with a summary and the next action.

**Done when.** A full checkup can be completed in order with no manual re-selection, History shows one reading per system, and the flow ends on the astronaut view.

## 2. 3D model: organ placement and leftovers

**Problem.** The brain covers the whole skull, the lungs are rotated, the heart and kidneys are out of position, organs bunch at the pelvis, and a detached hand with a disc floats beside the body. `index.html` still requests three images that were replaced by the 3D model (`astronaut.png`, `assets/astronaut_anatomy.png`, `assets/space-background.jpg`) and they return 404.

**Do.**
- [ ] Fix scale, rotation and position of brain, lungs, heart and kidneys.
- [ ] Remove the stray hand and disc, or attach the pulse marker to the wrist.
- [ ] Remove the dead `<img>` tags and the legacy anatomy SVG.
- [ ] Protocols: use the 3D body instead of the SVG body.

**Done when.** Every organ sits in its anatomical place from the front view and the console shows no 404.

## 3. Mission risk map

**Problem.** The app treats every body system as equally important for every mission. NASA's Human Research Roadmap rates each of 22 risks by likelihood and consequence for each mission type, separately for in-mission operations and long-term health. The app uses none of this.

**Do.**
- [ ] Data file with the 22 risks: id, short title, ratings per mission type, source URL, date published.
- [ ] Mission type chosen at profile setup and editable in Environment.
- [ ] A map view: risks ranked for the chosen mission, each linked to its app section and to the roadmap page.
- [ ] Mark risks the app does not yet cover (sensorimotor, medications, dust) as "not monitored yet".

**Done when.** Changing the mission changes the ranking, and every row shows its NASA source.

## 4. Readiness: weights from the risk map

**Problem.** The readiness weights are hand-picked and the page says it is not a NASA score. It showed 100/100 "Ready" from three heart-rate readings covering two of seven areas.

**Do.**
- [ ] Derive area weights from the risk ratings of the chosen mission (ticket 3).
- [ ] Do not show "Ready" when coverage is low; show "not enough data" with what is missing.
- [ ] Explain the calculation on the page: the ratings are NASA's, the formula is ours.
- [ ] Immune watch: replace checkboxes with pills; allow saliva and blood test results to be entered.

**Done when.** The score changes with the mission, and low coverage never produces a high score.

## 5. Today page and work queue

**Problem.** Overview and Readiness both lead with the same score, and Missions holds a separate daily task list. Three pages answer "what should I do today".

**Do.**
- [ ] One Today page: score at the top, then the items due today ordered by the mission's risk ratings, each opening its check.
- [ ] Reuse the Missions tasks and their automatic ticking; higher-rated risks come up more often. Label the intervals as our design choice.
- [ ] Remove Overview and Readiness as separate pages. Decide whether points, streaks and badges stay.

**Done when.** One page shows the score and the queue, and finishing a check removes it from the queue.

## 6. Vision (SANS) self-check

**Problem.** Spaceflight-associated neuro-ocular syndrome is rated 4x4 for a Mars mission and the app has no vision check.

**Do.**
- [ ] On-screen self-test, one eye at a time (grid distortion and near vision). Content and thresholds from the medic.
- [ ] Record, History and What to do, like every other section.
- [ ] Add it to the 3D body (eyes) and to the work queue.
- [ ] State on screen that it is a screening aid, not a diagnosis.

**Done when.** A result can be saved, compared with earlier results, and leads to an action.

## 7. Emergencies

**Problem.** Urgent guidance is scattered; the solar storm steps sit inside Radiation. Owner: colleague already working on this.

**Do.**
- [ ] One Emergencies section, organised by symptom ("what is happening to me"), not by body system.
- [ ] Move the solar storm steps here; Radiation links to it.
- [ ] Other sections link here when a reading crosses an urgent threshold.
- [ ] Works with no connection.

**Done when.** Any urgent state in the app leads to one Emergencies page with steps to follow.

## 8. Copy and source fixes

- [ ] Settings: replace "Data is never sent to a server" with text that is true when sign-in is used: data stays on the device unless you choose to sign in.
- [ ] Sidebar: remove "Works offline in Firefox".
- [ ] Radiation: replace the Phys.org and Space.com citations with the instrument papers or NASA pages.
- [ ] Radiation: rewrite the "Where you are going" instructions.
- [ ] Environment: "the risks I watch for" becomes "the risks the tool watches for".
- [ ] Rename "report" to "protocols" where the two are mixed.
- [ ] Cover: remove "PDF for your doctor" (there is no doctor view).

## 9. Theme

**Problem.** The checkup panel and the Settings dialog are light cards on a dark page; dropdowns and the email field use browser defaults.

**Do.**
- [ ] One set of colour tokens for the whole app; dark is the default.
- [ ] Style inputs, selects, dropdown lists and the email field.
- [ ] Light and dark switch in the header.
- [ ] Profile icon in the top right showing sign-in and sync state.
- [ ] Contrast check on all text.

**Done when.** No screen mixes light and dark surfaces, and the switch changes every section.

## 10. Profile form

- [ ] Align "Save profile" and "Later" (currently 8 px apart vertically).
- [ ] Raise contrast of labels and help text.
- [ ] Height: lower the minimum from 120 cm or explain the limit.
- [ ] Sex: rename to "Sex used for energy calculation"; options Female, Male, Prefer not to say (uses an average).
- [ ] Add mission type and destination to setup (feeds ticket 3).

## 11. Environment

- [ ] Add "In transit" (matches the Mars cruise dose rate in Radiation).
- [ ] Decide whether ground or analog missions are offered.
- [ ] Link each location to the mission risk map.
- [ ] Keep the "Keep in mind" notes.

## 12. Mental health

- [ ] Show results in the section instead of redirecting to Overview.
- [ ] If the suicidal-thoughts question is answered with anything other than "Not at all", show an immediate response: who to tell on the crew, and a link to Emergencies. Wording from the medic.
- [ ] Add History.

## 13. Medical images

**Problem.** The generated SVG illustrations look poor, and specific medical figures (for example dermatome maps) are needed. NASA does not publish these.

**Do.**
- [ ] List the figures needed.
- [ ] Source each from a licence that allows reuse with credit (candidates: Wikimedia Commons including public-domain Gray's Anatomy plates, OpenStax Anatomy and Physiology, Servier Medical Art). Check each file's licence page.
- [ ] Record title, author, URL and licence for the references (GitHub issue 4).
- [ ] Do not use images taken from a general image search without a clear licence.

## 14. Cover page redo

**Problem.** The cover reads as generated: emoji icons, four generic cards, gradient button.

**Do.**
- [ ] Redesign with the impeccable and taste skills.
- [ ] Say what the app is for in one line, and enter the app in one action.

## 15. Build tool (decide Sunday)

- [ ] Add Vite with ES modules; keep the existing vanilla code.
- [ ] Remove the script-order dependency in `index.html`.
- [ ] Load 3D models as real `.glb` files.
- [ ] Confirm the Cloudflare Pages deploy still works.

A move to a component framework stays in GitHub issue 2 for after submission.

## 16. After submission

- [ ] Charts from a library that is bundled locally (works offline), replacing hand-drawn SVG charts.
- [ ] Nutrition: barcode scanning with the camera; fix camera button padding.
- [ ] Apply Record, History, What to do to every section and fold Progress into each History.
- [ ] Simplify data entry across sections.

---

## Changes to existing GitHub issues

- **Issue 1 (public site, data store, accounts):** the site is live at astrogirlies.pages.dev but serves an older build; deploy the current branch. Storage module and export/import are done. Sign-in is coded and tested but not configured (database id, mail key, site URL); decide whether to switch it on, given this is health data.
- **Issue 2 (framework):** keep as the after-submission framework move; the build-tool step is ticket 15 here.
- **Issue 3 (offline PWA):** unchanged.
- **Issue 4 (references and AI use):** add the medical image sources from ticket 13; note the README now has model credits.
- **Issue 5 (demo):** format is decided: slide presentation, 7 slides maximum, in English, hosted at a public link with no login. Slides must show the team name, the members' names and the challenge, plus an image of the project, the user experience and how NASA data makes it possible. Story still open. Nutrition is reported broken on the public site; confirm before taking screenshots.
- **Issue 6 (NLSP cross-reference):** add the Human Research Roadmap crawl as a source alongside NLSP.
