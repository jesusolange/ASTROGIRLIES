import { badges, doneSet, stats, titleOf, today, TASKS } from "../../scripts/missions.js";

export default function PointsStrip({ missions, save }) {
  const state = {
    ...missions,
    done: { ...(missions.done || {}) },
    auto: { ...(missions.auto || {}) }
  };
  const st = stats(state);
  const done = doneSet(state, today());
  const earned = badges(state, st).filter((badge) => badge.on);

  const toggle = (taskId, checked) => {
    const day = today();
    const set = new Set((missions.done && missions.done[day]) || []);
    checked ? set.add(taskId) : set.delete(taskId);
    save({ ...missions, done: { ...(missions.done || {}), [day]: [...set] } });
  };

  return (
    <>
      <section class="am-panel td-strip">
        <div class="td-stat"><small>Points</small><b>{st.total}</b></div>
        <div class="td-stat"><small>Level {st.level}</small><b>{titleOf(st.level)}</b></div>
        <div class="td-stat"><small>Streak</small><b>{st.streak} day{st.streak === 1 ? "" : "s"}</b></div>
        <div class="td-stat"><small>This week</small><b>{Math.round(st.thisWk)}%</b></div>
        <div class="td-badges">
          {earned.length
            ? earned.map((badge) => <span class="td-badge" key={badge.n}>{badge.n}</span>)
            : <span class="td-note">Badges appear as you build a streak.</span>}
        </div>
      </section>

      <details class="am-panel td-routine">
        <summary>Daily routine and points</summary>
        <p class="td-note">These crew-day tasks still count points and your streak when you tick them.</p>
        <div class="td-routine-list">
          {TASKS.filter((task) => !task.auto).map((task) => (
            <label class="td-routine-row" key={task.id}>
              <input type="checkbox" checked={done.has(task.id)} onChange={(event) => toggle(task.id, event.currentTarget.checked)} />
              <span><b>{task.t}</b><small>{task.d}</small></span>
              <em>+{task.pts}</em>
            </label>
          ))}
        </div>
      </details>
    </>
  );
}
