// The three machines as large pictures. Choosing one selects it and reveals its fields below.
import AiImage from "../ui/AiImage.jsx";

export default function DeviceChooser({ devices, value, onChange }) {
  return (
    <div class="exr-chooser" role="group" aria-label="Training machine">
      {devices.map((device) => (
        <button
          key={device.type}
          type="button"
          class={`exr-device ${value === device.type ? "is-on" : ""}`.trim()}
          aria-pressed={value === device.type ? "true" : "false"}
          onClick={() => onChange(device.type)}
        >
          <AiImage src={device.image} alt={device.alt} ai={device.ai} />
          <span class="exr-device-name">{device.title}</span>
          <small>{device.subtitle}</small>
        </button>
      ))}
    </div>
  );
}
