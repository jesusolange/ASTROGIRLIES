// The Immune deck cards: symptoms today and a free-form saliva or blood result.
import { openEmergency } from "../../lib/nav.js";
import {
  ACTIONS, SYMPTOMS, addTest, assess, immuneState, labDue, latestTest, riskFactors,
  saveSymptoms as storeSymptoms, status, testRows
} from "../../scripts/immune.js";
import LabCard from "./LabCard.jsx";
import SymptomsCard from "./SymptomsCard.jsx";
import "./immune.css";

const LABEL = Object.fromEntries(SYMPTOMS);

function feverAction(sym) {
  return sym.includes("fever")
    ? [{ label: "Open the fever card", variant: "danger", onClick: () => openEmergency("fever") }]
    : undefined;
}

function saveSymptoms(values) {
  const sym = Array.isArray(values.symptoms) ? values.symptoms : [];
  const current = assess(sym, riskFactors());
  const undo = storeSymptoms(sym);
  const saw = sym.length
    ? `Today you marked: ${sym.map((id) => (LABEL[id] || id).toLowerCase()).join(", ")}.`
    : "No symptoms marked today.";
  const result = {
    level: current.level,
    saw: `${saw} The symptom thresholds are our design choice.`,
    todo: ACTIONS[current.level],
    toast: "Symptoms recorded."
  };
  const actions = feverAction(sym);
  if (actions) result.actions = actions;
  return { result, undo };
}

function saveLab(values) {
  const name = String(values.name || "").trim();
  const unit = String(values.unit || "").trim();
  const value = Number(values.value);
  if (!name) return { error: { field: "name", message: "Enter the test name." } };
  if (values.value === "" || values.value == null || !Number.isFinite(value)) {
    return { error: { field: "value", message: "Enter the result as a number." } };
  }
  if (!unit) return { error: { field: "unit", message: "Enter the unit, for example µg/dL." } };
  const kind = values.kind === "blood" ? "blood" : "saliva";
  const { test, undo } = addTest({ kind, name, value, unit, note: values.note });
  const saved = testRows(immuneState().tests).find((row) => row.id === test.id);
  const change = saved && saved.before != null
    ? ` Change from the previous ${name}: ${saved.value - saved.before >= 0 ? "+" : ""}${Number((saved.value - saved.before).toFixed(4))} ${unit}.`
    : "";
  return {
    result: {
      level: "info",
      saw: `Saved ${name}: ${value} ${unit} (${kind} test). No reference range is applied.${change}`,
      todo: "Compare it with your earlier results in Progress.",
      toast: "Lab result recorded."
    },
    undo
  };
}

function symptomsSummary() {
  const current = status();
  if (!current.saved) return "";
  if (!current.sym.length) return "No symptoms";
  return current.sym.map((id) => LABEL[id] || id).join(", ");
}

export const cards = [
  {
    id: "immune-symptoms",
    topic: "immune",
    title: "Symptoms today",
    Component: SymptomsCard,
    isDone: () => status().saved,
    summary: symptomsSummary,
    save: saveSymptoms
  },
  {
    id: "immune-lab",
    topic: "immune",
    title: "Lab result (saliva or blood)",
    Component: LabCard,
    isDone: () => !labDue(),
    summary() {
      const test = latestTest();
      return test ? `${test.name}: ${test.value} ${test.unit}` : "";
    },
    save: saveLab
  }
];
