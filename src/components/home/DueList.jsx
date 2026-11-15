import { ratingOf, reasonFor } from "../../scripts/home.js";
import { openCard } from "../../lib/nav.js";

export default function DueList({ queue }) {
  return (
    <section class="ui-panel home-due">
      <h2>Due today</h2>
      <div class="home-queue">
        {queue.map((item, index) => (
          <article class="home-q" key={item.vo2 ? "vo2" : item.area.key}>
            <div class="home-q-rank" aria-hidden="true">{index + 1}</div>
            <div class="home-q-main">
              <b>{item.check.label}</b>
              <span>
                {item.vo2 ? "Fitness" : `${item.area.area} · NASA rating ${ratingOf(item.area)} · weight ${Math.round(item.area.weight * 100)}%`}
              </span>
              <p>{reasonFor(item)}</p>
            </div>
            <button type="button" class="ui-btn ui-btn-soft" onClick={() => openCard(item.check.route)}>Open check</button>
          </article>
        ))}
      </div>
      {!queue.length && <p class="home-note">Nothing is due today. Every scheduled check has recent data.</p>}
      <p class="home-note">
        Higher NASA ratings come back more often: rating 16 or above every day, 9 to 15 every 2 days, below 9
        every week. This interval table is our design choice, not a NASA rule.
      </p>
    </section>
  );
}
