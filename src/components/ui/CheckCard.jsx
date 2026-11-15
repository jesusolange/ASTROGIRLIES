// The one check card frame. It owns the save button, the inline error and focus, the result screen,
// the slide out, and the undo toast. A card supplies its body and its validation.
//
// Card module shape (src/components/<section>/cards.js):
//   { id, topic, title, reference, illustration,
//     Component({ form, onSaved })   // renders the fields; form = { values, set, errorFor, fieldRef }
//     save(values) -> { error: { field, message } } | { result, undo }
//     isDone() -> boolean,
//     summary() -> string,  // optional: what was recorded today, shown in "Done for today"
//     Aside({ form, result }) // optional: visuals in their own container to the right of the card
//   }
// Component also receives onDone(): a card logged several times a day calls it from "Done for now"
// to leave without a result; the deck moves on and the card stays due.
// result = { level, saw, todo, toast?, actions?: [{ label, onClick, variant? }], body?: node }
//   level null hides the badge; body replaces saw and todo; actions render as buttons under the result.
// A card may also save by itself and call onSaved(result, undo).
import "./kit.css";
import { useEffect, useId, useRef, useState } from "preact/hooks";
import Button from "./Button.jsx";
import { FieldTooltipContext } from "./Field.jsx";
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
  const resultRef = useRef(null);

  const Component = card.Component;
  const guide = Boolean(card.reference);

  useEffect(() => {
    if (result && resultRef.current) resultRef.current.focus();
  }, [result]);

  function nativeField(name) {
    const field = refs.current[name];
    return field && typeof field.setCustomValidity === "function" ? field : null;
  }

  const form = {
    values,
    set(name, value) {
      setValues((old) => ({ ...old, [name]: value }));
      setError((old) => (old && old.field === name ? null : old));
      const field = nativeField(name);
      if (field) field.setCustomValidity("");
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
    const restore = typeof undo === "function"
      ? () => {
          setError(null);
          setResult(null);
          undo();
        }
      : null;
    toast({ text: next.toast || `${card.title} recorded.`, undo: restore });
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
      if (field && typeof field.setCustomValidity === "function") {
        field.setCustomValidity(outcome.error.message || "Check the answer and try again.");
        if (typeof field.reportValidity === "function") field.reportValidity();
      }
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

  const Aside = card.Aside;
  const body = result ? (
    <div class="ui-card-result" role="status" tabIndex={-1} ref={resultRef}>
      {result.level ? <LevelBadge level={result.level} /> : null}
      {result.body ? result.body : (
        <>
          {result.saw ? <p class="ui-card-saw">{result.saw}</p> : null}
          {result.todo ? <p class="ui-card-todo"><b>Do this:</b> {result.todo}</p> : null}
        </>
      )}
      {result.actions && result.actions.length ? (
        <div class="ui-card-actions">
          {result.actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant || "primary"}
              onClick={() => {
                onDone?.(card);
                action.onClick?.();
              }}
            >{action.label}</Button>
          ))}
        </div>
      ) : null}
    </div>
  ) : (
    <div class="ui-card-body">
      <FieldTooltipContext.Provider value={true}>
        <Component form={form} onSaved={showResult} onDone={next} />
      </FieldTooltipContext.Provider>
    </div>
  );

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

      <div class={`ui-card-main ${Aside ? "has-aside" : ""}`.trim()}>
        {body}
        {Aside ? (
          <aside class="ui-card-aside" aria-label={`${card.title}: overview`}>
            <Aside form={form} result={result} />
          </aside>
        ) : null}
      </div>

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
