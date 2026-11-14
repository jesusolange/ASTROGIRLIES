// A tab list with the role="tablist" semantics and left/right, Home and End movement.
// Props: tabs ([{ id, label }]), value (active id), onChange(id), label (accessible name),
// idBase (prefix for the tab and panel ids).
import { useRef } from "preact/hooks";

export default function Tabs({ tabs, value, onChange, label = "Views", idBase = "tabs" }) {
  const list = useRef(null);

  function onKeyDown(event) {
    const index = tabs.findIndex((tab) => tab.id === value);
    if (index < 0) return;
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    onChange(tabs[next].id);
    list.current?.children[next]?.focus();
  }

  return (
    <div ref={list} class="ui-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${idBase}-tab-${tab.id}`}
            aria-controls={`${idBase}-panel-${tab.id}`}
            aria-selected={active ? "true" : "false"}
            tabIndex={active ? 0 : -1}
            class={`ui-tab ${active ? "is-active" : ""}`.trim()}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
