import Tile from "./Tile.jsx";

export default function IndexSection({ title, note, entries, activeKey, onOpen }) {
  if (!entries.length) return null;
  return (
    <section class="emg-section" aria-label={title}>
      <div class="emg-section-head">
        <h2>{title}</h2>
        {note ? <p>{note}</p> : null}
      </div>
      <div class="emg-grid">
        {entries.map((entry) => (
          <Tile
            entry={entry}
            key={entry.key}
            active={entry.key === activeKey}
            onOpen={() => onOpen(entry)}
          />
        ))}
      </div>
    </section>
  );
}
