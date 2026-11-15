import { emergencyForFinding, isUrgent } from "../../scripts/home.js";
import { alsoTell } from "../../scripts/mission.js";
import { openEmergency } from "../../lib/nav.js";

export default function AttentionList({ findings }) {
  if (!findings.length) return null;
  return (
    <section class="ui-panel home-attention">
      <h2>Needs attention</h2>
      {findings.map((finding, index) => {
        const emergency = emergencyForFinding(finding);
        const tell = finding.tell ? alsoTell("the flight surgeon") : "";
        return (
          <article class="home-attention-row" key={`${finding.title}-${index}`}>
            <div class="home-attention-head">
              <b>{finding.title}</b>
              <span class={`home-tag ${isUrgent(finding) ? "home-tag-urgent" : "home-tag-warn"}`}>
                {isUrgent(finding) ? "Urgent" : "Warning"}
              </span>
            </div>
            <p>{finding.saw}</p>
            <p class="home-attention-todo">{finding.todo}{tell ? ` ${tell}` : ""}</p>
            {emergency
              ? <button type="button" class="home-emergency" onClick={() => openEmergency(emergency)}>Open the emergency card</button>
              : null}
          </article>
        );
      })}
    </section>
  );
}
