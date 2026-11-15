import { useEffect, useState } from "preact/hooks";
import Button from "../ui/Button.jsx";
import IndicatorList from "./IndicatorList.jsx";
import { get as getProfile } from "../../scripts/profile.js";
import { SYSTEMS, complete, draftFor, readValues, upsertRecord } from "../../scripts/checkup-flow.js";

export default function MeasurementForm({ part, records, saveRecords }) {
  const system = SYSTEMS[part];
  const initial = draftFor(part, records);
  const [draft, setDraft] = useState(initial.values);
  const [simulated, setSimulated] = useState(initial.simulated);
  const [profile, setProfile] = useState(getProfile);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const filledUnchanged = simulated
    && system.fields.every((field) => Number(draft[field.key]) === field.typical);

  useEffect(() => {
    const update = () => setProfile(getProfile());
    document.addEventListener("astromed-profile-changed", update);
    document.addEventListener("astromed-profile-apply", update);
    return () => {
      document.removeEventListener("astromed-profile-changed", update);
      document.removeEventListener("astromed-profile-apply", update);
    };
  }, []);

  const update = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSimulated(false);
    setError("");
    setMessage("");
  };

  const fillTypical = () => {
    const values = {};
    system.fields.forEach((field) => { values[field.key] = field.typical; });
    setDraft(values);
    setSimulated(true);
    setError("");
    setMessage("Filled with the typical (mean) values. These values are simulated.");
  };

  const save = () => {
    const result = readValues(system.fields, draft);
    if (result.error) {
      setError(result.error);
      setMessage("");
      return;
    }
    const record = {
      part,
      values: result.values,
      time: new Date().toISOString(),
      source: filledUnchanged ? "typical values (simulated)" : "manual"
    };
    if (filledUnchanged) record.simulated = true;
    saveRecords(upsertRecord(records, record));
    complete(part);
  };

  return (
    <div class="che-record">
      <div class="che-system">
        <div>
          <h3>{system.title}</h3>
          <p class="che-sub">{system.sub}</p>
        </div>
        {filledUnchanged ? <span class="che-sim">Simulated typical values</span> : null}
      </div>

      <p class="che-desc">{system.description}</p>


      <div class="che-fields">
        {system.fields.map((field) => (
          <label class="che-field" key={field.key} for={`che-${part}-${field.key}`}>
            <span class="che-field-label">{field.label} <small>({field.unit})</small></span>
            <input
              id={`che-${part}-${field.key}`}
              name={field.key}
              type="number"
              inputmode="decimal"
              min={field.min}
              max={field.max}
              step={field.step}
              value={draft[field.key]}
              aria-label={`${field.label} in ${field.unit}`}
              onInput={(event) => update(field.key, event.currentTarget.value)}
            />
            <small class="che-field-help">Typical {field.typical} {field.unit} Â· range {field.min} to {field.max}</small>
          </label>
        ))}
      </div>

      <IndicatorList fields={system.fields} values={draft} profile={profile} />

      <div class="che-buttons">
        <Button id="saveData" className="che-save" onClick={save}>Save measurements</Button>
        <Button variant="soft" onClick={fillTypical}>Fill typical values</Button>
      </div>

      {error ? <p class="che-error" role="alert">{error}</p> : null}
      {message ? <p class="che-message" role="status" aria-live="polite">{message}</p> : null}
      <p class="che-note">
        A screening and self-monitoring aid, not a diagnosis. Values filled from the typical range are
        simulated and marked in the saved record.
      </p>
    </div>
  );
}
