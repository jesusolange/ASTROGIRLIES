// Device instructions kept from the former Home training panel, one collapsible section per device.
import { EQUIP } from "../../data/devices.js";
import Steps from "../ui/Steps.jsx";

const DEVICES = Object.entries(EQUIP);

export default function ExerciseInstructions() {
  return (
    <section class="exr-instructions">
      <h3 class="exr-instructions-title">How to use your devices</h3>
      {DEVICES.map(([key, device]) => (
        <details key={key} class="exr-device-steps">
          <summary>{device.name}</summary>
          <p>{device.use}</p>
          <Steps items={device.steps} ariaLabel={`${device.name} steps`} />
          <p class="exr-note">{device.note} Follow your device manual.</p>
        </details>
      ))}
    </section>
  );
}
