// A labelled form control with optional help and error text. Inside a check card the browser's own
// validation bubble carries the error on a native control, so no red line is drawn under it.
// Props: label, id (the control's id), help (optional), error (optional),
// children (the input, select or a group such as Chips), className.
import { cloneElement, createContext, isValidElement } from "preact";
import { useContext } from "preact/hooks";

const LABELABLE = ["input", "select", "textarea"];

export const FieldTooltipContext = createContext(false);

export default function Field({ label, id, help, error, children, className = "" }) {
  const tooltip = useContext(FieldTooltipContext);
  const native = isValidElement(children) && LABELABLE.includes(children.type);
  const showError = Boolean(error) && !(tooltip && native);
  const helpId = help ? `${id}-help` : null;
  const errorId = showError ? `${id}-error` : null;
  const labelId = `${id}-label`;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
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
      {showError ? <span class="ui-field-error" id={errorId} role="alert">{error}</span> : null}
    </div>
  );
}
