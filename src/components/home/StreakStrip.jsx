import { useEffect, useMemo, useRef } from "preact/hooks";
import { MAXPTS, badges, dayPoints, stats, titleOf, today } from "../../scripts/rewards.js";
import { toast } from "../../lib/ui.js";

const R = 42;
const CIRC = 2 * Math.PI * R;

function Ring({ done, due }) {
  const share = due ? done / due : 0;
  return (
    <div class="home-ring-wrap">
      <svg class="home-ring" viewBox="0 0 100 100" role="img" aria-label={`${done} of ${due} checks done today`}>
        <circle class="home-ring-track" cx="50" cy="50" r={R} />
        <circle
          class="home-ring-fill"
          cx="50" cy="50" r={R}
          stroke-dasharray={`${CIRC * share} ${CIRC}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div class="home-ring-label">
        <b>{done} / {due}</b>
        <small>checks done</small>
      </div>
    </div>
  );
}

export default function StreakStrip({ missions, readiness }) {
  const state = useMemo(() => ({
    ...missions,
    done: { ...(missions.done || {}) },
    auto: { ...(missions.auto || {}) },
    vo2: missions.vo2 || []
  }), [missions]);

  const st = stats(state);
  const points = dayPoints(state, today());
  const earned = badges(state, st).filter((badge) => badge.on);
  const badgeKey = earned.map((badge) => badge.n).join("|");
  const previous = useRef(null);

  useEffect(() => {
    const current = { points, level: st.level, badgeKey };
    const prior = previous.current;
    previous.current = current;
    if (!prior) return;
    if (current.level > prior.level) toast(`Level ${current.level}: ${titleOf(current.level)}.`);
    else if (current.points > prior.points) toast(`${current.points} points today.`);
    const fresh = earned.filter((badge) => !prior.badgeKey.split("|").includes(badge.n));
    if (fresh.length) toast(`Badge earned: ${fresh.map((badge) => badge.n).join(", ")}.`);
  }, [points, st.level, badgeKey]);

  return (
    <section class="ui-panel home-strip">
      <div class="home-strip-streak">
        <small>Streak</small>
        <b>{st.streak} day{st.streak === 1 ? "" : "s"}</b>
        <span>in a row with the day's checks done</span>
      </div>

      <Ring done={readiness.covered} due={readiness.due} />

      <div class="home-strip-rewards">
        <div class="home-stat">
          <small>Today's points</small>
          <b>{points} / {MAXPTS}</b>
        </div>
        <div class="home-stat">
          <small>Level</small>
          <b>{st.level} · {titleOf(st.level)}</b>
        </div>
        <div class="home-badges">
          <small>Badges earned</small>
          {earned.length
            ? <ul>{earned.map((badge) => <li class="home-badge" key={badge.n}>{badge.n}</li>)}</ul>
            : <span>No badge yet</span>}
        </div>
      </div>
    </section>
  );
}
