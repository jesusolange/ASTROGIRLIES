import { FIELDS, PLACES, formatTime } from "../../scripts/environment.js";
import Panel from "../ui/Panel.jsx";
import Button from "../ui/Button.jsx";

function placeName(entry) {
  return entry.place === "other" ? (entry.custom || "Other place") : PLACES[entry.place]?.name || entry.place;
}

export default function EnvironmentLog({ log, onDelete }) {
  if (!log.length) return null;
  return (
    <Panel title="Recent environment logs">
      <ul class="am-saved">
        {log.slice(0, 6).map((entry) => {
          const bits = FIELDS
            .filter((field) => Number.isFinite(entry.readings?.[field.key]))
            .slice(0, 3)
            .map((field) => `${entry.readings[field.key]} ${field.unit}`)
            .join(" · ");
          return (
            <li key={entry.time}>
              <span>{formatTime(entry.time)} · {placeName(entry)}</span>
              <b>{bits}</b>
              <Button variant="soft" onClick={() => onDelete(entry.time)}>Delete</Button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
