import IndicatorGauge from "./IndicatorGauge.jsx";

export default function IndicatorList({ fields, values, profile, onChange }) {
  return (
    <section class="che-gauges" aria-label="Health indicators">
      <div class="che-gauges-head">
        <h4>Health indicators</h4>
        <span>Click or drag a gauge to set its value; the arrow keys step it.</span>
      </div>
      {fields.map((field) => (
        <IndicatorGauge
          key={field.key}
          field={field}
          raw={values[field.key]}
          profile={profile}
          onChange={onChange}
        />
      ))}
      <p class="che-gauge-foot">
        Reference bands are a screening aid and our design choice, not a diagnosis.
      </p>
    </section>
  );
}
