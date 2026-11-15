// A term with a dashed underline. Its short definition opens in a native popover on click or Enter,
// anchored under the term. One definition is open at a time; it closes on an outside click, on a
// route change and when another term opens.
// Props: term (the abbreviation) or children (the text shown, when it differs), className.
import "./kit.css";
import { useEffect, useId, useRef, useState } from "preact/hooks";
import { definitionOf, termKey } from "../../data/terms.js";

// The popover that is open right now, shared by every Term on the page.
let openPop = null;

export default function Term({ term, children, className = "" }) {
  const label = children || term;
  const name = term || (typeof children === "string" ? children : "");
  const key = termKey(name);
  const definition = definitionOf(name);
  const popId = `ui-term-${useId()}`;
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const popRef = useRef(null);
  const [open, setOpen] = useState(false);

  function place() {
    const pop = popRef.current;
    const button = buttonRef.current;
    if (!pop || !button) return;
    const rect = button.getBoundingClientRect();
    const width = Math.min(288, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const top = Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 12));
    pop.style.setProperty("--ui-term-left", `${left}px`);
    pop.style.setProperty("--ui-term-top", `${top}px`);
    pop.style.setProperty("--ui-term-width", `${width}px`);
  }

  function hide() {
    const pop = popRef.current;
    if (pop && typeof pop.hidePopover === "function" && pop.matches(":popover-open")) pop.hidePopover();
    if (openPop === pop) openPop = null;
    setOpen(false);
  }

  function show() {
    const pop = popRef.current;
    const button = buttonRef.current;
    if (!pop || !button || typeof pop.showPopover !== "function") return;
    if (openPop && openPop !== pop && typeof openPop.hidePopover === "function") openPop.hidePopover();
    place();
    pop.showPopover();
    openPop = pop;
    setOpen(true);
  }

  function toggle() {
    const pop = popRef.current;
    if (!pop || typeof pop.showPopover !== "function") return;
    if (pop.matches(":popover-open")) hide();
    else show();
  }

  useEffect(() => {
    if (!open) return undefined;
    const reposition = () => place();
    const onPointer = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) hide();
    };
    const onNavigate = () => hide();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("hashchange", onNavigate);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("hashchange", onNavigate);
    };
  }, [open]);

  useEffect(() => () => {
    const pop = popRef.current;
    if (pop && typeof pop.hidePopover === "function" && pop.matches(":popover-open")) pop.hidePopover();
    if (openPop === pop) openPop = null;
  }, []);

  if (!key) return <>{label}</>;

  return (
    <span class={`ui-term-wrap ${className}`.trim()} ref={wrapRef}>
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
        onToggle={(event) => {
          const next = event.newState === "open";
          setOpen(next);
          if (!next && openPop === popRef.current) openPop = null;
        }}
      >
        <b>{key}.</b> {definition}
      </span>
    </span>
  );
}
