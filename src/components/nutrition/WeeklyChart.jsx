import { weekRows, status } from "../../scripts/nutrition.js";

const W = 680, H = 230, PL = 44, PR = 12, PT = 16, PB = 40;

export default function WeeklyChart({ state, profile, viewDay, onOpenDay }) {
  const rows = weekRows(state, profile);
  const maxValue = Math.max(1, ...rows.map((row) => Math.max(row.kcal, row.targetKcal ? row.targetKcal * 1.2 : 0)));
  const y = (value) => H - PB - (value / maxValue) * (H - PB - PT);
  const width = (W - PL - PR) / 7;
  const goal = rows.find((row) => row.targetKcal)?.targetKcal;

  return (
    <>
      <svg class="nutrition-week" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Calories for the last 7 days">
        {goal ? (
          <>
            <rect class="nutrition-week-band" x={PL} y={y(goal * 1.05)} width={W - PL - PR} height={y(goal * 0.95) - y(goal * 1.05)} />
            <line class="nutrition-week-goal" x1={PL} x2={W - PR} y1={y(goal)} y2={y(goal)} />
            <text class="nutrition-week-muted" x={W - PR} y={y(goal * 1.05) - 4} text-anchor="end" font-size="11">goal range</text>
          </>
        ) : null}
        {rows.map((row, index) => {
          const x = PL + index * width + width * 0.18;
          const barWidth = width * 0.64;
          const level = status(row.targetKcal ? row.kcal / row.targetKcal : 0, row.any).level;
          const height = Math.max(row.any ? 3 : 0, H - PB - y(row.kcal));
          const dot = ["○○○", "●○○", "●●○", "●●●"][row.meals];
          return (
            <g key={row.key} class="nutrition-week-bar" role="button" tabindex="0"
              onClick={() => onOpenDay(row.key)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenDay(row.key); } }}>
              <title>{`${row.weekday}: ${Math.round(row.kcal)} kcal`}</title>
              <rect x={x} y={PT} width={barWidth} height={H - PB - PT} fill="transparent" />
              <rect
                class={`nutrition-week-fill nutrition-week-fill--${level} ${row.key === viewDay ? "on" : ""}`}
                x={x} y={H - PB - height} width={barWidth} height={height} rx="7"
              />
              {row.any
                ? <text class="nutrition-week-value" x={x + barWidth / 2} y={H - PB - height - 6} text-anchor="middle" font-size="11">{Math.round(row.kcal)}</text>
                : <text class="nutrition-week-muted" x={x + barWidth / 2} y={H - PB - 6} text-anchor="middle" font-size="11">–</text>}
              <text class="nutrition-week-muted" x={x + barWidth / 2} y={H - 22} text-anchor="middle" font-size="11">{row.weekday}</text>
              <text class="nutrition-week-dots" x={x + barWidth / 2} y={H - 8} text-anchor="middle" font-size="12">{dot}</text>
            </g>
          );
        })}
      </svg>
      <p class="nutrition-note">Bars show calories. Green is on target. Dots show breakfast, lunch and dinner logged. Tap a bar to open that day.</p>
    </>
  );
}
