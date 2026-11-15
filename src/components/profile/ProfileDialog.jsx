import { useEffect, useRef, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { MISSION_TYPES } from "../../scripts/risks.js";
import {
  KEY, REQUIRED_ORDER, applyForm, closeDialog, dayLabelFor, dialog, fieldErrors, formValues, get, open, saveProfile
} from "../../scripts/profile.js";
import Field from "../ui/Field.jsx";
import Button from "../ui/Button.jsx";
import "../ui/ui.css";
import "./profile.css";

const FIELD_ID = {
  name: "pf-name",
  missionType: "pf-missionType",
  crew: "pf-crew",
  startDate: "pf-startDate",
  total: "pf-total"
};

export default function ProfileDialog() {
  const [stored] = useStored(KEY, null);
  const [form, setForm] = useState(() => formValues(null));
  const [errors, setErrors] = useState({});
  const [first, setFirst] = useState(false);
  const dialogRef = useRef(null);
  const fields = useRef({});
  const state = dialog.value;

  function bind(field) {
    return (node) => { fields.current[field] = node; };
  }

  function update(key) {
    return (event) => {
      const value = event.currentTarget.value;
      setForm((current) => {
        const next = { ...current, [key]: value };
        if (key === "sex" && value !== "f") next.meno = "";
        return next;
      });
      setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    };
  }

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;
    if (state.open && !element.open) {
      setForm(formValues(get()));
      setErrors({});
      setFirst(state.first);
      element.showModal();
    } else if (!state.open && element.open) {
      element.close();
    }
  }, [state.open, state.first]);

  useEffect(() => {
    const profile = get();
    if (profile && profile.name) return undefined;
    let cancelled = false;
    let timer = null;
    const request = () => { if (!cancelled) open(true); };
    const onCoverClosed = () => { timer = setTimeout(request, 600); };
    if (window.__amCoverOpen) document.addEventListener("astromed-cover-closed", onCoverClosed, { once: true });
    else timer = setTimeout(request, 600);
    return () => {
      cancelled = true;
      document.removeEventListener("astromed-cover-closed", onCoverClosed);
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    function syncShell() {
      const profile = get();
      const lines = document.querySelectorAll(".astronaut-mission-line");
      if (lines[0]) lines[0].lastElementChild.textContent = dayLabelFor(profile);
      if (lines[1]) lines[1].lastElementChild.textContent = profile && profile.name ? profile.name : "Tap to set your name";
      document.querySelectorAll("[data-pf-name]").forEach((node) => { node.textContent = (profile && profile.name) || "Astronaut"; });
      document.querySelectorAll("[data-pf-day]").forEach((node) => { node.textContent = dayLabelFor(profile); });
    }

    const chip = document.querySelector(".astronaut-mission-info");
    if (chip) {
      chip.style.cursor = "pointer";
      chip.style.pointerEvents = "auto";
      chip.setAttribute("title", "Edit astronaut profile");
      chip.setAttribute("role", "button");
      chip.setAttribute("tabindex", "0");
    }
    const chipClick = () => open(false);
    const chipKey = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open(false);
      }
    };
    if (chip) {
      chip.addEventListener("click", chipClick);
      chip.addEventListener("keydown", chipKey);
    }
    const onProfileChip = (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-profile-open]") : null;
      if (target) open(false);
    };
    document.addEventListener("click", onProfileChip);
    document.addEventListener("astromed-profile-apply", syncShell);
    syncShell();

    return () => {
      if (chip) {
        chip.removeEventListener("click", chipClick);
        chip.removeEventListener("keydown", chipKey);
      }
      document.removeEventListener("click", onProfileChip);
      document.removeEventListener("astromed-profile-apply", syncShell);
    };
  }, []);

  function submit(event) {
    event.preventDefault();
    const found = fieldErrors(form);
    setErrors(found);
    const firstInvalid = REQUIRED_ORDER.find((key) => found[key]);
    if (firstInvalid) {
      const node = fields.current[firstInvalid];
      if (node) node.focus();
      return;
    }
    saveProfile(applyForm(form, stored || {}));
  }

  function cancel() {
    closeDialog();
  }

  return (
    <dialog
      ref={dialogRef}
      class="pf-dialog"
      aria-label="Astronaut profile"
      onCancel={(event) => { if (first) event.preventDefault(); }}
      onClose={() => { if (dialog.value.open) closeDialog(); }}
      onClick={(event) => { if (event.target === dialogRef.current && !first) cancel(); }}
    >
      <div class="env-pop-card pf-card">
        <h3>{first ? "Welcome, astronaut" : "Astronaut profile"}</h3>
        <p class="pf-sub">Saved on this device only. Your name and mission show in the app and the report. The mission day goes up by itself every day.</p>
        <form class="pf-grid" noValidate onSubmit={submit}>
          <fieldset class="pf-group">
            <legend>You</legend>
            <div class="pf-fields">
              <Field label="Name" id="pf-name" className="pf-f pf-wide" error={errors.name}>
                <input
                  id="pf-name" name="name" type="text" maxLength={40} required autocomplete="name"
                  placeholder="Your name" value={form.name} onInput={update("name")} ref={bind("name")}
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>
              <Field label="Age (years)" id="pf-age" className="pf-f" help="Optional">
                <input id="pf-age" name="age" type="number" min="18" max="80" step="1" value={form.age} onInput={update("age")} />
              </Field>
              <Field label="Sex used for energy calculation" id="pf-sex" className="pf-f" help="Optional">
                <select id="pf-sex" name="sex" value={form.sex} onChange={update("sex")}>
                  <option value="f">Female</option>
                  <option value="m">Male</option>
                  <option value="x">Prefer not to say</option>
                </select>
              </Field>
              {form.sex === "f" ? (
                <Field label="Menopause" id="pf-meno" className="pf-f" help="Optional">
                  <select id="pf-meno" name="meno" value={form.meno} onChange={update("meno")}>
                    <option value="">Not set</option>
                    <option value="pre">Not yet</option>
                    <option value="post">After menopause</option>
                  </select>
                </Field>
              ) : null}
            </div>
          </fieldset>

          <fieldset class="pf-group">
            <legend>Mission</legend>
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
          </fieldset>

          <fieldset class="pf-group">
            <legend>Body</legend>
            <div class="pf-fields">
              <Field label="Weight (kg)" id="pf-weight" className="pf-f" help="Optional">
                <input id="pf-weight" name="weight" type="number" min="30" max="200" step="0.1" value={form.weight} onInput={update("weight")} />
              </Field>
              <Field label="Height (cm)" id="pf-height" className="pf-f" help="Optional">
                <input id="pf-height" name="height" type="number" min="100" max="230" step="0.5" value={form.height} onInput={update("height")} />
              </Field>
            </div>
          </fieldset>

          <p class="pf-note pf-wide">Age, sex used for energy calculation, weight and height are optional. Nutrition uses them to set your food goals.</p>
          <div class="pf-actions pf-wide">
            <Button type="submit">Save profile</Button>
            {first ? null : <Button variant="soft" onClick={cancel}>Cancel</Button>}
          </div>
        </form>
      </div>
    </dialog>
  );
}
