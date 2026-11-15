// The keyboard shortcuts, listed where the astronaut looks for settings. The list is the same one
// the shell listens for, so it cannot drift.
import { SHORTCUTS } from "../../lib/ui.js";
import "./kit.css";

export default function KeyboardList() {
  return (
    <section class="ui-keys" aria-labelledby="ui-keys-title">
      <h3 class="ui-keys-title" id="ui-keys-title">Keyboard</h3>
      <p class="ui-keys-note">These keys work on every screen. They do nothing while you type in a field.</p>
      <dl class="ui-key-list">
        {SHORTCUTS.map((item) => (
          <div class="ui-key-row" key={item.keys}>
            <dt><kbd>{item.keys}</kbd></dt>
            <dd>{item.action}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
