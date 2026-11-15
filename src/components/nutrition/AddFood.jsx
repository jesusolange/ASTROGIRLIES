import { useState } from "preact/hooks";
import { FIELDS, MEALS, UNITS, factor, unitLabel, basisText, buildEntry, libraryItem, lookupFood } from "../../scripts/nutrition.js";
import MyFoods from "./MyFoods.jsx";
import ScanDialog from "./ScanDialog.jsx";
import Button from "../ui/Button.jsx";
import Pill from "../ui/Pill.jsx";

const newDraft = () => ({ amount: 100, unit: "g", name: "", code: "", editName: false });

const MEAL_ICON = { Breakfast: "🍳", Lunch: "🥪", Dinner: "🍽️", Snack: "🍎" };
const EXTRA = [
  ["carb", "Carbs g"], ["prot", "Protein g"], ["fat", "Fat g"], ["fiber", "Fiber g"],
  ["sodium", "Salt (sodium) mg"], ["veg", "Vegetables g"], ["fluid", "Fluid mL"]
];

function canScan() {
  return typeof window !== "undefined" && "BarcodeDetector" in window
    && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function";
}

function autoMeal() {
  const h = new Date().getHours();
  return h < 11 ? "Breakfast" : h < 16 ? "Lunch" : h < 21 ? "Dinner" : "Snack";
}

