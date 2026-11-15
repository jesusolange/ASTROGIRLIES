// The meal card's overview: today's plate, calorie gauge, target rings and meals.
import { useStored } from "../../lib/use-stored.js";
import { KEY, blankNutrition, dayView } from "../../scripts/nutrition.js";
import NutritionTargets from "./NutritionTargets.jsx";

export default function MealAside() {
  const [profile] = useStored("astromed-profile", null);
  const [stored] = useStored(KEY, blankNutrition());
  const state = { ...blankNutrition(), ...stored, lib: stored.lib || [], eva: stored.eva || {} };
  const { T, list, tot } = dayView(state, profile);

  if (!T) {
    return (
      <p class="ntr-note">
        Your daily targets need your age, sex, weight and height. Add them in your profile to see the plate and rings.
      </p>
    );
  }
  return <NutritionTargets T={T} tot={tot} list={list} />;
}
