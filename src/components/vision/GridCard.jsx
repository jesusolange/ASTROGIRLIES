import { VIEW, EYE_LABEL, calibration } from "../../scripts/vision.js";
import Steps from "../ui/Steps.jsx";
import Field from "../ui/Field.jsx";
import Chips from "../ui/Chips.jsx";
import GridControl from "./GridControl.jsx";

const ANSWERS = [
  { id: "normal", label: "All lines look straight and even" },
  { id: "changed", label: "Some lines look wavy, blurred or missing" }
];

export default function GridCard({ form, eye }) {
  const current = calibration();
  const other = eye === "left" ? "right" : "left";
  const marks = Array.isArray(form.values.marks) ? form.values.marks : [];

  const setMarks = (next) => {
    form.set("marks", next);
    if (next.length) form.set("gridAnswer", "changed");
  };

  return (
    <div class="vision vs-grid-card">
      <Steps
        ariaLabel={`Grid steps for the ${EYE_LABEL[eye].toLowerCase()}`}
        items={[
          `Hold the screen ${VIEW.gridDistanceCm} cm away and cover your ${other} eye.`,
          "Keep looking at the dot in the centre. Do not move your eye to the edges.",
          "Mark every square where a line looks wavy, blurred or missing. Leave the rest clear."
        ]}
      />

      {current ? (
        <GridControl ppmm={current.ppmm} eye={eye} marks={marks} onChange={setMarks} />
      ) : (
        <p class="vs-note" ref={form.fieldRef("calibration")} tabIndex={-1}>
          This device is not calibrated yet. Open the calibration card first so the squares keep their size.
          {form.errorFor("calibration") ? ` ${form.errorFor("calibration")}` : ""}
        </p>
      )}

      <Field label="How did the grid look?" id={`vs-grid-${eye}`} error={form.errorFor("gridAnswer")}>
        <div ref={form.fieldRef("gridAnswer")} tabIndex={-1} class="vs-field-focus">
          <Chips
            options={ANSWERS}
            value={form.values.gridAnswer}
            onChange={(id) => {
              form.set("gridAnswer", id);
              if (id === "normal") form.set("marks", []);
            }}
            label="Grid appearance"
            idBase={`vs-grid-${eye}`}
          />
        </div>
      </Field>
    </div>
  );
}
