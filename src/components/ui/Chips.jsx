// Single and multiple choice chips. A single choice behaves as a radio group; a multiple choice as
// a group of toggle buttons.
// Props: options ([{ id, label }]), value (id, or array of ids when multiple), onChange(next),
// multiple (default false), label (group name), className, idBase.
import "./kit.css";
import { useRef } from "preact/hooks";

export default function Chips({ options = [], value, onChange, multiple = false, label = "Choices", className = "", idBase = "chips", ...rest }) {
  const list = useRef(null);
  const selected = multiple ? new Set(Array.isArray(value) ? value : []) : null;

  function isOn(id) {
    return multiple ? selected.has(id) : value === id;
  }

  function pick(id) {
    if (!multiple) {
      onChange?.(id);
      return;
    }
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange?.(options.map((option) => option.id).filter((optionId) => next.has(optionId)));
  }

  function onKeyDown(event) {
    if (multiple) return;
    const index = options.findIndex((option) => option.id === value);
    if (index < 0) return;
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % options.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;
    event.preventDefault();
    onChange?.(options[next].id);
    list.current?.children[next]?.focus();
  }

  return (
    <div
      ref={list}
      class={`ui-chips ${className}`.trim()}
      role={multiple ? "group" : "radiogroup"}
      aria-label={label}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {options.map((option, index) => {
        const on = isOn(option.id);
        const active = multiple ? undefined : (value || options[0]?.id) === option.id;
        return (
          <button
            key={option.id}
            id={`${idBase}-${option.id}`}
            type="button"
            class={`ui-chip ${on ? "is-selected" : ""}`.trim()}
            role={multiple ? undefined : "radio"}
            aria-checked={multiple ? undefined : (on ? "true" : "false")}
            aria-pressed={multiple ? (on ? "true" : "false") : undefined}
            tabIndex={multiple ? 0 : (active ? 0 : -1)}
            onClick={() => pick(option.id)}
            data-index={index}
          >
            <span class="ui-chip-mark" aria-hidden="true">{on ? "\u2713" : ""}</span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
