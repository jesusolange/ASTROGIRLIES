// One body check: the fields for that system, with the visual and the gauges in the card's aside.
// Only values the astronaut enters are saved; an empty field is skipped.
import Field from "../ui/Field.jsx";
import BodyDevices from "./BodyDevices.jsx";
import { SYSTEMS, fieldsFor, profileWeight } from "../../scripts/checkup-flow.js";
import { get as getProfile } from "../../scripts/profile.js";
import "./body.css";

export default function BodyCard({ part, devices = [], form }) {
  const system = SYSTEMS[part];
  if (!system) return null;
  const profile = getProfile();
  const fields = fieldsFor(part, profile);
  const weight = part === "kidneys" ? profileWeight(profile) : null;

  return (
    <div class="body-card">
      <p class="body-lead">{system.description}</p>
      {weight != null ? (
        <p class="body-profile-weight">Body weight {weight} kg is taken from your profile.</p>
      ) : null}

      <div class="body-fields">
        {fields.map((field) => (
          <Field
            key={field.key}
            id={`body-${part}-${field.key}`}
            label={`${field.label} (${field.unit})`}
            help={`Accepted range ${field.min} to ${field.max} ${field.unit}.`}
            error={form.errorFor(field.key)}
          >
            <input
              ref={form.fieldRef(field.key)}
              type="number"
              inputmode="decimal"
              min={field.min}
              max={field.max}
              step={field.step}
              value={form.values[field.key] ?? ""}
              onInput={(event) => form.set(field.key, event.currentTarget.value)}
            />
          </Field>
        ))}
      </div>

      <BodyDevices devices={devices} />
    </div>
  );
}
