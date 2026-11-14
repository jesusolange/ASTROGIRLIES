import { Fragment } from "preact";

function BloodTable({ table }) {
  return (
    <>
      <div class="emg-scroll">
        <table class="emg-tbl emg-blood">
          <thead><tr><th></th>{table.head.map((head, i) => <th class={`g${i}`} key={head}>{head}</th>)}</tr></thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row[0]}><th>{row[0]}</th>{row.slice(1).map((cell, i) => <td key={i}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="emg-note">↔ no change · ↑ higher · ↓ lower</p>
    </>
  );
}

function InfectionTable({ table }) {
  return (
    <div class="emg-scroll">
      <table class="emg-tbl">
        <thead><tr><th></th>{table.head.map((head) => <th key={head}>{head}</th>)}</tr></thead>
        <tbody>
          {table.rows.map((row) => (
            <Fragment key={row.label}>
              <tr>
                <th>{row.label}{row.sub && <><br /><small>{row.sub}</small></>}</th>
                {row.cells.map((cell, i) => <td class={row.hot?.includes(i) ? "hot" : ""} key={i}>{cell}</td>)}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TableBlock({ block }) {
  return block.type === "bloodTable" ? <BloodTable table={block.table} /> : <InfectionTable table={block.table} />;
}
