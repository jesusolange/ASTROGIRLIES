import { useRef } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { toast } from "../../lib/ui.js";
import { downloadText, measurementsCsv, RECORDS_KEY } from "../../lib/csv.js";
import { KEY } from "../../scripts/profile.js";
import { loadDemo } from "../../scripts/demo-data.js";
import Button from "../ui/Button.jsx";
import SyncAccount from "./SyncAccount.jsx";

const store = () => window.AstroMedStore && window.AstroMedStore.store;

function reloadSoon() {
  setTimeout(() => window.location.reload(), 800);
}

function hasSavedData(api) {
  return api.appKeys().some((key) => key !== "astromed-theme" && key !== "astromed-cover-day");
}

export default function DataSection() {
  const [profile] = useStored(KEY, null);
  const fileInput = useRef(null);

  function exportAll() {
    const api = store();
    if (!api) return;
    const name = `astromed-data-${new Date().toISOString().slice(0, 10)}.json`;
    downloadText(JSON.stringify(api.exportAll(), null, 2), name, "application/json");
    toast({ text: "Data exported" });
  }

  async function importFile(event) {
    const api = store();
    const file = event.currentTarget.files && event.currentTarget.files[0];
    event.currentTarget.value = "";
    if (!api || !file) return;
    try {
      if (!window.confirm("Replace all data saved in this browser with the file?")) return;
      const count = api.importAll(await file.text());
      toast({ text: `Imported ${count} items. Reloading...` });
      reloadSoon();
    } catch (error) {
      window.alert(error.message);
    }
  }

  function exportCsv() {
    const api = store();
    const records = api ? api.get(RECORDS_KEY, []) : [];
    if (!Array.isArray(records) || !records.length) {
      toast({ text: "Save a measurement first" });
      return;
    }
    const meta = window.AstroMedData && window.AstroMedData.SYSTEM_META;
    downloadText(measurementsCsv(records, meta), "AstroMed-Measurements.csv", "text/csv;charset=utf-8");
    toast({ text: "CSV export created" });
  }

  function demoMission() {
    const api = store();
    if (!api) return;
    const question = hasSavedData(api)
      ? "Load the demo mission? This replaces all data saved in this browser with a 14-day demo for Solange."
      : "Load the demo mission for Solange? It fills every screen with 14 days of simulated data.";
    if (!window.confirm(question)) return;
    loadDemo();
    toast({ text: "Demo mission loaded. Reloading..." });
    reloadSoon();
  }

  function eraseAll() {
    const api = store();
    if (!api) return;
    if (!window.confirm("Erase all data saved in this browser? This cannot be undone.")) return;
    try {
      api.importAll(JSON.stringify({ app: "astromed", version: 1, data: {} }));
      toast({ text: "All data erased. Reloading..." });
      reloadSoon();
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div class="pf-data">
      <section class="pf-block">
        <h4>Account and sync</h4>
        <SyncAccount />
      </section>

      <section class="pf-block">
        <h4>Demo mission</h4>
        <p>
          Fill the app with 14 days for Solange, a demo astronaut on a Mars mission. Every check, chart and
          history screen gets simulated data. The bar shows that demo data is loaded until you erase it.
        </p>
        {profile && profile.demo ? <p class="pf-demo-state">Demo data is loaded.</p> : null}
        <div class="pf-actions">
          <Button variant="soft" onClick={demoMission}>Load demo mission</Button>
        </div>
      </section>

      <section class="pf-block">
        <h4>Back up and restore</h4>
        <p>Back up your data to one file, or restore it on another device. Restoring replaces the data saved in this browser.</p>
        <div class="pf-actions">
          <Button variant="soft" onClick={exportAll}>Export my data</Button>
          <Button variant="soft" onClick={() => fileInput.current && fileInput.current.click()}>Import data</Button>
          <Button variant="soft" onClick={exportCsv}>Export measurements as CSV</Button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importFile} />
        </div>
      </section>

      <section class="pf-block">
        <h4>Erase</h4>
        <p>Erase every record, the profile and the demo mission from this browser. Your account is not deleted.</p>
        <div class="pf-actions">
          <Button variant="danger" onClick={eraseAll}>Erase all data</Button>
        </div>
      </section>
    </div>
  );
}
