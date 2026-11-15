// One body check: fields on the left, the 3D model on the right. The gauges below the fields are the
// sliders for the same values, so the number box and the gauge always move together.
// Only values the astronaut enters are saved; an empty field is skipped.
import Field from "../ui/Field.jsx";
import BodyFigure from "./BodyFigure.jsx";
import BodyGauge from "./BodyGauge.jsx";
import BodyDevices from "./BodyDevices.jsx";
import { SYSTEMS, fieldsFor, profileWeight } from "../../scripts/checkup-flow.js";
import { get as getProfile } from "../../scripts/profile.js";
import { scaleFor, vitalRangeFor } from "../../scripts/health-indicators.js";
import "./body.css";

export default function BodyCard({ part, focus, devices = [], form }) {
  const system = SYSTEMS[part];
  if (!system) return null;
  const profile = getProfile();
  const fields = fieldsFor(part, profile);
  const gauges = fields.filter((field) => scaleFor(field.key, profile));
  const weight = part === "kidneys" ? profileWeight(profile) : null;

  return (
    <div class="body-card">
      <div class="body-card-main">
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

        <section class="body-gauges" aria-label="Health indicators">
          <div class="body-gauges-head">
            <h3>Health indicators</h3>
            <span>Drag or click a gauge to set its value. The arrow keys step it.</span>
          </div>
          {gauges.map((field) => (
            <BodyGauge
              key={field.key}
              field={field}
              raw={form.values[field.key]}
              profile={profile}
              normal={vitalRangeFor(field.key)}
              onChange={(value) => form.set(field.key, value)}
            />
          ))}
          <p class="body-gauge-foot">
            Reference bands are a screening aid and our design choice, not a diagnosis.
          </p>
        </section>

        <BodyDevices devices={devices} />
      </div>

      <BodyFigure part={focus} />
    </div>
  );
}
