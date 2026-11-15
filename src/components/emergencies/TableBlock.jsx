import { Fragment } from "preact";
import { bloodTable } from "../../scripts/emergencies.js";
import RichText from "./RichText.jsx";

function BloodTable({ table }) {
  const model = bloodTable(table);
  return (
    <div class="emg-scroll">
      <table class="emg-tbl emg-blood">
        <thead>
          <tr>{model.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>
          {model.rows.map((row) => (
            <tr key={row.head}>
              <th scope="row">{row.head}</th>
              {row.cells.map((cell, index) => <td key={index}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
                {row.cells.map((cell, index) => (
                  <td class={row.hot?.includes(index) ? "hot" : ""} key={index}><RichText text={cell} /></td>
                ))}
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
