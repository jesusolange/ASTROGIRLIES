// A labelled form control with optional help and error text.
// Props: label, id (the control's id), help (optional), error (optional),
// children (the input, select or a group such as Chips), className.
import { cloneElement, isValidElement } from "preact";

const LABELABLE = ["input", "select", "textarea"];

export default function Field({ label, id, help, error, children, className = "" }) {
  const helpId = help ? `${id}-help` : null;
  const errorId = error ? `${id}-error` : null;
  const labelId = `${id}-label`;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const native = isValidElement(children) && LABELABLE.includes(children.type);
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || id,
        "aria-labelledby": native ? undefined : (children.props["aria-labelledby"] || labelId),
        "aria-describedby": describedBy,
        "aria-invalid": error ? "true" : undefined
      })
    : children;

  return (
    <div class={`ui-field ${className}`.trim()}>
      {native ? (
        <label class="ui-field-label" for={id}>{label}</label>
      ) : (
        <span class="ui-field-label" id={labelId}>{label}</span>
      )}
      {control}
      {help ? <small class="ui-field-help" id={helpId}>{help}</small> : null}
      {error ? <span class="ui-field-error" id={errorId} role="alert">{error}</span> : null}
    </div>
  );
}
