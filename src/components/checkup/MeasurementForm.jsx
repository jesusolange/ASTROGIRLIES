import { useEffect, useState } from "preact/hooks";
import Button from "../ui/Button.jsx";
import IndicatorList from "./IndicatorList.jsx";
import { get as getProfile } from "../../scripts/profile.js";
import { SYSTEMS, complete, draftFor, readValues, upsertRecord } from "../../scripts/checkup-flow.js";

export default function MeasurementForm({ part, records, saveRecords }) {
  const system = SYSTEMS[part];
  const [draft, setDraft] = useState(() => draftFor(part).values);
  const [profile, setProfile] = useState(getProfile);
  const [error, setError] = useState("");

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
    setError("");
  };

  const save = () => {
    const result = readValues(system.fields, draft);
    if (result.error) {
      setError(result.error);
      return;
    }
    saveRecords(upsertRecord(records, {
      part,
      values: result.values,
      time: new Date().toISOString(),
      source: "manual"
    }));
    complete(part);
  };

  return (
    <div class="che-record">
      <div class="che-system">
        <div>
          <h3>{system.title}</h3>
          <p class="che-sub">{system.sub}</p>
        </div>
      </div>

      <p class="che-desc">{system.description}</p>


      <div class="che-fields">
        {system.fields.map((field) => {
          const raw = draft[field.key];
          const text = raw == null ? "" : String(raw);
          return (
            <div class="che-field" key={field.key}>
              <label class="che-field-label" for={`che-${part}-${field.key}`}>
                {field.label} <small>({field.unit})</small>
              </label>
              <input
                id={`che-${part}-${field.key}`}
                name={field.key}
                type="number"
                inputmode="decimal"
                min={field.min}
                max={field.max}
                step={field.step}
                value={text}
                aria-label={`${field.label} in ${field.unit}`}
                onInput={(event) => update(field.key, event.currentTarget.value)}
              />
              <small class="che-field-help">Range {field.min} to {field.max} {field.unit}</small>
            </div>
          );
        })}
      </div>

      <IndicatorList fields={system.fields} values={draft} profile={profile} onChange={update} />

      <div class="che-buttons">
        <Button className="che-save" onClick={save}>Save measurements</Button>
      </div>

      {error ? <p class="che-error" role="alert">{error}</p> : null}
      <p class="che-note">A screening and self-monitoring aid, not a diagnosis.</p>
    </div>
  );
}
