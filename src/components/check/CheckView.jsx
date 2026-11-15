// The Check deck: due cards as a stack, one card at a time, plus guide cards below.
import { useEffect, useMemo, useState } from "preact/hooks";
import { go, openCard, route } from "../../lib/nav.js";
import CheckCard from "../ui/CheckCard.jsx";
import Icon from "../ui/Icon.jsx";
import {
  allCards, deckProgress, dueCards, findCard, guideCards, orderCards, recordedCards
} from "./deck.js";
import "../ui/ui.css";
import "./check.css";

export default function CheckView() {
  const [revision, setRevision] = useState(0);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!window.AstroMedStore || !window.AstroMedStore.store) return undefined;
    return window.AstroMedStore.store.subscribe(() => setRevision((value) => value + 1));
  }, []);

  const cards = useMemo(() => orderCards(allCards()), [revision]);
  const due = useMemo(() => dueCards(cards), [cards]);
  const guides = useMemo(() => guideCards(cards), [cards]);
  const recorded = useMemo(() => recordedCards(cards), [cards]);
  const progress = useMemo(() => deckProgress(cards), [cards]);

  const routeId = route.value.id;
  const opened = routeId ? findCard(cards, routeId) : null;
  const active = opened || (activeId ? findCard(cards, activeId) : null);

  useEffect(() => {
    setActiveId(null);
  }, [routeId]);

  useEffect(() => {
    if (routeId || activeId || !due.length) return;
    setActiveId(due[0].id);
  }, [routeId, activeId, due]);

  function finish() {
    setActiveId(null);
    if (routeId) go("#/check");
  }

  if (opened) {
    return (
      <div class="ck-wrap">
        <nav class="ck-back"><button type="button" class="ck-back-btn" onClick={finish}>{"\u2190"} All checks</button></nav>
        <CheckCard card={opened} onDone={finish} />
      </div>
    );
  }

  return (
    <div class="ck-wrap">
      <header class="ck-head">
        <h1>Check</h1>
        <p>One card at a time. Save records it for today.</p>
      </header>

      {progress.total > 0 ? (
        <p class="ck-count" aria-live="polite">{progress.recorded} of {progress.total} recorded today</p>
      ) : null}

      {active ? (
        <div class="ck-stack">
          <span class="ck-stack-layer ck-stack-two" aria-hidden="true" />
          <span class="ck-stack-layer ck-stack-one" aria-hidden="true" />
          <CheckCard card={active} onDone={finish} />
        </div>
      ) : progress.total > 0 && due.length === 0 ? (
        <section class="ck-done">
          <Icon name="checkmark" size={22} />
          <h2>Done for today</h2>
          <p>{recorded.length === progress.total ? "Every check is recorded for today." : "All checks due today are recorded."}</p>
          <ul class="ck-done-list">
            {recorded.map((card) => (
              <li key={card.id}>
                <button type="button" class="ck-done-link" onClick={() => openCard(card.id)}>{card.title}</button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section class="ck-done">
          <h2>No checks are set up yet</h2>
          <p>Checks appear here as cards once they are added.</p>
        </section>
      )}

      {guides.length ? (
        <section class="ck-guides">
          <h2>Guides</h2>
          <p class="ck-guides-note">Reference cards. They explain, and they are not recorded.</p>
          <ul class="ck-guide-list">
            {guides.map((card) => (
              <li key={card.id}>
                <button type="button" class="ck-guide" onClick={() => openCard(card.id)}>
                  <span class="ck-guide-title">{card.title}</span>
                  <Icon name="next" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
