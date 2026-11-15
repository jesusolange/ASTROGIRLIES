// A search box with a popover list of groups and their items. Typing filters both levels and opens
// every group that still has a match; the arrow keys move through the visible items, Enter chooses,
// Esc closes. Callers supply the groups and say what a choice does.
// Props: groups ([{ id, label, items: [{ id, label }] }]), onSelect(item, group),
// label, placeholder, emptyText, className.
import "./kit.css";
import "./search.css";
import { useEffect, useId, useRef, useState } from "preact/hooks";
import Icon from "./Icon.jsx";
import { filterGroups, stepIndex } from "./search.js";

export default function SearchOverlay({
  groups = [],
  onSelect,
  label = "Search",
  placeholder = "Search",
  emptyText = "No matches.",
  className = ""
}) {
  const base = useId();
  const listId = `${base}-list`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState({});
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  const filtered = filterGroups(groups, query);
  const visible = [];
  for (const group of filtered) {
    if (collapsed[group.id]) continue;
    for (const item of group.items) visible.push({ group, item });
  }
  const indexById = new Map(visible.map((entry, index) => [entry.item.id, index]));
  const activeEntry = visible[active] || null;

  useEffect(() => {
    setCollapsed({});
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = itemRefs.current[active];
    if (node && typeof node.scrollIntoView === "function") node.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(entry) {
    if (!entry) return;
    setOpen(false);
    setQuery("");
    onSelect?.(entry.item, entry.group);
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      if (!open) return;
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.target !== inputRef.current) return;
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => stepIndex(index, event.key === "ArrowDown" ? 1 : -1, visible.length));
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      if (!open) return;
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : Math.max(0, visible.length - 1));
      return;
    }
    if (event.key === "Enter") {
      if (!open || !activeEntry) return;
      event.preventDefault();
      choose(activeEntry);
    }
  }

  return (
    <div class={`ui-search ${className}`.trim()} ref={rootRef} onKeyDown={onKeyDown}>
      <div class="ui-search-box">
        <Icon name="search" size={18} />
        <input
          ref={inputRef}
          class="ui-search-input"
          type="text"
          role="combobox"
          aria-label={label}
          aria-autocomplete="list"
          aria-expanded={open ? "true" : "false"}
          aria-controls={listId}
          aria-activedescendant={open && activeEntry ? `${base}-opt-${active}` : undefined}
          autocomplete="off"
          spellcheck={false}
          placeholder={placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onInput={(event) => {
            setQuery(event.currentTarget.value);
            setActive(0);
            setCollapsed({});
            setOpen(true);
          }}
        />
      </div>

      {open ? (
        <div class="ui-search-pop" id={listId} role="listbox" aria-label={label}>
          {visible.length ? (
            filtered.map((group) => {
              const isOpen = !collapsed[group.id];
              return (
                <div class="ui-search-group" key={group.id} role="group" aria-label={group.label}>
                  <button
                    type="button"
                    class="ui-search-group-btn"
                    aria-expanded={isOpen ? "true" : "false"}
                    onClick={() => setCollapsed((old) => ({ ...old, [group.id]: !old[group.id] }))}
                  >
                    <Icon name="next" size={16} className={isOpen ? "ui-search-chevron is-open" : "ui-search-chevron"} />
                    <span>{group.label}</span>
                  </button>
                  {isOpen ? (
                    <ul class="ui-search-items">
                      {group.items.map((item) => {
                        const index = indexById.get(item.id);
                        const on = index === active;
                        return (
                          <li key={item.id}>
                            <button
                              ref={(node) => { itemRefs.current[index] = node; }}
                              id={`${base}-opt-${index}`}
                              type="button"
                              role="option"
                              tabIndex={-1}
                              class={`ui-search-item ${on ? "is-active" : ""}`.trim()}
                              aria-selected={on ? "true" : "false"}
                              onMouseEnter={() => setActive(index)}
                              onClick={() => choose({ group, item })}
                            >
                              {item.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p class="ui-search-empty">{emptyText}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
