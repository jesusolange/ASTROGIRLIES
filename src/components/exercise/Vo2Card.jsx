// VO2max test: a value and a date. The test is due every 14 days; the fitness findings are the result.
import { load } from "../../scripts/rewards.js";
import { VO2_EVERY, findings, recordVo2, save as saveFitness, vo2Due } from "../../scripts/fitness.js";
import { parseVo2 } from "../../scripts/exercise.js";
import { alsoTell } from "../../scripts/mission.js";
import Field from "../ui/Field.jsx";
import Term from "../ui/Term.jsx";
import "./exercise.css";

const isoDay = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function vo2Save(values) {
  const parsed = parseVo2(values);
  if (!parsed.ok) return { error: { field: parsed.field, message: parsed.error } };
  const { value } = parsed;
  const time = parsed.date.toISOString();
  recordVo2(value, time);
  const found = findings()[0];
  const result = found || {
    level: "ok",
    saw: `${Math.round(value * 10) / 10} mL/kg/min recorded.`,
    todo: `Test again in ${VO2_EVERY} days so we can see your aerobic fitness trend.`
  };
  const also = result.tell ? alsoTell(result.tell) : "";
  return {
    result: {
      level: result.level,
      saw: result.saw,
      todo: also ? `${result.todo} ${also}` : result.todo,
      toast: "VO2max test recorded."
    },
    undo: () => {
      const current = load();
      saveFitness({ ...current, vo2: (current.vo2 || []).filter((test) => test.time !== time) });
    }
  };
}

export default function Vo2Card({ form }) {
  const due = vo2Due();
  const next = !due.last ? "No test yet; log your first one." : due.days <= 0 ? "Due now." : `Next test in ${due.days} day${due.days === 1 ? "" : "s"}.`;

  return (
    <div class="exr-card">
      <p class="exr-lead">
        Record the <Term term={"VO\u2082max"} /> result from your test. The plan repeats the test every {VO2_EVERY} days; this interval is our design choice.
      </p>
      <p class="exr-note">{next}</p>
      <div class="exr-fields">
        <Field label={"VO\u2082max (mL/kg/min)"} id="vo2-value" error={form.errorFor("value")}>
          <input
            ref={form.fieldRef("value")}
            type="number" step="any" min="5" max="90" inputmode="decimal"
            value={form.values.value}
            onInput={(event) => form.set("value", event.currentTarget.value)}
          />
        </Field>
        <Field label="Test date" id="vo2-date" error={form.errorFor("date")}>
          <input
            ref={form.fieldRef("date")}
            type="date" max={isoDay(new Date())}
            value={form.values.date}
            onInput={(event) => form.set("date", event.currentTarget.value)}
          />
        </Field>
      </div>
    </div>
  );
}
