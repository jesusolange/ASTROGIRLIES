// The stress and burn-out questionnaire inside a check card.
// Props: form (the CheckCard form state; answers live in form.values.answers).
import { CATS, STRESS_OPTS, STRESS_Q } from "./questions.js";
import Questionnaire from "./Questionnaire.jsx";

const GROUPS = Object.keys(CATS).map((cat) => ({
  label: CATS[cat],
  items: STRESS_Q.map((question, index) => ({ question, index }))
    .filter((item) => item.question[1] === cat)
    .map((item) => ({ index: item.index, text: item.question[0] }))
}));

export default function StressCard({ form }) {
  const stored = Array.isArray(form.values.answers) ? form.values.answers : [];
  const answers = STRESS_Q.map((_, index) => (stored[index] == null ? null : stored[index]));

  function answer(index, value) {
    const next = STRESS_Q.map((_, i) => (i === index ? value : answers[i]));
    form.set("answers", next);
  }

  return (
    <>
      <p class="mh-lead">How strongly do you notice these signs?</p>
      <Questionnaire
        groups={GROUPS}
        options={STRESS_OPTS}
        columns={3}
        answers={answers}
        onAnswer={answer}
        error={form.errorFor("answers")}
        optionRef={form.fieldRef("answers")}
      />
    </>
  );
}
