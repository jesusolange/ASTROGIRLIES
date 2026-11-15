export default function PersonButton({ person, initials, selected, onPick }) {
  return (
    <li>
      <button
        type="button"
        class={`amcr-person${selected ? " is-selected" : ""}`}
        aria-pressed={selected ? "true" : "false"}
        onClick={() => onPick(person)}
      >
        <span class="amcr-initials" aria-hidden="true">{initials || "?"}</span>
        <span class="amcr-name">{person.name}</span>
        {person.pinHash ? <span class="amcr-lock">PIN</span> : null}
      </button>
    </li>
  );
}
