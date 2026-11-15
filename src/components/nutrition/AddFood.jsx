// Add one food: search My foods, look up a barcode, or type the values from the label.
// Offline, the camera scan is disabled and one line explains why; manual entry and import still work.
import { useEffect, useState } from "preact/hooks";
import { Camera, GlassWater, Plus } from "lucide-preact";
import { FIELDS, MEALS, UNITS, basisText, buildEntry, factor, isoDay, libraryItem, lookupFood, unitLabel } from "../../scripts/nutrition.js";
import Chips from "../ui/Chips.jsx";
import Button from "../ui/Button.jsx";
import MyFoods from "./MyFoods.jsx";
import ScanDialog from "./ScanDialog.jsx";

const MEAL_OPTIONS = MEALS.map((meal) => ({ id: meal, label: meal }));
const EXTRA = [
  ["carb", "Carbohydrate (g)"], ["prot", "Protein (g)"], ["fat", "Fat (g)"], ["fiber", "Fibre (g)"],
  ["sodium", "Salt as sodium (mg)"], ["veg", "Vegetables (g)"], ["fluid", "Fluid (mL)"], ["iron", "Iron (mg)"]
];
const newDraft = () => ({ amount: 100, unit: "g", name: "", code: "", kcal: "", editName: false });

function canScan() {
  return typeof window !== "undefined" && "BarcodeDetector" in window
    && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function";
}

function autoMeal() {
  const hour = new Date().getHours();
  return hour < 11 ? "Breakfast" : hour < 16 ? "Lunch" : hour < 21 ? "Dinner" : "Snack";
}

