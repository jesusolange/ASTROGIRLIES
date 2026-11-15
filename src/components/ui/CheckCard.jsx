// The one check card frame. It owns the save button, the inline error and focus, the result screen,
// the slide out, and the undo toast. A card supplies its body and its validation.
//
// Card module shape (src/components/<section>/cards.js):
//   { id, topic, title, reference, illustration,
//     Component({ form, onSaved })   // renders the fields; form = { values, set, errorFor, fieldRef }
//     save(values) -> { error: { field, message } } | { result: { level, saw, todo, toast? }, undo }
//     isDone() -> boolean }
// A card may also save by itself and call onSaved(result, undo).
import "./kit.css";
import { useId, useRef, useState } from "preact/hooks";
import Button from "./Button.jsx";
import LevelBadge from "./LevelBadge.jsx";
import { toast } from "../../lib/ui.js";

const REDUCED = () => typeof window !== "undefined" && window.matchMedia
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function CheckCard({ card, onDone }) {
  const titleId = `ui-card-title-${useId()}`;
  const [values, setValues] = useState(() => ({ ...(card.initialValues || {}) }));
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const refs = useRef({});
  const timer = useRef(null);

  const Component = card.Component;
  const guide = Boolean(card.reference);

  const form = {
    values,
    set(name, value) {
      setValues((old) => ({ ...old, [name]: value }));
      setError((old) => (old && old.field === name ? null : old));
    },
    errorFor(name) {
      return error && error.field === name ? error.message : undefined;
    },
    fieldRef(name) {
      return (element) => { refs.current[name] = element; };
    }
  };

  function showResult(next, undo) {
    if (!next) return;
    setResult(next);
    toast({ text: next.toast || `${card.title} recorded.`, undo });
  }

  function save() {
    if (typeof card.save !== "function") return;
    let outcome;
    try {
      outcome = card.save(values);
    } catch (cause) {
      outcome = { error: { field: cause && cause.field, message: (cause && cause.message) || "Check the answer and try again." } };
    }
    if (!outcome) return;
    if (outcome.error) {
      setError(outcome.error);
      const field = refs.current[outcome.error.field];
      if (field && typeof field.focus === "function") field.focus();
      return;
    }
    showResult(outcome.result, outcome.undo);
  }

  function next() {
    if (leaving) return;
    setLeaving(true);
    const wait = REDUCED() ? 0 : 190;
    timer.current = setTimeout(() => onDone?.(card), wait);
  }

  return (
    <article class={`ui-card ${leaving ? "is-leaving" : ""}`.trim()} aria-labelledby={titleId}>
      <header class="ui-card-head">
        <h2 class="ui-card-title" id={titleId}>{card.title}</h2>
        {card.illustration ? (
          <div class="ui-card-art" aria-hidden="true">
            {typeof card.illustration === "string"
              ? <img src={card.illustration} alt="" loading="lazy" decoding="async" />
              : card.illustration}
          </div>
        ) : null}
      </header>

      {result ? (
        <div class="ui-card-result" role="status">
          <LevelBadge level={result.level} />
          <p class="ui-card-saw">{result.saw}</p>
          <p class="ui-card-todo"><b>Do this:</b> {result.todo}</p>
        </div>
      ) : (
        <div class="ui-card-body">
          <Component form={form} onSaved={showResult} />
        </div>
      )}

      <footer class="ui-card-foot">
        {result ? (
          <Button onClick={next}>Next</Button>
        ) : guide ? (
          <Button variant="soft" onClick={() => onDone?.(card)}>Back to checks</Button>
        ) : typeof card.save === "function" ? (
          <Button onClick={save}>Save</Button>
        ) : null}
      </footer>
    </article>
  );
}
