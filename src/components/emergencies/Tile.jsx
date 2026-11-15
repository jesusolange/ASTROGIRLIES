import CardIcon from "./CardIcon.jsx";

export default function Tile({ entry, active, onOpen }) {
  const danger = entry.kind === "emergency" && entry.card.actWithin === "minutes";
  return (
    <button
      type="button"
      class={`emg-tile${danger ? " is-danger" : ""}${active ? " is-active" : ""}`}
      data-emg-open={entry.id}
      aria-current={active ? "true" : undefined}
      onClick={onOpen}
    >
      <span class="emg-ic"><CardIcon name={entry.icon} /></span>
      <b>{entry.title}</b>
      <small>{entry.sub}</small>
      {entry.tag ? <em>{entry.tag}</em> : null}
    </button>
  );
}
