// Add a dose: value, unit and the source of the reading, plus the dosimeter instructions.
// Props: form (CheckCard form state).
import { cabinRate, convertToMsv } from "../../scripts/radiation.js";
import { EQUIP } from "../../data/devices.js";
import { openEmergency } from "../../lib/nav.js";
import Button from "../ui/Button.jsx";
import Field from "../ui/Field.jsx";
import Steps from "../ui/Steps.jsx";

export default function DoseCard({ form }) {
  const unit = form.values.unit || "mSv";
  const raw = Number(form.values.dose);
  const converted = form.values.dose !== "" && form.values.dose != null && Number.isFinite(raw)
    ? convertToMsv(raw, unit)
    : null;
  const cabin = cabinRate();

  function useCabin() {
    form.set("dose", cabin.mSvPerDay.toFixed(3));
    form.set("unit", "mSv");
  }

  return (
    <div class="rd-card">
      <p class="rd-lead">
        Read your dosimeter or area monitor and record the dose. It is added to your mission total. Report the
        reading for today; you can log several in one day.
      </p>

      <div class="rd-row">
        <Field label="Dose" id="rd-dose" error={form.errorFor("dose")}>
          <input
            id="rd-dose"
            type="number"
            step="any"
            min="0"
            inputmode="decimal"
            placeholder="e.g. 0.45"
            value={form.values.dose == null ? "" : form.values.dose}
            ref={form.fieldRef("dose")}
            onInput={(event) => form.set("dose", event.currentTarget.value)}
          />
        </Field>
        <Field label="Unit" id="rd-unit">
          <select id="rd-unit" value={unit} onChange={(event) => form.set("unit", event.currentTarget.value)}>
            <option value="mSv">mSv</option>
            <option value="µSv">µSv</option>
          </select>
        </Field>
      </div>
      {converted != null ? <p class="rd-note">{converted.toLocaleString("en-GB", { maximumFractionDigits: 4 })} mSv will be added.</p> : null}

      <Field label="Source of the reading" id="rd-source">
        <select id="rd-source" value={form.values.source || "dosimeter"} onChange={(event) => form.set("source", event.currentTarget.value)}>
          <option value="dosimeter">Personal dosimeter</option>
          <option value="area">Area monitor</option>
          <option value="estimate">Estimate</option>
        </select>
      </Field>

      {cabin ? (
        <div class="rd-cabin">
          <p class="rd-note">
            Cabin dose rate from Cabin conditions: {cabin.microSvPerHour} µSv/h, about {cabin.mSvPerDay.toFixed(3)} mSv per day.
          </p>
          <Button variant="soft" onClick={useCabin}>Use this daily dose</Button>
        </div>
      ) : null}

      <details class="rd-details">
        <summary>Dosimeter instructions</summary>
        <Steps items={EQUIP.dosi.steps} ariaLabel="How to use the radiation dosimeter" />
        <p class="rd-note">{EQUIP.dosi.note}</p>
      </details>

      <div class="rd-storm">
        <p class="rd-note">A solar storm can add a large dose in a few hours. Follow the solar storm card.</p>
        <Button variant="soft" onClick={() => openEmergency("storm")}>Open the solar storm card</Button>
      </div>
    </div>
  );
}
