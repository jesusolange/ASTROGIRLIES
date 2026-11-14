// The immediate response to thoughts of self-harm. Shown above the result, whatever the score.
// Props: onOpen (opens the Emergencies section).
import { SUICIDAL_RESPONSE } from "../../scripts/mental.js";
import Button from "../ui/Button.jsx";

const hasEmergencies = () => Boolean(window.AstroMedNav && document.getElementById("emergenciesPage"));

export default function UrgentResponse({ onOpen }) {
  return (
    <div class="mh-urgent" role="alert">
      <p class="mh-urgent-kicker">Immediate response</p>
      <h3>{SUICIDAL_RESPONSE.title}</h3>
      <p>{SUICIDAL_RESPONSE.text}</p>
      {hasEmergencies() ? (
        <Button variant="danger" className="mh-urgent-btn" onClick={onOpen}>
          {SUICIDAL_RESPONSE.button}
        </Button>
      ) : null}
    </div>
  );
}