export default function AddFood({ lib, meal, setMeal, onAdd, onWater, onImport }) {
  const [draft, setDraft] = useState(newDraft);
  const [note, setNote] = useState("");
  const [scanning, setScanning] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine !== false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine !== false);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const applyFood = (food, message) => {
    setDraft((current) => {
      const next = { ...current };
      if (food.name) next.name = food.name;
      if (food.unit) next.unit = food.unit;
      FIELDS.forEach((key) => { if (food[key] != null) next[key] = food[key]; });
      return next;
    });
    setNote(message || "Check the amount before adding.");
  };

  const runLookup = async (code) => {
    const trimmed = String(code || "").trim();
    if (!trimmed) return;
    update("code", trimmed);
    const result = await lookupFood(trimmed, lib);
    if (result.food) applyFood(result.food, result.note);
    else {
      if (result.name) update("name", result.name);
      setNote(result.note);
    }
  };

  const startScan = () => {
    if (!online) return;
    if (!canScan()) {
      setNote("This browser cannot use the camera. Type the barcode, or fill in the food by hand.");
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
      setNote("Add the calories from the label before adding the food.");
      return;
    }
    const chosen = meal || autoMeal();
    setMeal(chosen);
    const entry = buildEntry(draft, chosen, isoDay(new Date()));
    const box = event.currentTarget.elements.remember;
    const keep = !box || box.checked;
    const remember = keep && String(draft.name || "").trim() && Number(draft.kcal) > 0 ? libraryItem(draft) : null;
    onAdd(entry, remember);
    setDraft(newDraft());
    setNote("");
  };

  const eaten = Math.round((Number(draft.kcal) || 0) * factor(draft));
  const hasName = String(draft.name || "").trim() && !draft.editName;

  return (
    <div class="ntr-add">
      <div class="ntr-mealbar">
        <Chips label="Meal" options={MEAL_OPTIONS} value={meal} onChange={setMeal} />
        <Button variant="soft" className="ntr-water" onClick={onWater}><GlassWater size={18} aria-hidden="true" /> 250 mL water</Button>
      </div>

      <form class="ntr-form" autocomplete="off" onSubmit={submit}>
        <div class="ntr-row">
          <label class="ntr-field"><span>Amount</span>
            <input name="amount" type="number" min="0" max="10000" step="any" inputmode="decimal" value={draft.amount} required onInput={(event) => update("amount", event.currentTarget.value)} />
          </label>
          <label class="ntr-field"><span>Unit</span>
            <select name="unit" value={draft.unit} onChange={(event) => {
              const unit = event.currentTarget.value;
              let amount = draft.amount;
              if (unit === "portion" && Number(amount) > 20) amount = 1;
              if (unit !== "portion" && Number(amount) <= 20) amount = 100;
              setDraft((current) => ({ ...current, unit, amount }));
            }}>
              {UNITS.map((unit) => <option key={unit} value={unit}>{unit === "g" ? "grams (g)" : unit === "mL" ? "millilitres (mL)" : "portions"}</option>)}
            </select>
          </label>
        </div>

        <div class="ntr-row">
          <label class="ntr-field"><span>Barcode (optional)</span>
            <span class="ntr-code">
              <input
                name="code" type="text" inputmode="numeric" autocomplete="off" maxlength="20" placeholder="Scan or type"
                value={draft.code} onInput={(event) => update("code", event.currentTarget.value)}
                onBlur={(event) => runLookup(event.currentTarget.value)}
                onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); runLookup(event.currentTarget.value); } }}
              />
              <Button className="ntr-scan-btn" aria-label="Scan barcode" disabled={!online} onClick={startScan}>
                <Camera size={20} aria-hidden="true" />
              </Button>
            </span>
          </label>
          {hasName ? (
            <div class="ntr-found">
              <b>{draft.name}</b>
              <button type="button" class="ntr-edit" onClick={() => update("editName", true)}>Change name</button>
            </div>
          ) : (
            <label class="ntr-field"><span>Food name</span>
              <input name="name" type="text" maxlength="60" autocomplete="off" placeholder="For example, milk" value={draft.name} onInput={(event) => update("name", event.currentTarget.value)} />
            </label>
          )}
        </div>
        {!online ? <p class="ntr-note">Barcode lookup needs a connection. Enter the food by hand or import a food list.</p> : null}
        <p class="ntr-note" aria-live="polite">{note}</p>

        <div class="ntr-row">
          <label class="ntr-field"><span>Calories on the label (kcal {basisText(draft.unit)}) *</span>
            <input name="kcal" type="number" min="0" max="10000" step="any" inputmode="decimal" value={draft.kcal} required onInput={(event) => update("kcal", event.currentTarget.value)} />
          </label>
          <p class="ntr-calc"><span>You ate</span><b>{eaten} kcal</b><small>{draft.amount} {unitLabel(draft.unit, draft.amount)} × {Number(draft.kcal) || 0} kcal {basisText(draft.unit)}</small></p>
        </div>

        <details class="ntr-more">
          <summary>More numbers (optional)</summary>
          <div class="ntr-grid">
            {EXTRA.map(([key, label]) => (
              <label key={key} class="ntr-field"><span>{label}</span>
                <input name={key} type="number" min="0" max="10000" step="any" inputmode="decimal" value={draft[key] ?? ""} onInput={(event) => update(key, event.currentTarget.value)} />
              </label>
            ))}
          </div>
          <p class="ntr-note">Use the same basis as the calories: {basisText(draft.unit)}. For a drink in mL, fluid is counted for you.</p>
        </details>

        <div class="ntr-form-actions">
          <Button type="submit"><Plus size={18} aria-hidden="true" /> Add food</Button>
          <label class="ntr-remember"><input type="checkbox" name="remember" defaultChecked /> Remember this food</label>
        </div>
      </form>

      <MyFoods lib={lib} onPick={pickFood} onImport={onImport} />

      {scanning ? (
        <ScanDialog
          onClose={() => setScanning(false)}
          onCode={async (code) => { setScanning(false); await runLookup(code); }}
          onError={() => { setScanning(false); setNote("The camera is not available. Type the barcode, or fill in the food by hand."); }}
        />
      ) : null}
    </div>
  );
}
