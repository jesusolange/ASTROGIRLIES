// The Check deck: due cards as a stack, one card at a time, plus guide cards below.
import { useEffect, useMemo, useState } from "preact/hooks";
import { go, openCard, route } from "../../lib/nav.js";
import CheckCard from "../ui/CheckCard.jsx";
import Icon from "../ui/Icon.jsx";
import SearchOverlay from "../ui/SearchOverlay.jsx";
import {
  allCards, cardGroups, cardsForTopic, deckProgress, dueCards, findCard, guideCards, orderCards,
  recordedCards
} from "./deck.js";
import "../ui/ui.css";
import "./check.css";

export default function CheckView() {
  const [revision, setRevision] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [passed, setPassed] = useState([]);

  useEffect(() => {
    if (!window.AstroMedStore || !window.AstroMedStore.store) return undefined;
    return window.AstroMedStore.store.subscribe(() => setRevision((value) => value + 1));
  }, []);

  const cards = useMemo(() => orderCards(allCards()), [revision]);
  const due = useMemo(() => dueCards(cards), [cards]);
  const guides = useMemo(() => guideCards(cards), [cards]);
  const recorded = useMemo(() => recordedCards(cards), [cards]);
  const progress = useMemo(() => deckProgress(cards), [cards]);
  const searchGroups = useMemo(() => cardGroups(cards), [cards]);

  const routeId = route.value.id;
  const opened = routeId ? findCard(cards, routeId) : null;
  // #/check/<topic id> runs that topic's cards, due ones first, then returns to the deck.
  const topicCards = !opened && routeId ? cardsForTopic(routeId, cards) : [];
  const topicDue = topicCards.filter((card) => due.includes(card));
  const scoped = topicCards.length > 0;
  // Cards passed in this visit (with Next or "Done for now") go to the end, so a card that is still due
  // (a meal card before dinner) does not come straight back.
  const pending = scoped ? topicDue : due;
  const queue = [
    ...pending.filter((card) => !passed.includes(card.id)),
    ...pending.filter((card) => passed.includes(card.id)).sort((a, b) => passed.indexOf(a.id) - passed.indexOf(b.id)),
  ];
  const active = opened || (activeId ? findCard(cards, activeId) : null);

  useEffect(() => {
    setActiveId(null);
  }, [routeId]);

  useEffect(() => {
    if (opened || activeId || !queue.length) return;
    setActiveId(queue[0].id);
  }, [routeId, opened, scoped, activeId, queue]);

  function finish(card) {
    if (card && card.id) setPassed((old) => [...old.filter((id) => id !== card.id), card.id]);
    setActiveId(null);
    if (opened || (scoped && topicDue.length <= 1)) go("#/check");
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
        <p>One card at a time. Save records it for today.</p>
      </header>

      <SearchOverlay
        groups={searchGroups}
        label="Search checks"
        placeholder="Search checks"
        emptyText="No check matches that search."
        onSelect={(item) => openCard(item.id)}
      />

      {progress.total > 0 ? (
        <p class="ck-count" aria-live="polite">{progress.recorded} of {progress.total} recorded today</p>
      ) : null}

      {active ? (
        <div class="ck-stack">
          <span class="ck-stack-layer ck-stack-two" aria-hidden="true" />
          <span class="ck-stack-layer ck-stack-one" aria-hidden="true" />
          <CheckCard card={active} onDone={finish} />
        </div>
      ) : progress.total > 0 && queue.length === 0 ? (
        <section class="ck-done">
          <Icon name="checkmark" size={22} />
          <h2>Done for today</h2>
          <p>{scoped ? "These checks are recorded for today." : recorded.length === progress.total ? "Every check is recorded for today." : "All checks due today are recorded."}</p>
          {scoped && due.length ? (
            <p><button type="button" class="ck-done-link" onClick={() => go("#/check")}>Continue with the other checks due today</button></p>
          ) : null}
          <ul class="ck-done-list">
            {(scoped ? recorded.filter((card) => topicCards.includes(card)) : recorded).map((card) => (
              <li key={card.id}>
                <button type="button" class="ck-done-link" onClick={() => openCard(card.id)}>{card.title}</button>
                {typeof card.summary === "function" && card.summary() ? <span class="ck-done-summary"> {card.summary()}</span> : null}
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
