// Today's totals against the profile's targets: the plate shares, one ring per target, and the meals logged.
import { Beef, Carrot, Cookie, Droplet, GlassWater, Nut, Wheat, Zap } from "lucide-preact";
import { needList, status } from "../../scripts/nutrition.js";
import PlateChart from "./PlateChart.jsx";

function MiniRing({ Glyph, label, value, goal, unit, cap }) {
  const ratio = goal ? value / goal : 0;
  const level = cap
    ? (ratio > 1 ? "high" : ratio > 0.85 ? "warn" : "ok")
    : (ratio >= 1 ? "ok" : ratio >= 0.5 ? "mid" : "low");
  const radius = (84 - 9) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.max(0, Math.min(1, ratio)) * circumference;
  return (
    <div class="ntr-mini">
      <span class="ntr-mini-ring">
        <svg viewBox="0 0 84 84" width="84" height="84" aria-hidden="true">
          <circle cx="42" cy="42" r={radius} fill="none" class="ntr-mini-track" stroke-width="9" />
          <circle
            class={`ntr-mini-arc ntr-mini-arc--${level}`}
            cx="42" cy="42" r={radius} fill="none" stroke-width="9" stroke-linecap="round"
            stroke-dasharray={`${filled} ${circumference}`}
            transform="rotate(-90 42 42)"
          />
        </svg>
        <Glyph class="ntr-mini-icon" size={22} strokeWidth={2} aria-hidden="true" />
      </span>
      <b>{Math.round(value)}<small> {unit}</small></b>
      <span>{label}</span>
      <em>{cap ? `max ${Math.round(goal)}` : `goal ${Math.round(goal)}`}</em>
    </div>
  );
}

export default function NutritionTargets({ T, tot, list }) {
  const state = status(tot.kcal / T.kcal, tot.kcal > 0);
  const left = Math.max(0, T.kcal - tot.kcal);
  const need = needList(tot, T);
  const eaten = new Set(list.map((entry) => entry.meal));

  return (
    <section class="ntr-targets">
      <div class="ntr-plate">
        <PlateChart totals={tot} />
        <div class="ntr-plate-center">
          <b>{Math.round(tot.kcal)}</b>
          <span>of {Math.round(T.kcal)} kcal</span>
        </div>
      </div>

      <div class="ntr-side">
        <p class={`ntr-state ntr-state--${state.level}`}>
          <b>{state.label}</b>
          {left > 0 && tot.kcal > 0 ? <em>{Math.round(left)} kcal left</em> : null}
        </p>

        <div class="ntr-rings">
          <MiniRing Glyph={Zap} label="Energy" value={tot.kcal} goal={T.kcal} unit="kcal" />
          <MiniRing Glyph={Beef} label="Protein" value={tot.prot} goal={T.protein[0]} unit="g" />
          <MiniRing Glyph={Wheat} label="Carbs" value={tot.carb} goal={T.carbs[0]} unit="g" />
          <MiniRing Glyph={Nut} label="Fat" value={tot.fat} goal={T.fat[0]} unit="g" />
          <MiniRing Glyph={GlassWater} label="Water" value={tot.fluid} goal={T.fluid} unit="mL" />
          <MiniRing Glyph={Carrot} label="Vegetables" value={tot.veg} goal={T.veg} unit="g" />
          <MiniRing Glyph={Cookie} label="Salt" value={tot.sodium} goal={T.sodiumMax} unit="mg" cap />
          <MiniRing Glyph={Droplet} label="Iron" value={tot.iron} goal={T.iron} unit="mg" />
        </div>

        <div class="ntr-meals">
          {["Breakfast", "Lunch", "Dinner"].map((meal) => (
            <span key={meal} class={eaten.has(meal) ? "is-on" : ""}>{meal}</span>
          ))}
        </div>

        {need.length
          ? <p class="ntr-need"><b>Still need:</b> {need.join(" · ")}</p>
          : <p class="ntr-need ntr-need--ok">All goals reached for this day.</p>}
      </div>
    </section>
  );
}
