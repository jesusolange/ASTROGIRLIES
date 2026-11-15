import { STORM_NOTE, STORM_STEPS } from "../../data/emergencies.js";
import Icon from "../ui/Icon.jsx";
import RichText from "./RichText.jsx";

const ICONS = ["emergency", "home", "immune", "report"];

export default function StormSteps() {
  return (
    <>
      <ol class="emg-storm">
        {STORM_STEPS.map((step, index) => (
          <li class="emg-storm-step" key={step.title} style={`--emg-i:${index}`}>
            <span class="emg-storm-icon"><Icon name={ICONS[index] || "info"} size={26} /></span>
            <b><RichText text={step.title} /></b>
            <span><RichText text={step.sub} /></span>
          </li>
        ))}
      </ol>
      <p class="emg-note"><RichText text={STORM_NOTE} /></p>
    </>
  );
}
