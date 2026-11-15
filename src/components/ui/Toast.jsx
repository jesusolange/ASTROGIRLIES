// The one toast region: bottom centre, role="status". A toast with undo keeps its button for eight
// seconds; clicking it removes the toast and runs the undo.
import "./kit.css";
import "./ui.css";
import { dismissToast, toasts } from "../../lib/ui.js";

export default function Toasts() {
  return (
    <div class="ui-toasts" role="status">
      {toasts.value.map((item) => (
        <div class="ui-toast" key={item.id}>
          <span class="ui-toast-text">{item.text}</span>
          {item.undo ? (
            <button
              type="button"
              class="ui-toast-undo"
              onClick={() => {
                dismissToast(item.id);
                item.undo();
              }}
            >
              Undo
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
