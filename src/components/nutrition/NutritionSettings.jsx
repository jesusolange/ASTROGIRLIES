import { useState } from "preact/hooks";
import Panel from "../ui/Panel.jsx";
import { AF_OPTIONS, bmiClass, parseFoodList, mergeFoodList } from "../../scripts/nutrition.js";

export default function NutritionSettings({ state, save, viewDay, eva, T }) {
  const [message, setMessage] = useState("");

  const setAf = (value) => save({ ...state, af: Number(value) });
  const setEva = (value) => save({
    ...state,
    eva: { ...state.eva, [viewDay]: Math.max(0, Number(value) || 0) }
  });

  const importFile = async (file) => {
    if (!file) return;
    try {
      const rows = parseFoodList(await file.text(), file.name);
      if (!rows.length) throw new Error("empty");
      save({ ...state, lib: mergeFoodList(state.lib, rows) });
      setMessage(`${rows.length} foods loaded.`);
    } catch {
      setMessage("I could not read that file.");
    }
  };

  return (
    <Panel className="nutrition-options">
      <details>
        <summary>⚙️ Settings and sources</summary>
        <div class="nutrition-option-grid">
          <label class="pg-field"><span>Exercise equipment</span>
            <select value={String(state.af || 1.11)} onChange={(e) => setAf(e.currentTarget.value)}>
              {AF_OPTIONS.map((af) => (
                <option key={af} value={String(af)}>{af === 1.11 ? "Little exercise" : "ISS-type exercise equipment"}</option>
              ))}
            </select>
          </label>
          <label class="pg-field"><span>Spacewalk (EVA) hours this day</span>
            <input type="number" min="0" max="12" step="0.5" value={eva || ""} placeholder="0" onChange={(e) => setEva(e.currentTarget.value)} />
          </label>
        </div>
        <p class="nutrition-note">
          BMI {T.bmi.toFixed(1)} ({bmiClass(T.bmi)}, WHO ranges). Protein goal {Math.round(T.protein[0])}–{Math.round(T.protein[1])} g (1.2–1.8 g per kg).
          Fiber goal {T.fiber} g. Salt (sodium) max {T.sodiumMax} mg.{T.evaKcal ? ` Includes +${T.evaKcal} kcal for EVA.` : ""}
        </p>
        <label class="am-btn am-btn-soft nutrition-import">
          Load a food list (CSV or JSON)
          <input type="file" accept=".csv,.json" hidden onChange={(e) => importFile(e.currentTarget.files[0])} />
        </label>
        {message ? <p class="nutrition-note" aria-live="polite">{message}</p> : null}
        <p class="nutrition-note">Columns: code, name, kcal, carb, prot, fat, fiber, sodium, veg, fluid (values per portion). The ground team can prepare this list in advance.</p>
        <ul class="nutrition-sources">
          <li>Energy: NASA JSC-67378, Estimated Energy Requirement equations, activity 1.11 (1.25 with ISS-type equipment), +200 kcal per EVA hour. NASA reference average for ISS crew: 3,035 kcal/day (OCHMO-TB-013).</li>
          <li>Protein 1.2–1.8 g/kg · carbs 45–65% · fat 20–35% · fiber 38 g (men) / 25 g (women) · sodium max 2,300 mg · fluids 32 mL/kg (minimum 2,500 mL men / 2,100 mL women): NASA JSC-67378, Table 1.</li>
          <li>BMI ranges and the 400 g fruit and vegetables goal: World Health Organization.</li>
          <li>NASA does not publish a per-item nutrition table in the documents I found, so numbers come from the package label, a scan, or your food list.</li>
        </ul>
      </details>
    </Panel>
  );
}
