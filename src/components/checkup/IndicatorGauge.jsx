import { bandFor, gradientFor, position, scaleFor } from "../../scripts/health-indicators.js";

export default function IndicatorGauge({ field, raw, profile }) {
  const scale = scaleFor(field.key, profile);
  const text = raw == null ? "" : String(raw).trim();
  const value = text === "" ? null : Number(text);
  const valid = value != null && Number.isFinite(value);
  const band = bandFor(scale, valid ? value : null);
  const percent = valid && scale ? position(value, scale) : null;
  const label = `${field.label}: ${valid ? `${value} ${field.unit}` : "no value"}. ${band.text}. Read-only gauge.`;

  return (
    <div class={`che-gauge che-band-${band.level}`}>
      <div class="che-gauge-top">
        <span class="che-gauge-name">{field.label}</span>
        <span class="che-gauge-value">{valid ? `${value} ${field.unit}` : "No value"}</span>
      </div>
      <div class="che-gauge-track" role="img" aria-label={label}>
        <span class="che-gauge-bar" style={{ background: gradientFor(scale) }} />
        {percent != null ? <span class="che-gauge-mark" style={{ left: `${percent}%` }} /> : null}
      </div>
      {scale ? (
        <div class="che-gauge-ticks" aria-hidden="true">
          {scale.ticks.map((tick) => (
            <span key={tick} style={{ left: `${position(tick, scale)}%` }}>{tick}</span>
          ))}
        </div>
      ) : null}
      <p class="che-gauge-band">
        {scale && scale.rangeLabel ? `Reference range: ${scale.rangeLabel}. ` : null}
        {band.text}
      </p>
    </div>
  );
}
