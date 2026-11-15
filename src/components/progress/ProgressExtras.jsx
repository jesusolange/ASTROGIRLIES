import { compute } from "../../scripts/readiness.js";
import { lastVo2 } from "../../scripts/fitness.js";
import { status as radiationStatus } from "../../scripts/radiation.js";
import { summary as nutritionSummary } from "../../scripts/nutrition.js";
import Panel from "../ui/Panel.jsx";

function collect() {
  const cards = [];
  try {
    const readiness = compute();
    cards.push({
      label: "Readiness",
      value: readiness.total == null ? "Not enough records" : `${readiness.total}/100`,
      level: readiness.total == null ? "info" : readiness.total >= 80 ? "ok" : readiness.total >= 60 ? "info" : "review",
      sub: `${readiness.covered} of ${readiness.due} due areas recorded`
    });
    const vo2 = lastVo2();
    if (vo2) {
      const delta = vo2.prev != null ? vo2.value - vo2.prev : null;
      cards.push({
        label: "VO₂max",
        value: `${vo2.value} mL/kg/min`,
        level: delta == null ? "info" : delta < 0 ? "review" : "ok",
        sub: delta == null ? "first test" : `${delta >= 0 ? "+" : ""}${Math.round(delta * 10) / 10} since last test`
      });
    }
    const dose = radiationStatus();
    if (dose && dose.hasData) {
      cards.push({
        label: "Radiation used",
        value: `${dose.pct.toFixed(1)}% of limit`,
        level: dose.level,
        sub: `${dose.career.toFixed(1)} mSv total${dose.projected == null ? "" : ` · projected ${Math.round(dose.projected)} mSv`}`
      });
    }
    const food = nutritionSummary();
    if (food) {
      cards.push({
        label: "Calories",
        value: `${Math.round(food.ratio * 100)}% of goal`,
        level: food.ratio < 0.8 || food.ratio > 1.2 ? "review" : "ok",
        sub: "last logged days"
      });
    }
  } catch (error) {
    console.error("progress extras", error);
  }
  return cards;
}

export default function ProgressExtras() {
  const cards = collect();
  if (!cards.length) return null;
  return (
    <Panel title="Fitness, radiation and readiness">
      <div class="pg-cards">
        {cards.map((card) => (
          <div class={`pg-card pg-card-${card.level}`} key={card.label}>
            <span>{card.label}</span>
            <b>{card.value}</b>
            {card.sub ? <small>{card.sub}</small> : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}
