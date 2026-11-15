// A questionnaire form. Each question is one row of radio choices, grouped as the section needs.
// Props: id (form id), groups ([{ label?, items: [{ index, text }] }]), options (answer labels),
// columns (3 or 4), values (answer per question index), onAnswer(index, value), required,
// submitLabel, onSubmit().
import { Fragment } from "preact";
import { useRef, useState } from "preact/hooks";
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
  const [errorIndex, setErrorIndex] = useState(null);
  const firstOption = useRef([]);

  function answer(index, value) {
    if (errorIndex === index) setErrorIndex(null);
    onAnswer(index, value);
  }

  function submit(event) {
    event.preventDefault();
    if (required) {
      const missing = values.findIndex((value) => value == null);
      if (missing >= 0) {
        setErrorIndex(missing);
        firstOption.current[missing]?.focus();
        return;
      }
    }
    setErrorIndex(null);
    onSubmit();
  }

  return (
    <form id={id} onSubmit={submit} noValidate>
      {groups.map((group, groupIndex) => (
        <Fragment key={group.label || groupIndex}>
          {group.label ? <h4 class="am-cat">{group.label}</h4> : null}
          {group.items.map((question) => (
            <Fragment key={question.index}>
              <div class={`am-q ${columns === 3 ? "am-q-row" : ""}`.trim()}>
                <p>{question.text}</p>
                <div class={`am-opts am-opts-${columns}`}>
                  {options.map((option, value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name={`${id}-q${question.index}`}
                        value={value}
                        checked={values[question.index] === value}
                        aria-invalid={errorIndex === question.index}
                        ref={value === 0 ? (element) => { firstOption.current[question.index] = element; } : undefined}
                        onChange={() => answer(question.index, value)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              {errorIndex === question.index
                ? <p class="ui-field-error" role="alert">Choose an answer for this question.</p>
                : null}
            </Fragment>
          ))}
        </Fragment>
      ))}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
