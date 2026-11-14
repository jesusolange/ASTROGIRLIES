// A short status label: a colour plus its word, so the level is never colour alone.
// Props: level ("ok" | "info" | "warn" | "urgent"; "review" and "alert" are accepted as
// aliases), children (optional text that replaces the default word).
const LEVELS = { ok: "On track", info: "Info", warn: "Watch", urgent: "Priority" };
const ALIAS = { review: "warn", alert: "urgent" };

export default function LevelBadge({ level = "info", children }) {
  const key = ALIAS[level] || (LEVELS[level] ? level : "info");
  return (
    <span class={`ui-badge ui-badge-${key}`}>
      <span class="ui-badge-dot" aria-hidden="true" />
      {children || LEVELS[key]}
    </span>
  );
}
