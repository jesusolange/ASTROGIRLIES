// The three machines as small thumbnails. The abbreviation itself is defined with Term beside them.
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
          <img src={device.image} alt="" loading="lazy" decoding="async" />
          <span>{device.title}</span>
        </button>
      ))}
    </div>
  );
}
