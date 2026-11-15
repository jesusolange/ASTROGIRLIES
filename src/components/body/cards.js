// The body checks as deck cards: one card per body system that has measurements.
// Each card keeps the record shape { part, values, time, source } from checkup-flow.js.
import { h } from "preact";
import { openEmergency } from "../../lib/nav.js";
import { emergencyFor } from "../../data/topics.js";
import { EQUIP } from "../../data/devices.js";
import { get as getProfile } from "../../scripts/profile.js";
import { saveCard, doneToday, summaryFor, withProfileWeight } from "../../scripts/checkup-flow.js";
import BodyCard from "./BodyCard.jsx";

function ruleFor(key, value) {
  const data = typeof window !== "undefined" ? window.AstroMedData : null;
  return data && typeof data.rule === "function" ? data.rule(key, value) : null;
}

const SPECS = [
  { id: "brain", part: "brain", topic: "sleep", title: "Brain and sleep", focus: "brain", devices: [] },
  { id: "heart", part: "heart", topic: "heart", title: "Heart", focus: "heart", devices: ["bp", "pulse"] },
  { id: "lungs", part: "lungs", topic: "heart", title: "Lungs", focus: "lungs", devices: ["pulse"] },
  { id: "kidneys", part: "kidneys", topic: "kidneys", title: "Kidneys", focus: "kidneys", devices: [] },
  { id: "temp-glucose", part: "hand", topic: "immune", title: "Temperature and glucose", focus: "body", devices: ["thermo", "gluco"] },
  { id: "bones", part: "bones", topic: "bones", title: "Bones", focus: "bones", devices: [] },
  { id: "muscles", part: "muscles", topic: "exercise", title: "Muscles", focus: "muscles", devices: [] }
];

function componentFor(spec) {
  return function BodyCardFor(props) {
    return h(BodyCard, {
      part: spec.part,
      focus: spec.focus,
      devices: spec.devices.map((key) => EQUIP[key]).filter(Boolean),
      ...props
    });
  };
}

// Blood pressure alone only ever shows "Watch" with its action, never an emergency card (owner decision).
const NO_EMERGENCY = new Set(["sys", "dia"]);

function raisesEmergency(values) {
  return Object.entries(values || {}).some(([key, value]) => {
    if (NO_EMERGENCY.has(key) || value === "" || value == null) return false;
    const rule = ruleFor(key, Number(value));
    return Boolean(rule && (rule.level === "review" || rule.level === "alert"));
  });
}

function saveFor(spec) {
  return function save(values) {
    const draft = withProfileWeight(spec.part, values, getProfile());
    const outcome = saveCard(spec.part, draft, { ruleFor });
    if (outcome.error) return outcome;
    const emergency = emergencyFor(spec.topic);
    const raised = outcome.result.level === "warn" || outcome.result.level === "urgent";
    if (emergency && raised && raisesEmergency(draft)) {
      outcome.result.actions = [{ label: "Open the emergency card", onClick: () => openEmergency(emergency) }];
    }
    return outcome;
  };
}

export const cards = SPECS.map((spec) => ({
  id: spec.id,
  topic: spec.topic,
  title: spec.title,
  Component: componentFor(spec),
  save: saveFor(spec),
  isDone: () => doneToday(spec.part),
  summary: () => summaryFor(spec.part)
}));
