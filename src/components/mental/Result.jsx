// One saved screening result: the urgent response when flagged, then the score and what to do.
// Props: entry (a row from mental.js history()), onOpenEmergencies.
import { guideFor, resultLabel, resultLevel } from "../../scripts/mental.js";
import UrgentResponse from "./UrgentResponse.jsx";

export default function Result({ entry, onOpenEmergencies }) {
  const guide = guideFor(entry);
  return (
    <>
      {entry.flagged ? <UrgentResponse onOpen={onOpenEmergencies} /> : null}
      <div class={`am-result am-${resultLevel(entry)} mh-result`}>
        <strong>{entry.score} / {entry.max} · {resultLabel(entry)}</strong>
        <p class="mh-meaning">{guide.meaning}</p>
        <h4 class="mh-todo-title">What to do</h4>
        <ul class="mh-todo">
          {guide.todo.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p class="mh-fine">Screening aid, not a diagnosis. The score bands are this prototype's design choice.</p>
      </div>
    </>
  );
}
