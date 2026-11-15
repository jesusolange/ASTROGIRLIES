import { toasts } from "../../lib/ui.js";
import "./shell.css";

export default function Toasts() {
  return (
    <div class="toasts" id="toasts" aria-live="polite">
      {toasts.value.map((item) => (
        <div class="toast" key={item.id}>{item.message}</div>
      ))}
    </div>
  );
}
