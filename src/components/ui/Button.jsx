// A real button with the shared variants.
// Props: variant ("primary" | "soft" | "danger", default "primary"), type (default "button"),
// children, className, and any other button attribute (onClick, disabled).
const VARIANT_CLASS = {
  primary: "ui-btn-primary",
  soft: "ui-btn-soft",
  danger: "ui-btn-danger",
};

export default function Button({ variant = "primary", type = "button", className = "", children, ...rest }) {
  return (
    <button type={type} class={`ui-btn ${VARIANT_CLASS[variant] || VARIANT_CLASS.primary} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
