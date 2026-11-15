// One indicator over time. The reference band, grid and average are drawn from the chart model.
import { BANDS, CHART, DAY, chartBounds, fmtNum, levelOf, unitFor } from "../../scripts/progress.js";

export default function ProgressChart({ id, list, days, meta }) {
  const now = Date.now();
  const from = now - days * DAY;
  const points = list.filter((entry) => new Date(entry.time) >= from);
  const { W, H, L, R, T, B } = CHART;
  const band = BANDS[id];
  const { lo, hi } = chartBounds(points.map((entry) => entry.value), band);
  const x = (time) => L + ((time - from) / (now - from)) * (W - L - R);
  const y = (value) => T + (1 - (value - lo) / (hi - lo)) * (H - T - B);
  const grid = [0, 1, 2, 3, 4].map((index) => {
    const value = lo + ((hi - lo) * index) / 4;
    return { value, y: y(value) };
  });
  const step = days <= 7 ? 1 : days <= 14 ? 2 : 5;
  const ticks = [];
  for (let d = 0; d <= days; d += step) {
    const time = now - (days - d) * DAY;
    ticks.push({ time, label: new Date(time).toLocaleDateString("en-GB", days <= 7 ? { weekday: "short" } : { day: "2-digit", month: "short" }) });
  }
  const mean = points.length ? points.reduce((sum, entry) => sum + entry.value, 0) / points.length : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} class="pg-svg" role="img" aria-label={`${id} over the last ${days} days`}>
      {band ? (
        <>
          <rect class="pg-band" x={L} y={y(band[1])} width={W - L - R} height={Math.max(2, y(band[0]) - y(band[1]))} />
          <text class="pg-note" x={W - R - 4} y={y(band[1]) + 12} text-anchor="end">reference range</text>
        </>
      ) : null}
      {grid.map((line, index) => (
        <line key={`g${index}`} class="pg-grid-line" x1={L} x2={W - R} y1={line.y} y2={line.y} />
      ))}
      {grid.map((line, index) => (
        <text key={`t${index}`} class="pg-tick" x={L - 8} y={line.y + 4} text-anchor="end">{fmtNum(line.value)}</text>
      ))}
      {ticks.map((tick) => (
        <text key={tick.time} class="pg-tick" x={x(tick.time)} y={H - 10} text-anchor="middle">{tick.label}</text>
      ))}
      {points.length ? (
        <g>
          <line class="pg-mean" x1={L} x2={W - R} y1={y(mean)} y2={y(mean)} />
          <text class="pg-note pg-note-mean" x={L + 4} y={y(mean) - 5}>your average {fmtNum(mean)}</text>
          <polyline class="pg-line" points={points.map((entry) => `${x(new Date(entry.time))},${y(entry.value)}`).join(" ")} />
          {points.map((entry) => (
            <circle
              key={entry.id}
              class={`pg-dot pg-dot-${levelOf(id, entry.value)}`}
              cx={x(new Date(entry.time))}
              cy={y(entry.value)}
              r="5.5"
            >
              <title>{`${fmtNum(entry.value)} ${unitFor(meta, id)} · ${new Date(entry.time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`}</title>
            </circle>
          ))}
        </g>
      ) : (
        <text class="pg-empty" x={W / 2} y={H / 2} text-anchor="middle">No readings in the last {days} days</text>
      )}
    </svg>
  );
}
