// Settings dialog: the data statement, account and sync, backup and restore, and the CSV export.
import "../../scripts/storage.js";
import { useEffect, useRef } from "preact/hooks";
import { toast } from "../../lib/ui.js";
import { measurementsCsv, downloadText, RECORDS_KEY } from "../../lib/csv.js";
import "./settings.css";

const store = () => window.AstroMedStore && window.AstroMedStore.store;

export default function SettingsView() {
  const account = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => {
    const host = account.current;
    if (host && window.AstroMedSync && window.AstroMedSync.renderAccount) {
      host.replaceChildren();
      window.AstroMedSync.renderAccount(host);
    }
  }, []);

  function exportAll() {
    const api = store();
    if (!api) return;
    downloadText(JSON.stringify(api.exportAll(), null, 2), `astromed-data-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
    toast("Data exported");
  }

  async function importFile(event) {
    const api = store();
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!api || !file) return;
    try {
      if (!confirm("Replace all data saved in this browser with the file?")) return;
      const count = api.importAll(await file.text());
      toast(`Imported ${count} items. Reloading...`);
      setTimeout(() => location.reload(), 800);
    } catch (error) {
      alert(error.message);
    }
  }

  function exportCsv() {
    const api = store();
    const records = api ? api.get(RECORDS_KEY, []) : [];
    if (!Array.isArray(records) || !records.length) {
      toast("Save a measurement first");
      return;
    }
    const meta = window.AstroMedData && window.AstroMedData.SYSTEM_META;
    downloadText(measurementsCsv(records, meta), "AstroMed-Measurements.csv", "text/csv;charset=utf-8");
    toast("CSV export created");
  }

  return (
    <div class="st-wrap">
      <p>
        This app stores your data in this browser. It stays on this device unless you choose to sign in.
      </p>

      <section class="st-block">
        <h3>Account and sync</h3>
        <div ref={account}></div>
      </section>

      <section class="st-block">
        <h3>Back up and restore</h3>
        <p>Back up your data to one file, or restore it on another device. Restoring replaces the data saved in this browser.</p>
        <div class="st-actions">
          <button type="button" class="btn btn-soft" onClick={exportAll}>Export my data</button>
          <button type="button" class="btn btn-soft" onClick={() => fileInput.current && fileInput.current.click()}>Import data</button>
          <button type="button" class="btn btn-soft" onClick={exportCsv}>Export measurements as CSV</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importFile} />
        </div>
      </section>

      <p class="st-note">
        AstroMed is a screening and self-monitoring aid, not a medical device and not a diagnosis.
      </p>
    </div>
  );
}
