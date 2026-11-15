import Panel from "../ui/Panel.jsx";

const ICON = { Breakfast: "🍳", Lunch: "🥪", Dinner: "🍽️", Snack: "🍎", Drink: "💧" };

export default function FoodLog({ list, isToday, onDelete }) {
  return (
    <Panel title={isToday ? "Today" : "This day"}>
      <div class="nutrition-list">
        {list.map((entry) => {
          const time = new Date(entry.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
          const amount = entry.unit
            ? `${entry.amount} ${entry.unit === "portion" ? (Number(entry.amount) === 1 ? "portion" : "portions") : entry.unit}`
            : entry.portions > 1 ? `×${entry.portions}` : "";
          const value = entry.kcal ? `${Math.round(entry.kcal)} kcal` : entry.fluid ? `${Math.round(entry.fluid)} mL` : "";
          return (
            <div key={entry.id} class="nutrition-item">
              <span class="nutrition-item-icon" aria-hidden="true">{ICON[entry.meal] || "🍽️"}</span>
              <div>
                <span><b>{entry.name || entry.meal}</b></span>
                <small>{entry.meal} · {time}{amount ? ` · ${amount}` : ""}</small>
              </div>
              <span class="nutrition-item-kcal">{value}</span>
              <button type="button" class="nutrition-delete" aria-label={`Delete ${entry.name || entry.meal}`} onClick={() => onDelete(entry.id)}>×</button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
