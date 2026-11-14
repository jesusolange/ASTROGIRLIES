// A labelled form control with optional help and error text.
// Props: label, id (the control's id), help (optional), error (optional),
// children (the input or select), className.
export default function Field({ label, id, help, error, children, className = "" }) {
  return (
    <div class={`ui-field ${className}`.trim()}>
      <label class="ui-field-label" for={id}>{label}</label>
      {children}
      {help ? <small class="ui-field-help">{help}</small> : null}
      {error ? <span class="ui-field-error" role="alert">{error}</span> : null}
    </div>
  );
}
