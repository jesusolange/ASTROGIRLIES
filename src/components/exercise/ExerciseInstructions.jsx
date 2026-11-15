// Device instructions kept from the former Home training panel, in the one step list.
import { EQUIP } from "../../data/devices.js";
import Steps from "../ui/Steps.jsx";

const DEVICES = Object.entries(EQUIP);

export default function ExerciseInstructions() {
  return (
    <details class="exr-instructions">
      <summary>How to use your devices</summary>
      {DEVICES.map(([key, device]) => (
        <section key={key} class="exr-device-steps">
          <h3>{device.name}</h3>
          <p>{device.use}</p>
          <Steps items={device.steps} ariaLabel={`${device.name} steps`} />
          <p class="exr-note">{device.note} Follow your device manual.</p>
        </section>
      ))}
    </details>
  );
}
