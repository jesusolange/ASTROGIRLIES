// A term with a dashed underline. Its short definition opens in a native popover on click or Enter.
// Props: term (the abbreviation) or children (the text shown, when it differs), className.
import "./kit.css";
import { useId, useRef, useState } from "preact/hooks";
import { definitionOf, termKey } from "../../data/terms.js";

export default function Term({ term, children, className = "" }) {
  const label = children || term;
  const name = term || (typeof children === "string" ? children : "");
  const key = termKey(name);
  const definition = definitionOf(name);
  const popId = `ui-term-${useId()}`;
  const buttonRef = useRef(null);
  const popRef = useRef(null);
  const [open, setOpen] = useState(false);

  if (!key) return <>{label}</>;

  function toggle() {
    const pop = popRef.current;
    const button = buttonRef.current;
    if (!pop || !button) return;
    if (typeof pop.hidePopover !== "function") return;
    if (pop.matches(":popover-open")) {
      pop.hidePopover();
      return;
    }
    const rect = button.getBoundingClientRect();
    const width = Math.min(288, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    pop.style.setProperty("--ui-term-left", `${left}px`);
    pop.style.setProperty("--ui-term-top", `${rect.bottom + 6}px`);
    pop.style.setProperty("--ui-term-width", `${width}px`);
    pop.showPopover();
  }

  return (
    <span class={`ui-term-wrap ${className}`.trim()}>
      <button
        ref={buttonRef}
        type="button"
        class="ui-term"
        aria-expanded={open ? "true" : "false"}
        aria-controls={popId}
        onClick={toggle}
      >
        {label}
      </button>
      <span
        ref={popRef}
        id={popId}
        class="ui-term-pop"
        popover="auto"
        role="note"
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        <b>{key}.</b> {definition}
      </span>
    </span>
  );
}
