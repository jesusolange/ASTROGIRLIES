import { doneToday, isoDay, readNutrition, todaySummary } from "../../scripts/nutrition.js";
import MealCard from "./MealCard.jsx";

export const cards = [
  {
    id: "nutrition",
    topic: "nutrition",
    title: "Log a meal",
    Component: MealCard,
    isDone: () => doneToday(readNutrition(), isoDay(new Date())),
    summary: () => todaySummary(readNutrition(), isoDay(new Date()))
  }
];
