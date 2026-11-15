import { PLACES } from "../../scripts/environment.js";
import TransitIcon from "./TransitIcon.jsx";

export default function LocationPicker({ place, onPick }) {
  return (
    <div class="env-places" role="group" aria-label="Location">
      {Object.entries(PLACES).map(([id, info]) => (
        <button
          key={id}
          type="button"
          class={`env-place ${id === place ? "on" : ""}`}
          data-place={id}
          aria-pressed={id === place}
          onClick={() => onPick(id)}
        >
          <span>
            {info.img ? <img src={info.img} alt="" loading="lazy" /> : id === "transit" ? <TransitIcon /> : info.icon}
          </span>
          <b>{info.name}</b>
          <small>{info.tag}</small>
        </button>
      ))}
    </div>
  );
}
