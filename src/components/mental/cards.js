// The Mind deck cards: mood daily, the two questionnaires on the topic interval.
import { h } from "preact";
import { openEmergency } from "../../lib/nav.js";
import {
  guideFor, latest, moodToday, questionnaireDue, removeResult, saveResult,
  stressActions, stressBand, stressMax, suicidalFlag
} from "../../scripts/mental.js";
import { DEP_Q, STRESS_Q } from "./questions.js";
import DepressionCard from "./DepressionCard.jsx";
import MoodCard from "./MoodCard.jsx";
import SelfHarmBody from "./SelfHarmBody.jsx";
import StressCard from "./StressCard.jsx";
import "../../styles/mental.css";

const SELF_HARM_ACTION = {
  label: "Open the full card",
  variant: "danger",
  onClick: () => openEmergency("self-harm")
};

function depressionResult(entry) {
  if (suicidalFlag(entry.answers)) {
    return {
      level: null,
      toast: "Check-in recorded.",
      body: h(SelfHarmBody, {}),
      actions: [SELF_HARM_ACTION]
    };
  }
  const guide = guideFor(entry);
  return {
    level: entry.level,
    toast: "Check-in recorded.",
    saw: `Score ${entry.score}/${entry.max}: ${entry.label}. ${guide.meaning} Screening aid, not a diagnosis; the score bands are our design choice.`,
    todo: guide.todo.join(" ") || "Keep your routine and repeat the check-in."
  };
}

function stressResult(entry) {
  const band = stressBand(entry.score);
  const guide = guideFor(entry);
  return {
    level: band.level,
    toast: "Check-in recorded.",
    saw: `Score ${entry.score}/${stressMax()}: ${band.label}. ${guide.meaning} Screening aid, not a diagnosis; the score bands are our design choice.`,
    todo: guide.todo.join(" ") || stressActions(band.label).join(" ") || "Protect your rest and repeat the check-in."
  };
}

function saveQuestionnaire(type, count, values) {
  const stored = Array.isArray(values.answers) ? values.answers : [];
  const answers = Array.from({ length: count }, (_, index) => stored[index]);
  if (answers.some((value) => value == null || value === "")) {
    return { error: { field: "answers", message: "Choose an answer for every question before saving." } };
  }
  const entry = saveResult(type, answers.map(Number));
  return {
    result: type === "depression" ? depressionResult(entry) : stressResult(entry),
    undo: () => removeResult(type, entry.date)
  };
}

function summaryOf(type) {
  const value = latest()[type];
  if (!value || !value.date) return "";
  return type === "depression"
    ? `${value.score}/27 · ${value.label}`
    : `${value.score}/${stressMax()} · ${value.label}`;
}

export const cards = [
  {
    id: "mood",
    topic: "mental",
    title: "How are you feeling today?",
    Component: MoodCard,
    isDone: () => moodToday(),
    summary() {
      const mood = latest().mood;
      return mood ? `Mood: ${mood.value}` : "";
    }
  },
  {
    id: "depression",
    topic: "mental",
    title: "Isolation and depression check-in",
    Component: DepressionCard,
    isDone: () => !questionnaireDue("depression"),
    summary: () => summaryOf("depression"),
    save: (values) => saveQuestionnaire("depression", DEP_Q.length, values)
  },
  {
    id: "stress",
    topic: "mental",
    title: "Stress and burn-out check-in",
    Component: StressCard,
    isDone: () => !questionnaireDue("stress"),
    summary: () => summaryOf("stress"),
    save: (values) => saveQuestionnaire("stress", STRESS_Q.length, values)
  }
];
