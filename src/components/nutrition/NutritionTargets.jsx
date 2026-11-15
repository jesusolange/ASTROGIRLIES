import Panel from "../ui/Panel.jsx";

const SIZE = 300;
const RING_WIDTH = 16;
const PLATE_R = 74;

function ring(ratio, level) {
  const r = (SIZE - RING_WIDTH) / 2;
  const C = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, ratio));
  return (
    <circle
      class={`nutrition-plate-arc nutrition-plate-arc--${level}`}
      cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke-width={RING_WIDTH}
      stroke-linecap="round" stroke-dasharray={`${v * C} ${C}`}
      transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
    />
  );
}

function sector(start, end, kind, progress) {
  const cx = 150, cy = 150;
  const rad = (a) => (a - 90) * Math.PI / 180;
  const x0 = cx + PLATE_R * Math.cos(rad(start)), y0 = cy + PLATE_R * Math.sin(rad(start));
  const x1 = cx + PLATE_R * Math.cos(rad(end)), y1 = cy + PLATE_R * Math.sin(rad(end));
  return (
    <path
      class={`nutrition-plate-sector nutrition-plate-sector--${kind}`}
      d={`M${cx} ${cy} L${x0} ${y0} A${PLATE_R} ${PLATE_R} 0 0 1 ${x1} ${y1}Z`}
      opacity={(0.22 + 0.78 * Math.min(1, Math.max(0, progress))).toFixed(2)}
    />
  );
}

function label(x, y, text, progress) {
  return <text x={x} y={y} font-size="30" text-anchor="middle" opacity={(0.22 + 0.78 * Math.min(1, Math.max(0, progress))).toFixed(2)}>{text}</text>;
}

function Plate({ T, tot, level }) {
  const ratio = T ? tot.kcal / T.kcal : 0;
  const pc = T ? tot.carb / T.carbs[0] : 0;
  const pp = T ? tot.prot / T.protein[0] : 0;
  const pv = T ? tot.veg / T.veg : 0;
  return (
    <svg class="nutrition-plate" viewBox="0 0 300 300" role="img" aria-label={`Calories ${Math.round(tot.kcal)} of ${T ? Math.round(T.kcal) : "?"}`}>
      <circle cx="150" cy="150" r="142" fill="none" stroke="var(--am-field-border)" stroke-width="16" opacity="0.35" />
      {ring(ratio, level)}
      <circle class="nutrition-plate-rim" cx="150" cy="150" r="104" />
      <circle class="nutrition-plate-face" cx="150" cy="150" r="92" />
      {sector(0, 120, "carb", pc)}
      {sector(120, 240, "protein", pp)}
      {sector(240, 360, "veg", pv)}
      <circle cx="150" cy="150" r={PLATE_R} fill="none" stroke="var(--am-bg-raised)" stroke-width="3" />
      <path d="M150 150L150 76M150 150L214 187M150 150L86 187" stroke="var(--am-bg-raised)" stroke-width="3" />
      {label(188, 118, "🍞", pc)}{label(150, 214, "🍗", pp)}{label(112, 118, "🥦", pv)}
    </svg>
  );
}

function MiniRing({ icon, label: text, value, goal, unit, cap }) {
  const p = goal ? value / goal : 0;
  const level = cap
    ? (p > 1 ? "high" : p > 0.85 ? "warn" : "ok")
    : (p >= 1 ? "ok" : p >= 0.5 ? "mid" : "low");
  const r = (84 - 9) / 2, C = 2 * Math.PI * r;
  return (
    <div class="nutrition-mini">
      <svg viewBox="0 0 84 84" width="84" height="84" aria-hidden="true">
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--am-field-border)" stroke-width="9" opacity="0.35" />
        <circle
          class={`nutrition-mini-arc nutrition-mini-arc--${level}`}
          cx="42" cy="42" r={r} fill="none" stroke-width="9" stroke-linecap="round"
          stroke-dasharray={`${Math.max(0, Math.min(1, p)) * C} ${C}`}
          transform="rotate(-90 42 42)"
        />
        <text x="42" y="50" font-size="24" text-anchor="middle">{icon}</text>
      </svg>
      <b>{Math.round(value)}<small> {unit}</small></b>
      <span>{text}</span>
      <em>{cap ? `max ${Math.round(goal)}` : `goal ${Math.round(goal)}`}</em>
    </div>
  );
}

export default function NutritionTargets({ T, tot, list, statusFn, needFn }) {
  const ratio = tot.kcal / T.kcal;
  const state = statusFn(ratio, tot.kcal > 0);
  const left = Math.max(0, T.kcal - tot.kcal);
  const need = needFn(tot, T);
  const eaten = { Breakfast: false, Lunch: false, Dinner: false };
  list.forEach((e) => { if (e.meal in eaten) eaten[e.meal] = true; });

  return (
    <Panel className="nutrition-hero">
      <div class="nutrition-ringbox">
        <Plate T={T} tot={tot} level={state.level} />
        <div class="nutrition-center"><b>{Math.round(tot.kcal)}</b><span>of {Math.round(T.kcal)} kcal</span></div>
      </div>
      <div class="nutrition-side">
        <div class={`nutrition-state nutrition-state--${state.level}`}>
          <b>{state.label}</b>
          {left > 0 && tot.kcal > 0 ? <em>{Math.round(left)} kcal left</em> : null}
        </div>
        <div class="nutrition-rings">
          <MiniRing icon="🍗" label="Protein" value={tot.prot} goal={T.protein[0]} unit="g" />
          <MiniRing icon="🍞" label="Carbs" value={tot.carb} goal={T.carbs[0]} unit="g" />
          <MiniRing icon="🥑" label="Fat" value={tot.fat} goal={T.fat[0]} unit="g" />
          <MiniRing icon="💧" label="Water" value={tot.fluid} goal={T.fluid} unit="mL" />
          <MiniRing icon="🥦" label="Veg" value={tot.veg} goal={T.veg} unit="g" />
          <MiniRing icon="🧂" label="Salt" value={tot.sodium} goal={T.sodiumMax} unit="mg" cap />
        </div>
        <div class="nutrition-meals">
          {["Breakfast", "Lunch", "Dinner"].map((m) => (
            <span key={m} class={eaten[m] ? "on" : ""}>{m}{eaten[m] ? " ✓" : ""}</span>
          ))}
        </div>
        {need.length
          ? <p class="nutrition-need"><b>Still need:</b> {need.join(" · ")}</p>
          : <p class="nutrition-need nutrition-need--ok">All goals reached for this day.</p>}
      </div>
    </Panel>
  );
}
