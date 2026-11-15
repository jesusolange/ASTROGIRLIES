import { REF } from "../../scripts/radiation.js";
import Panel from "../ui/Panel.jsx";
import SourceLink from "../ui/SourceLink.jsx";

export default function ReferenceTable() {
  return (
    <Panel title="Reference dose rates">
      <div class="nu-tw">
        <table class="nu-table">
          <thead>
            <tr><th>Place</th><th>mSv per day</th><th>Notes</th><th>Source</th></tr>
          </thead>
          <tbody>
            {REF.map((row) => (
              <tr key={row.place} style={{ cursor: "default" }}>
                <td>{row.place}</td>
                <td><b>{row.v}</b></td>
                <td>{row.note}</td>
                <td>
                  <SourceLink href={row.url}>{row.src}</SourceLink>
                  {row.src2 ? <>; <SourceLink href={row.url2}>{row.src2}</SourceLink></> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="mi-note" style={{ marginTop: "12px" }}>
        The RAD measurements show how quickly dose adds up in transit and on the surface, which is why the 600 mSv career
        limit is a design challenge for Mars. Career limit and ALARA: NASA-STD-3001 Vol. 1 Rev B (V1 4029, V1 4030),
        summarized in the NASA OCHMO radiation technical brief. For the space radiation environment and its health risks,
        see the <SourceLink href="https://www.nasa.gov/hrp/elements/radiation/">NASA Human Research Program</SourceLink>.
        These reference values are typical measurements, not predictions for your mission.
      </p>
    </Panel>
  );
}
