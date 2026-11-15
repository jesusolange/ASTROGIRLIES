import { initialsOf } from "../../scripts/profile.js";
import PersonButton from "./PersonButton.jsx";
import PinField from "./PinField.jsx";

export default function SignIn({ people, selected, pin, error, busy, onPick, onPin, onAdd }) {
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
      </div>
    </section>
  );
}
