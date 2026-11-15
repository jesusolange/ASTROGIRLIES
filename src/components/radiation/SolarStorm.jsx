import { SPE_LIMIT, openStormSteps } from "../../scripts/radiation.js";
import Panel from "../ui/Panel.jsx";
import Button from "../ui/Button.jsx";

export default function SolarStorm() {
  return (
    <Panel title="Solar storm" className="rd-spe">
      <p>
        A solar particle event can add a large dose in a few hours. Move to the most shielded part of the habitat, stay
        there until the ground team or your radiation plan says it is safe, then log the dose.
      </p>
      <p class="mi-note">NASA's short-term limit for one storm is {SPE_LIMIT} mSv. This is general guidance: follow your mission protocol.</p>
      <div class="am-actions"><Button onClick={openStormSteps}>Open solar storm steps</Button></div>
    </Panel>
  );
}
