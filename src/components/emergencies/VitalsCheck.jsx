import { useState } from "preact/hooks";
import { vitalChips } from "../../scripts/emergencies.js";

const FIELDS = [
  { key: "pulse", label: "Pulse (per min)" },
  { key: "sys", label: "Top blood pressure (mmHg)" },
  { key: "resp", label: "Breathing (per min)" },
  { key: "spo2", label: "Oxygen (SpO₂ %)" },
  { key: "temp", label: "Temperature (°C)", step: "0.1" },
];

export default function VitalsCheck() {
  const [values, setValues] = useState({});
  const chips = vitalChips(values);
  const update = (key, input) => {
    setValues((old) => ({ ...old, [key]: input.value === "" ? null : Number(input.value) }));
  };
  return (
    <>
      <div class="emg-vf">
        {FIELDS.map((field) => (
          <label key={field.key}>
            <span>{field.label}</span>
            <input
              type="number"
              step={field.step}
              inputmode="decimal"
              data-vital={field.key}
              value={values[field.key] ?? ""}
              onInput={(event) => update(field.key, event.currentTarget)}
            />
          </label>
        ))}
      </div>
      <div class="emg-chips" data-vitals-result>
        {chips.map((chip) => <span class={`emg-chip ${chip.tone}`} key={chip.text}>{chip.text}</span>)}
      </div>
    </>
  );
}
