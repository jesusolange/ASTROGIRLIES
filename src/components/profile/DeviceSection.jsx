import { useState } from "preact/hooks";
import { closeDialog } from "../../scripts/profile.js";
import { IDLE_MS, PIN_MAX, PIN_MIN, activeSignal, clearPinFor, lock, setPinFor } from "../../scripts/people.js";
import Button from "../ui/Button.jsx";
import Field from "../ui/Field.jsx";
import RemovePerson from "../crew/RemovePerson.jsx";
import "../crew/crew.css";

export default function DeviceSection() {
  const person = activeSignal.value;
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (!person) return null;

  async function savePin(event) {
    event.preventDefault();
    setError("");
    setNote("");
    setBusy(true);
    try {
      await setPinFor(person.id, pin);
      setPin("");
      setNote("PIN saved.");
    } catch (problem) {
      setError(problem && problem.message ? problem.message : "Could not save the PIN.");
    } finally {
      setBusy(false);
    }
  }

  function dropPin() {
    clearPinFor(person.id);
    setPin("");
    setError("");
    setNote("PIN removed.");
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

      <form class="pf-pin" onSubmit={savePin}>
        <p>
          The PIN keeps your records out of casual view on this device. It is not encryption, and it cannot be
          recovered if forgotten. This is our design choice.
        </p>
        <Field
          label={person.pinHash ? "New PIN (4 to 8 digits)" : "PIN (4 to 8 digits, optional)"}
          id="pf-pin"
          error={error || undefined}
        >
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
            onInput={(event) => { setPin(event.currentTarget.value.replace(/\D/g, "")); setError(""); setNote(""); }}
          />
        </Field>
        <div class="pf-actions">
          <Button type="submit" variant="soft" disabled={busy}>{busy ? "Saving..." : "Set PIN"}</Button>
          {person.pinHash ? <Button variant="soft" onClick={dropPin}>Remove PIN</Button> : null}
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
