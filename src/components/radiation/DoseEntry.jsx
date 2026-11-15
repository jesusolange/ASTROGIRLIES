import { useState } from "preact/hooks";
import { missionDayFor, parseIso } from "../../scripts/profile.js";
import { isoDay } from "../../scripts/radiation.js";
import Field from "../ui/Field.jsx";
import Panel from "../ui/Panel.jsx";
import Button from "../ui/Button.jsx";

export default function DoseEntry({ state, profile, onAdd, onDelete, onPrior }) {
  const today = isoDay(new Date());
  const [day, setDay] = useState(today);
  const [dose, setDose] = useState("");
  const [source, setSource] = useState("dosimeter");
  const [converted, setConverted] = useState("");

  function submit(event) {
    event.preventDefault();
    const value = Number(dose);
    if (!Number.isFinite(value) || value < 0 || !day) return;
    onAdd({ day, dose: Math.round(value * 1000) / 1000, src: source });
    setDose("");
  }

  const entries = state.entries.slice().sort((a, b) => b.day.localeCompare(a.day)).slice(0, 30);

  return (
    <Panel title="Add a dose">
      <form class="mi-form" onSubmit={submit}>
        <Field label="Date" id="rd-day">
          <input id="rd-day" type="date" required value={day} max={today} onInput={(event) => setDay(event.currentTarget.value)} />
        </Field>
        <Field label="Dose that day (mSv)" id="rd-dose">
          <input id="rd-dose" type="number" step="0.001" min="0" max="500" required placeholder="e.g. 0.45" value={dose} onInput={(event) => setDose(event.currentTarget.value)} />
        </Field>
        <Field label="Source" id="rd-source">
          <select id="rd-source" value={source} onChange={(event) => setSource(event.currentTarget.value)}>
            <option value="dosimeter">Personal dosimeter</option>
            <option value="estimate">Estimate</option>
          </select>
        </Field>
        <div class="am-actions"><Button type="submit">Add reading</Button></div>
      </form>

      <div class="rd-tools">
        <Field label="Dose from past missions (mSv)" id="rd-prior">
          <input
            id="rd-prior"
            type="number"
            step="0.1"
            min="0"
            max="2000"
            value={state.prior || ""}
            placeholder="0"
            onInput={(event) => onPrior(Math.max(0, Number(event.currentTarget.value) || 0))}
          />
        </Field>
        <Field label="Convert µSv/h to mSv/day" id="rd-convert">
          <input
            id="rd-convert"
            type="number"
            step="any"
            min="0"
            placeholder="µSv/h"
            onInput={(event) => {
              const value = Number(event.currentTarget.value);
              setConverted(event.currentTarget.value !== "" && value >= 0 ? `${value} µSv/h = ${((value * 24) / 1000).toFixed(3)} mSv/day` : "");
            }}
          />
        </Field>
        {converted ? <em class="mi-note">{converted}</em> : null}
      </div>

      {entries.length ? (
        <div class="nu-list" style={{ marginTop: "12px" }}>
          {entries.map((entry) => {
            const missionDay = profile && profile.startDate ? missionDayFor(profile, parseIso(entry.day)) : null;
            return (
              <div key={entry.id} class="nu-item">
                <div>
                  <span><b>{entry.dose} mSv</b> · {entry.src === "estimate" ? "Estimate" : "Dosimeter"}</span>
                  <small>
                    {new Date(entry.day).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                    {missionDay != null && missionDay >= 1 ? ` · Mission day ${missionDay}` : ""}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </small>
                </div>
                <button type="button" class="nu-del" aria-label="Delete reading" onClick={() => onDelete(entry.id)}>×</button>
              </div>
            );
          })}
        </div>
      ) : null}
    </Panel>
  );
}
