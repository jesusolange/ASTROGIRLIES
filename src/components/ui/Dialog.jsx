// The one dialog surface. Modal by default: the native dialog traps focus and Esc closes it,
// and focus returns to the element that opened it.
// Props: open, onClose, title, children, footer, className, label (accessible name when no title).
import "./kit.css";
import { useEffect, useId, useRef } from "preact/hooks";

export default function Dialog({ open, onClose, title, children, footer, className = "", label }) {
  const ref = useRef(null);
  const opener = useRef(null);
  const titleId = `ui-dialog-title-${useId()}`;

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
    if (open) return;
    if (opener.current && typeof opener.current.focus === "function") opener.current.focus();
    opener.current = null;
  }, [open]);

  return (
    <dialog
      ref={ref}
      class={`ui-dialog ${className}`.trim()}
      aria-label={title ? undefined : label}
      aria-labelledby={title ? titleId : undefined}
      onCancel={(event) => { event.preventDefault(); onClose?.(); }}
      onClick={(event) => { if (event.target === ref.current) onClose?.(); }}
      onClose={() => { if (open) onClose?.(); }}
    >
      <div class="ui-dialog-body">
        <div class="ui-dialog-head">
          {title ? <h2 id={titleId}>{title}</h2> : null}
          <button type="button" class="ui-dialog-close" aria-label="Close dialog" onClick={() => onClose?.()}>
            <span aria-hidden="true">&#215;</span>
          </button>
        </div>
        <div class="ui-dialog-content">{children}</div>
        {footer ? <div class="ui-dialog-foot">{footer}</div> : null}
      </div>
    </dialog>
  );
}
