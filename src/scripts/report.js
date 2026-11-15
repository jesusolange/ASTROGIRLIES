/* The mission health report: the astronaut's own record as a formal, text-only document.
   The content model is pure and tested without the DOM; openReport() prints it through the browser. */

import { TOPICS } from "../data/topics.js";
import { SOURCES } from "../data/sources.js";
import { MISSION_TYPES } from "./risks.js";
import { crewFor, missionDayFor, totalFor } from "./profile.js";
import { link, alsoTell } from "./mission.js";
import { SYSTEMS } from "./checkup-flow.js";
import { dateLabel, formatValue, fmtNum, readProgress } from "./progress.js";
import { findings as bodyFindings } from "./checkup.js";
import { findings as mentalFindings } from "./mental.js";
import { findings as immuneFindings } from "./immune.js";
import { findings as nutritionFindings } from "./nutrition.js";
import { findings as radiationFindings } from "./radiation.js";
import { findings as visionFindings } from "./vision.js";
import { findings as environmentFindings } from "./environment.js";
import { findings as fitnessFindings } from "./fitness.js";
import { renderReportHtml } from "../components/report/report-print.js";
import { toast } from "../lib/ui.js";

export const NOTICE = "Self-monitoring record. Not a medical device and not a diagnosis.";
export const REFERENCE_NOTE =
  "Reference ranges in this record are the app's design choice where no named source is given.";
export const LEVEL_TEXT = {
  ok: "In range",
  info: "Recorded",
  review: "Review",
  warn: "Review",
  alert: "Urgent",
  urgent: "Urgent"
};

// The body systems are grouped into topics by the same mapping the body deck cards use.
export const PART_TOPIC = {
  brain: "sleep",
  lungs: "heart",
  heart: "heart",
  kidneys: "kidneys",
  hand: "immune",
  bones: "bones",
  muscles: "exercise"
};

const FILTER_TOPIC = {
  vision: "vision",
  mind: "mental",
  immune: "immune",
  radiation: "radiation",
  cabin: "environment",
  nutrition: "nutrition",
  exercise: "exercise"
};

export function topicForRow(row) {
  if (!row) return null;
  if (row.filter === "body") return PART_TOPIC[row.part] || null;
  return FILTER_TOPIC[row.filter] || null;
}

const timeOf = (iso) => {
  const value = new Date(iso).getTime();
  return Number.isFinite(value) ? value : null;
};

// One row per measure: the latest value the astronaut recorded for it.
export function latestPerMeasure(rows = []) {
  const best = new Map();
  for (const row of rows) {
    if (!row || !row.measure || timeOf(row.date) == null) continue;
    const current = best.get(row.measure);
    if (!current || timeOf(row.date) > timeOf(current.date)) best.set(row.measure, row);
  }
  return [...best.values()].sort(
    (a, b) => (a.order || 0) - (b.order || 0) || timeOf(a.date) - timeOf(b.date)
  );
}

export function referenceText(row) {
  const unit = row && row.unit ? ` ${row.unit}` : "";
  const band = row && row.band;
  if (Array.isArray(band) && Number.isFinite(band[0]) && Number.isFinite(band[1])) {
    return `${fmtNum(band[0])} to ${fmtNum(band[1])}${unit}`;
  }
  if (typeof band === "number" && Number.isFinite(band)) return `${fmtNum(band)}${unit}`;
  return "—";
}

export function valueText(row) {
  if (row.display) return row.display;
  const value = formatValue(row, row.value);
  return row.unit ? `${value} ${row.unit}` : value;
}

export function levelText(level) {
  return LEVEL_TEXT[level] || "Recorded";
}

export function tableRow(row) {
  return {
    date: dateLabel(row.date),
    measure: row.label || row.check || row.measure,
    value: valueText(row),
    reference: referenceText(row),
    level: levelText(row.level)
  };
}

export function partFromTitle(title) {
  const text = String(title || "");
  return Object.keys(SYSTEMS).find((part) => {
    const own = SYSTEMS[part].title;
    return text === own || text.startsWith(`${own} ·`);
  }) || null;
}

function findingsRow(finding) {
  return {
    level: levelText(finding.level),
    title: String(finding.title || ""),
    saw: String(finding.saw || ""),
    todo: String(finding.todo || "")
  };
}

// Calls each section's findings() and files them under the topic they belong to.
export function collectFindings() {
  const byTopic = Object.fromEntries(TOPICS.map((topic) => [topic.id, []]));
  const add = (topicId, list) => {
    const bucket = byTopic[topicId];
    if (!bucket) return;
    (list || []).forEach((finding) => {
      if (finding && finding.title) bucket.push(finding);
    });
  };

  bodyFindings().forEach((finding) => {
    const part = partFromTitle(finding.title);
    if (part) add(PART_TOPIC[part], [finding]);
  });
  add("mental", mentalFindings());
  add("immune", immuneFindings());
  add("nutrition", nutritionFindings());
  add("radiation", radiationFindings());
  add("vision", visionFindings());
  add("environment", environmentFindings());
  add("exercise", fitnessFindings());
  return byTopic;
}

export function closingLine(linkValue) {
  if (!linkValue || linkValue.kind === "none") return "";
  return `This record can be sent to the flight surgeon. ${alsoTell("the flight surgeon", linkValue)}`;
}

const formatGenerated = (value) => new Date(value).toLocaleString("en-GB", {
  dateStyle: "long",
  timeStyle: "short"
});

export function buildReport(options = {}) {
  const profile = options.profile || null;
  const rows = options.rows || [];
  const findingsByTopic = options.findingsByTopic || {};
  const generatedAt = options.generatedAt ? new Date(options.generatedAt) : new Date();

  const latest = latestPerMeasure(rows);
  const sections = TOPICS.map((topic) => {
    const own = latest.filter((row) => topicForRow(row) === topic.id);
    if (!own.length) return null;
    return {
      id: topic.id,
      label: topic.label,
      rows: own.map(tableRow),
      findings: (findingsByTopic[topic.id] || []).map(findingsRow)
    };
  }).filter(Boolean);

  const mission = MISSION_TYPES.find((item) => item.id === (profile && profile.missionType)) || null;
  const linkValue = link(null, profile);
  const missionDay = missionDayFor(profile, generatedAt);

  return {
    title: "Mission health report",
    header: {
      name: (profile && profile.name) || "Astronaut",
      mission: mission ? mission.label : "Mission not set",
      crew: crewFor(profile),
      missionDay,
      totalDays: totalFor(profile),
      generated: formatGenerated(generatedAt)
    },
    notice: NOTICE,
    referenceNote: REFERENCE_NOTE,
    sections,
    sources: SOURCES.map((source) => ({
      title: source.title,
      author: source.author,
      url: source.url,
      licence: source.licence
    })),
    closing: closingLine(linkValue)
  };
}

export async function openReport() {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank");
  if (!win) {
    toast("Allow pop-ups for this page to open the report.");
    return;
  }
  try {
    const store = window.AstroMedStore && window.AstroMedStore.store;
    const profile = store ? store.get("astromed-profile", null) : null;
    const rows = readProgress(store, profile).rows;
    const report = buildReport({
      profile,
      rows,
      findingsByTopic: collectFindings(),
      generatedAt: new Date()
    });
    win.document.open();
    win.document.write(renderReportHtml(report));
    win.document.close();
    win.focus();
    win.setTimeout(() => win.print(), 300);
  } catch (error) {
    console.error("report", error);
    try { win.close(); } catch { /* the window is already gone */ }
    toast("The report could not be opened. Try again.");
  }
}
