import { COMM, PLACES } from "../../scripts/environment.js";
import TransitIcon from "./TransitIcon.jsx";

export default function MessageDelay({ place }) {
  const delay = COMM[place];
  if (!delay) return null;
  return (
    <div class="env-comm">
      <h4>📡 Message delay to Earth: <b>{delay.t}</b></h4>
      <div class="env-comm-viz" aria-hidden="true">
        <span>🌍</span>
        <div class="env-comm-line"><i style={{ animationDuration: `${Math.max(1.2, delay.bar / 14)}s` }} /></div>
        <span>{place === "transit" ? <TransitIcon /> : PLACES[place].icon}</span>
      </div>
      <div class="env-comm-nums">
        <div><small>One way</small><b>{delay.one}</b></div>
        <div><small>Answer back</small><b>{delay.rt}</b></div>
      </div>
      <p>{delay.tip}</p>
    </div>
  );
}
