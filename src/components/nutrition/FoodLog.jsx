// Today's food log, kept inside the meal card so a wrong entry can be taken out without leaving it.
import { Coffee, Cookie, GlassWater, Moon, Sun, Trash2, Utensils } from "lucide-preact";

const ICON = { Breakfast: Coffee, Lunch: Sun, Dinner: Moon, Snack: Cookie, Drink: GlassWater };

export default function FoodLog({ list, onDelete }) {
  return (
    <section class="ntr-log">
      <h3 class="ntr-subtitle">Today's food</h3>
      <ul>
        {list.map((entry) => {
          const Glyph = ICON[entry.meal] || Utensils;
          const time = new Date(entry.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
          const amount = entry.unit
            ? `${entry.amount} ${entry.unit === "portion" ? (Number(entry.amount) === 1 ? "portion" : "portions") : entry.unit}`
            : entry.portions > 1 ? `x${entry.portions}` : "";
          const value = entry.kcal ? `${Math.round(entry.kcal)} kcal` : "";
          const title = !entry.kcal && entry.fluid
            ? `${entry.name || entry.meal} ${Math.round(entry.fluid)} mL`
            : (entry.name || entry.meal);
          return (
            <li key={entry.id} class="ntr-entry">
              <Glyph class="ntr-entry-icon" size={20} strokeWidth={2} aria-hidden="true" />
              <span class="ntr-entry-main">
                <b>{title}</b>
                <small>{entry.meal} · {time}{amount ? ` · ${amount}` : ""}{entry.iron ? ` · ${Math.round(entry.iron * 10) / 10} mg iron` : ""}</small>
              </span>
              <span class="ntr-entry-value">{value}</span>
              <button type="button" class="ntr-delete" aria-label={`Remove ${entry.name || entry.meal}`} onClick={() => onDelete(entry)}>
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
