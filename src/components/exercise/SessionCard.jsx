// The one exercise card: choose a machine, log minutes and effort, and see this week's bone-loading habit.
// A session can be logged more than once a day; the card stays open after a save.
import { useMemo, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { openCard } from "../../lib/nav.js";
import { toast } from "../../lib/ui.js";
import { buildOverview } from "../../scripts/exercise-overview.js";
import {
  KEY, DEVICES, RESISTIVE_WEEKLY_TARGET, buildSession, deviceOf,
  readSessions, removeSession, saveSessions, sessionsToday, validateSession, weeklyResistive
} from "../../scripts/exercise.js";
import Button from "../ui/Button.jsx";
import Term from "../ui/Term.jsx";
import "./exercise.css";
import DeviceChooser from "./DeviceChooser.jsx";
import SessionFields from "./SessionFields.jsx";
import ExerciseInstructions from "./ExerciseInstructions.jsx";

const initialValues = (device) => Object.fromEntries(device.fields.map((field) => [field.key, ""]));
const nextId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export default function SessionCard({ onSaved }) {
  const [sessions, save] = useStored(KEY, []);
  const [type, setType] = useState(DEVICES[0].type);
  const [values, setValues] = useState(() => initialValues(DEVICES[0]));
  const [errors, setErrors] = useState([]);
  const [last, setLast] = useState(null);
  const refs = {};
  const device = deviceOf(type);

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

  const fieldLabel = (key) => (device.fields.find((field) => field.key === key) || {}).label || "";

  const submit = (event) => {
    event.preventDefault();
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

  const result = () => {
    const today = sessionsToday(sessions);
    if (!today.length) {
      return {
        level: "info",
        saw: "No session is recorded today yet.",
        todo: "Log a session on one of the three machines.",
        toast: "Nothing is recorded yet today."
      };
    }
    const minutes = today.reduce((sum, item) => sum + (Number(item.values && item.values.minutes) || 0), 0);
    const names = [...new Set(today.map((item) => item.title || device.title))];
    const saw = (
      <>
        Session recorded: {Math.round(minutes)} min on{" "}
        {names.map((name, index) => (
          <span key={name}>{index ? ", " : ""}<Term term={name} /></span>
        ))}. You have {resistive} of {RESISTIVE_WEEKLY_TARGET} resistive sessions this week (our design choice).
      </>
    );
    const todo = tip ? tip.message : "Keep a regular training habit.";
    const actions = underTarget ? [{ label: "Bone density loss", onClick: () => openCard("bone") }] : [];
    return { level: underTarget ? "warn" : "ok", saw, todo, actions, toast: "Training session recorded." };
  };

  const done = () => {
    if (onSaved) onSaved(result());
    else toast({ text: "Sessions are recorded for today." });
  };

  return (
    <div class="exr-card">
      <p class="exr-lead">Pick the machine, then log the minutes and how hard it felt.</p>
      <DeviceChooser devices={DEVICES} value={type} onChange={choose} />
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
        Weekly activity and progress charts are on Progress. Weekly resistive target: {RESISTIVE_WEEKLY_TARGET} sessions, our design choice.
      </p>
      <div class="exr-actions">
        <Button onClick={done}>Done for today</Button>
        {last ? <span class="exr-hint">You can log another session at any time.</span> : null}
      </div>
    </div>
  );
}
