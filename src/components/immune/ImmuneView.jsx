import { useEffect, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { ACTIONS, EMPTY_IMMUNE, SYMPTOMS, status, testRows } from "../../scripts/immune.js";
import "./immune.css";

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const labelOf = (id) => (SYMPTOMS.find(([key]) => key === id) || [id, id])[1];
const dateLabel = (iso) => new Date(iso).toLocaleDateString("en-GB", { dateStyle: "medium" });
const num = (value) => Number(value).toLocaleString("en-GB", { maximumFractionDigits: 4 });

function ImmuneBody() {
  const [immune, save] = useStored("astromed-immune", EMPTY_IMMUNE);
  const day = isoDay(new Date());
  const [selected, setSelected] = useState(() => [...((immune.log || {})[day] || [])]);
  const current = status();
  const rows = testRows(immune.tests || []);
  const emergencies = Boolean(window.AstroMedNav && window.AstroMedNav.has("emergencies"));
  const savedDays = Object.keys(immune.log || {}).sort().reverse();
  const storedToday = (immune.log || {})[day] || [];
  const storedKey = storedToday.join("|");

  useEffect(() => { setSelected([...storedToday]); }, [day, storedKey]);

  const toggle = (id) => setSelected((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  const saveToday = () => save({ ...immune, log: { ...(immune.log || {}), [day]: selected } });
  const removeTest = (id) => save({ ...immune, tests: (immune.tests || []).filter((test) => test.id !== id) });

  const addTest = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const entry = {
      id: Date.now().toString(36),
      time: new Date().toISOString(),
      kind: form.elements.kind.value,
      name: form.elements.name.value.trim(),
      value: Number(form.elements.value.value),
      unit: form.elements.unit.value.trim(),
      note: form.elements.note.value.trim()
    };
    form.reset();
    save({ ...immune, tests: [...(immune.tests || []), entry] });
  };

  return (
    <div>
      <div class="am-heading">
        <h2>Immune watch</h2>
        <p>Check how you feel, record saliva or blood results and follow your trend day by day.</p>
      </div>

      <section class="am-panel">
        <h3>Record today</h3>
        <p>Space travel changes the immune system and can wake up dormant viruses (Crucian et al., 2018, Frontiers in Immunology). Select what you feel today.</p>
        <div class="im-pills">
          {SYMPTOMS.map(([id, label]) => (
            <button type="button" key={id} class="im-pill" aria-pressed={selected.includes(id)} onClick={() => toggle(id)}>{label}</button>
          ))}
        </div>
        <div class={`im-status im-${current.level}`}>
          <b>{current.level === "ok" ? "No warning signs" : current.level === "review" ? "Keep watching" : "Needs attention"}</b>
          <span>{current.risks.length ? `Risk factors now: ${current.risks.join(", ")}.` : "No risk factors found from your other data."}</span>
        </div>
        <div class="am-actions"><button type="button" class="am-btn" onClick={saveToday}>Save today</button></div>
      </section>

      <section class="am-panel">
        <h3>Add a saliva or blood result</h3>
        <p class="td-note">Enter the name, value and unit from your test. No reference range is applied: the result and its trend against your earlier values are for your own monitoring.</p>
        <form class="td-form" onSubmit={addTest}>
          <label class="pg-field"><span>Sample</span>
            <select name="kind"><option value="saliva">Saliva</option><option value="blood">Blood</option></select>
          </label>
          <label class="pg-field"><span>Test name</span><input name="name" type="text" maxlength="60" required placeholder="e.g. cortisol" /></label>
          <label class="pg-field"><span>Value</span><input name="value" type="number" step="any" required /></label>
          <label class="pg-field"><span>Unit</span><input name="unit" type="text" maxlength="20" required placeholder="e.g. µg/dL" /></label>
          <label class="pg-field td-wide"><span>Note (optional)</span><input name="note" type="text" maxlength="120" placeholder="time of day, fasting, how you feel" /></label>
          <div class="am-actions td-wide"><button type="submit" class="am-btn">Save result</button></div>
        </form>
      </section>

      <section class="am-panel">
        <h3>History</h3>
        <h4 class="im-sub">Daily symptom checks</h4>
        <div class="td-list">
          {savedDays.length
            ? savedDays.slice(0, 30).map((entryDay) => {
              const list = immune.log[entryDay] || [];
              return (
                <div class="td-row" key={entryDay}>
                  <div><b>{entryDay}</b><span>{list.length ? list.map(labelOf).join(", ") : "No symptoms"}</span></div>
                </div>
              );
            })
            : <p class="td-note">No daily checks saved yet.</p>}
        </div>
        <h4 class="im-sub">Saliva and blood results</h4>
        <div class="td-list">
          {rows.length
            ? rows.map((test) => {
              const change = test.before == null ? "" : ` (${test.value - test.before >= 0 ? "+" : ""}${num(test.value - test.before)} vs previous)`;
              return (
                <div class="td-row" key={test.id}>
                  <div>
                    <b>{test.name}: {num(test.value)} {test.unit}</b>
                    <span>{test.kind === "blood" ? "Blood test" : "Saliva test"}{change}</span>
                    <small>{dateLabel(test.time)}{test.note ? ` · ${test.note}` : ""}</small>
                  </div>
                  <button type="button" class="td-del" aria-label="Delete test result" onClick={() => removeTest(test.id)}>×</button>
                </div>
              );
            })
            : <p class="td-note">No saliva or blood results saved yet.</p>}
        </div>
        <p class="td-note">No reference range is applied to these values. They are shown with their change from your own earlier results.</p>
      </section>

      <section class="am-panel">
        <h3>What to do</h3>
        <p>{ACTIONS[current.level]}</p>
        <ul class="im-actions">
          <li>Sleep at least 8 hours and keep your sleep window regular.</li>
          <li>Eat enough and drink water through the day.</li>
          <li>Keep your scheduled exercise; it supports the immune system.</li>
          <li>Wash hands before meals and keep shared surfaces clean.</li>
        </ul>
        {emergencies && <div class="am-actions"><button type="button" class="am-btn" onClick={() => window.AstroMedNav.show("emergencies")}>Open Emergencies</button></div>}
        <p class="td-note">If breathing or chest symptoms start, follow your emergency plan.</p>
        <p class="td-note">This is a self-monitoring aid, not a medical device and not a diagnosis.</p>
      </section>
    </div>
  );
}

export default function ImmuneView() {
  return <ImmuneBody />;
}
