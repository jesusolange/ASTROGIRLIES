import { useEffect, useRef } from "preact/hooks";
import { rankedRisks, SOURCE } from "../../scripts/risks.js";
import { BANDS, COVERAGE_MIN, MENTAL_DAYS, RECENT_DAYS } from "../../scripts/readiness.js";
import { topicFor } from "../../data/topics.js";
import { checkForTopic, ratingOf } from "../../scripts/home.js";
import { openCard } from "../../lib/nav.js";
import SourceLink from "../ui/SourceLink.jsx";

function Rating({ label, side, missing }) {
  if (!side) return <div class="home-rate"><span>{label}</span><b class="home-chip home-none">{missing}</b></div>;
  return (
    <div class="home-rate">
      <span>{label}</span>
      <b class={`home-chip home-${side.colour || "none"}`}>{side.l} {"\u00d7"} {side.c}</b>
      {side.disposition ? <em>{side.disposition}</em> : null}
    </div>
  );
}

function Watch({ risk }) {
  if (!risk.monitored) return <span class="home-unwatched">Not monitored yet</span>;
  const topic = topicFor(risk.id);
  const check = topic ? checkForTopic(topic.id) : null;
  if (!check) return <span class="home-unwatched">Not monitored yet</span>;
  return <button type="button" class="home-link" onClick={() => openCard(check.route)}>{topic.label}</button>;
}

function RiskRow({ risk, rank }) {
  return (
    <li class="home-risk">
      <div class="home-risk-rank" aria-hidden="true">{rank}</div>
      <div class="home-risk-main">
        <b>{risk.short}</b>
        <p>{risk.title}</p>
        <div class="home-risk-meta">
          <SourceLink href={risk.url}>NASA source</SourceLink>
          <span>last published {risk.published || "date not given"}</span>
        </div>
      </div>
      <div class="home-risk-ratings">
        <Rating label="In mission" side={risk.ops} missing="Not rated for this mission" />
        <Rating label="Long-term health" side={risk.lth} missing="Not rated" />
      </div>
      <div class="home-risk-watch"><Watch risk={risk} /></div>
    </li>
  );
}

export default function ScoreDialog({ open, onClose, readiness }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const risks = rankedRisks(readiness.mission.id);

  return (
    <dialog
      ref={ref}
      class="home-dialog"
      aria-labelledby="home-dialog-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
    >
      <div class="home-dialog-body">
        <div class="home-dialog-head">
          <h2 id="home-dialog-title">How this score is made</h2>
          <button type="button" class="home-dialog-close" aria-label="Close dialog" onClick={onClose}>{"\u00d7"}</button>
        </div>

        <p>
          Each topic's weight is its highest in-mission NASA risk rating for <b>{readiness.mission.label}</b>,
          scaled so the weights add to 100%. The app turns your recent data in a topic into a 0–100 result with
          its own rules. The weighted average is pulled toward the middle by the share of due topics you have not
          recorded, so a missing check can never look healthy.
        </p>
        <p>
          A score appears only when you have recorded at least {Math.round(COVERAGE_MIN * 100)}% of the due
          topics. Recent means a reading from the last {RECENT_DAYS} days, or {MENTAL_DAYS} days for mental
          health. The weights and the intervals follow NASA's ratings for the mission you chose; the mapping of
          topics to checks, the weights and these windows are our design choice. The
          {" "}<a class="home-link" href={SOURCE} target="_blank" rel="noopener noreferrer">ratings are NASA's</a>,
          from the Human Research Roadmap.
        </p>

        <div class="home-table-wrap">
          <table class="home-table">
            <thead><tr><th>Topic</th><th>NASA risk</th><th>Weight</th><th>Your data</th><th>Check</th></tr></thead>
            <tbody>
              {readiness.areas.map((area) => {
                const check = checkForTopic(area.key);
                return (
                  <tr key={area.key}>
                    <td><b>{area.area}</b></td>
                    <td>
                      {area.risk
                        ? <><a class="home-link" href={area.risk.url} target="_blank" rel="noopener noreferrer">{area.risk.short}</a> <span>{ratingOf(area)}</span></>
                        : <span>–</span>}
                    </td>
                    <td>{Math.round(area.weight * 100)}%</td>
                    <td>{area.data ? Math.round(area.data.score) : "no recent data"}</td>
                    <td>{check ? <button type="button" class="home-link" onClick={() => openCard(check.route)}>Open</button> : "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div class="home-bands">
          {BANDS.map((band, index) => (
            <span class={`home-band home-tone-${band.key}`} key={band.key}>
              <b>{band.title}</b> {band.min}–{index === 0 ? 100 : BANDS[index - 1].min - 1}
            </span>
          ))}
        </div>

        <h3 class="home-why-title">Why this order</h3>
        <p>
          All 22 NASA human health risks for <b>{readiness.mission.label}</b>, highest in-mission rating first.
          Choosing the mission in the profile changes the order. A risk with no topic has no check yet.
        </p>
        <ol class="home-risks">
          {risks.map((risk, index) => <RiskRow key={risk.id} risk={risk} rank={index + 1} />)}
        </ol>

        <p class="home-note">This is a screening and self-monitoring aid, not a medical device and not a diagnosis. A rating is not a prediction for you.</p>
      </div>
    </dialog>
  );
}
