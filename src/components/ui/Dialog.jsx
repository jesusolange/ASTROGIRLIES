// The one dialog surface. Modal by default: the native dialog traps focus and Esc closes it,
// and focus returns to the element that opened it. It opens and closes with a short slide and fade.
// Props: open, onClose, title, children, footer, className, label (accessible name when no title),
// size ("large" for view-all content) or large.
import "./kit.css";
import "./dialog.css";
import { useEffect, useId, useRef, useState } from "preact/hooks";

const CLOSE_MS = 220;

function reducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Dialog({
  open, onClose, title, children, footer, className = "", label, size, large = false
}) {
  const ref = useRef(null);
  const opener = useRef(null);
  const closeTimer = useRef(null);
  const closing = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const titleId = `ui-dialog-title-${useId()}`;
  const isLarge = large || size === "large";

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      closing.current = false;
      setLeaving(false);
    }
  }, [open]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (open) return;
    if (opener.current && typeof opener.current.focus === "function") opener.current.focus();
    opener.current = null;
  }, [open]);

  function requestClose() {
    if (closing.current) return;
    const dialog = ref.current;
    if (!dialog || !dialog.open || reducedMotion()) {
      onClose?.();
      return;
    }
    closing.current = true;
    setLeaving(true);
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      closing.current = false;
      setLeaving(false);
      onClose?.();
    }, CLOSE_MS);
  }

  return (
    <dialog
      ref={ref}
      class={`ui-dialog ${isLarge ? "is-large" : ""} ${leaving ? "is-closing" : ""} ${className}`.replace(/\s+/g, " ").trim()}
      aria-label={title ? undefined : label}
      aria-labelledby={title ? titleId : undefined}
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onClick={(event) => { if (event.target === ref.current) requestClose(); }}
    >
      <div class="ui-dialog-body">
        <div class="ui-dialog-head">
          {title ? <h2 id={titleId}>{title}</h2> : null}
          <button type="button" class="ui-dialog-close" aria-label="Close dialog" onClick={requestClose}>
            <span aria-hidden="true">&#215;</span>
          </button>
        </div>
        <div class="ui-dialog-content">{children}</div>
        {footer ? <div class="ui-dialog-foot">{footer}</div> : null}
      </div>
    </dialog>
  );
}
