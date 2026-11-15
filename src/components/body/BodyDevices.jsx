// Device instructions for the card that takes the measurement, collapsed by default.
import Steps from "../ui/Steps.jsx";

export default function BodyDevices({ devices = [] }) {
  if (!devices.length) return null;
  return (
    <div class="body-devices">
      {devices.map((device) => (
        <details class="body-device" key={device.name}>
          <summary class="body-device-summary">
            <span class="body-device-name">{device.name}</span>
            <span class="body-device-use">{device.use}</span>
          </summary>
          <Steps items={device.steps} ariaLabel={`${device.name} steps`} />
          <p class="body-device-note">{device.note}</p>
        </details>
      ))}
    </div>
  );
}
