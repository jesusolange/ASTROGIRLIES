import { cardForFinding } from "../../scripts/today.js";

function openGuide(card) {
  const emergencies = window.AstroMedEmergencies;
  if (card && emergencies && typeof emergencies.open === "function" && emergencies.open(card)) return;
  window.AstroMedNav.show("emergencies");
}

export default function UrgentFindings({ findings, emergencies }) {
  if (!findings.length) return null;
  return (
    <section class="am-panel td-urgent">
      <h3>Needs attention now</h3>
      {findings.map((finding, index) => {
        const card = cardForFinding(finding);
        return (
          <article class="td-urgent-row" key={`${finding.title}-${index}`}>
            <div>
              <b>{finding.title}</b>
              <p>{finding.saw}</p>
              <p class="td-todo">{finding.todo}</p>
            </div>
            {card ? (
              <button type="button" class="am-btn" onClick={() => openGuide(card)}>Open the emergency guide</button>
            ) : emergencies ? (
              <button type="button" class="am-btn" onClick={() => openGuide(null)}>Open Emergencies</button>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
