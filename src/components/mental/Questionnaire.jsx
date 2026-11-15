// One questionnaire: each question is a row of radio choices, grouped as the section needs.
// Props: groups ([{ label?, items: [{ index, text }] }]), options (answer labels), columns (3 or 4),
// answers (one value per question index), onAnswer(index, value), error (message), optionRef(name) for focus.
import { Fragment } from "preact";
import { useId } from "preact/hooks";

export default function Questionnaire({ groups, options, columns = 4, answers, onAnswer, error, optionRef }) {
  const base = useId();
  const firstMissing = answers.findIndex((value) => value == null);

  return (
    <div class="mh-questionnaire">
      {error ? <p class="ui-field-error mh-q-error" role="alert">{error}</p> : null}
      {groups.map((group, groupIndex) => (
        <Fragment key={group.label || groupIndex}>
          {group.label ? <h4 class="mh-cat">{group.label}</h4> : null}
          {group.items.map((question) => (
            <div class={`mh-q ${columns === 3 ? "mh-q-row" : ""}`.trim()} key={question.index}>
              <p>{question.text}</p>
              <div class={`mh-opts mh-opts-${columns}`}>
                {options.map((option, value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={`${base}-q${question.index}`}
                      value={value}
                      checked={answers[question.index] === value}
                      onChange={() => onAnswer(question.index, value)}
                      ref={question.index === firstMissing && value === 0 ? optionRef : undefined}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
