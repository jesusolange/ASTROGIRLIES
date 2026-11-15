import { FIELDS } from "../../scripts/environment.js";
import Button from "../ui/Button.jsx";

export default function ReadingsForm({ draft, onChange, onSave, onDemo }) {
  return (
    <form class="env-form" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <div class="env-fields">
        {FIELDS.map((field) => (
          <label key={field.key} class="env-field">
            <span class="env-lab">{field.label} <small>{field.unit}</small></span>
            <input
              type="number"
              name={field.key}
              step={field.step}
              min={field.min}
              max={field.max}
              value={draft[field.key] ?? ""}
              inputMode="decimal"
              onInput={(event) => onChange(field.key, event.currentTarget.value)}
            />
            <em>{field.how}</em>
          </label>
        ))}
      </div>
      <div class="am-actions">
        <Button type="submit">Save environment</Button>
        <Button variant="soft" onClick={onDemo}>Demo values</Button>
      </div>
    </form>
  );
}
