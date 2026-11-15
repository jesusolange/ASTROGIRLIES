import { doneToday, isoDay, readNutrition, todaySummary } from "../../scripts/nutrition.js";
import MealCard from "./MealCard.jsx";
import MealAside from "./MealAside.jsx";

export const cards = [
  {
    id: "nutrition",
    topic: "nutrition",
    title: "Log a meal",
    Component: MealCard,
    Aside: MealAside,
    isDone: () => doneToday(readNutrition(), isoDay(new Date())),
    summary: () => todaySummary(readNutrition(), isoDay(new Date()))
  }
];
