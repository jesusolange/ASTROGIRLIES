import { doneToday, readSessions, todaySummary } from "../../scripts/exercise.js";
import { vo2Due } from "../../scripts/fitness.js";
import SessionCard from "./SessionCard.jsx";
import Vo2Card, { vo2Save } from "./Vo2Card.jsx";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const cards = [
  {
    id: "exercise",
    topic: "exercise",
    title: "Log a training session",
    Component: SessionCard,
    isDone: () => doneToday(readSessions()),
    summary: () => todaySummary(readSessions())
  },
  {
    id: "vo2max",
    topic: "exercise",
    title: "Log a VO\u2082max test",
    Component: Vo2Card,
    initialValues: { value: "", date: today() },
    save: vo2Save,
    isDone: () => vo2Due().days > 0
  }
];