export default function AddFood({ state, meal, setMeal, day, onAdd, onWater }) {
  const [draft, setDraft] = useState(newDraft);
  const [note, setNote] = useState("");
  const [scanning, setScanning] = useState(false);

  const update = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const openMeal = (next) => {
    setMeal(meal === next ? null : next);
    setDraft(newDraft());
    setNote("");
  };

  const applyFood = (food, message) => {
    setDraft((d) => {
      const next = { ...d };
      if (food.name) next.name = food.name;
      if (food.unit) next.unit = food.unit;
      FIELDS.forEach((k) => { if (food[k] != null) next[k] = food[k]; });
      return next;
    });
    setNote(message || "Check the amount before saving.");
  };

  const runLookup = async (code) => {
    const trimmed = String(code || "").trim();
    if (!trimmed) return;
    setDraft((d) => ({ ...d, code: trimmed }));
    const result = await lookupFood(trimmed, state.lib);
    if (result.food) applyFood(result.food, result.note);
    else {
      if (result.name) setDraft((d) => ({ ...d, name: result.name }));
      setNote(result.note);
    }
  };

  const startScan = () => {
    if (!canScan()) {
      setNote("This browser cannot scan with the camera. Type the barcode in the field above, or fill in the food by hand.");
      return;
    }
    setScanning(true);
  };

  const pickFood = (food) => {
    setMeal(meal || autoMeal());
    setDraft({ ...newDraft(), ...food, amount: food.unit === "portion" ? 1 : 100 });
    setNote("How much did you have? Change the amount.");
  };

  const submit = (event) => {
    event.preventDefault();
    if (!String(draft.kcal ?? "").trim()) {
      setNote("Add the calories from the label before saving.");
      return;
    }
    const entry = buildEntry(draft, meal, day);
    const remember = String(draft.name || "").trim() && Number(draft.kcal) > 0 ? libraryItem(draft) : null;
    onAdd(entry, remember);
    setDraft(newDraft());
    setNote("");
  };

  const kcal = Number(draft.kcal) || 0;
  const amount = Number(draft.amount) || 0;
  const eaten = Math.round(kcal * factor(draft));
  const hasName = String(draft.name || "").trim() && !draft.editName;

  return (
    <div class="nutrition-add">
      <div class="nutrition-quick">
        {MEALS.map((m) => (
          <Pill key={m} pressed={meal === m} className="nutrition-quick-btn" onClick={() => openMeal(m)}>
            <span aria-hidden="true">{MEAL_ICON[m]}</span>{m}
          </Pill>
        ))}
        <Pill className="nutrition-quick-btn nutrition-quick-btn--water" onClick={onWater}>
          <span aria-hidden="true">💧</span>+250 mL
        </Pill>
      </div>

      {meal && (
        <form class="nutrition-form" autocomplete="off" onSubmit={submit}>
          <h4 class="nutrition-step"><span aria-hidden="true">{MEAL_ICON[meal]}</span> {meal}</h4>
          <div class="nutrition-row">
            <label class="pg-field"><span>1. How much did you have?</span>
              <input name="amount" type="number" min="0" max="10000" step="any" inputmode="decimal" value={draft.amount} required onInput={(e) => update("amount", e.currentTarget.value)} />
            </label>
            <label class="pg-field"><span>Unit</span>
              <select name="unit" value={draft.unit} onChange={(e) => {
                const unit = e.currentTarget.value;
                let next = draft.amount;
                if (unit === "portion" && Number(next) > 20) next = 1;
                if (unit !== "portion" && Number(next) <= 20) next = 100;
                setDraft((d) => ({ ...d, unit, amount: next }));
              }}>
                {UNITS.map((u) => <option key={u} value={u}>{u === "g" ? "grams (g)" : u === "mL" ? "milliliters (mL)" : "portions"}</option>)}
              </select>
            </label>
          </div>
          <div class="nutrition-row">
            <label class="pg-field"><span>2. Barcode (optional)</span>
              <span class="nutrition-code">
                <input name="code" type="text" inputmode="numeric" autocomplete="off" maxlength="20" placeholder="scan or type" value={draft.code}
                  onInput={(e) => update("code", e.currentTarget.value)}
                  onBlur={(e) => runLookup(e.currentTarget.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runLookup(e.currentTarget.value); } }} />
                <Button className="nutrition-scan-btn" aria-label="Scan barcode" onClick={startScan}>📷</Button>
              </span>
            </label>
            {hasName ? (
              <div class="nutrition-found">
                <b>{draft.name}</b>
                <button type="button" class="nutrition-edit" aria-label="Change name" onClick={() => update("editName", true)}>✎</button>
              </div>
            ) : (
              <label class="pg-field"><span>Food name</span>
                <input name="fname" type="text" maxlength="60" autocomplete="off" placeholder="e.g. Milk" value={draft.name} onInput={(e) => update("name", e.currentTarget.value)} />
              </label>
            )}
          </div>
          <p class="nutrition-note" aria-live="polite">{note}</p>
          <div class="nutrition-row">
            <label class="pg-field"><span>3. Calories on the label (kcal {basisText(draft.unit)}) *</span>
              <input name="kcal" type="number" min="0" max="10000" step="any" inputmode="decimal" value={draft.kcal ?? ""} required onInput={(e) => update("kcal", e.currentTarget.value)} />
            </label>
            <div class="nutrition-calc">
              <span>You ate</span><b>{eaten} kcal</b>
              <small>{amount} {unitLabel(draft.unit, amount)} × {kcal} kcal {basisText(draft.unit)}</small>
            </div>
          </div>
          <details class="nutrition-more">
            <summary>More numbers (optional)</summary>
            <div class="nutrition-grid">
              {EXTRA.map(([key, label]) => (
                <label key={key} class="pg-field"><span>{label}</span>
                  <input name={key} type="number" min="0" max="10000" step="any" inputmode="decimal" value={draft[key] ?? ""} onInput={(e) => update(key, e.currentTarget.value)} />
                </label>
              ))}
            </div>
            <p class="nutrition-note">Use the same basis as calories: {basisText(draft.unit)}. For drinks in mL, fluid is counted for you.</p>
          </details>
          <div class="am-actions">
            <Button type="submit">✔ Add</Button>
            <label class="nutrition-remember"><input type="checkbox" name="remember" defaultChecked /> Remember this food</label>
            <Button variant="soft" onClick={() => { setMeal(null); setDraft(newDraft()); setNote(""); }}>Cancel</Button>
          </div>
        </form>
      )}

      <MyFoods lib={state.lib} onPick={pickFood} />

      {scanning && (
        <ScanDialog
          onClose={() => setScanning(false)}
          onCode={async (code) => { setScanning(false); await runLookup(code); }}
          onError={() => { setScanning(false); setNote("Camera not available. Type the barcode in the field above, or fill in the food by hand."); }}
        />
      )}
    </div>
  );
}
