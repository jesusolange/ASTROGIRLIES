import { useEffect, useState } from "preact/hooks";
import Dialog from "../ui/Dialog.jsx";
import Button from "../ui/Button.jsx";
import { removePerson } from "../../scripts/people.js";

export default function RemovePerson({ person, open, onClose, onRemoved }) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTyped("");
    setError("");
  }, [open, person && person.id]);

  if (!person) return null;

  function submit(event) {
    event.preventDefault();
    if (typed.trim() !== person.name.trim()) {
      setError("Type the name exactly as shown.");
      return;
    }
    removePerson(person.id);
    onRemoved?.();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Remove ${person.name}?`}
      footer={
        <>
          <Button type="submit" form="amcr-remove" variant="danger">Remove this person</Button>
          <Button variant="soft" onClick={onClose}>Cancel</Button>
        </>
      }
    >
      <form id="amcr-remove" class="amcr-remove" onSubmit={submit}>
        <p>
          This deletes {person.name}&rsquo;s profile and every record saved on this device. It cannot be undone,
          and the records go with the person.
        </p>
        <label class="amcr-remove-label" for="amcr-remove-name">Type the name to confirm</label>
        <input
          id="amcr-remove-name"
          class="amcr-remove-input"
          type="text"
          autocomplete="off"
          value={typed}
          onInput={(event) => { setTyped(event.currentTarget.value); setError(""); }}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "amcr-remove-error" : undefined}
        />
        {error ? <span class="amcr-remove-error" id="amcr-remove-error" role="alert">{error}</span> : null}
      </form>
    </Dialog>
  );
}
