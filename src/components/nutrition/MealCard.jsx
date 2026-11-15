// The one nutrition card: log a meal, see today's totals against your targets, and take an entry out.
// Records are always for today. A meal can be logged more than once; the card stays open.
import { useMemo, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { openCard } from "../../lib/nav.js";
import { open as openProfile } from "../../scripts/profile.js";
import { toast } from "../../lib/ui.js";
import {
  KEY, blankNutrition, isoDay, targets, dayEntries, totalsOf, status, needList,
  addToLibrary, waterEntry, removeEntry, doneToday, ironUnder, readNutrition, saveNutrition,
  parseFoodList, mergeFoodList
} from "../../scripts/nutrition.js";
import Button from "../ui/Button.jsx";
import "./nutrition.css";
import NutritionTargets from "./NutritionTargets.jsx";
import AddFood from "./AddFood.jsx";
import FoodLog from "./FoodLog.jsx";
import NutritionSettings from "./NutritionSettings.jsx";

const today = () => isoDay(new Date());
const LEVEL = { ok: "ok", mid: "info", low: "info", none: "info", over: "warn", high: "warn" };

export default function MealCard({ onSaved }) {
  const [profile] = useStored("astromed-profile", null);
  const [stored, save] = useStored(KEY, blankNutrition());
  const [meal, setMeal] = useState(null);
  const state = { ...blankNutrition(), ...stored, lib: stored.lib || [], eva: stored.eva || {} };
  const day = today();
  const eva = Number(state.eva[day]) || 0;
  const T = targets(profile, eva, state.af || 1.11);
  const list = useMemo(
    () => dayEntries(state, day).sort((a, b) => new Date(a.time) - new Date(b.time)),
    [stored, day]
  );
  const tot = totalsOf(list);
  const need = T ? needList(tot, T) : [];
  const info = T ? status(tot.kcal / T.kcal, tot.kcal > 0) : { level: "none", label: "" };

  const undoAdd = (id) => () => {
    if (typeof window === "undefined" || !window.AstroMedStore) return;
    saveNutrition(removeEntry(readNutrition(), id));
  };

  const addEntry = (entry, item) => {
    save({ ...state, entries: [...state.entries, entry], lib: item ? addToLibrary(state.lib, item) : state.lib });
    toast({ text: `${entry.name || entry.meal} added.`, undo: undoAdd(entry.id) });
  };

  const addWater = () => {
    const entry = waterEntry(day);
    save({ ...state, entries: [...state.entries, entry] });
    toast({ text: "Water added.", undo: undoAdd(entry.id) });
  };

  const remove = (entry) => {
    save(removeEntry(state, entry.id));
    toast({
      text: `${entry.name || entry.meal} removed.`,
      undo: () => {
        if (typeof window === "undefined" || !window.AstroMedStore) return;
        const current = readNutrition();
        saveNutrition({ ...current, entries: [...(current.entries || []), entry] });
      }
    });
  };

  const importFile = async (file) => {
    if (!file) return;
    try {
      const rows = parseFoodList(await file.text(), file.name);
      if (!rows.length) throw new Error("empty");
      save({ ...state, lib: mergeFoodList(state.lib, rows) });
      toast({ text: `${rows.length} foods imported.` });
    } catch {
      toast({ text: "That food list could not be read." });
    }
  };

  const result = () => {
    const ironLow = ironUnder(tot, T);
    const saw = `Today you have ${Math.round(tot.kcal)} of ${Math.round(T.kcal)} kcal, ${Math.round(tot.prot)} g protein and ${Math.round(tot.iron)} of ${T.iron} mg iron.`;
    const todo = ironLow
      ? "Your iron is under target. Eat iron-rich food today; the guide explains what to do."
      : need.length
        ? `Still need ${need.join(", ")}. Add them to your next meal.`
        : "You have reached every goal today. Keep the same balance at your next meal.";
    const actions = ironLow ? [{ label: "Space anaemia", onClick: () => openCard("anemia") }] : [];
    return { level: ironLow ? "warn" : (LEVEL[info.level] || "info"), saw, todo, actions, toast: "Meal recorded." };
  };

  const done = () => {
    if (onSaved) onSaved(result());
    else toast({ text: "Meals are recorded for today." });
  };

  if (!T) {
    return (
      <div class="ntr-card">
        <p class="ntr-lead">
          Your targets depend on your age, sex, weight and height. Add them in your profile; they stay on this device.
        </p>
        <Button onClick={() => openProfile(false)}>Open profile</Button>
      </div>
    );
  }

  return (
    <div class="ntr-card">
      <p class="ntr-lead">Add what you ate. Today's totals and the plate update after every meal.</p>

      <AddFood
        lib={state.lib} meal={meal} setMeal={setMeal}
        onAdd={addEntry} onWater={addWater} onImport={importFile}
      />

      {list.length > 0 ? (
        <div class="ntr-result" role="status">
          <div class="ntr-result-head">
            <b>{doneToday(state, day) ? "Today is recorded" : "Today so far"}</b>
            <span>{info.label}</span>
          </div>
          {ironUnder(tot, T) ? (
            <p class="ntr-result-note">
              Iron is under target. Eat iron-rich food today, then open the Space anaemia guide.
              <Button onClick={() => openCard("anemia")}>Space anaemia</Button>
            </p>
          ) : need.length ? (
            <p class="ntr-result-note">Still need: {need.join(" · ")}.</p>
          ) : (
            <p class="ntr-result-note">All targets reached for today.</p>
          )}
        </div>
      ) : null}

      <NutritionTargets T={T} tot={tot} list={list} />

      {list.length > 0 ? <FoodLog list={list} onDelete={remove} /> : null}

      <NutritionSettings
        eva={eva} af={state.af || 1.11}
        onEva={(value) => save({ ...state, eva: { ...state.eva, [day]: Math.max(0, Number(value) || 0) } })}
        onAf={(value) => save({ ...state, af: Number(value) })}
        bmi={T.bmi} evaKcal={T.evaKcal} T={T}
      />

      <div class="ntr-actions">
        <Button onClick={done}>Done for today</Button>
        {list.length > 0 && onSaved ? <span class="ntr-hint">You can log another meal whenever you eat.</span> : null}
      </div>
    </div>
  );
}
