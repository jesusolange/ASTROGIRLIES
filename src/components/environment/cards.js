// The Cabin conditions card: one set of optional readings, judged with the existing thresholds.
import { h } from "preact";
import { openEmergency } from "../../lib/nav.js";
import {
  FIELDS, PLACES, overallLevel, profilePlace, readingLog, readingState, readingsResult, record, recordedToday
} from "../../scripts/environment.js";
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

export const cards = [
  {
    id: "cabin",
    topic: "environment",
    title: "Cabin conditions",
    get illustration() {
      const info = PLACES[profilePlace()];
      return info && info.img ? `/${info.img}` : null;
    },
    Component: CabinCard,
    isDone: () => recordedToday(),
    summary: cabinSummary,
    save: saveCabin
  }
];
