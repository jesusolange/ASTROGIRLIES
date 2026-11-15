// The body checks as deck cards: one card per body system that has measurements.
// Each card keeps the record shape { part, values, time, source } from checkup-flow.js.
import { h } from "preact";
import { openEmergency } from "../../lib/nav.js";
import { emergencyFor } from "../../data/topics.js";
import { EQUIP } from "../../data/devices.js";
import { saveCard, doneToday, summaryFor } from "../../scripts/checkup-flow.js";
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

function saveFor(spec) {
  return function save(values) {
    const outcome = saveCard(spec.part, values, { ruleFor });
    if (outcome.error) return outcome;
    const emergency = emergencyFor(spec.topic);
    if (emergency && (outcome.result.level === "warn" || outcome.result.level === "urgent")) {
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
