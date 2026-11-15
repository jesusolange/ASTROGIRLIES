import { PLACES, labelFrom } from "../../scripts/environment.js";
import TransitIcon from "./TransitIcon.jsx";

export default function KeepInMind({ place, onRiskMap }) {
  const info = PLACES[place];
  if (!info) return null;
  return (
    <div class="env-info">
      <div class="env-facts">
        <h4>Keep in mind in {labelFrom({ place })}</h4>
        <ul>{info.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        <button type="button" class="rk-linkbtn" onClick={onRiskMap}>Mission risks for this location</button>
      </div>
      <div class="env-space" aria-hidden="true">
        {info.img ? <img src={info.img} alt="" /> : place === "transit" ? <TransitIcon className="env-space-icon" /> : <span class="env-space-emoji">{info.icon}</span>}
      </div>
    </div>
  );
}
