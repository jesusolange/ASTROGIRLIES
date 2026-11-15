// The one exercise card: choose a machine, log minutes and effort, and see this week's bone-loading habit.
// A session can be logged more than once a day; the card stays open after a save.
import { useMemo, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { openCard } from "../../lib/nav.js";
import { toast } from "../../lib/ui.js";
import { buildOverview } from "../../scripts/exercise-overview.js";
import {
  KEY, DEVICES, RESISTIVE_WEEKLY_TARGET, buildSession, deviceOf,
  readSessions, removeSession, saveSessions, validateSession, weeklyResistive
} from "../../scripts/exercise.js";
import Button from "../ui/Button.jsx";
import SourceLink from "../ui/SourceLink.jsx";
import Term from "../ui/Term.jsx";
import "./exercise.css";
import DeviceChooser from "./DeviceChooser.jsx";
import SessionFields from "./SessionFields.jsx";
import ExerciseInstructions from "./ExerciseInstructions.jsx";

const initialValues = (device) => Object.fromEntries(device.fields.map((field) => [field.key, ""]));
const nextId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export default function SessionCard({ onDone }) {
  const [sessions, save] = useStored(KEY, []);
  const [type, setType] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState([]);
  const [last, setLast] = useState(null);
  const refs = {};
  const device = type ? deviceOf(type) : null;

  const overview = useMemo(() => buildOverview(sessions), [sessions]);
  const resistive = weeklyResistive(sessions);
  const underTarget = resistive < RESISTIVE_WEEKLY_TARGET;
  const tip = overview.insights[0];

  const choose = (nextType) => {
    const nextDevice = deviceOf(nextType);
    if (!nextDevice) return;
    setType(nextType);
    setValues(initialValues(nextDevice));
    setErrors([]);
  };

  const update = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => current.filter((error) => !error.startsWith(fieldLabel(key))));
  };

  const fieldLabel = (key) => {
    if (!device) return "";
    return (device.fields.find((field) => field.key === key) || {}).label || "";
  };

  const submit = (event) => {
    event.preventDefault();
    if (!device) return;
    const result = validateSession(device, values);
    if (!result.ok) {
      setErrors(result.errors);
      const first = device.fields.find((field) => result.errors.some((error) => error.startsWith(field.label)));
      const node = first && refs[first.key];
      if (node && typeof node.focus === "function") node.focus();
      return;
    }
    setErrors([]);
    const session = { ...buildSession(device, result.values), id: nextId() };
    save([session, ...(Array.isArray(sessions) ? sessions : [])].slice(0, 500));
    setValues(initialValues(device));
    setLast(session);
    toast({
      text: `${device.title} session saved.`,
      undo: () => {
        if (typeof window === "undefined" || !window.AstroMedStore) return;
        saveSessions(removeSession(readSessions(), session.id));
        setLast(null);
      }
    });
  };

  return (
    <div class="exr-card">
      <p class="exr-lead">Pick the machine, then log the minutes and how hard it felt.</p>

      <DeviceChooser devices={DEVICES} value={type} onChange={choose} />

      {device ? (
        <>
          <p class="exr-selected">
            Selected: <Term term={device.title} /> · {device.subtitle}
          </p>
          <form class="exr-form" onSubmit={submit} noValidate>
            <SessionFields device={device} values={values} onChange={update} refs={refs} />
            {errors.length ? (
              <ul class="exr-errors" role="alert">
                {errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            ) : null}
            <div class="exr-form-actions">
              <Button type="submit">Save session</Button>
            </div>
          </form>
        </>
      ) : (
        <p class="exr-note">Select a machine to see its fields.</p>
      )}

      {last ? (
        <div class="exr-result" role="status">
          <div class="exr-result-head">
            <b>Session recorded</b>
            <span>{resistive} of {RESISTIVE_WEEKLY_TARGET} resistive sessions this week</span>
          </div>
          <p><b>Tip for you:</b> {tip ? tip.message : "Keep a regular training habit."}</p>
          {underTarget ? <Button onClick={() => openCard("bone")}>Bone density loss</Button> : null}
        </div>
      ) : null}

      <ExerciseInstructions />

      <p class="exr-note">
        Weekly activity and progress charts are on Progress. The station programme performs resistance exercise on {RESISTIVE_WEEKLY_TARGET} days per week. <SourceLink id="sprint-study-2020">Source</SourceLink>
      </p>
      <div class="exr-actions">
        <Button onClick={() => onDone?.()}>Done for now</Button>
        {last ? <span class="exr-hint">You can log another session at any time.</span> : null}
      </div>
    </div>
  );
}
