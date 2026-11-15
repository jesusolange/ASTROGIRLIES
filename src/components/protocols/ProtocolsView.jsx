// Protocols: the saved results in one place and the astronaut's own mission health report.
import "../../scripts/storage.js";
import { useEffect, useState } from "preact/hooks";
import { currentSection } from "../../lib/nav.js";
import { protocolRows } from "../../scripts/mental.js";
import { toast } from "../../lib/ui.js";
import { reportLead, sendHint } from "./report-wording.js";
import "./protocols.css";

export default function ProtocolsView() {
  const [report, setReport] = useState(null);
  const [revision, setRevision] = useState(0);
  const section = currentSection.value;
  const comm = window.AstroMedEnv && typeof window.AstroMedEnv.comm === "function" ? window.AstroMedEnv.comm() : null;

  useEffect(() => {
    const api = window.AstroMedStore && window.AstroMedStore.store;
    if (!api) return;
    return api.subscribe(() => setRevision((value) => value + 1));
  }, []);

  useEffect(() => {
    if (section === "protocols") setRevision((value) => value + 1);
  }, [section]);

  const data = window.AstroMedData;
  const checkups = data ? data.getCheckups() : {};
  const sessions = data ? data.load(data.KEYS.exercise, []) : [];
  const rows = protocolRows();
  const systems = Object.values(checkups).map((checkup) => checkup.title);

  function generate() {
    if (!window.AstroMedPDF) {
      toast("The report module is not loaded.");
      return;
    }
    if (report) URL.revokeObjectURL(report.url);
    setReport(window.AstroMedPDF.build());
  }

  return (
    <div data-revision={revision}>
      <div class="am-heading">
        <h2>Protocols</h2>
        <p>Your saved results and your mission health report.</p>
      </div>

      <section class="am-panel">
        <h3>Saved results</h3>
        <ul class="am-saved">
          {rows.map((row) => (
            <li key={row.name}><span>{row.name}</span><b>{row.value || "Not saved yet"}</b></li>
          ))}
          <li><span>Daily checkup systems</span><b>{systems.length ? systems.join(", ") : "Not saved yet"}</b></li>
          <li><span>Exercise sessions</span><b>{sessions.length}</b></li>
        </ul>
      </section>

      <section class="am-panel am-consult">
        <h3>Prepare your mission health report</h3>
        <p>{reportLead(comm)}</p>
        <button type="button" class="am-btn" onClick={generate}>{report ? "Update my report" : "Yes, generate my report"}</button>
      </section>

      {report ? (
        <section class="am-panel">
          <h3>Your report is ready</h3>
          <p>Generated {new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} from your latest data. Keep it as your record. {sendHint(comm)}</p>
          <div class="am-actions">
            <a class="am-btn" href={report.url} download={report.filename}>Download PDF</a>
          </div>
          <iframe class="am-report" title="Mission health report preview" src={report.url}></iframe>
        </section>
      ) : null}
    </div>
  );
}
