// Vision deck cards. Calibration comes first, then the left eye before the right, and the symptoms card
// ends the run with the result. Each eye is fixed by its card.
import { h } from "preact";
import { openEmergency } from "../../lib/nav.js";
import { emergencyFor } from "../../data/topics.js";
import {
  CALIBRATION, CARD_MM, EYE_LABEL, NEAR_LINES, calibration, readData, saveCalibration
} from "../../scripts/vision.js";
import {
  assessmentSummary, assessmentToday, cardDone, finish, readProgress, restore, savePart,
  saveSymptoms, snapshot
} from "./session.js";
import "./vision.css";
import CalibrationCard from "./CalibrationCard.jsx";
import GridCard from "./GridCard.jsx";
import NearCard from "./NearCard.jsx";
import SymptomsCard from "./SymptomsCard.jsx";

const widthNow = () => {
  const current = calibration();
  return current ? Math.round(current.ppmm * CARD_MM) : 300;
};

const GridLeft = (props) => h(GridCard, { ...props, eye: "left" });
const GridRight = (props) => h(GridCard, { ...props, eye: "right" });
const NearLeft = (props) => h(NearCard, { ...props, eye: "left" });
const NearRight = (props) => h(NearCard, { ...props, eye: "right" });

const NOT_CALIBRATED = {
  error: { field: "calibration", message: "Calibrate the screen on the first card before you test an eye." }
};

function saveCalibrate(values) {
  const width = Number(values.cardWidth);
  if (!(width >= CALIBRATION.minPx && width <= CALIBRATION.maxPx)) {
    return { error: { field: "cardWidth", message: "Move the slider until the bar matches the long edge of a bank card." } };
  }
  const before = snapshot();
  const ppmm = saveCalibration(width / CARD_MM);
  if (!ppmm) return { error: { field: "cardWidth", message: "The calibration could not be saved. Try again." } };
  return {
    result: {
      level: "ok",
      saw: `Screen calibrated at ${ppmm.toFixed(2)} px per mm. The grid and the near chart use this scale on this device.`,
      todo: "Next, test the grid with your left eye, then your right."
    },
    undo: () => restore(before)
  };
}

function saveGrid(eye) {
  return (values) => {
    if (!calibration()) return NOT_CALIBRATED;
    if (values.gridAnswer !== "normal" && values.gridAnswer !== "changed") {
      return { error: { field: "gridAnswer", message: "Choose whether the lines looked even or changed." } };
    }
    const before = snapshot();
    const marks = Array.isArray(values.marks) ? values.marks : [];
    const grid = { distortion: values.gridAnswer === "changed", marks };
    savePart(eye, { grid });
    const count = marks.length;
    return {
      result: {
        level: "info",
        saw: `${EYE_LABEL[eye]} grid recorded. ${grid.distortion ? "Some lines looked wavy, blurred or missing." : "All lines looked straight and even."}${count ? ` ${count} ${count === 1 ? "area" : "areas"} marked.` : ""}`,
        todo: eye === "left" ? "Next, test the grid with your right eye." : "Next, check near vision in your left eye."
      },
      undo: () => restore(before)
    };
  };
}

function saveNear(eye) {
  return (values) => {
    if (!calibration()) return NOT_CALIBRATED;
    if (!Number.isInteger(values.near)) {
      return { error: { field: "near", message: "Choose the smallest line you read, or say you could not read the largest line." } };
    }
    const before = snapshot();
    savePart(eye, { near: values.near });
    const line = NEAR_LINES[values.near];
    return {
      result: {
        level: "info",
        saw: `${EYE_LABEL[eye]} near vision recorded: ${line ? line.snellen : "could not read the largest line shown"}.`,
        todo: eye === "left" ? "Next, check near vision in your right eye." : "Next, note any symptoms you noticed today."
      },
      undo: () => restore(before)
    };
  };
}

function saveSymptomsCard(values) {
  const progress = readProgress();
  const ready = (part) => Boolean(part && part.grid && Number.isInteger(part.near));
  if (!ready(progress.left) || !ready(progress.right)) {
    return { error: { field: "symptoms", message: "Record the grid and the near chart for both eyes first." } };
  }
  const before = snapshot();
  saveSymptoms(Array.isArray(values.symptoms) ? values.symptoms : []);
  finish();
  const assessment = assessmentToday(readData());
  if (!assessment) return { error: { field: "symptoms", message: "The result could not be saved. Try again." } };
  const actions = assessment.level === "warn" || assessment.level === "urgent"
    ? [{
        label: "Sudden change in vision",
        variant: assessment.level === "urgent" ? "danger" : "primary",
        onClick: () => openEmergency(emergencyFor("vision"))
      }]
    : [];
  return {
    result: {
      level: assessment.level,
      saw: `${assessmentSummary(assessment)} The change thresholds are our design choice, not a medical standard.`,
      todo: assessment.todo,
      actions
    },
    undo: () => restore(before)
  };
}

export const cards = [
  {
    id: "vision-calibrate",
    topic: "vision",
    title: "Calibrate the screen",
    Component: CalibrationCard,
    initialValues: { cardWidth: widthNow() },
    save: saveCalibrate,
    isDone: () => cardDone("vision-calibrate")
  },
  {
    id: "vision-grid-left",
    topic: "vision",
    title: "Grid test, left eye",
    Component: GridLeft,
    initialValues: { marks: [], gridAnswer: null },
    save: saveGrid("left"),
    isDone: () => cardDone("vision-grid-left")
  },
  {
    id: "vision-grid-right",
    topic: "vision",
    title: "Grid test, right eye",
    Component: GridRight,
    initialValues: { marks: [], gridAnswer: null },
    save: saveGrid("right"),
    isDone: () => cardDone("vision-grid-right")
  },
  {
    id: "vision-near-left",
    topic: "vision",
    title: "Near chart, left eye",
    Component: NearLeft,
    initialValues: { near: null },
    save: saveNear("left"),
    isDone: () => cardDone("vision-near-left")
  },
  {
    id: "vision-near-right",
    topic: "vision",
    title: "Near chart, right eye",
    Component: NearRight,
    initialValues: { near: null },
    save: saveNear("right"),
    isDone: () => cardDone("vision-near-right")
  },
  {
    id: "vision-symptoms",
    topic: "vision",
    title: "Symptoms today",
    Component: SymptomsCard,
    initialValues: { symptoms: [] },
    save: saveSymptomsCard,
    isDone: () => cardDone("vision-symptoms"),
    summary: () => {
      const assessment = assessmentToday(readData());
      return assessment ? assessment.title : "";
    }
  }
];

