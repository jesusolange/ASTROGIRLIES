import { LIMIT, addDays, parseIso } from "../../scripts/radiation.js";

const W = 680;
const H = 230;
const PAD = 44;

export default function CumulativeChart({ state, totals }) {
  if (!totals.keys.length) return <p class="mi-note">Add doses to see your chart.</p>;

  const first = totals.keys[0];
  const lastDay = totals.keys[totals.keys.length - 1];
  const span = Math.max(1, Math.round((parseIso(lastDay) - parseIso(first)) / 864e5));
  let accumulated = state.prior;
  const points = [];
  for (let index = 0; index <= span; index++) {
    const day = addDays(first, index);
    accumulated += totals.days[day] || 0;
    points.push([index, accumulated]);
  }

  const extra = totals.rate != null && totals.left ? Math.min(totals.left, Math.max(14, span)) : 0;
  const total = span + extra;
  const maxY = Math.max(LIMIT * 1.05, accumulated + (totals.rate || 0) * extra);
  const x = (index) => PAD + (index / Math.max(1, total)) * (W - PAD * 2);
  const y = (value) => H - PAD - (value / maxY) * (H - PAD * 2);
  const line = points.map(([index, value]) => `${x(index)},${y(value)}`).join(" ");

  return (
    <svg class="pg-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cumulative radiation dose">
      <line x1={PAD} x2={W - PAD} y1={y(LIMIT)} y2={y(LIMIT)} stroke="var(--am-danger)" stroke-width="2" stroke-dasharray="4 4" />
      <text x={W - PAD} y={y(LIMIT) - 6} text-anchor="end" font-size="11" fill="var(--am-danger)">Career limit {LIMIT} mSv</text>
      <line x1={PAD} x2={W - PAD} y1={y(0)} y2={y(0)} stroke="var(--am-border-strong)" />
      <text x={PAD - 6} y={y(0) + 4} text-anchor="end" font-size="11" fill="var(--am-text-muted)">0</text>
      <polyline fill="none" stroke="var(--am-accent)" stroke-width="3" points={line} />
      {extra ? (
        <polyline
          fill="none"
          stroke="var(--am-warn)"
          stroke-width="3"
          stroke-dasharray="6 6"
          points={`${x(span)},${y(accumulated)} ${x(total)},${y(accumulated + totals.rate * extra)}`}
        />
      ) : null}
      <text x={PAD} y={H - 12} font-size="10" fill="var(--am-text-muted)">
        {new Date(first).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </text>
      {extra ? (
        <text x={W - PAD} y={H - 12} text-anchor="end" font-size="10" fill="var(--am-warn)">projection at your recent rate</text>
      ) : null}
    </svg>
  );
}
