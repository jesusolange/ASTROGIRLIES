import LevelBadge from "../ui/LevelBadge.jsx";
import { dateLabel, formatValue, missionLabel } from "../../scripts/progress.js";

export default function HistoryTableView({ rows, profile, onDelete }) {
  return (
    <div class="pg-table-wrap">
      <table class="pg-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Check</th>
            <th scope="col">Value</th>
            <th scope="col">Level</th>
            <th scope="col"><span class="pg-sr">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const mission = missionLabel(row.date, profile);
            const value = row.display || `${formatValue(row, row.value)}${row.unit ? ` ${row.unit}` : ""}`;
            return (
              <tr key={row.id}>
                <td class="pg-date">
                  <b>{dateLabel(row.date)}</b>
                  {mission ? <small>{mission}</small> : null}
                </td>
                <td>{row.check}</td>
                <td class="pg-value">{value}</td>
                <td><LevelBadge level={row.level} /></td>
                <td class="pg-row-actions">
                  <button type="button" class="pg-delete" onClick={() => onDelete(row)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
