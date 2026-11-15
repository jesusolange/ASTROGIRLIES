import { useEffect, useRef } from "preact/hooks";
import { rankedRisks, SOURCE } from "../../scripts/risks.js";
import { BANDS, COVERAGE_MIN, MENTAL_DAYS, RECENT_DAYS } from "../../scripts/readiness.js";
import { topicFor } from "../../data/topics.js";
import { checkForTopic, ratingOf } from "../../scripts/home.js";
import { openCard } from "../../lib/nav.js";
import SourceLink from "../ui/SourceLink.jsx";

const MISSING = { ops: "Not rated for this mission", lth: "Not rated" };

function RateCell({ side, missing }) {
  if (!side) return <b class="home-chip home-none">{missing}</b>;
  return (
    <>
      <b class={`home-chip home-${side.colour || "none"}`}>{side.l} {"\u00d7"} {side.c}</b>
      {side.disposition ? <em>{side.disposition}</em> : null}
    </>
  );
}

function Watch({ risk }) {
  const topic = topicFor(risk.id);
  const check = risk.monitored && topic ? checkForTopic(topic.id) : null;
  if (!check) return <span class="home-unwatched">Not monitored yet</span>;
  return <button type="button" class="home-watch-btn" onClick={() => openCard(check.route)}>Open check</button>;
}

function RiskRow({ risk, rank }) {
  return (
    <li class="home-risk">
      <div class="home-risk-main">
        <span class="home-risk-rank" aria-hidden="true">{rank}</span>
        <div class="home-risk-copy">
          <b>{risk.short}</b>
          <p class="home-risk-name">{risk.title}</p>
          <p class="home-risk-meta">
            <span>Last published {risk.published || "date not given"}</span>
            <SourceLink href={risk.url}>NASA source</SourceLink>
          </p>
        </div>
      </div>
      <div class="home-rates">
        <span class="home-rates-label">In mission</span>
        <span class="home-rates-cell"><RateCell side={risk.ops} missing={MISSING.ops} /></span>
        <span class="home-rates-label">Long-term health</span>
        <span class="home-rates-cell"><RateCell side={risk.lth} missing={MISSING.lth} /></span>
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
      </div>
    </dialog>
  );
}
