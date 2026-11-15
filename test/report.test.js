import test from "node:test";
import assert from "node:assert/strict";
import {
  NOTICE, PART_TOPIC, buildReport, latestPerMeasure, levelText, partFromTitle,
  referenceText, tableRow, topicForRow
} from "../src/scripts/report.js";
import { renderReportHtml } from "../src/components/report/report-print.js";
import { dateLabel } from "../src/scripts/progress.js";

const PROFILE = {
  name: "Solange", missionType: "mars-planetary", crew: 4,
  startDate: "2026-11-01", totalDays: 730
};
const at = (day, hour = 9) => new Date(2026, 10, day, hour, 0, 0).toISOString();
const BASE = {
  label: "Heart rate", value: 76, unit: "bpm", band: [60, 100], level: "ok",
  date: at(10), measure: "body.heart.hr", filter: "body", part: "heart", order: 1000
};
const row = (over) => ({ ...BASE, ...over });

function fixture() {
  return [
    row({ date: at(10), value: 70 }),
    row({ date: at(12), value: 78 }),
    row({ part: "lungs", filter: "body", measure: "body.lungs.resp", label: "Respiratory rate", unit: "breaths/min", value: 15, band: [12, 18], order: 1001 }),
    row({ part: "brain", filter: "body", measure: "body.brain.sleep", label: "Sleep duration", unit: "h", value: 7.4, band: [6, 9], order: 2000 }),
    row({ part: "kidneys", filter: "body", measure: "body.kidneys.urine", label: "Urine output", unit: "mL", value: 1500, band: null, order: 3000 }),
    row({ part: "hand", filter: "body", measure: "body.hand.temp", label: "Oral body temperature", unit: "°C", value: 36.8, band: [36, 37.5], order: 4000 }),
    row({ part: "bones", filter: "body", measure: "body.bones.bmd", label: "Reference BMD", unit: "g/cm²", value: 1.12, band: null, order: 5000 }),
    row({ part: "muscles", filter: "body", measure: "body.muscles.activity", label: "Activity", unit: "min", value: 58, band: null, order: 6000 }),
    row({ filter: "vision", part: undefined, measure: "vision.left.line", label: "Left near line", unit: "", value: 6, band: null, order: 7000, display: "J1" }),
    row({ filter: "mind", part: undefined, measure: "mind.mood", label: "Mood", unit: "", value: 5, band: [0, 10], order: 8000, display: "okay (4/5)" }),
    row({ filter: "immune", part: undefined, measure: "immune.symptoms", label: "Daily symptoms", unit: "", value: 0, band: null, order: 9000, display: "No symptoms" }),
    row({ filter: "radiation", part: undefined, measure: "radiation.daily", label: "Daily dose", unit: "mSv", value: 0.6, band: null, order: 10000 }),
    row({ filter: "cabin", part: undefined, measure: "cabin.temp", label: "Cabin temperature", unit: "°C", value: 21, band: [18, 27], order: 11000 }),
    row({ filter: "nutrition", part: undefined, measure: "nutrition.meal", label: "Meal", unit: "kcal", value: 620, band: null, order: 12000, display: "Oatmeal · 620 kcal" }),
    row({ filter: "exercise", part: undefined, measure: "exercise.session", label: "Session", unit: "min", value: 45, band: null, order: 13000 })
  ];
}

test("the header names the astronaut, mission, crew, mission day and generation date", () => {
  const report = buildReport({
    profile: PROFILE, rows: [], findingsByTopic: {}, generatedAt: new Date(2026, 10, 15, 10, 0)
  });
  assert.equal(report.header.name, "Solange");
  assert.equal(report.header.mission, "Mars planetary, 730 to 1224 days");
  assert.equal(report.header.crew, 4);
  assert.equal(report.header.missionDay, 15);
  assert.equal(report.header.totalDays, 730);
  assert.match(report.header.generated, /15 November 2026/);
  assert.equal(report.notice, NOTICE);
  assert.equal(NOTICE, "Self-monitoring record. Not a medical device and not a diagnosis.");
});

test("rows are grouped into one section per topic and map body systems like the deck does", () => {
  assert.equal(PART_TOPIC.brain, "sleep");
  assert.equal(PART_TOPIC.lungs, "heart");
  assert.equal(topicForRow(row({ part: "hand", filter: "body" })), "immune");
  assert.equal(topicForRow(row({ filter: "cabin", part: undefined })), "environment");
  assert.equal(topicForRow(row({ filter: "unknown", part: undefined })), null);

  const report = buildReport({ profile: PROFILE, rows: fixture(), generatedAt: new Date(2026, 10, 15, 10, 0) });
  const ids = report.sections.map((section) => section.id);
  assert.deepEqual(ids, ["heart", "bones", "kidneys", "immune", "radiation", "mental", "sleep", "vision", "environment", "nutrition", "exercise"]);
  assert.equal(report.sections[0].rows.length, 2);
  assert.equal(report.sections[0].rows[0].measure, "Heart rate");
  assert.equal(report.sections[0].rows[1].measure, "Respiratory rate");
});

