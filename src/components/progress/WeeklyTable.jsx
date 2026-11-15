import { formatValue, weekComparison } from "../../scripts/progress.js";

export default function WeeklyTable({ rows }) {
  const comparison = weekComparison(rows);
  if (!comparison.length) return <p class="pg-empty-note">No records yet.</p>;

  return (
    <div class="pg-table-wrap">
      <table class="pg-table pg-week">
        <thead>
          <tr>
            <th scope="col">Indicator</th>
            <th scope="col">This week</th>
            <th scope="col">Last week</th>
            <th scope="col">Change</th>
          </tr>
        </thead>
        <tbody>
          {comparison.map(({ measure, cur, prev, change }) => (
            <tr key={measure.id}>
              <td>{measure.label}</td>
              <td class="pg-value">{cur == null ? "—" : `${formatValue(measure, cur)}${measure.unit ? ` ${measure.unit}` : ""}`}</td>
              <td class="pg-value">{prev == null ? "—" : `${formatValue(measure, prev)}${measure.unit ? ` ${measure.unit}` : ""}`}</td>
              <td><span class={`pg-change pg-${change.cls}`}>{change.txt}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
