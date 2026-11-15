import { useState } from "preact/hooks";
import { closeDialog } from "../../scripts/profile.js";
import { IDLE_MS, PIN_MAX, PIN_MIN, activeSignal, clearPinFor, lock, savePinFor } from "../../scripts/people.js";
import Button from "../ui/Button.jsx";
import Field from "../ui/Field.jsx";
import RemovePerson from "../crew/RemovePerson.jsx";
import "../crew/crew.css";

export default function DeviceSection() {
  const person = activeSignal.value;
  const [current, setCurrent] = useState("");
  const [pin, setPin] = useState("");
  const [repeat, setRepeat] = useState("");
  const [errors, setErrors] = useState({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (!person) return null;

  function change(setter) {
    return (event) => {
      setter(event.currentTarget.value.replace(/\D/g, ""));
      if (note) setNote("");
    };
  }

  function clearError(key) {
    setErrors((currentErrors) => (currentErrors[key] ? { ...currentErrors, [key]: undefined } : currentErrors));
  }

  function reset() {
    setErrors({});
    setNote("");
  }

  async function savePin(event) {
    event.preventDefault();
    if (busy) return;
    reset();
    setBusy(true);
    try {
      const result = await savePinFor(person.id, pin, repeat, current);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setCurrent("");
      setPin("");
      setRepeat("");
      setNote(person.pinHash ? "PIN changed." : "PIN saved.");
    } catch (problem) {
      setErrors({ pin: problem && problem.message ? problem.message : "Could not save the PIN." });
    } finally {
      setBusy(false);
    }
  }

  async function dropPin() {
    if (busy) return;
    reset();
    setBusy(true);
    try {
      const result = await clearPinFor(person.id, current);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setCurrent("");
      setPin("");
      setRepeat("");
      setNote("PIN removed.");
    } catch (problem) {
      setErrors({ current: problem && problem.message ? problem.message : "Could not remove the PIN." });
    } finally {
      setBusy(false);
    }
  }

  function lockNow() {
    closeDialog();
    lock();
  }

  function removed() {
    setRemoving(false);
    closeDialog();
  }

  return (
    <section class="pf-block">
      <h4>This device</h4>
      <p>
        Locking returns to the cover, where each person on this device checks in by name. The app also locks
        after {Math.round(IDLE_MS / 60000)} minutes without input. This is our design choice.
      </p>
      <div class="pf-actions">
        <Button variant="soft" onClick={lockNow}>Lock</Button>
      </div>

      <form class="pf-pin" onSubmit={savePin} noValidate>
        <p>
          The PIN keeps your records out of casual view on this device. It is not encryption, and it cannot be
          recovered if forgotten. This is our design choice.
        </p>
        {person.pinHash ? (
          <Field label="Current PIN" id="pf-pin-current" error={errors.current}>
            <input
              id="pf-pin-current"
              type="password"
              inputMode="numeric"
              autocomplete="off"
              minLength={PIN_MIN}
              maxLength={PIN_MAX}
              pattern={`\\d{${PIN_MIN},${PIN_MAX}}`}
              value={current}
              disabled={busy}
              onInput={(event) => { change(setCurrent)(event); clearError("current"); }}
            />
          </Field>
        ) : null}
        <Field label="New PIN (4 to 8 digits)" id="pf-pin" error={errors.pin}>
          <input
            id="pf-pin"
            type="password"
            inputMode="numeric"
            autocomplete="off"
            minLength={PIN_MIN}
            maxLength={PIN_MAX}
            pattern={`\\d{${PIN_MIN},${PIN_MAX}}`}
            value={pin}
            disabled={busy}
            onInput={(event) => { change(setPin)(event); clearError("pin"); }}
          />
        </Field>
        <Field label="Repeat new PIN" id="pf-pin-repeat" error={errors.repeat}>
          <input
            id="pf-pin-repeat"
            type="password"
            inputMode="numeric"
            autocomplete="off"
            minLength={PIN_MIN}
            maxLength={PIN_MAX}
            pattern={`\\d{${PIN_MIN},${PIN_MAX}}`}
            value={repeat}
            disabled={busy}
            onInput={(event) => { change(setRepeat)(event); clearError("repeat"); }}
          />
        </Field>
        <div class="pf-actions">
          <Button type="submit" variant="soft" disabled={busy}>
            {busy ? "Saving..." : person.pinHash ? "Change PIN" : "Set PIN"}
          </Button>
          {person.pinHash ? <Button variant="soft" disabled={busy} onClick={dropPin}>Remove PIN</Button> : null}
        </div>
        {note ? <p class="pf-note" role="status">{note}</p> : null}
      </form>

      <div class="pf-remove-person">
        <p>Removing {person.name} deletes their profile and every record on this device. This cannot be undone.</p>
        <Button variant="danger" onClick={() => setRemoving(true)}>Remove this person</Button>
      </div>

      <RemovePerson person={person} open={removing} onClose={() => setRemoving(false)} onRemoved={removed} />
    </section>
  );
}
