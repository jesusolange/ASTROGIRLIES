import { useMemo } from "preact/hooks";
import { buildOverview } from "../../scripts/exercise-overview.js";
import WeeklyActivity from "./WeeklyActivity.jsx";
import Panel from "../ui/Panel.jsx";

const fixed = (number) => Number(number.toFixed(2));

export default function ExerciseOverview({ sessions }) {
  const data = useMemo(() => buildOverview(sessions), [sessions]);
  const effort = data.effort == null ? "—" : `${data.effort.toFixed(1)} / 10`;

  return (
    <section id="exerciseOverview" class="exo-overview">
      <div class="exo-heading">
        <div>
          <h2>Exercise &amp; Recovery Overview</h2>
          <p>Your training and recovery this week.</p>
        </div>
        <span>Last 7 days</span>
      </div>

      <div class="exo-stats">
        <article><span>Training time</span><strong>{Math.round(data.totalMinutes)} min</strong><small>Last 7 days</small></article>
        <article><span>Sessions</span><strong>{data.currentCount}</strong><small>Last 7 days</small></article>
        <article><span>Average effort</span><strong>{effort}</strong><small>0 = easy, 10 = very hard</small></article>
      </div>

      <div class="exo-columns">
        <Panel title="Training activity" className="exo-panel">
          <p class="exo-sub">Minutes each day</p>
          <WeeklyActivity days={data.days} peak={data.peak} />
          <p class="exo-comparison">
            {data.comparison
              ? `Compared with the previous 7 days: ${data.comparison.difference >= 0 ? "+" : "−"}${data.comparison.percentage}% training time (${Math.round(data.comparison.previousMinutes)} → ${Math.round(data.comparison.totalMinutes)} min).`
              : "No previous-week training data available for comparison yet."}
          </p>
          <div class="exo-machines">
            {data.machines.map((machine) => (
              <div key={machine.type} class={`exo-mc ${machine.count ? "on" : ""}`}>
                <img src={`/assets/exercise/${machine.type}.png`} alt="" loading="lazy" />
                <b>{machine.name}</b>
                <small>{machine.count} session{machine.count === 1 ? "" : "s"} · {machine.mins} min</small>
                <span class="exo-mbar"><i style={{ width: `${machine.share}%` }} /></span>
              </div>
            ))}
          </div>
          <h4>Progress</h4>
          <div class="exo-performance">
            {data.performance.length
              ? data.performance.map((row) => (
                <p key={row.label}>
                  {row.label}: {fixed(row.from)} → {fixed(row.to)} {row.unit} ({row.difference >= 0 ? "+" : ""}{fixed(row.difference)}). Compare duration, effort and conditions too.
                </p>
              ))
              : <p>Record at least two comparable sessions on the same equipment to see performance differences.</p>}
          </div>
        </Panel>

        <Panel title="Tips for you" className="exo-panel">
          <p class="exo-sub">Tips from your own training</p>
          <div class="exo-advice">
            {data.insights.map((insight) => (
              <div key={insight.title} class={`exo-insight ${insight.review ? "review" : ""}`}>
                <strong>{insight.title}</strong>
                <p>{insight.message}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <p class="exo-disclaimer">
        Research prototype. Uses manually saved training records, not sensor-verified data.
        These observations are not diagnoses, medical alerts or prescribed training changes.
        Follow approved mission protocols.
      </p>
    </section>
  );
}
