import { ratingOf, reasonFor } from "../../scripts/today.js";

export default function QueueList({ queue, onOpen }) {
  return (
    <section class="am-panel">
      <h3>Due today</h3>
      <div class="td-queue">
        {queue.map((item, index) => (
          <article class="td-q" key={item.area.key}>
            <div class="td-q-rank" aria-hidden="true">{index + 1}</div>
            <div class="td-q-main">
              <b>{item.check.label}</b>
              <span>{item.area.area} · NASA rating {ratingOf(item.area)} · weight {Math.round(item.area.weight * 100)}%</span>
              <p>{reasonFor(item)}</p>
            </div>
            <button type="button" class="am-btn" onClick={() => onOpen(item.area)}>Open check</button>
          </article>
        ))}
      </div>
      {!queue.length && <p class="td-note">Nothing is due today. Every scheduled check has recent data.</p>}
      <p class="td-note">Higher NASA ratings come back more often: rating 16 or above every day, 9 to 15 every 2 days, below 9 every week. This interval table is our design choice, not a NASA rule.</p>
    </section>
  );
}
