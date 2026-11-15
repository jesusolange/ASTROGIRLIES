import { useEffect, useState } from "preact/hooks";
import LevelBadge from "../ui/LevelBadge.jsx";
import { dateLabel, formatValue, missionLabel } from "../../scripts/progress.js";

const PAGE = 25;

export default function HistoryTable({ rows, profile, onDelete, resetKey }) {
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    setShown(PAGE);
  }, [resetKey]);

  if (!rows.length) {
    return <p class="pg-empty-note">No records yet.</p>;
  }

  const visible = rows.slice(0, shown);

  return (
    <div class="pg-history">
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
            {visible.map((row) => {
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
      <div class="pg-more">
        <small>{`${visible.length} of ${rows.length} records`}</small>
        {shown < rows.length ? (
          <button type="button" class="pg-more-btn" onClick={() => setShown((count) => count + PAGE)}>Show 25 more</button>
        ) : null}
      </div>
    </div>
  );
}
