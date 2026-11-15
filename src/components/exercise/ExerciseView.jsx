import { useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { KEY, DEVICES, deviceOf, buildSession, addSession } from "../../scripts/exercise.js";
import ExerciseCards from "./ExerciseCards.jsx";
import SessionForm from "./SessionForm.jsx";
import ExerciseOverview from "./ExerciseOverview.jsx";
import "./exercise.css";

export default function ExerciseView() {
  const [sessions, save] = useStored(KEY, []);
  const [active, setActive] = useState(null);
  const [status, setStatus] = useState("");
  const device = deviceOf(active);

  const start = (type) => { setStatus(""); setActive(type); };
  const cancel = () => setActive(null);

  const submit = (values) => {
    save(addSession(sessions, buildSession(device, values)));
    setActive(null);
    setStatus(`${device.title} session saved successfully ✓`);
  };

  return (
    <div class="exercise-view">
      <div class="am-heading">
        <h2>Exercise &amp; Recovery</h2>
        <p>Which type of exercise would you like to log today?</p>
      </div>

      <div class="exercise-options">
        {device
          ? <SessionForm key={device.type} device={device} onSave={submit} onCancel={cancel} />
          : <ExerciseCards devices={DEVICES} onSelect={start} />}
      </div>

      <p id="exerciseSaveStatus" class="exercise-save-status" role="status" aria-live="polite">{status}</p>

      <ExerciseOverview sessions={sessions} />
    </div>
  );
}
