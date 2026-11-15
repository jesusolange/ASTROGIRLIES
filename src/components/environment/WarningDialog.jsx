import { useEffect, useRef } from "preact/hooks";
import Button from "../ui/Button.jsx";

export default function WarningDialog({ warning, onClose }) {
  const okButton = useRef(null);

  useEffect(() => {
    if (!warning) return undefined;
    if (okButton.current) okButton.current.focus();
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [warning, onClose]);

  if (!warning) return null;
  const worst = warning.items.some((item) => item.level === "alert") ? "alert" : "review";

  return (
    <div
      class="env-pop"
      role="dialog"
      aria-modal="true"
      aria-label="Environment warnings"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div class={`env-pop-card ${worst}`}>
        <h3>{warning.plain ? "Heads up" : worst === "alert" ? "Please read this first" : "A few things to watch"}</h3>
        <div class="env-pop-list">
          {warning.items.map((item, index) => (
            <div key={`${item.title}-${index}`} class={`env-pop-item ${item.level}`}>
              <i>!</i>
              <div>
                <b>{(item.title || "").replace("Environment · ", "")}</b>
                <p>{item.saw} {item.todo}</p>
              </div>
            </div>
          ))}
        </div>
        <Button ref={okButton} onClick={onClose}>I understand</Button>
      </div>
    </div>
  );
}
