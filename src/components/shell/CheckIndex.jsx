import "./shell.css";

const CHECKS = [
  { id: "checkup", label: "Daily Checkup" },
  { id: "vision", label: "Vision" },
  { id: "exercise", label: "Exercise" },
  { id: "nutrition", label: "Nutrition" },
  { id: "mental", label: "Mental health" },
  { id: "immune", label: "Immune" },
  { id: "radiation", label: "Radiation" },
];

export default function CheckIndex() {
  return (
    <section class="tb-check" aria-labelledby="tb-check-title">
      <h2 id="tb-check-title">Checks</h2>
      <p class="tb-lead">Open a check to record today's result. Progress keeps the history.</p>
      <ul class="tb-check-list">
        {CHECKS.map((check) => (
          <li key={check.id}>
            <a href={`#/check/${check.id}`}>{check.label}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
