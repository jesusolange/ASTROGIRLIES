// A questionnaire form. Each question is one row of radio choices, grouped as the section needs.
// Props: id (form id), groups ([{ label?, items: [{ index, text }] }]), options (answer labels),
// columns (3 or 4), values (answer per question index), onAnswer(index, value), required,
// submitLabel, onSubmit().
import { Fragment } from "preact";
import Button from "../ui/Button.jsx";

export default function Questionnaire({
  id,
  groups,
  options,
  columns,
  values,
  onAnswer,
  required = false,
  submitLabel = "See my result",
  onSubmit,
}) {
  function submit(event) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form id={id} onSubmit={submit}>
      {groups.map((group, groupIndex) => (
        <Fragment key={group.label || groupIndex}>
          {group.label ? <h4 class="am-cat">{group.label}</h4> : null}
          {group.items.map((question) => (
            <div key={question.index} class={`am-q ${columns === 3 ? "am-q-row" : ""}`.trim()}>
              <p>{question.text}</p>
              <div class={`am-opts am-opts-${columns}`}>
                {options.map((option, value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={`${id}-q${question.index}`}
                      value={value}
                      checked={values[question.index] === value}
                      required={required}
                      onChange={() => onAnswer(question.index, value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </Fragment>
      ))}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
