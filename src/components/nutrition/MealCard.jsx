// The one nutrition card: log a meal and take an entry out. Records are always for today.
// The plate and target rings sit in the card's aside; a meal can be logged more than once.
import { useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { open as openProfile } from "../../scripts/profile.js";
import { toast } from "../../lib/ui.js";
import {
  KEY, blankNutrition, dayView, needList, status, addToLibrary, waterEntry, removeEntry,
  doneToday, readNutrition, saveNutrition, parseFoodList, mergeFoodList
} from "../../scripts/nutrition.js";
import Button from "../ui/Button.jsx";
import SourceLink from "../ui/SourceLink.jsx";
import "./nutrition.css";
import AddFood from "./AddFood.jsx";
import FoodLog from "./FoodLog.jsx";
import NutritionSettings from "./NutritionSettings.jsx";

export default function MealCard({ onDone }) {
  const [profile] = useStored("astromed-profile", null);
  const [stored, save] = useStored(KEY, blankNutrition());
  const [meal, setMeal] = useState(null);
  const state = { ...blankNutrition(), ...stored, lib: stored.lib || [], eva: stored.eva || {} };
  const { day, eva, T, list, tot } = dayView(state, profile);
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

  const done = () => onDone?.();

  if (!T) {
    return (
      <div class="ntr-card">
        <p class="ntr-lead">
          Your targets depend on your age, sex, weight and height. Add them in your profile; they stay on this device.
        </p>
        <Button onClick={() => openProfile(false)}>Open profile</Button>
        <div class="ntr-actions">
          <Button onClick={done}>Done for now</Button>
        </div>
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
          {need.length
            ? <p class="ntr-result-note">Still need: {need.join(" · ")}.</p>
            : <p class="ntr-result-note">All targets reached for today.</p>}
        </div>
      ) : null}

      <p class="ntr-iron-line">
        Iron today: {Math.round(tot.iron * 10) / 10} mg. NASA's limit in flight is {T.iron} mg a day, because iron builds up in the body in space. <SourceLink id="jsc-67378-2020">Source</SourceLink>
      </p>

      {list.length > 0 ? <FoodLog list={list} onDelete={remove} /> : null}

      <NutritionSettings
        eva={eva} af={state.af || 1.11}
        onEva={(value) => save({ ...state, eva: { ...state.eva, [day]: Math.max(0, Number(value) || 0) } })}
        onAf={(value) => save({ ...state, af: Number(value) })}
        bmi={T.bmi} evaKcal={T.evaKcal} T={T}
      />

      <div class="ntr-actions">
        <Button onClick={done}>Done for now</Button>
        {list.length > 0 ? <span class="ntr-hint">You can log another meal whenever you eat.</span> : null}
      </div>
    </div>
  );
}
