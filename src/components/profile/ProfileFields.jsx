import { MISSION_TYPES } from "../../scripts/risks.js";
import Field from "../ui/Field.jsx";
import MissionNotes from "./MissionNotes.jsx";

function YouFields({ form, errors, update, bind }) {
  return (
    <div class="pf-fields">
      <Field label="Name" id="pf-name" className="pf-f pf-wide" error={errors.name}>
        <input
          id="pf-name" name="name" type="text" maxLength={40} required autocomplete="name"
          placeholder="Your name" value={form.name} onInput={update("name")} ref={bind("name")}
          aria-invalid={Boolean(errors.name)}
        />
      </Field>
      <Field label="Age (years)" id="pf-age" className="pf-f" error={errors.age}>
        <input
          id="pf-age" name="age" type="number" min="18" max="80" step="1" inputMode="numeric" required
          value={form.age} onInput={update("age")} ref={bind("age")}
          aria-invalid={Boolean(errors.age)}
        />
      </Field>
      <Field label="Sex used for energy calculation" id="pf-sex" className="pf-f" error={errors.sex}>
        <select
          id="pf-sex" name="sex" required value={form.sex} onChange={update("sex")} ref={bind("sex")}
          aria-invalid={Boolean(errors.sex)}
        >
          <option value="">Choose</option>
          <option value="f">Female</option>
          <option value="m">Male</option>
          <option value="x">Prefer not to say</option>
        </select>
      </Field>
      {form.sex === "f" ? (
        <Field label="Menopause" id="pf-meno" className="pf-f" error={errors.meno}>
          <select
            id="pf-meno" name="meno" required value={form.meno} onChange={update("meno")} ref={bind("meno")}
            aria-invalid={Boolean(errors.meno)}
          >
            <option value="">Choose</option>
            <option value="pre">Not yet</option>
            <option value="post">After menopause</option>
          </select>
        </Field>
      ) : null}
    </div>
  );
}

function MissionFields({ form, errors, update, bind }) {
  return (
    <>
      <div class="pf-fields">
        <Field label="Destination" id="pf-missionType" className="pf-f pf-wide" error={errors.missionType}>
          <select
            id="pf-missionType" name="missionType" required value={form.missionType}
            onChange={update("missionType")} ref={bind("missionType")}
            aria-invalid={Boolean(errors.missionType)}
          >
            {MISSION_TYPES.map((mission) => <option key={mission.id} value={mission.id}>{mission.label}</option>)}
          </select>
        </Field>
        <Field label="Crew size" id="pf-crew" className="pf-f" help="Including you" error={errors.crew}>
          <input
            id="pf-crew" name="crew" type="number" min="1" max="99" step="1" inputMode="numeric" required
            value={form.crew} onInput={update("crew")} ref={bind("crew")}
            aria-invalid={Boolean(errors.crew)}
          />
        </Field>
        <Field label="Mission start date" id="pf-startDate" className="pf-f" error={errors.startDate}>
          <input
            id="pf-startDate" name="startDate" type="date" required
            value={form.startDate} onChange={update("startDate")} ref={bind("startDate")}
            aria-invalid={Boolean(errors.startDate)}
          />
        </Field>
        <Field label="Mission length (days)" id="pf-total" className="pf-f" error={errors.total}>
          <input
            id="pf-total" name="total" type="number" min="1" max="3000" step="1" required
            value={form.total} onInput={update("total")} ref={bind("total")}
            aria-invalid={Boolean(errors.total)}
          />
        </Field>
      </div>
      <MissionNotes missionType={form.missionType} />
    </>
  );
}

function BodyFields({ errors, update, bind, form }) {
  return (
    <>
      <div class="pf-fields">
        <Field label="Weight (kg)" id="pf-weight" className="pf-f" error={errors.weight}>
          <input
            id="pf-weight" name="weight" type="number" min="30" max="200" step="0.1" required
            value={form.weight} onInput={update("weight")} ref={bind("weight")}
            aria-invalid={Boolean(errors.weight)}
          />
        </Field>
        <Field label="Height (cm)" id="pf-height" className="pf-f" error={errors.height}>
          <input
            id="pf-height" name="height" type="number" min="100" max="230" step="0.5" required
            value={form.height} onInput={update("height")} ref={bind("height")}
            aria-invalid={Boolean(errors.height)}
          />
        </Field>
      </div>
      <p class="pf-note">Nutrition uses these values to set your food goals. The N-telopeptide range follows sex and menopause.</p>
    </>
  );
}

export default function ProfileFields({ form, errors, update, bind, tab }) {
  const shared = { form, errors, update, bind };
  return (
    <div class="pf-group">
      {tab === "mission"
        ? <MissionFields {...shared} />
        : tab === "body"
          ? <BodyFields {...shared} />
          : <YouFields {...shared} />}
    </div>
  );
}
