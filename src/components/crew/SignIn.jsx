import { useState } from "preact/hooks";
import { initialsOf } from "../../scripts/profile.js";
import PersonButton from "./PersonButton.jsx";
import PinField from "./PinField.jsx";
import RemovePerson from "./RemovePerson.jsx";

export default function SignIn({ people, selected, pin, error, busy, onPick, onPin, onAdd, onRemoved }) {
  const [removing, setRemoving] = useState(false);

  function removed() {
    setRemoving(false);
    onRemoved?.();
  }

  return (
    <section class="amcr" aria-labelledby="amcr-title">
      <h2 class="amcr-title" id="amcr-title">Who is checking in?</h2>
      {people.length ? (
        <ul class="amcr-people">
          {people.map((person) => (
            <PersonButton
              key={person.id}
              person={person}
              initials={initialsOf(person.name)}
              selected={person.id === (selected && selected.id)}
              onPick={onPick}
            />
          ))}
        </ul>
      ) : (
        <p class="amcr-empty">No one is set up on this device yet.</p>
      )}

      {selected && selected.pinHash ? (
        <PinField id="amc-pin" value={pin} error={error} busy={busy} onChange={onPin} />
      ) : null}

      <div class="amcr-tools">
        <button type="button" class="amcr-link" onClick={onAdd}>Add crew member</button>
        {selected && selected.pinHash ? (
          <button type="button" class="amcr-link" onClick={() => setRemoving(true)}>Forgot the PIN? Remove this person</button>
        ) : null}
      </div>

      <div onClick={(event) => event.stopPropagation()}>
        <RemovePerson person={selected} open={removing} onClose={() => setRemoving(false)} onRemoved={removed} />
      </div>
    </section>
  );
}
