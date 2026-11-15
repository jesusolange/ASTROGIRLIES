// The sidebar: every section comes from the ordered list in src/lib/nav.js.
import { SECTIONS, currentSection, show } from "../../lib/nav.js";
import { openSettings } from "../../lib/ui.js";
import "./shell.css";

export default function Sidebar() {
  const current = currentSection.value;

  return (
    <nav class="nav" aria-label="Main navigation">
      {SECTIONS.map((section) => {
        const active = section.id === current && section.page;
        return (
          <button
            type="button"
            key={section.id}
            data-action={section.id}
            class={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
            onClick={() => (section.id === "settings" ? openSettings() : show(section.id))}
          >
            <svg class="icon" aria-hidden="true"><use href={`#${section.icon}`} /></svg>
            {section.label}
          </button>
        );
      })}

      <div class="nav-foot">
        <div class="mars-card">
          <small>Next destination</small>
          <strong>Mars</strong>
          <small style={{ marginTop: "6px" }}>Exploration scenario</small>
        </div>
      </div>
    </nav>
  );
}
