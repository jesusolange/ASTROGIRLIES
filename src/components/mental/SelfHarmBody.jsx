// The immediate response to thoughts of self-harm, shown as the result itself.
// The medic's card supplies the title, the sign and the escalation list; the steps are worded by crew and link.
import { selfHarmContent } from "../../scripts/mental.js";
import Steps from "../ui/Steps.jsx";

export default function SelfHarmBody() {
  const content = selfHarmContent();
  return (
    <div class="mh-urgent" role="alert">
      <p class="mh-urgent-kicker">Immediate response</p>
      <h3>{content.title}</h3>
      <p>{content.sign}. You answered that you have had thoughts of being better off dead or of hurting yourself.</p>
      <h4 class="mh-urgent-title">Do this now</h4>
      <Steps items={content.steps} ariaLabel="What to do now" />
      {content.escalate.length ? (
        <>
          <h4 class="mh-urgent-title">Treat it as an emergency now if</h4>
          <ul class="mh-urgent-list">{content.escalate.map((line) => <li key={line}>{line}</li>)}</ul>
        </>
      ) : null}
    </div>
  );
}
