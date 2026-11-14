// A titled surface for one block of a section.
// Props: title (optional string), children, className, and any attribute for the element
// (id, hidden, role, ariaLabelledby).
export default function Panel({ title, children, className = "", ...rest }) {
  return (
    <section class={`ui-panel ${className}`.trim()} {...rest}>
      {title ? <h3 class="ui-panel-title">{title}</h3> : null}
      {children}
    </section>
  );
}
