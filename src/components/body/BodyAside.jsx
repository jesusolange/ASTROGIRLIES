// The visual container beside a body card: the 3D model and the health-indicator gauges for the
// same fields, so the number box and the gauge always move together.
import BodyFigure from "./BodyFigure.jsx";
import BodyGauge from "./BodyGauge.jsx";
import { SYSTEMS, fieldsFor } from "../../scripts/checkup-flow.js";
import { get as getProfile } from "../../scripts/profile.js";
import { scaleFor, vitalRangeFor } from "../../scripts/health-indicators.js";

export default function BodyAside({ part, focus, form }) {
  const system = SYSTEMS[part];
  if (!system) return null;
  const profile = getProfile();
  const gauges = fieldsFor(part, profile).filter((field) => scaleFor(field.key, profile));

  return (
    <div class="body-aside">
      <BodyFigure part={focus} />
      {gauges.length ? (
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
      ) : null}
    </div>
  );
}
