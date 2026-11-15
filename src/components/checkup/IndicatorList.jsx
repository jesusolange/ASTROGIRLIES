import IndicatorGauge from "./IndicatorGauge.jsx";

export default function IndicatorList({ fields, values }) {
  return (
    <section class="che-gauges" aria-label="Health indicators">
      <div class="che-gauges-head">
        <h4>Health indicators</h4>
        <span>Read-only gauge · value shown against its reference band</span>
      </div>
      {fields.map((field) => (
        <IndicatorGauge key={field.key} field={field} raw={values[field.key]} />
      ))}
      <p class="che-gauge-foot">
        Reference bands are a screening aid and our design choice, not a diagnosis.
      </p>
    </section>
  );
}
