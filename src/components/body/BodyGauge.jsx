// A health-indicator gauge that is also its field's slider: click, drag or use the arrow keys.
// Ends, the normal range of a vital sign and the current value are labelled. No marker or colour
// is drawn before a value is entered.
import { useRef } from "preact/hooks";
import { bandFor, gradientFor, position, scaleFor, valueFromPosition } from "../../scripts/health-indicators.js";

const clamp = (value) => Math.max(0, Math.min(100, value));

export default function BodyGauge({ field, raw, profile, normal, onChange }) {
  const track = useRef(null);
  const scale = scaleFor(field.key, profile);
  if (!scale) return null;

  const text = raw == null ? "" : String(raw).trim();
  const value = text === "" ? null : Number(text);
  const valid = value != null && Number.isFinite(value);
  const band = bandFor(scale, valid ? value : null);
  const percent = valid ? clamp(position(value, scale)) : null;
  const step = Number(field.step) > 0 ? Number(field.step) : 1;
  const label = `${field.label}, ${field.unit}. ${band.text}.`;

  const setFromPosition = (pct) => {
    const next = valueFromPosition(pct, scale, step);
    if (next != null) onChange(next);
  };

  const setFromClientX = (clientX) => {
    const element = track.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
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

  const onPointerDown = (event) => {
    setFromClientX(event.clientX);
    setCapture(event, true);
  };

  const onPointerMove = (event) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setFromClientX(event.clientX);
  };

  const onKeyDown = (event) => {
    const base = valid ? value : scale.min;
    let next = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = base + step;
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = base - step;
    else if (event.key === "Home") next = scale.min;
    else if (event.key === "End") next = scale.max;
    if (next == null) return;
    event.preventDefault();
    const clamped = Math.max(scale.min, Math.min(scale.max, next));
    onChange(valueFromPosition(position(clamped, scale), scale, step));
  };

  return (
    <div class={`body-gauge body-band-${band.level}`}>
      <div class="body-gauge-top">
        <span class="body-gauge-name">{field.label}</span>
        <span class="body-gauge-value">{valid ? `${value} ${field.unit}` : "No value"}</span>
      </div>
      <div
        ref={track}
        class="body-gauge-track is-interactive"
        role="slider"
        tabindex={0}
        aria-label={`${label} Click, drag or use the arrow keys to set the value.`}
        aria-orientation="horizontal"
        aria-valuemin={scale.min}
        aria-valuemax={scale.max}
        aria-valuenow={valid ? value : scale.min}
        aria-valuetext={valid ? `${value} ${field.unit}` : "No value entered yet"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => setCapture(event, false)}
        onPointerCancel={(event) => setCapture(event, false)}
        onKeyDown={onKeyDown}
      >
        {valid ? <span class="body-gauge-bar" style={{ background: gradientFor(scale) }} /> : null}
        {percent != null ? <span class="body-gauge-mark" style={{ left: `${percent}%` }} /> : null}
        {normal ? (
          <>
            <span class="body-gauge-normal-num" style={{ left: `${clamp(position(normal.low, scale))}%` }} aria-hidden="true">{normal.low}</span>
            <span class="body-gauge-normal-num" style={{ left: `${clamp(position(normal.high, scale))}%` }} aria-hidden="true">{normal.high}</span>
          </>
        ) : null}
      </div>
      <div class="body-gauge-ends" aria-hidden="true">
        <span>{scale.min} {scale.unit}</span>
        <span>{scale.max} {scale.unit}</span>
      </div>
      <p class="body-gauge-band">
        {normal ? `Normal range ${normal.low} to ${normal.high} ${normal.unit}. ` : null}
        {scale.rangeLabel ? `Reference range: ${scale.rangeLabel}. ` : null}
        {band.text}
      </p>
    </div>
  );
}
