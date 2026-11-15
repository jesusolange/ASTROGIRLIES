// One numbered step list, used for device instructions and emergency stages.
// Props: items (array of strings or { text, note }), start (first number, default 1), className,
// ariaLabel (the list's accessible name).
import "./kit.css";
export default function Steps({ items = [], start = 1, className = "", ariaLabel }) {
  return (
    <ol class={`ui-steps ${className}`.trim()} aria-label={ariaLabel}>
      {items.map((item, index) => {
        const text = typeof item === "string" ? item : item.text;
        const note = typeof item === "string" ? null : item.note;
        return (
          <li class="ui-step" key={`${start + index}-${text}`}>
            <span class="ui-step-num" aria-hidden="true">{start + index}</span>
            <span class="ui-step-text">
              {text}
              {note ? <small class="ui-step-note">{note}</small> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
