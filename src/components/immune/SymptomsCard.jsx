// Today's immune symptoms as toggle chips, with a live status under them.
// Props: form (CheckCard form state; the selection lives in form.values.symptoms).
import { ACTIONS, SYMPTOMS, assess, riskFactors } from "../../scripts/immune.js";
import Chips from "../ui/Chips.jsx";

const OPTIONS = SYMPTOMS.map(([id, label]) => ({ id, label }));
const LABELS = { ok: "No warning signs", review: "Keep watching", alert: "Needs attention" };

export default function SymptomsCard({ form }) {
  const selected = Array.isArray(form.values.symptoms) ? form.values.symptoms : [];
  const current = assess(selected, riskFactors());

  return (
    <div class="im-symptoms">
      <p class="im-lead">
        Space travel changes the immune system and can wake up dormant viruses (Crucian et al., 2018, Frontiers in
        Immunology). Select what you feel today.
      </p>
      <Chips
        multiple
        options={OPTIONS}
        value={selected}
        onChange={(next) => form.set("symptoms", next)}
        label="Symptoms today"
        idBase="im-sym"
      />
      <div class={`im-status im-${current.level}`} role="status" aria-live="polite">
        <b>{LABELS[current.level]}</b>
        <span>{current.risks.length ? `Risk factors now: ${current.risks.join(", ")}.` : "No risk factors found from your other data."}</span>
        <span>{ACTIONS[current.level]}</span>
      </div>
    </div>
  );
}
