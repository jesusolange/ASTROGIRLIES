// A titled surface for one block of a route. Its title is the section heading of that block.
// Props: title (optional string), children, className, and any attribute for the element
// (id, hidden, role, ariaLabelledby).
export default function Panel({ title, children, className = "", ...rest }) {
  return (
    <section class={`ui-panel ${className}`.trim()} {...rest}>
      {title ? <h2 class="ui-panel-title">{title}</h2> : null}
      {children}
    </section>
  );
}
