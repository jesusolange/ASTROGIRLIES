import { stats } from "../../scripts/missions.js";

export default function StreakStrip({ missions, readiness }) {
  const state = {
    ...missions,
    done: { ...(missions.done || {}) },
    auto: { ...(missions.auto || {}) }
  };
  const { streak } = stats(state);
  return (
    <section class="am-panel td-strip">
      <div class="td-stat">
        <small>Streak</small>
        <b>{streak} day{streak === 1 ? "" : "s"}</b>
      </div>
      <div class="td-stat">
        <small>Today</small>
        <b>{readiness.covered} / {readiness.due} checks done</b>
      </div>
    </section>
  );
}
