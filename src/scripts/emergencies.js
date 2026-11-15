import { signal } from "@preact/signals";
import { VITALS_REFERENCE, resolveCardId, situations as listSituations } from "../data/emergencies.js";
import { NTX_RANGES } from "../data/slow-risks.js";
import { openEmergency } from "../lib/nav.js";

const NORMAL = VITALS_REFERENCE.normal;

// Older callers read this signal; the screen itself follows the hash route.
export const openCard = signal(null);

// The search box text survives a card opening, so Back returns to the same list.
export const searchTerm = signal("");

export function gcsScore(picks) {
  const picked = picks.filter(Boolean).length;
  if (picked < 3) return { picked, total: null, level: null, message: `Picked ${picked} of 3 columns.` };
  const total = picks[0] + picks[1] + picks[2];
  if (total >= 13) return { picked, total, level: "ok", message: "Mild or normal. Keep watching." };
  if (total >= 9) return { picked, total, level: "mid", tell: "flight-surgeon", message: "Moderate drop in awareness. Call the flight surgeon now." };
  return { picked, total, level: "bad", tell: "flight-surgeon", message: "Severe drop in awareness (8 or less). Life-threatening. Call the flight surgeon now." };
}

export function shockIndex(pulse, systolic) {
  return pulse && systolic ? pulse / systolic : null;
}

export function vitalChips(values) {
  const chips = [];
  const range = (key, name) => {
    if (values[key] == null) return;
    const band = NORMAL[key];
    const label = values[key] < band.low ? "low" : values[key] > band.high ? "high" : "normal";
    chips.push({ text: `${name}: ${values[key]} ${band.unit} · ${label}`, tone: label === "normal" ? "ok" : "bad" });
  };
  range("pulse", "Pulse");
  range("resp", "Breathing");
  range("spo2", "SpO₂");
  if (values.temp != null) {
    const fever = values.temp >= VITALS_REFERENCE.feverC;
    chips.push({ text: `Temperature: ${values.temp} °C · ${fever ? "fever" : "no fever"}`, tone: fever ? "bad" : "ok" });
  }
  const index = shockIndex(values.pulse, values.sys);
  if (index != null) chips.push({ text: `Shock index: ${index.toFixed(2)} (pulse ÷ top pressure)`, tone: "info" });
  return chips;
}

export function ntxRange(profile) {
  const p = profile || {};
  if (p.sex === "m") return NTX_RANGES[0];
  if (p.sex === "f") return p.meno === "post" ? NTX_RANGES[2] : NTX_RANGES[1];
  return NTX_RANGES[1];
}

export function ntxStatus(value, profile) {
  const range = ntxRange(profile);
  const tone = value > range.max ? "bad" : value < range.min ? "mid" : "ok";
  const state = tone === "bad" ? "high" : tone === "mid" ? "low" : "in range";
  return {
    tone,
    text: `${value}: ${state} for ${range.label.toLowerCase()} (${range.min}–${range.max})`,
    needSex: !(profile && profile.sex),
  };
}

export function situations(crew = 1) {
  return listSituations(crew);
}

export function findings() {
  return [];
}

export function open(id) {
  const resolved = resolveCardId(id);
  if (!resolved) return false;
  openEmergency(resolved);
  return true;
}

// ---------- Index: urgency sections ----------

export const SECTIONS = [
  { id: "minutes", title: "Act now", note: "Act within minutes." },
  { id: "hours", title: "Within hours", note: "Act within a few hours." },
  { id: "space", title: "Space events", note: "Cabin and solar events." },
  { id: "slow", title: "Slow risks", note: "Guides that explain. They are not recorded." },
];

const SPACE_EVENT_IDS = new Set(["cabin-air", "storm"]);

export function sectionFor(card) {
  if (!card) return null;
  if (SPACE_EVENT_IDS.has(card.id)) return "space";
  return card.actWithin === "minutes" ? "minutes" : "hours";
}

export function groupEmergencies(cards) {
  return SECTIONS.filter((section) => section.id !== "slow").map((section) => ({
    ...section,
    cards: cards.filter((card) => sectionFor(card) === section.id),
  }));
}

// ---------- Search ----------

const norm = (value) => String(value || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

function collect(node, out) {
  if (node == null) return;
  if (typeof node === "string") {
    out.push(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collect(item, out));
    return;
  }
  if (typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    if (key === "src" || key === "icon" || key === "sourceIds") continue;
    collect(value, out);
  }
}

export function cardText(card) {
  const out = [];
  collect(card, out);
  return norm(out.join(" "));
}

export function matchesQuery(card, query) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const haystack = cardText(card);
  return tokens.every((token) => haystack.includes(token));
}

export function filterCards(cards, query) {
  if (!norm(query).trim()) return cards;
  return cards.filter((card) => matchesQuery(card, query));
}

// ---------- Blocks: generated text ----------

const ARROWS = {
  "↔": "unchanged",
  "↑": "higher",
  "↑↑": "much higher",
  "↓": "lower",
  "↓↓": "much lower",
};

export function arrowText(cell) {
  return String(cell)
    .split("/")
    .map((part) => part.trim())
    .map((part) => ARROWS[part] || part)
    .join(" or ");
}

// One row per class, values in columns, words instead of arrows.
export function bloodTable(table) {
  const heads = table.rows.map((row) => row[0]);
  return {
    columns: ["Class", ...heads],
    rows: table.head.map((head, index) => ({
      head,
      cells: table.rows.map((row) => arrowText(row[index + 1])),
    })),
  };
}

if (typeof window !== "undefined") {
  window.AstroMedEmergencies = { open, situations, findings };
}
