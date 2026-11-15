// A short at-a-glance panel over the other sections' summaries (readiness, VO2max, radiation, food).
function collect() {
  const cards = [];
  try {
    const readiness = window.AstroMedReadiness && window.AstroMedReadiness.compute();
    if (readiness && readiness.total != null) {
      cards.push({ label: "Readiness", value: `${Math.round(readiness.total)}/100`, level: readiness.total >= 80 ? "ok" : readiness.total >= 60 ? "info" : "review", sub: "" });
    }
    const vo2 = window.AstroMedMissions && window.AstroMedMissions.lastVo2();
    if (vo2) {
      const delta = vo2.prev != null ? vo2.value - vo2.prev : null;
      cards.push({
        label: "VO₂max",
        value: `${vo2.value} mL/kg/min`,
        level: delta == null ? "info" : delta < 0 ? "review" : "ok",
        sub: delta == null ? "first test" : `${delta >= 0 ? "+" : ""}${Math.round(delta * 10) / 10} since last test`,
      });
    }
    const dose = window.AstroMedRadiation && window.AstroMedRadiation.status();
    if (dose && dose.hasData) {
      cards.push({ label: "Radiation used", value: `${dose.pct.toFixed(1)}% of limit`, level: dose.level, sub: `${dose.career.toFixed(1)} mSv total` });
    }
    const food = window.AstroMedNutrition && window.AstroMedNutrition.summary();
    if (food) {
      cards.push({ label: "Calories", value: `${Math.round(food.ratio * 100)}% of goal`, level: food.ratio < 0.8 || food.ratio > 1.2 ? "review" : "ok", sub: "last logged days" });
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
    <section class="am-panel">
      <h3>Fitness, radiation and readiness</h3>
      <div class="pg-grid">
        {cards.map((card) => (
          <div class="pg-card" key={card.label}>
            <i class={`pg-stripe pg-stripe-${card.level}`}></i>
            <span>{card.label}</span>
            <b>{card.value}</b>
            {card.sub ? <small>{card.sub}</small> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
