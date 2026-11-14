import { useState } from "preact/hooks";
import { EQUIP, vo2Due } from "../../scripts/missions.js";
import Vo2Chart from "./Vo2Chart.jsx";

const devices = Object.entries(EQUIP);
const dateLabel = (iso) => new Date(iso).toLocaleDateString("en-GB", { dateStyle: "medium" });

export default function TrainingPanel({ missions, save }) {
  const [tab, setTab] = useState("fit");
  const [method, setMethod] = useState("direct");
  const [deviceKey, setDeviceKey] = useState(devices[0][0]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const tests = missions.vo2 || [];
  const due = vo2Due(missions);
  const sorted = tests.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const device = EQUIP[deviceKey];

  const submit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Number(form.elements.val.value);
    const value = method === "cooper" ? (raw - 504.9) / 44.73 : raw;
    if (!(value > 5 && value < 90)) {
      setError("This value gives an unrealistic VO2max. Check it.");
      return;
    }
    setError("");
    form.reset();
    setMethod("direct");
    save({
      ...missions,
      vo2: [...tests, { id: Date.now().toString(36), time: new Date().toISOString(), value: Math.round(value * 10) / 10, method }]
    });
  };

  const remove = (id) => save({ ...missions, vo2: tests.filter((test) => test.id !== id) });

  return (
    <div class="am-panel td-training">
      <h3>Training and devices</h3>
      <p class="td-note">A fitness test every 14 days and how to use your devices. This is a self-monitoring aid, not a medical device.</p>

      <div class="td-tabs" role="tablist">
        <button type="button" role="tab" class={`td-tab ${tab === "fit" ? "on" : ""}`} aria-selected={tab === "fit"} onClick={() => setTab("fit")}>Fitness</button>
        <button type="button" role="tab" class={`td-tab ${tab === "dev" ? "on" : ""}`} aria-selected={tab === "dev"} onClick={() => setTab("dev")}>Devices</button>
      </div>

      {tab === "fit" && (
        <div>
          <div class="td-kpis">
            <div><small>Next test</small><b>{!tests.length ? "Do your first test" : due.days <= 0 ? "Due today" : `In ${due.days} day${due.days === 1 ? "" : "s"}`}</b></div>
            <div><small>Latest</small><b>{last ? `${last.value.toFixed(1)} mL/kg/min` : "–"}</b></div>
            <div><small>Change since first</small><b>{first && last && first !== last ? `${last.value - first.value >= 0 ? "+" : ""}${(last.value - first.value).toFixed(1)}` : "–"}</b></div>
          </div>

          <form class="td-form" onSubmit={submit}>
            <label class="pg-field"><span>Method</span>
              <select name="method" value={method} onChange={(event) => setMethod(event.currentTarget.value)}>
                <option value="direct">Direct value (mL/kg/min)</option>
                <option value="cooper">Cooper 12-minute run: distance (m)</option>
              </select>
            </label>
            <label class="pg-field"><span>{method === "cooper" ? "Distance in 12 minutes (m)" : "VO₂max (mL/kg/min)"}</span><input name="val" type="number" step="any" min="1" required /></label>
            <div class="am-actions"><button class="am-btn" type="submit">Save test (+30 points)</button></div>
            <p class="td-note td-wide">Cooper test: run as far as you can in 12 minutes. Estimate = (metres − 504.9) ÷ 44.73. A bike test gives a direct value. Test every 14 days; this interval is our design choice.</p>
            {error && <p class="td-note td-wide" role="alert">{error}</p>}
          </form>

          <div class="td-chart-wrap"><Vo2Chart tests={tests} /></div>
          <div class="td-list">
            {sorted.slice().reverse().map((test) => (
              <div class="td-row" key={test.id}>
                <div>
                  <b>{test.value.toFixed(1)} mL/kg/min</b>
                  <span>{test.method === "cooper" ? "Cooper estimate" : "Direct"}</span>
                  <small>{dateLabel(test.time)}</small>
                </div>
                <button type="button" class="td-del" aria-label="Delete test" onClick={() => remove(test.id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "dev" && (
        <div>
          <div class="td-eq-tabs">
            {devices.map(([key, value]) => (
              <button type="button" key={key} class={`td-eq-tab ${key === deviceKey ? "on" : ""}`} aria-pressed={key === deviceKey} onClick={() => { setDeviceKey(key); setStep(0); }}>{value.name}</button>
            ))}
          </div>
          <p class="td-note"><b>{device.name}</b> · {device.use}</p>
          <ol class="td-steps">
            {device.steps.map((text, index) => <li key={text} class={index === step ? "on" : index < step ? "past" : ""}>{text}</li>)}
          </ol>
          <div class="am-actions"><button type="button" class="am-btn am-btn-soft" onClick={() => setStep((value) => (value + 1) % device.steps.length)}>Next step</button></div>
          <p class="td-note">{device.note} Follow your device manual.</p>
        </div>
      )}
    </div>
  );
}
