// One modal surface for shell dialogs, built on the native <dialog> element.
import { useEffect, useRef } from "preact/hooks";
import { modal, closeModal } from "../../lib/ui.js";
import SettingsView from "../settings/SettingsView.jsx";
import "./shell.css";

export default function Modal() {
  const ref = useRef(null);
  const state = modal.value;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (state && !dialog.open) dialog.showModal();
    if (!state && dialog.open) dialog.close();
  }, [state]);

  return (
    <dialog
      ref={ref}
      class="am-dialog"
      aria-labelledby="am-dialog-title"
      onCancel={(event) => { event.preventDefault(); closeModal(); }}
      onClick={(event) => { if (event.target === ref.current) closeModal(); }}
    >
      {state ? (
        <div class="am-dialog-body">
          <div class="am-dialog-header">
            <h2 id="am-dialog-title">{state.title}</h2>
            <button type="button" class="am-dialog-close" aria-label="Close dialog" onClick={closeModal}>×</button>
          </div>
          {state.type === "settings" ? <SettingsView /> : null}
        </div>
      ) : null}
    </dialog>
  );
}
