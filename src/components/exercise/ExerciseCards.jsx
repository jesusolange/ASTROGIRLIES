export default function ExerciseCards({ devices, onSelect }) {
  return devices.map((device) => (
    <button key={device.type} type="button" class="exercise-option" onClick={() => onSelect(device.type)}>
      <img src={device.image} alt={device.alt} class="exercise-card-image" />
      <h3>{device.title}</h3>
      <p>{device.subtitle}</p>
    </button>
  ));
}
