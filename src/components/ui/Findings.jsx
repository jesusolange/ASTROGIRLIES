// Renders the findings list a section exposes: [{ level, title, saw, todo }].
// Props: items. An empty list renders nothing, so a section can pass it straight in.
import LevelBadge from "./LevelBadge.jsx";

export default function Findings({ items = [] }) {
  if (!items.length) return null;
  return (
    <ul class="ui-findings">
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} class="ui-finding">
          <div class="ui-finding-head">
            <LevelBadge level={item.level} />
            <strong>{item.title}</strong>
          </div>
          <p class="ui-finding-saw"><b>What I noticed:</b> {item.saw}</p>
          <p class="ui-finding-todo"><b>What to do:</b> {item.todo}</p>
        </li>
      ))}
    </ul>
  );
}
