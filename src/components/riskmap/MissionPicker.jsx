// Chooses the mission type for the map and shows which mission is on screen.
// Props: mission (the chosen MISSION_TYPES entry), onChange(id).
import { MISSION_TYPES } from "../../scripts/risks.js";
import Field from "../ui/Field.jsx";

export default function MissionPicker({ mission, onChange }) {
  return (
    <div class="rk-controls">
      <Field label="Mission type" id="rk-mission" className="rk-mission">
        <select id="rk-mission" value={mission.id} onChange={(event) => onChange(event.currentTarget.value)}>
          {MISSION_TYPES.map((type) => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </Field>
      <div class="rk-now">
        <small>Showing</small>
        <b>{mission.label}</b>
      </div>
    </div>
  );
}
