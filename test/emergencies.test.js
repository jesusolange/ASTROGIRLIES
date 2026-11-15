"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  CARDS, CARD_BY_ID, resolveCardId, indexCards, situations,
  STORM_STEPS, STORM_NOTE, VITALS_REFERENCE, BLOOD_LOSS,
} = require("../src/data/emergencies.js");
const {
  SLOW_RISKS, SLOW_RISK_BY_ID, BONE_LOSS, ANEMIA, NTX_RANGES,
} = require("../src/data/slow-risks.js");
const { SOURCES, SOURCE_BY_ID, sourcesFor } = require("../src/data/sources.js");

const root = path.join(__dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");

const KEPT_IDS = [
  "breath", "bleeding", "gcs", "cabin-air", "vision-change", "storm",
  "belly", "fever", "back", "calf", "fracture",
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

function itemTexts(items) {
  return items.map((item) => (typeof item === "string" ? item : item.text));
}

function stepsOf(card) {
  return blocksOf(card).filter((block) => block.type === "steps").flatMap((block) => itemTexts(block.items));
}

function listItemsOf(card) {
  return blocksOf(card).filter((block) => block.type === "list").flatMap((block) => itemTexts(block.items));
}

test("the eleven kept cards and the shared self-harm card are present once", () => {
  assert.deepEqual(CARDS.map((card) => card.id), [...KEPT_IDS, "self-harm"]);
  assert.equal(CARDS.length, new Set(CARDS.map((card) => card.id)).size);
  for (const id of ["bone", "anemia", "vitals"]) {
    assert.equal(CARD_BY_ID.has(id), false, id);
  }
  assert.equal(SLOW_RISK_BY_ID.has("bone"), true);
  assert.equal(SLOW_RISK_BY_ID.has("anemia"), true);
});

test("crew one sees ten index cards and a crew sees eleven", () => {
  const solo = indexCards(1).map((card) => card.id);
  assert.equal(solo.length, 10);
  assert.equal(solo.includes("gcs"), false);
  assert.equal(solo.includes("self-harm"), false);
  assert.deepEqual(solo, ["breath", "bleeding", "cabin-air", "vision-change", "storm", "belly", "fever", "back", "calf", "fracture"]);

  for (const crew of [2, 6]) {
    const withCrew = indexCards(crew).map((card) => card.id);
    assert.equal(withCrew.length, 11, `crew ${crew}`);
    assert.equal(withCrew.includes("gcs"), true);
    assert.equal(withCrew.includes("self-harm"), false);
  }
  assert.equal(situations(1).length, 10);
  assert.equal(situations(6).length, 11);
});

test("self-harm stays as data shared with mental health", () => {
  const card = CARD_BY_ID.get("self-harm");
  assert.equal(card.sharedWith, "mental");
  assert.equal(card.topic, "mental");
  assert.deepEqual(card.link, { check: "mental" });
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

test("every card has a title, a sign, a topic, a tone, a block and source ids", () => {
  for (const card of CARDS) {
    assert.ok(card.title.length > 0, `${card.id}: title`);
    assert.ok(card.sign.length > 0, `${card.id}: sign`);
    assert.ok(Object.hasOwn(card, "topic"), `${card.id}: topic`);
    assert.ok(["bad", "info"].includes(card.tone), `${card.id}: tone`);
    assert.ok(card.tag == null || card.tag.length > 0, `${card.id}: tag`);
    assert.ok(card.blocks.length > 0, `${card.id}: blocks`);
    assert.ok(Array.isArray(card.sourceIds), `${card.id}: sourceIds`);
    assert.ok(["minutes", "hours"].includes(card.actWithin), `${card.id}: actWithin`);
    assert.equal(card.source, undefined, `${card.id}: old source`);
    assert.equal(card.sourceLink, undefined, `${card.id}: old sourceLink`);
  }
});

test("the index is ordered by time to act and only minutes keep the danger tone", () => {
  const cards = indexCards(6);
  const firstSlow = cards.findIndex((card) => card.actWithin === "hours");
  assert.ok(firstSlow > 0);
  assert.ok(cards.slice(0, firstSlow).every((card) => card.actWithin === "minutes"));
  assert.ok(cards.slice(firstSlow).every((card) => card.actWithin === "hours"));
  for (const card of CARDS) {
    assert.equal(card.tone === "bad", card.actWithin === "minutes", card.id);
  }
});

test("a tag is the stated time to act, never Red flag", () => {
  assert.equal(CARD_BY_ID.get("cabin-air").tag, "Now");
  assert.equal(CARD_BY_ID.get("vision-change").tag, "Now");
  assert.equal(CARD_BY_ID.get("storm").tag, "In a few hours");
  assert.equal(CARD_BY_ID.get("breath").tag, undefined);
  for (const card of CARDS) {
    assert.doesNotMatch(String(card.tag), /red flag/i);
  }
});

test("the kept first-response cards keep steps, preparation and escalation triggers", () => {
  for (const id of ["bleeding", "vision-change", "fracture", "cabin-air", "self-harm"]) {
    const card = CARD_BY_ID.get(id);
    assert.ok(card.steps.length >= 4, `${card.id}: steps`);
    assert.ok(card.prepare.length >= 2, `${card.id}: prepare`);
    assert.ok(card.escalate.length >= 3, `${card.id}: escalate`);
  }
  assert.equal(CARD_BY_ID.get("fracture").tag, undefined);
});

test("removed cards leave the emergency data and the moved text keeps its length", () => {
  assert.deepEqual(SLOW_RISKS.map((card) => card.id), ["bone", "anemia"]);
  assert.deepEqual(stepsOf(BONE_LOSS), [
    "Take vitamin D.",
    "If vitamin D does not help, take a bisphosphonate (ask your flight surgeon).",
    "Keep up resistive exercise (ARED).",
  ]);
  assert.equal(stepsOf(BONE_LOSS).length, 3);
  assert.equal(listItemsOf(ANEMIA).length, 5);
  assert.equal(BONE_LOSS.crewOnly, undefined);
  assert.equal(ANEMIA.topic, null);
});

test("the bone card keeps its gauge and N-telopeptide reference text", () => {
  const gauge = blocksOf(BONE_LOSS).find((block) => block.type === "gauge");
  assert.equal(
    gauge.text,
    "Bone density (DXA) compared with your value before the mission (100%). NASA: keep at or above 95% (hip, spine) and 90% (femoral neck). Typical loss is about 1–1.5% per month without countermeasures.",
  );
  assert.deepEqual(NTX_RANGES, [
    { min: 21, max: 83, label: "Men" },
    { min: 17, max: 94, label: "Women before menopause" },
    { min: 36, max: 124, label: "Women after menopause" },
  ]);
});

test("the anaemia card keeps every observation", () => {
  assert.deepEqual(listItemsOf(ANEMIA), [
    "Lower red cell mass, reticulocytes, haemoglobin and erythropoietin (EPO).",
    "EPO falls as central venous pressure rises.",
    "Haptoglobin was not lower: the cells break down outside the blood vessels.",
    "Little movement and bone load can push marrow stem cells to make bone or fat instead of blood.",
    "Microgravity also changes the structure and function of red cells.",
  ]);
});

test("the vitals reference keeps its numbers and quick check", () => {
  assert.deepEqual(VITALS_REFERENCE.bars, [
    { label: "Pulse", min: 30, max: 160, lo: 60, hi: 100, unit: "per min" },
    { label: "Breathing", min: 5, max: 35, lo: 12, hi: 18, unit: "per min" },
    { label: "Oxygen (SpO₂)", min: 80, max: 100, lo: 95, hi: 100, unit: "%" },
  ]);
  assert.deepEqual(VITALS_REFERENCE.chips, [
    { tone: "ok", text: "Blood pressure: 120/80 mmHg" },
    { tone: "bad", text: "Fever: 38.5 °C or more" },
  ]);
  assert.equal(VITALS_REFERENCE.note, "Always compare with the astronaut's own usual values.");
  assert.deepEqual(VITALS_REFERENCE.quickCheck, { type: "vitals" });
  assert.equal(VITALS_REFERENCE.bars.length + VITALS_REFERENCE.chips.length, 5);
});

test("the blood loss and shock table moves into the bleeding card whole", () => {
  const table = blocksOf(CARD_BY_ID.get("bleeding")).find((block) => block.type === "bloodTable");
  assert.ok(table, "bleeding carries the table");
  assert.deepEqual(table.table, BLOOD_LOSS);
  assert.equal(BLOOD_LOSS.head.length, 4);
  assert.equal(BLOOD_LOSS.rows.length, 9);
});

test("no removed phrase or developer note is left in the emergency data", () => {
  const text = read("src", "data", "emergencies.js");
  for (const phrase of [
    "not yet reviewed", "pending review", "SOURCE-NEEDED", "Source: Notes.",
    "Readiness", "Mental Health check-in", "Red flag", "General first response", "Slow risks in space",
  ]) {
    assert.equal(text.includes(phrase), false, phrase);
  }
  assert.doesNotMatch(text, /\bCHECK\b/);
  const vision = JSON.stringify(CARD_BY_ID.get("vision-change"));
  assert.equal(vision.includes("Design choice"), false);
  assert.equal(vision.includes("design choice"), false);
});

test("the fever card links to the immune check and the self-harm card to mental health", () => {
  const feverSteps = blocksOf(CARD_BY_ID.get("fever")).find((block) => block.type === "steps");
  assert.deepEqual(feverSteps.link, { check: "immune" });
  assert.equal(feverSteps.items.length, 2);
  const selfHarmSteps = blocksOf(CARD_BY_ID.get("self-harm")).find((block) => block.type === "steps");
  assert.deepEqual(selfHarmSteps.link, { check: "mental" });
  assert.equal(itemTexts(selfHarmSteps.items).includes("Do not wait for the result to get help."), true);
});

test("flight-surgeon steps carry the tell marker", () => {
  const back = JSON.stringify(CARD_BY_ID.get("back"));
  assert.match(back, /"tell":"flight-surgeon"/);
  const bone = JSON.stringify(BONE_LOSS);
  assert.match(bone, /"tell":"flight-surgeon"/);
});

test("no pictograph characters remain inside the medic's text", () => {
  const text = read("src", "data", "emergencies.js");
  assert.doesNotMatch(text, /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u);
});

test("every card topic matches the topic table where one exists", () => {
  const expected = {
    "vision-change": "vision", fever: "immune", storm: "radiation",
    breath: "heart", "cabin-air": null, "self-harm": "mental",
  };
  const known = new Set(["bones", "kidneys", "immune", "radiation", "mental", "sleep", "vision", "nutrition", "heart", "exercise"]);
  for (const [id, topic] of Object.entries(expected)) {
    assert.equal(CARD_BY_ID.get(id).topic, topic, id);
  }
  for (const card of [...CARDS, ...SLOW_RISKS]) {
    assert.ok(card.topic === null || known.has(card.topic), `${card.id}: ${card.topic}`);
  }
  assert.equal(BONE_LOSS.topic, "bones");
});

test("every source id resolves and usedBy agrees with the cards", () => {
  assert.ok(SOURCES.length > 0);
  for (const source of SOURCES) {
    assert.ok(source.id && source.title && source.author && source.licence, source.id);
    assert.ok(source.url === null || /^https?:\/\//.test(source.url), source.id);
    assert.ok(Array.isArray(source.usedBy), source.id);
    for (const id of source.usedBy) {
      assert.ok(CARD_BY_ID.has(id) || SLOW_RISK_BY_ID.has(id), `${source.id}: ${id}`);
    }
  }
  for (const card of [...CARDS, ...SLOW_RISKS]) {
    for (const id of card.sourceIds) {
      assert.ok(SOURCE_BY_ID.has(id), `${card.id}: ${id}`);
      assert.ok(SOURCE_BY_ID.get(id).usedBy.includes(card.id), `${id} lists ${card.id}`);
    }
  }
  assert.deepEqual(sourcesFor("storm").map((source) => source.id), ["nasa-std-3001-4031", "mission-protocol"]);
  assert.match(`${SOURCE_BY_ID.get("nasa-std-3001-4031").title} ${STORM_NOTE}`, /250 mSv|NASA-STD-3001/);
});

test("the solar storm steps and source are kept", () => {
  assert.deepEqual(STORM_STEPS.map((step) => step.title), ["1 · Storm alert", "2 · Go inside", "3 · Safe room", "4 · Call ground"]);
  assert.match(STORM_NOTE, /NASA's limit for one storm is 250 mSv\./);
  assert.equal(CARD_BY_ID.get("storm").sourceIds.includes("nasa-std-3001-4031"), true);
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
  assert.equal(gcsScore([3, 3, 3]).tell, "flight-surgeon");
  assert.equal(gcsScore([2, 2, 2]).level, "bad");
  assert.equal(gcsScore([2, 2, 2]).tell, "flight-surgeon");
  assert.match(gcsScore([4, 5, 6]).message, /Mild or normal/);
});

test("vital chips and the shock index follow the reference values", async () => {
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
  const area = read("src", "components", "shell", "AreaView.jsx");
  const view = read("src", "components", "emergencies", "EmergenciesView.jsx");
  const index = read("src", "components", "emergencies", "EmergencyIndex.jsx");
  const script = read("src", "scripts", "emergencies.js");
  assert.match(area, /<EmergenciesView \/>/);
  assert.doesNotMatch(page, /AstroMedNav/);
  assert.match(view, /import "\.\/emergencies\.css"/);
  assert.match(view, /<EmergencyIndex/);
  assert.match(view, /<EmergencyCard/);
  assert.match(index, /indexCards/);
  assert.match(index, /SearchBox/);
  assert.match(index, /VitalEntry/);
  assert.match(index, /groupEmergencies/);
  const nav = read("src", "lib", "nav.js");
  assert.match(nav, /emergency/);
  assert.match(script, /window\.AstroMedEmergencies = \{ open, situations, findings \}/);
  assert.doesNotMatch(script, /innerHTML|insertAdjacentHTML|querySelector|localStorage|DOMContentLoaded/);
});

test("the index groups the kept cards by urgency", async () => {
  const { groupEmergencies, sectionFor, SECTIONS } = await import("../src/scripts/emergencies.js");
  assert.deepEqual(SECTIONS.map((section) => section.title), ["Act now", "Within hours", "Space events", "Slow risks"]);
  const solo = groupEmergencies(indexCards(1));
  assert.deepEqual(solo.map((section) => section.cards.map((card) => card.id)), [
    ["breath", "bleeding", "vision-change"],
    ["belly", "fever", "back", "calf", "fracture"],
    ["cabin-air", "storm"],
  ]);
  const crew = groupEmergencies(indexCards(6));
  assert.deepEqual(crew.map((section) => section.cards.length), [4, 5, 2]);
  assert.equal(sectionFor(CARD_BY_ID.get("storm")), "space");
  assert.equal(sectionFor(CARD_BY_ID.get("gcs")), "minutes");
  assert.equal(sectionFor(CARD_BY_ID.get("calf")), "hours");
});

test("search matches titles, symptoms, terms and the shared self-harm card", async () => {
  const { matchesQuery, filterCards } = await import("../src/scripts/emergencies.js");
  const calf = CARD_BY_ID.get("calf");
  assert.equal(matchesQuery(calf, "calf"), true);
  assert.equal(matchesQuery(calf, "dvt"), true);
  assert.equal(matchesQuery(calf, "swollen calf"), false);
  assert.equal(matchesQuery(CARD_BY_ID.get("self-harm"), "suicide"), true);
  assert.equal(matchesQuery(BONE_LOSS, "bone"), true);
  assert.equal(matchesQuery(ANEMIA, "anemia"), true);
  assert.deepEqual(filterCards(indexCards(6), "calf").map((card) => card.id), ["calf"]);
  assert.equal(filterCards(indexCards(6), "zzz").length, 0);
});

test("the blood loss table is one row per class with words, not arrows", async () => {
  const { bloodTable, arrowText } = await import("../src/scripts/emergencies.js");
  const model = bloodTable(BLOOD_LOSS);
  assert.equal(model.rows.length, 4);
  assert.equal(model.columns.length, 10);
  assert.deepEqual(model.rows.map((row) => row.head), BLOOD_LOSS.head);
  assert.deepEqual(model.rows[1].cells.slice(0, 3), ["15–30%", "unchanged or higher", "unchanged"]);
  assert.equal(arrowText("↑↑"), "much higher");
  assert.equal(arrowText("↓↓"), "much lower");
  for (const row of model.rows) {
    for (const cell of row.cells) {
      assert.doesNotMatch(String(cell), /[↔↑↓]/);
    }
  }
});

test("the slow risks stay as reference cards in the deck", () => {
  const cards = read("src", "components", "emergencies", "cards.js");
  assert.match(cards, /guide\(BONE_LOSS, "bones"\)/);
  assert.match(cards, /guide\(ANEMIA, "nutrition"\)/);
  assert.match(cards, /reference: true/);
  assert.match(cards, /id: card\.id/);
  assert.match(cards, /topic/);
});

test("the emergency styles use only the colour tokens", () => {
  const css = read("src", "components", "emergencies", "emergencies.css");
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(css, /rgba?\(/);
  assert.match(css, /var\(--am-danger\)/);
  assert.doesNotMatch(css, /emgPulse|infinite/);
  assert.equal((css.match(/border-left/g) || []).length, 1, "only the range tick keeps a side line");
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.emg-bt i,\s*\.emg-storm-step\s*\{\s*animation:\s*none;/);
});
