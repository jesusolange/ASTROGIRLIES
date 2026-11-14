import { SYMPTOMS } from "../../scripts/vision.js";

export default function SymptomList({ selected, onToggle }) {
  return (
    <div class="vs-symptoms">
      {SYMPTOMS.map((symptom) => (
        <label key={symptom.id} class="vs-symptom">
          <input
            type="checkbox"
            checked={selected.includes(symptom.id)}
            onChange={() => onToggle(symptom.id)}
          />
          <span>{symptom.label}</span>
        </label>
      ))}
    </div>
  );
}
