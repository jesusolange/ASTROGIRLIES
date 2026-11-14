export default function Vo2Chart({ tests }) {
  const points = tests.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
  if (points.length < 2) return <p class="td-note">Add at least two tests to see your trend.</p>;
  const W = 640;
  const H = 200;
  const pad = 36;
  const values = points.map((point) => point.value);
  const lo = Math.floor(Math.min(...values) - 2);
  const hi = Math.ceil(Math.max(...values) + 2);
  const x = (index) => pad + (index / (points.length - 1)) * (W - pad * 2);
  const y = (value) => H - pad - ((value - lo) / (hi - lo)) * (H - pad * 2);
  const ticks = [lo, (lo + hi) / 2, hi];

  return (
    <svg class="td-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="VO2max trend">
      {ticks.map((value) => (
        <g key={value}>
          <line x1={pad} x2={W - pad} y1={y(value)} y2={y(value)} stroke="currentColor" opacity=".18" />
          <text x={pad - 6} y={y(value) + 4} text-anchor="end" font-size="11" fill="currentColor" opacity=".7">{Math.round(value)}</text>
        </g>
      ))}
      <polyline fill="none" stroke="var(--am-accent)" stroke-width="3" points={points.map((point, index) => `${x(index)},${y(point.value)}`).join(" ")} />
      {points.map((point, index) => (
        <g key={point.id || index}>
          <circle cx={x(index)} cy={y(point.value)} r="5" fill="var(--am-accent)" />
          <text x={x(index)} y={H - 10} text-anchor="middle" font-size="10" fill="currentColor" opacity=".7">
            {new Date(point.time).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </text>
        </g>
      ))}
    </svg>
  );
}
