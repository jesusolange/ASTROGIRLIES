import { openEmergency } from "../../lib/nav.js";
import CardIcon from "./CardIcon.jsx";
import Icon from "../ui/Icon.jsx";

export default function VitalEntry({ active, onFocus }) {
  return (
    <section class={`emg-vital${active ? " is-active" : ""}`} aria-label="Vital signs">
      <button type="button" class="emg-vital-main" onClick={() => openEmergency("vitals")} onFocus={onFocus}>
        <span class="emg-vital-icon"><CardIcon name="vitals" /></span>
        <span class="emg-vital-text">
          <b>Check vital signs</b>
          <small>Reference values and a quick check you can do now.</small>
        </span>
        <Icon name="next" size={20} className="emg-vital-go" />
      </button>
    </section>
  );
}
