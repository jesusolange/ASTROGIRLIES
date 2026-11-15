// "My foods": search the saved and imported list, then pick an amount. Imported CSV foods sit first.
import { useState } from "preact/hooks";
import { Search, Upload } from "lucide-preact";
import { searchFoods } from "../../scripts/nutrition.js";
import Term from "../ui/Term.jsx";

export default function MyFoods({ lib, onPick, onImport }) {
  const [query, setQuery] = useState("");
  const found = searchFoods(lib, query);
  const shown = found.slice(0, 24);

  return (
    <section class="ntr-foods">
      <h3 class="ntr-subtitle">My foods</h3>
      <label class="ntr-search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search" value={query} placeholder="Search saved and imported foods"
          aria-label="Search my foods" onInput={(event) => setQuery(event.currentTarget.value)}
        />
      </label>

      {shown.length ? (
        <ul class="ntr-food-list">
          {shown.map((food, index) => (
            <li key={`${food.code || food.name}-${index}`}>
              <button type="button" class="ntr-food" onClick={() => onPick(food)}>
                <b>{food.name}</b>
                <small>{Math.round(food.kcal || 0)} kcal · {food.unit === "portion" ? "per portion" : `per 100 ${food.unit}`}{food.iron ? ` · ${food.iron} mg iron` : ""}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p class="ntr-note">
          {lib.length ? "No saved food matches that search." : "No saved foods yet. Scan a barcode, type the values, or import a list."}
        </p>
      )}

      <div class="ntr-import-row">
        <label class="ntr-import">
          <Upload size={18} aria-hidden="true" />
          Import a food list
          <input type="file" accept=".csv,.json" hidden onChange={(event) => onImport(event.currentTarget.files[0])} />
        </label>
        <span class="ntr-note"><Term term="CSV" /> or <Term term="JSON" /> file, one food per row.</span>
      </div>
    </section>
  );
}