test("each measure appears once, with its latest value and the five table columns", () => {
  const latest = latestPerMeasure(fixture());
  const heart = latest.filter((entry) => entry.measure === "body.heart.hr");
  assert.equal(heart.length, 1);
  assert.equal(heart[0].value, 78);

  const cells = tableRow(latest.find((entry) => entry.measure === "body.heart.hr"));
  assert.deepEqual(Object.keys(cells), ["date", "measure", "value", "reference", "level"]);
  assert.equal(cells.date, dateLabel(at(12)));
  assert.equal(cells.measure, "Heart rate");
  assert.equal(cells.value, "78 bpm");
  assert.equal(cells.reference, "60 to 100 bpm");
  assert.equal(cells.level, "In range");
  assert.equal(referenceText({ band: null }), "—");
  assert.equal(referenceText({ band: 30, unit: "min" }), "30 min");
  assert.equal(levelText("alert"), "Urgent");
  assert.equal(levelText("review"), "Review");
});

test("findings come from each section and keep the action", () => {
  const report = buildReport({
    profile: PROFILE, rows: fixture(), generatedAt: new Date(2026, 10, 15, 10, 0),
    findingsByTopic: {
      heart: [{ level: "review", title: "Cardiovascular System · Heart rate: 110 bpm", saw: "Above your baseline.", todo: "Sit and rest, then measure again." }],
      mental: [{ level: "alert", title: "Isolation and depression check-in", saw: "Needs attention.", todo: "Open the self-harm card." }]
    }
  });
  const heart = report.sections.find((section) => section.id === "heart");
  assert.equal(heart.findings[0].level, "Review");
  assert.equal(heart.findings[0].todo, "Sit and rest, then measure again.");
  const mental = report.sections.find((section) => section.id === "mental");
  assert.equal(mental.findings[0].level, "Urgent");
  assert.equal(report.sections.find((section) => section.id === "vision").findings.length, 0);
});

test("body finding titles are filed under their own system topic", () => {
  assert.equal(partFromTitle("Cardiovascular System · Heart rate: 110 bpm"), "heart");
  assert.equal(partFromTitle("Sleep & Cognition · Mood (self-report): 3 /10"), "brain");
  assert.equal(partFromTitle("Something else"), null);
});

test("sources are appended and the closing line follows the mission link", () => {
  const report = buildReport({ profile: PROFILE, rows: fixture(), generatedAt: new Date(2026, 10, 15, 10, 0) });
  assert.ok(report.sources.length > 0);
  assert.ok(report.sources.every((source) => source.title && "author" in source && "licence" in source));
  assert.match(report.closing, /sent to the flight surgeon/i);
  assert.match(report.closing, /reply takes about 6 to 44 minutes/i);

  const noLink = buildReport({ profile: { ...PROFILE, missionType: "leo-short" }, rows: [] });
  assert.match(noLink.closing, /link is live/i);
  assert.equal(buildReport({ profile: null }).closing, "");
});

test("the print document is text only, black on white, with tables and page numbers", () => {
  const report = buildReport({
    profile: PROFILE, rows: fixture(), generatedAt: new Date(2026, 10, 15, 10, 0),
    findingsByTopic: { heart: [{ level: "review", title: "Heart · high", saw: "Above your baseline.", todo: "Sit and rest." }] }
  });
  const html = renderReportHtml(report);
  assert.match(html, /^<!DOCTYPE html>/);
  assert.ok(html.includes(`<p class="rpt-notice">${NOTICE}</p>`));
  assert.ok(html.includes("Date</th><th scope=\"col\">Measure"));
  assert.ok(html.includes("@media print"));
  assert.ok(html.includes("counter(page)"));
  assert.ok(html.includes("color: #000"));
  assert.doesNotMatch(html, /<img|<svg|<canvas|3D|body figure/i);
  assert.doesNotMatch(html, /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u);
  assert.ok(html.includes("<h2>Sources</h2>"));
  assert.ok(html.includes("Action:"));
});

test("text from stored data is escaped before it reaches the document", () => {
  const html = renderReportHtml(buildReport({
    profile: { ...PROFILE, name: "<script>alert(1)</script>" },
    rows: fixture(),
    findingsByTopic: { heart: [{ level: "info", title: "<b>x</b>", saw: "a & b", todo: "<i>do</i>" }] },
    generatedAt: new Date(2026, 10, 15, 10, 0)
  }));
  assert.doesNotMatch(html, /<script>alert/);
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(html.includes("&lt;b&gt;x&lt;/b&gt;"));
  assert.ok(html.includes("a &amp; b"));
});
