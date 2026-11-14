// A toggle control: a real button that reports its state with aria-pressed.
// Props: pressed (boolean), children, className, and any other button attribute (onClick, disabled).
export default function Pill({ pressed = false, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      class={`ui-pill ${pressed ? "is-pressed" : ""} ${className}`.trim()}
      aria-pressed={pressed ? "true" : "false"}
      {...rest}
    >
      {children}
    </button>
  );
}
