// The three machines as large pictures. Choosing one selects it and reveals its fields below.
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
          <img src={device.image} alt={device.alt} loading="lazy" decoding="async" />
          <span class="exr-device-name">{device.title}</span>
          <small>{device.subtitle}</small>
        </button>
      ))}
    </div>
  );
}
