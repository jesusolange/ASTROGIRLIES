import { STEP_IDS, SYSTEMS, latestFor } from "../../scripts/checkup-flow.js";

const fmtTime = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

const describe = (record) => {
  const system = SYSTEMS[record.part];
  if (!system || !record.values) return "";
  return system.fields
    .filter((field) => record.values[field.key] != null)
    .map((field) => `${field.label}: ${record.values[field.key]} ${field.unit}`)
    .join(" · ");
};

export default function CheckupHistory({ records }) {
  const list = (Array.isArray(records) ? records : []).filter((record) => record && SYSTEMS[record.part]);
  return (
    <div class="che-history">
      <h3>History</h3>
      <p>
        One reading per body system per save. Saving the same system again within the same minute
        replaces the earlier reading instead of adding a duplicate.
      </p>

      <div class="che-latest" aria-label="Latest reading per system">
        {STEP_IDS.map((part) => {
          const latest = latestFor(records, part);
          return (
            <div class={`che-latest-item${latest ? " has-reading" : ""}`} key={part}>
              <b>{SYSTEMS[part].title}</b>
              <span>{latest ? fmtTime(latest.time) : "No reading yet"}</span>
              {latest && latest.simulated ? <em>Simulated typical values</em> : null}
            </div>
          );
        })}
      </div>

      {list.length === 0 ? (
        <p class="che-empty">No readings saved yet. Complete the checkup and they will appear here.</p>
      ) : (
        <>
          <h4 class="che-list-title">Saved readings</h4>
          <ul class="che-list">
            {list.map((record, index) => (
              <li key={`${record.part}-${record.time}-${index}`}>
                <div class="che-list-top">
                  <b>{SYSTEMS[record.part].title}</b>
                  <span>{fmtTime(record.time)}</span>
                </div>
                <p>{describe(record)}</p>
                {record.simulated ? <em>Simulated typical values</em> : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
