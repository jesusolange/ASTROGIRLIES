// The Radiation card: log a dose. It is always available by route; it is not on a fixed interval.
import { h } from "preact";
import { profileRecord } from "../../scripts/mission.js";
import {
  addDose, calc, convertToMsv, isoDay, load, missionFor, recordedToday, removeDose, save
} from "../../scripts/radiation.js";
import DoseCard from "./DoseCard.jsx";
import DoseResult from "./DoseResult.jsx";
import "./radiation.css";

function saveDose(values) {
  const raw = values.dose;
  const value = Number(raw);
  if (raw === "" || raw == null || !Number.isFinite(value) || value < 0) {
    return { error: { field: "dose", message: "Enter the dose as a number." } };
  }
  const mSv = convertToMsv(value, values.unit || "mSv");
  if (mSv == null || mSv <= 0) {
    return { error: { field: "dose", message: "Enter a dose greater than zero." } };
  }
  const added = addDose(load(), {
    day: isoDay(new Date()),
    dose: Math.round(mSv * 1000) / 1000,
    src: values.source || "dosimeter"
  });
  save(added.state);
  const totals = calc(added.state, missionFor(profileRecord()));
  return {
    result: {
      level: totals.level,
      toast: "Dose recorded.",
      body: h(DoseResult, { totals })
    },
    undo: () => save(removeDose(load(), added.entry.id))
  };
}

function doseSummary() {
  const today = isoDay(new Date());
  const total = load().entries.filter((entry) => entry.day === today).reduce((sum, entry) => sum + entry.dose, 0);
  return total ? `${Number(total.toFixed(3))} mSv today` : "";
}

export const cards = [
  {
    id: "radiation-dose",
    topic: "radiation",
    title: "Add a radiation dose",
    Component: DoseCard,
    isDone: () => recordedToday(),
    summary: doseSummary,
    save: saveDose
  }
];
