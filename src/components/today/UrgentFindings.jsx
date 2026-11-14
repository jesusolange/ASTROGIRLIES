export default function UrgentFindings({ findings, emergencies }) {
  if (!findings.length) return null;
  return (
    <section class="am-panel td-urgent">
      <h3>Needs attention now</h3>
      {findings.map((finding, index) => (
        <article class="td-urgent-row" key={`${finding.title}-${index}`}>
          <div>
            <b>{finding.title}</b>
            <p>{finding.saw}</p>
            <p class="td-todo">{finding.todo}</p>
          </div>
          {emergencies && (
            <button type="button" class="am-btn" onClick={() => window.AstroMedNav.show("emergencies")}>Open Emergencies</button>
          )}
        </article>
      ))}
    </section>
  );
}
