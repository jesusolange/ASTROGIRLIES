import { openCard } from "../../lib/nav.js";
import { VITALS_REFERENCE } from "../../data/emergencies.js";
import CardIcon from "./CardIcon.jsx";
import RangeBar from "./RangeBar.jsx";

export default function VitalEntry({ active, onFocus }) {
  return (
    <section class={`emg-vital${active ? " is-active" : ""}`} aria-label="Vital signs">
      <button type="button" class="emg-vital-main" onClick={() => openCard("vitals")} onFocus={onFocus}>
        <span class="emg-vital-icon"><CardIcon name="vitals" /></span>
        <span class="emg-vital-text">
          <b>Check vital signs</b>
          <small>Pulse, breathing, oxygen and temperature, judged as you type.</small>
        </span>
      </button>
      <div class="emg-vital-ref">
        <b>Reference values</b>
        {VITALS_REFERENCE.bars.map((bar) => <RangeBar bar={bar} key={bar.label} />)}
        <div class="emg-chips">
          {VITALS_REFERENCE.chips.map((chip) => (
            <span class={`emg-chip ${chip.tone}`} key={chip.text}>{chip.text}</span>
          ))}
        </div>
        <small class="emg-note">{VITALS_REFERENCE.note}</small>
      </div>
    </section>
  );
}
