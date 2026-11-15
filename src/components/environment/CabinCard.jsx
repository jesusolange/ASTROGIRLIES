// One set of cabin readings. Every field is optional; at least one is needed to save.
// Props: form (CheckCard form state).
import { FIELDS, PLACES, profilePlace, recordedToday } from "../../scripts/environment.js";
import Field from "../ui/Field.jsx";

export default function CabinCard({ form }) {
  const place = profilePlace();
  const info = PLACES[place];
  const saved = recordedToday();

  return (
    <div class="env-cabin">
      <p class="env-lead">
        Reading for {info ? info.name : "your cabin"}. The expected ranges below are our design choice for this
        prototype, not a medical standard. Fill in what you can measure.
      </p>
      {saved ? (
        <p class="env-saved-note" role="status">
          These readings are recorded for today. The card opens again with them filled in and does not take a
          second entry.
        </p>
      ) : null}
      <div class="env-grid">
        {FIELDS.map((field) => (
          <Field
            key={field.key}
            label={`${field.label} (${field.unit})`}
            id={`env-${field.key}`}
            help={field.how}
            error={form.errorFor(field.key)}
          >
            <input
              id={`env-${field.key}`}
              type="number"
              step={field.step}
              min={field.min}
              max={field.max}
              inputmode="decimal"
              value={form.values[field.key] == null ? "" : form.values[field.key]}
              ref={form.fieldRef(field.key)}
              onInput={(event) => form.set(field.key, event.currentTarget.value)}
            />
          </Field>
        ))}
      </div>
    </div>
  );
}
