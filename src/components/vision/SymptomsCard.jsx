import { SYMPTOMS } from "../../scripts/vision.js";
import Steps from "../ui/Steps.jsx";
import Field from "../ui/Field.jsx";
import Chips from "../ui/Chips.jsx";

const OPTIONS = SYMPTOMS.map((symptom) => ({ id: symptom.id, label: symptom.label }));

export default function SymptomsCard({ form }) {
  return (
    <div class="vision vs-symptoms">
      <Steps
        ariaLabel="Symptom steps"
        items={[
          "Think about today and tick anything you noticed in either eye.",
          "Leave a box clear if you did not notice it.",
          "Save to record today's symptoms. The grid and near chart add the eye measurements."
        ]}
      />

      <Field label="Symptoms you noticed today" id="vs-symptoms" error={form.errorFor("symptoms")}>
        <div ref={form.fieldRef("symptoms")} tabIndex={-1} class="vs-field-focus">
          <Chips
            options={OPTIONS}
            value={form.values.symptoms}
            onChange={(ids) => form.set("symptoms", ids)}
            multiple
            label="Symptoms today"
            idBase="vs-symptom"
          />
        </div>
      </Field>

    </div>
  );
}
