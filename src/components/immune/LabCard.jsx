// A saliva, blood or urine result, entered free-form: sample, test name, value, typed unit and an optional note.
// Props: form (CheckCard form state).
import { testOptions, unitOptions } from "../../scripts/immune.js";
import Field from "../ui/Field.jsx";

const NAME_PLACEHOLDER = { saliva: "e.g. cortisol", blood: "e.g. CRP", urine: "e.g. N-telopeptide" };

export default function LabCard({ form }) {
  const values = form.values;
  const sample = values.kind || "saliva";
  const units = unitOptions(values.name, sample);
  const names = testOptions(sample);
  return (
    <div class="im-lab">
      <p class="im-lead">
        Enter the name, value and unit from your test. No reference range is applied: the result and its trend
        against your earlier values are for your own monitoring.
      </p>
      <Field label="Sample" id="im-kind">
        <select id="im-kind" value={sample} onChange={(event) => form.set("kind", event.currentTarget.value)}>
          <option value="saliva">Saliva</option>
          <option value="blood">Blood</option>
          <option value="urine">Urine</option>
        </select>
      </Field>
      <Field label="Test name" id="im-name" error={form.errorFor("name")} help="Choose a common test or type your own.">
        <input
          id="im-name"
          type="text"
          list="im-name-options"
          maxlength="60"
          placeholder={NAME_PLACEHOLDER[sample] || "e.g. cortisol"}
          value={values.name || ""}
          ref={form.fieldRef("name")}
          onInput={(event) => form.set("name", event.currentTarget.value)}
        />
      </Field>
      <datalist id="im-name-options">
        {names.map((name) => <option value={name} key={name} />)}
      </datalist>
      <div class="im-value-row">
        <Field label="Value" id="im-value" error={form.errorFor("value")}>
          <input
            id="im-value"
            type="number"
            step="any"
            inputmode="decimal"
            value={values.value == null ? "" : values.value}
            ref={form.fieldRef("value")}
            onInput={(event) => form.set("value", event.currentTarget.value)}
          />
        </Field>
        <Field label="Unit" id="im-unit" error={form.errorFor("unit")} help="Choose a usual unit or type your own.">
          <input
            id="im-unit"
            type="text"
            list="im-unit-options"
            maxlength="20"
            placeholder="µg/dL"
            value={values.unit || ""}
            ref={form.fieldRef("unit")}
            onInput={(event) => form.set("unit", event.currentTarget.value)}
          />
        </Field>
      </div>
      <datalist id="im-unit-options">
        {units.map((unit) => <option value={unit} key={unit} />)}
      </datalist>
      <Field label="Note (optional)" id="im-note">
        <input
          id="im-note"
          type="text"
          maxlength="120"
          placeholder="time of day, fasting, how you feel"
          value={values.note || ""}
          onInput={(event) => form.set("note", event.currentTarget.value)}
        />
      </Field>
    </div>
  );
}
