import { useRef } from "preact/hooks";
import { bandFor, gradientFor, position, scaleFor, valueFromPosition } from "../../scripts/health-indicators.js";

export default function IndicatorGauge({ field, raw, profile, onChange }) {
  const trackRef = useRef(null);
  const scale = scaleFor(field.key, profile);
  const text = raw == null ? "" : String(raw).trim();
  const value = text === "" ? null : Number(text);
  const valid = value != null && Number.isFinite(value);
  const band = bandFor(scale, valid ? value : null);
  const percent = valid && scale ? position(value, scale) : null;
  const interactive = Boolean(scale && onChange);
  const step = Number(field.step) > 0 ? Number(field.step) : 1;
  const label = `${field.label}, ${field.unit}. ${band.text}.`;

  const setFromPosition = (percentOnTrack) => {
    const next = valueFromPosition(percentOnTrack, scale, step);
    if (next != null) onChange(field.key, next);
  };

  const setFromClientX = (clientX) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (!rect.width) return;
    setFromPosition(((clientX - rect.left) / rect.width) * 100);
  };

  const setCapture = (event, active) => {
    try {
      if (active) event.currentTarget.setPointerCapture(event.pointerId);
      else if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch (error) {
      /* the pointer can end before the browser registers the capture */
    }
  };

  const handlePointerDown = (event) => {
    if (!interactive) return;
    setFromClientX(event.clientX);
    setCapture(event, true);
  };

  const handlePointerMove = (event) => {
    if (!interactive || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setFromClientX(event.clientX);
  };

  const handlePointerEnd = (event) => {
    setCapture(event, false);
  };

  const handleKeyDown = (event) => {
    if (!interactive) return;
    const base = valid ? value : scale.min;
    let next = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = base + step;
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = base - step;
    else if (event.key === "Home") next = scale.min;
    else if (event.key === "End") next = scale.max;
    if (next == null) return;
    event.preventDefault();
    setFromPosition(position(Math.max(scale.min, Math.min(scale.max, next)), scale));
  };

  return (
    <div class={`che-gauge che-band-${band.level}`}>
      <div class="che-gauge-top">
        <span class="che-gauge-name">{field.label}</span>
        <span class="che-gauge-value">{valid ? `${value} ${field.unit}` : "No value"}</span>
      </div>
      <div
        ref={trackRef}
        class={`che-gauge-track${interactive ? " is-interactive" : ""}`}
        role={interactive ? "slider" : "img"}
        tabindex={interactive ? 0 : undefined}
        aria-label={interactive ? `${label} Click, drag or use the arrow keys to set the value.` : label}
        aria-orientation={interactive ? "horizontal" : undefined}
        aria-valuemin={interactive ? scale.min : undefined}
        aria-valuemax={interactive ? scale.max : undefined}
        aria-valuenow={interactive ? (valid ? value : scale.min) : undefined}
        aria-valuetext={valid ? `${value} ${field.unit}` : "No value entered yet"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        {valid ? <span class="che-gauge-bar" style={{ background: gradientFor(scale) }} /> : null}
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
