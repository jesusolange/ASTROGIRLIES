// The isolation and depression questionnaire inside a check card.
// Props: form (the CheckCard form state; answers live in form.values.answers).
import { DEP_OPTS, DEP_Q } from "./questions.js";
import Questionnaire from "./Questionnaire.jsx";

const GROUPS = [{ items: DEP_Q.map((text, index) => ({ index, text })) }];

export default function DepressionCard({ form }) {
  const stored = Array.isArray(form.values.answers) ? form.values.answers : [];
  const answers = DEP_Q.map((_, index) => (stored[index] == null ? null : stored[index]));

  function answer(index, value) {
    const next = DEP_Q.map((_, i) => (i === index ? value : answers[i]));
    form.set("answers", next);
  }

  return (
    <>
      <p class="mh-lead">How often have you experienced any of the following symptoms?</p>
      <Questionnaire
        groups={GROUPS}
        options={DEP_OPTS}
        columns={4}
        answers={answers}
        onAnswer={answer}
        error={form.errorFor("answers")}
        optionRef={form.fieldRef("answers")}
      />
    </>
  );
}
