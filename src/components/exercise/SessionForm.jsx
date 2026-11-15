import { useState } from "preact/hooks";
import { validateSession } from "../../scripts/exercise.js";

const initialValues = (device) => Object.fromEntries(device.fields.map((field) => [field.key, ""]));

export default function SessionForm({ device, onSave, onCancel }) {
  const [values, setValues] = useState(() => initialValues(device));
  const [errors, setErrors] = useState([]);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const result = validateSession(device, values);
    if (!result.ok) { setErrors(result.errors); return; }
    onSave(result.values);
  };

  return (
    <article class="exercise-inline-editor">
      <div class="exercise-inline-header">
        <div>
          <h3>{device.title}</h3>
          <p>{device.subtitle}</p>
        </div>
        <button type="button" class="exercise-inline-close" aria-label="Close training form" onClick={onCancel}>×</button>
      </div>
      <form class="exercise-inline-form" onSubmit={submit} noValidate>
        <div class="exercise-inline-fields">
          {device.fields.map((field) => (
            <label key={field.key} class="exercise-input-group">
              {field.label}
              {field.type === "select" ? (
                <select name={field.key} value={values[field.key]} required={field.required} onChange={(e) => update(field.key, e.currentTarget.value)}>
                  <option value="" disabled>Select a {field.label.toLowerCase()}</option>
                  {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input
                  name={field.key} type="number" step="any" inputmode="decimal"
                  min={field.min} max={field.max} required={field.required}
                  value={values[field.key]} onChange={(e) => update(field.key, e.currentTarget.value)}
                />
              )}
            </label>
          ))}
        </div>
        {errors.length > 0 && (
          <ul class="exercise-errors" role="alert">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        )}
        <button type="submit" class="exercise-inline-save">Save Session</button>
      </form>
    </article>
  );
}
