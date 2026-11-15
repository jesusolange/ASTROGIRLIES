import { useMemo, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import {
  KEY, blankNutrition, isoDay, parseIso, targets, dayEntries, totalsOf,
  status, needList, waterEntry, addToLibrary, missionDayFor
} from "../../scripts/nutrition.js";
import NutritionTargets from "./NutritionTargets.jsx";
import AddFood from "./AddFood.jsx";
import FoodLog from "./FoodLog.jsx";
import WeeklyChart from "./WeeklyChart.jsx";
import NutritionSettings from "./NutritionSettings.jsx";
import Panel from "../ui/Panel.jsx";
import Button from "../ui/Button.jsx";
import "./nutrition.css";

const today = () => isoDay(new Date());

export default function NutritionView() {
  const [profile] = useStored("astromed-profile", null);
  const [stored, save] = useStored(KEY, blankNutrition());
  const state = { ...blankNutrition(), ...stored, lib: stored.lib || [], eva: stored.eva || {} };
  const [viewDay, setViewDay] = useState(today());
  const [addMeal, setAddMeal] = useState(null);

  const date = parseIso(viewDay);
  const missionDay = missionDayFor(profile, date);
  const isToday = viewDay === today();
  const eva = Number(state.eva[viewDay]) || 0;
  const T = targets(profile, eva, state.af || 1.11);
  const list = useMemo(() => dayEntries(state, viewDay).sort((a, b) => new Date(a.time) - new Date(b.time)), [state, viewDay]);
  const tot = totalsOf(list);

  const go = (n) => {
    const d = parseIso(viewDay);
    d.setDate(d.getDate() + n);
    setViewDay(isoDay(d));
    setAddMeal(null);
  };

  const addEntry = (entry, item) => {
    const next = { ...state, entries: [...state.entries, entry] };
    if (item) next.lib = addToLibrary(state.lib, item);
    save(next);
    setAddMeal(null);
  };

  const addWater = () => save({ ...state, entries: [...state.entries, waterEntry(viewDay)] });

  const removeEntry = (id) => save({ ...state, entries: state.entries.filter((e) => e.id !== id) });

  const pickFood = (food) => {
    const meal = addMeal
      || (new Date().getHours() < 11 ? "Breakfast" : new Date().getHours() < 16 ? "Lunch" : new Date().getHours() < 21 ? "Dinner" : "Snack");
    setAddMeal(meal);
    return food;
  };

  const dayHeading = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const missionText = missionDay != null ? (missionDay >= 1 ? `Mission day ${missionDay}` : "Before mission start") : "Mission day not set";

  return (
    <div class="nutrition-view">
      <div class="am-heading">
        <h2>Nutrition</h2>
        <p>Tap a meal, add what you ate. The plate shows how your day is going.</p>
      </div>

      <Panel className="nutrition-daybar">
        <Button variant="soft" aria-label="Previous day" onClick={() => go(-1)}>‹</Button>
        <div class="nutrition-day">
          <b>{dayHeading}</b>
          <span>{missionText}{isToday ? " · today" : ""}</span>
        </div>
        <Button variant="soft" aria-label="Next day" disabled={isToday} onClick={() => go(1)}>›</Button>
        <Button variant="soft" onClick={() => window.AstroMedProfile && window.AstroMedProfile.open()}>👤 Me</Button>
      </Panel>

      {!T ? (
        <Panel title="Tell me about you">
          <p>I need your age, sex, weight and height to know how much energy you need. It stays on this device.</p>
          <Button onClick={() => window.AstroMedProfile && window.AstroMedProfile.open()}>Add my details</Button>
        </Panel>
      ) : (
        <>
          <NutritionTargets T={T} tot={tot} list={list} statusFn={status} needFn={needList} />
          <Panel title="Add food">
            <AddFood
              state={state}
              meal={addMeal}
              setMeal={setAddMeal}
              day={viewDay}
              onAdd={addEntry}
              onWater={addWater}
              onPick={pickFood}
            />
          </Panel>
          {list.length > 0 && <FoodLog list={list} isToday={isToday} onDelete={removeEntry} />}
          <Panel>
            <h3>My week <small class="nutrition-small">calories vs goal</small></h3>
            <WeeklyChart state={state} profile={profile} viewDay={viewDay} onOpenDay={(key) => { setViewDay(key); setAddMeal(null); }} />
          </Panel>
          <NutritionSettings state={state} save={save} viewDay={viewDay} eva={eva} T={T} />
        </>
      )}
    </div>
  );
}
