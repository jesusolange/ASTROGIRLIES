"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { CARDS, GROUPS, cardsInGroup, resolveCardId, situations } = require("../src/data/emergencies.js");

const root = path.join(__dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const REQUIRED_IDS = [
  "vitals", "gcs", "breath", "belly", "back", "calf", "fever", "storm", "bone", "anemia",
  "vision-change", "bleeding", "fracture", "self-harm", "cabin-air",
];

function blocksOf(card) {
  const out = [];
  const walk = (blocks) => {
    for (const block of blocks) {
      out.push(block);
      if (block.blocks) walk(block.blocks);
      if (block.diagram) walk(block.diagram);
    }
  };
  walk(card.blocks);
  return out;
}

test("the doctor's cards and the kept first-response cards are all present once", () => {
  assert.deepEqual(CARDS.map((card) => card.id), REQUIRED_IDS);
  assert.equal(CARDS.length, new Set(REQUIRED_IDS).size);
});

test("the emergency content is grouped in the required order", () => {
  assert.deepEqual(GROUPS.map((group) => group.id), ["first", "feel", "space", "slow", "general"]);
  assert.deepEqual(cardsInGroup("general").map((card) => card.id), ["vision-change", "bleeding", "fracture", "self-harm", "cabin-air"]);
});

test("cards the doctor's guide replaces are no longer situations", () => {
  for (const id of ["chest-pain", "trouble-breathing", "headache-confusion", "flank-pain"]) {
    assert.equal(CARDS.some((card) => card.id === id), false, id);
  }
});

test("old ids still open the right card", () => {
  assert.equal(resolveCardId("solar-storm"), "storm");
  assert.equal(resolveCardId("self-harm"), "self-harm");
  assert.equal(resolveCardId("chest-pain"), "breath");
  assert.equal(resolveCardId("trouble-breathing"), "breath");
  assert.equal(resolveCardId("headache-confusion"), "gcs");
  assert.equal(resolveCardId("flank-pain"), "back");
  assert.equal(resolveCardId("not-a-card"), null);
  assert.ok(situations().some((situation) => situation.id === "storm"));
});

test("every card has a title, a sign, a tone and a tag", () => {
  for (const card of CARDS) {
    assert.ok(card.title.length > 0, `${card.id}: title`);
    assert.ok(card.sign.length > 0, `${card.id}: sign`);
    assert.ok(["bad", "mid", "info"].includes(card.tone), `${card.id}: tone`);
    assert.ok(card.tag.length > 0, `${card.id}: tag`);
    assert.ok(card.blocks.length > 0, `${card.id}: blocks`);
  }
});

test("the kept first-response cards keep steps, preparation and escalation triggers", () => {
  for (const card of cardsInGroup("general")) {
    assert.ok(card.steps.length >= 4, `${card.id}: steps`);
    assert.ok(card.prepare.length >= 2, `${card.id}: prepare`);
    assert.ok(card.escalate.length >= 3, `${card.id}: escalate`);
  }
});

test("the doctor's doses, thresholds and CHECK notes are unchanged", () => {
  const all = CARDS.map((card) => blocksOf(card));
  const text = JSON.stringify(all);
  assert.match(text, /Aciclovir for oral and genital herpes: adults and children 12 years and older, 200 mg every 4 hours, 5 times a day, for 7 days\./);
  assert.match(text, /To stop it coming back: usual dose 200 mg \(one tablet\) 4 times a day\. Space the doses about 6 hours apart\./);
  assert.match(text, /CHECK with the doctor: these doses are for oral and genital herpes\. Zoster \(shingles\) usually needs a different dose\./);
  assert.match(text, /CHECK with the doctor: the notes say 3 weeks of blood thinner\. Guidelines usually say at least 3 months\./);
  assert.match(text, /CHECK: the doctor asked for changes to this card\. Waiting for her details\./);
  assert.match(text, /Fever: 38\.5 °C or more/);
  assert.match(text, /NASA: keep at or above 95% \(hip, spine\) and 90% \(femoral neck\)\./);
});

test("the solar storm steps exist once as data and keep the storm limit", () => {
  const { STORM_STEPS, STORM_NOTE } = require("../src/data/emergencies.js");
  assert.deepEqual(STORM_STEPS.map((step) => step.title), ["1 · Storm alert", "2 · Go inside", "3 · Safe room", "4 · Call ground"]);
  assert.match(STORM_NOTE, /NASA's limit for one storm is 250 mSv\./);
  const radiation = read("src", "scripts", "radiation.js");
  assert.match(radiation, /AstroMedEmergencies\.open\("solar-storm"\)/);
  assert.doesNotMatch(radiation, /Storm alert/);
});

test("Glasgow Coma Scale scoring bands", async () => {
  const { gcsScore } = await import("../src/scripts/emergencies.js");
  assert.deepEqual(gcsScore([0, 0, 0]), { picked: 0, total: null, level: null, message: "Picked 0 of 3 columns." });
  assert.equal(gcsScore([4, 5, 6]).total, 15);
  assert.equal(gcsScore([4, 5, 6]).level, "ok");
  assert.equal(gcsScore([3, 3, 3]).level, "mid");
  assert.equal(gcsScore([2, 2, 2]).level, "bad");
  assert.match(gcsScore([4, 5, 6]).message, /Mild or normal/);
});

test("vital chips and the shock index follow the doctor's ranges", async () => {
  const { shockIndex, vitalChips } = await import("../src/scripts/emergencies.js");
  assert.equal(shockIndex(60, 120), 0.5);
  assert.equal(shockIndex(0, 120), null);
  const chips = vitalChips({ pulse: 80, sys: 120, resp: 16, spo2: 98, temp: 39 });
  assert.equal(chips[0].text, "Pulse: 80 /min · normal");
  assert.equal(chips[0].tone, "ok");
  assert.equal(chips[3].text, "Temperature: 39 °C · fever");
  assert.equal(chips[3].tone, "bad");
  assert.equal(chips[4].text, "Shock index: 0.67 (pulse ÷ top pressure)");
  assert.equal(vitalChips({ pulse: 50 })[0].tone, "bad");
});

test("N-telopeptide ranges follow sex and menopause", async () => {
  const { ntxRange, ntxStatus } = await import("../src/scripts/emergencies.js");
  assert.deepEqual(ntxRange({ sex: "m" }), { min: 21, max: 83, label: "Men" });
  assert.equal(ntxRange({ sex: "f", meno: "pre" }).label, "Women before menopause");
  assert.equal(ntxRange({ sex: "f", meno: "post" }).label, "Women after menopause");
  assert.equal(ntxRange({}).label, "Women before menopause");
  assert.equal(ntxStatus(90, { sex: "m" }).tone, "bad");
  assert.equal(ntxStatus(50, { sex: "m" }).tone, "ok");
  assert.equal(ntxStatus(10, { sex: "f" }).tone, "mid");
  assert.equal(ntxStatus(50, {}).needSex, true);
  assert.equal(ntxStatus(50, { sex: "m" }).needSex, false);
});

test("the section markup lives in Preact components and the module builds no HTML", () => {
  const page = read("src", "components", "App.jsx");
  const view = read("src", "components", "emergencies", "EmergenciesView.jsx");
  const script = read("src", "scripts", "emergencies.js");
  assert.match(page, /<section id="emergenciesPage" class="am-page" hidden><EmergenciesView \/>/);
  assert.match(view, /import "\.\/emergencies\.css"/);
  assert.match(view, /openCard\.value/);
  assert.match(view, /<EmergencyCard/);
  const nav = read("src", "lib", "nav.js");
  assert.match(nav, /id: "emergencies"/);
  assert.match(script, /window\.AstroMedEmergencies = \{ open, situations, findings \}/);
  assert.doesNotMatch(script, /innerHTML|insertAdjacentHTML|querySelector|localStorage/);
});

test("the emergency styles use only the colour tokens", () => {
  const css = read("src", "components", "emergencies", "emergencies.css");
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(css, /rgba?\(/);
  assert.match(css, /var\(--am-danger\)/);
});
