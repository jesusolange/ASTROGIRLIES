import { useEffect, useRef } from "preact/hooks";
import { PIN_MAX, PIN_MIN } from "../../scripts/people.js";

export default function PinField({ id, value, error, busy, onChange }) {
  const input = useRef(null);

  useEffect(() => {
    if (input.current) input.current.focus();
  }, []);

  useEffect(() => {
    if (error && input.current) input.current.focus();
  }, [error]);

  return (
    <div class="amcr-pin">
      <label class="amcr-pin-label" for={id}>PIN</label>
      <input
        ref={input}
        id={id}
        class="amcr-pin-input"
        type="password"
        inputMode="numeric"
        autocomplete="off"
        pattern={`\\d{${PIN_MIN},${PIN_MAX}}`}
        minLength={PIN_MIN}
        maxLength={PIN_MAX}
        value={value}
        disabled={busy}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onInput={(event) => onChange(event.currentTarget.value.replace(/\D/g, ""))}
      />
      {error ? <span class="amcr-pin-error" id={`${id}-error`} role="alert">{error}</span> : null}
    </div>
  );
}
