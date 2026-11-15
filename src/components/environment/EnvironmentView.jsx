import { useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { MISSION_TYPES, missionType } from "../../scripts/risks.js";
import { KEYS, PLACES, deleteReading, findingsFrom, saveReading } from "../../scripts/environment.js";
import Field from "../ui/Field.jsx";
import Panel from "../ui/Panel.jsx";
import LocationPicker from "./LocationPicker.jsx";
import MessageDelay from "./MessageDelay.jsx";
import KeepInMind from "./KeepInMind.jsx";
import ReadingsForm from "./ReadingsForm.jsx";
import EnvironmentStatus from "./EnvironmentStatus.jsx";
import EnvironmentLog from "./EnvironmentLog.jsx";
import WarningDialog from "./WarningDialog.jsx";
import "../ui/ui.css";
import "./environment.css";

const EMPTY = { place: "", custom: "", readings: null, time: null };
const PROFILE_KEY = "astromed-profile";

function finiteReadings(draft) {
  return Object.fromEntries(Object.entries(draft).filter(([, value]) => Number.isFinite(value)));
}

export default function EnvironmentView() {
  const [env, saveEnv] = useStored(KEYS.state, EMPTY);
  const [storedLog] = useStored(KEYS.log, []);
  const log = Array.isArray(storedLog) ? storedLog : [];
  const [profile, saveProfile] = useStored(PROFILE_KEY, null);
  const [draft, setDraft] = useState(null);
  const values = draft || env.readings || {};
  const [warning, setWarning] = useState(null);

  const place = env.place;
  const mission = missionType(profile && profile.missionType);

  function pickPlace(id) {
    saveEnv({ ...env, place: id });
    setDraft(null);
    setWarning(null);
  }

  function changeMission(id) {
    saveProfile({ ...(profile || {}), missionType: id });
    document.dispatchEvent(new CustomEvent("astromed-profile-changed"));
  }

  function changeReading(key, value) {
    setDraft((current) => ({ ...(current || env.readings || {}), [key]: value === "" ? "" : Number(value) }));
  }

  function save() {
    const readings = finiteReadings(values);
    if (!Object.keys(readings).length) {
      setWarning({ plain: true, items: [{ level: "review", title: "Nothing to save", saw: "Enter at least one measurement first.", todo: "" }] });
      return;
    }
    const time = new Date().toISOString();
    const next = { ...env, readings, time };
    saveReading(next, readings, time);
    setDraft(null);
    setWarning(null);
    const items = findingsFrom(next, log).filter((item) => item.level !== "ok");
    if (items.length) setWarning({ plain: false, items });
    window.AstroMedProgress?.sync();
  }

  function remove(time) {
    deleteReading(time);
  }

  return (
    <>
      <div class="am-heading">
        <h2>Environment</h2>
        <p>Where are you right now? Your location and the air around you shape the risks the tool watches for, and they are used in Today and your protocols.</p>
      </div>

      <Panel title="Mission" className="env-mission">
        <div class="rk-controls">
          <Field label="Mission type" id="env-mission" className="rk-mission">
            <select id="env-mission" value={mission.id} onChange={(event) => changeMission(event.currentTarget.value)}>
              {MISSION_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
            </select>
          </Field>
          <p class="rk-note">This mission sets the order of Mission risks and the risk warnings in the app.</p>
        </div>
      </Panel>

      <Panel title="Where are you?">
        <LocationPicker place={place} onPick={pickPlace} />
        {place === "other" ? (
          <Field label="Name of your location" id="env-custom" className="env-custom">
            <input
              id="env-custom"
              type="text"
              maxLength={40}
              placeholder="e.g. Lunar orbit station"
              value={env.custom || ""}
              onInput={(event) => saveEnv({ ...env, custom: event.currentTarget.value })}
            />
          </Field>
        ) : null}
        {place ? <MessageDelay place={place} /> : null}
        {place ? (
          <KeepInMind place={place} onRiskMap={() => window.AstroMedNav?.show("riskmap")} />
        ) : (
          <p class="am-small">Pick a location to continue.</p>
        )}
      </Panel>

      {place ? (
        <Panel title="Conditions around you">
          <ReadingsForm
            draft={values}
            onChange={changeReading}
            onSave={save}
            onDemo={() => setDraft({ ...PLACES[place].demo })}
          />
        </Panel>
      ) : null}

      <EnvironmentStatus state={env} log={log} />
      <EnvironmentLog log={log} onDelete={remove} />
      <WarningDialog warning={warning} onClose={() => setWarning(null)} />
    </>
  );
}
