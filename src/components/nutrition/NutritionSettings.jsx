// The two inputs that move today's targets: the activity factor and the hours outside the spacecraft.
import { AF_OPTIONS, bmiClass } from "../../scripts/nutrition.js";
import Term from "../ui/Term.jsx";

export default function NutritionSettings({ eva, af, onEva, onAf, bmi, evaKcal, T }) {
  return (
    <details class="ntr-settings">
      <summary>Target settings and sources</summary>
      <div class="ntr-settings-grid">
        <label class="ntr-field"><span>Exercise equipment</span>
          <select value={String(af)} onChange={(event) => onAf(event.currentTarget.value)}>
            {AF_OPTIONS.map((value) => (
              <option key={value} value={String(value)}>{value === 1.11 ? "Little exercise" : "Space station exercise equipment"}</option>
            ))}
          </select>
        </label>
        <label class="ntr-field"><span><Term term="EVA" /> hours today</span>
          <input type="number" min="0" max="12" step="0.5" value={eva || ""} placeholder="0" onInput={(event) => onEva(event.currentTarget.value)} />
        </label>
      </div>
      <p class="ntr-note">
        Body mass index {bmi.toFixed(1)} ({bmiClass(bmi)}, World Health Organization ranges).
        Protein goal {Math.round(T.protein[0])} to {Math.round(T.protein[1])} g, fibre {T.fiber} g, sodium maximum {T.sodiumMax} mg.
        {evaKcal ? <> Includes {evaKcal} kcal for {eva} <Term term="EVA" /> hours.</> : null}
      </p>
      <ul class="ntr-sources">
        <li>Energy: <Term term="NASA" /> JSC-67378, estimated energy requirement, activity {af} and 200 kcal per <Term term="EVA" /> hour.</li>
        <li>Protein 1.2 to 1.8 g per kg, carbohydrate 45 to 65 percent, fat 20 to 35 percent, fibre 38 g (men) and 25 g (women), sodium maximum 2300 mg, fluids 32 mL per kg (at least 2500 mL men and 2100 mL women): NASA JSC-67378, table 1.</li>
        <li>Iron goal {T.iron} mg for every crew member: our design choice. NASA spaceflight nutrition cites about 8 to 10 mg per day in flight, lower than the ground value for women because iron stores rise in weightlessness (NASA JSC-28038 and Smith and Zwart).</li>
        <li>Iron and the other food numbers come from the package label, a barcode lookup or your imported food list; the app does not estimate them.</li>
      </ul>
    </details>
  );
}
