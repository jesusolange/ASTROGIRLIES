// A new version is waiting: one toast offers to reload into it, the same way any other notice
// reaches the astronaut.
import { useEffect, useRef } from "preact/hooks";
import { toast } from "../../lib/ui.js";

export default function UpdateNotice({ onReload }) {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast({ text: "Update ready", undo: onReload, undoLabel: "Reload" });
  }, [onReload]);

  return null;
}
