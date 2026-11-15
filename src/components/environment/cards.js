// The Cabin conditions card: one set of optional readings, judged with the existing thresholds.
import { h } from "preact";
import { openEmergency } from "../../lib/nav.js";
import {
  FIELDS, overallLevel, profilePlace, readingLog, readingState, readingsResult, record, recordedToday
} from "../../scripts/environment.js";
import CabinAside from "./CabinAside.jsx";
import CabinCard from "./CabinCard.jsx";
import CabinResult from "./CabinResult.jsx";
import "./environment.css";

function saveCabin(values) {
  const readings = {};
  for (const field of FIELDS) {
    const raw = values[field.key];
    if (raw === "" || raw == null) continue;
    const number = Number(raw);
    if (!Number.isFinite(number)) {
      return { error: { field: field.key, message: "Enter a number, or leave the field empty." } };
    }
    readings[field.key] = number;
  }
  if (!Object.keys(readings).length) {
    return { error: { field: FIELDS[0].key, message: "Enter at least one cabin reading before saving." } };
  }

  const place = profilePlace();
  const results = readingsResult(readings, place, readingLog());
  const level = overallLevel(results);
  const { undo } = record(readings);
  const result = {
    level: level === "info" ? "ok" : level,
    toast: "Cabin conditions recorded.",
    body: h(CabinResult, { results, place })
  };
  if (level === "review" || level === "alert") {
    result.actions = [{
      label: "Open the cabin air card",
      variant: level === "alert" ? "danger" : "primary",
      onClick: () => openEmergency("cabin-air")
    }];
  }
  return { result, undo };
}

function cabinSummary() {
  const state = readingState();
  if (!state.readings) return "";
  return FIELDS.filter((field) => Number.isFinite(state.readings[field.key]))
    .map((field) => `${state.readings[field.key]} ${field.unit}`)
    .join(" · ");
}

// Today's recorded readings fill the form again, so returning to the card never shows an empty
// entry next to an existing record for the same day.
function savedValues() {
  if (!recordedToday()) return {};
  const readings = readingState().readings || {};
  const values = {};
  FIELDS.forEach((field) => {
    if (Number.isFinite(readings[field.key])) values[field.key] = readings[field.key];
  });
  return values;
}

export const cards = [
  {
    id: "cabin",
    topic: "environment",
    title: "Cabin conditions",
    get initialValues() {
      return savedValues();
    },
    Component: CabinCard,
    Aside: CabinAside,
    isDone: () => recordedToday(),
    summary: cabinSummary,
    // A saved day has one record: the card opens with those readings and no Save button, so Back
    // from the cabin-air card cannot start a second entry.
    get save() {
      return recordedToday() ? undefined : saveCabin;
    }
  }
];
