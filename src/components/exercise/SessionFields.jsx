// Device-specific inputs. Duration and effort are the two numbers the weekly view uses.
export default function SessionFields({ device, values, onChange, refs }) {
  return (
    <div class="exr-fields">
      {device.fields.map((field) => (
        <label key={field.key} class="exr-field">
          <span>{field.label}{field.required ? " *" : ""}</span>
          {field.type === "select" ? (
            <select
              ref={(node) => { refs[field.key] = node; }}
              name={field.key}
              value={values[field.key]}
              onChange={(event) => onChange(field.key, event.currentTarget.value)}
            >
              <option value="" disabled>Select a {field.label.toLowerCase()}</option>
              {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : (
            <input
              ref={(node) => { refs[field.key] = node; }}
              name={field.key}
              type="number"
              step="any"
              inputmode="decimal"
              min={field.min}
              max={field.max}
              value={values[field.key]}
              onInput={(event) => onChange(field.key, event.currentTarget.value)}
            />
          )}
        </label>
      ))}
    </div>
  );
}
