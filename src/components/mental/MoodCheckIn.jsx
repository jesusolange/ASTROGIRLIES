// The mood check-in: five choices, one selected at a time, and a short reply.
// Props: value (selected mood id or null), reply (text for the status line), onPick(id).
import { MOODS } from "../../scripts/mental.js";
import Panel from "../ui/Panel.jsx";
import Pill from "../ui/Pill.jsx";

export default function MoodCheckIn({ value, reply, onPick }) {
  return (
    <Panel title="How are you feeling?">
      <div class="am-moods">
        {MOODS.map(([label, id]) => (
          <Pill key={id} pressed={value === id} onClick={() => onPick(id)}>
            {label}
          </Pill>
        ))}
      </div>
      <p class="am-reply" role="status" aria-live="polite">{reply}</p>
    </Panel>
  );
}
