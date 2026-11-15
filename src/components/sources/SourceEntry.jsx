export default function SourceEntry({ entry, focused, bind }) {
  const href = entry.url || entry.sourceUrl || null;
  const licenceHref = entry.licenceUrl || null;
  return (
    <li id={`source-${entry.id}`} class={`sources-item${focused ? " is-focus" : ""}`} ref={bind}>
      <div class="sources-item-title">
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer">{entry.title}</a>
          : entry.title}
      </div>
      <div class="sources-item-meta">
        <span>{entry.author}</span>
        <span class="sources-licence">
          {licenceHref
            ? <a href={licenceHref} target="_blank" rel="noopener noreferrer">{entry.licence}</a>
            : entry.licence}
        </span>
      </div>
      {entry.note ? <p class="sources-note">{entry.note}</p> : null}
    </li>
  );
}
