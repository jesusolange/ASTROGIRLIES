import { useEffect, useRef, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { MISSION_TYPES } from "../../scripts/risks.js";
import {
  KEY, applyForm, closeDialog, dayLabelFor, dialog, formValues, get, markSkipped, open, saveProfile
} from "../../scripts/profile.js";
import Field from "../ui/Field.jsx";
import Button from "../ui/Button.jsx";
import "../ui/ui.css";
import "./profile.css";

const DESTINATIONS = ["Moon", "Mars", "Low Earth orbit"];

export default function ProfileDialog() {
  const [stored] = useStored(KEY, null);
  const [form, setForm] = useState(() => formValues(null));
  const [first, setFirst] = useState(false);
  const dialogRef = useRef(null);
  const state = dialog.value;

  function update(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.currentTarget.value }));
  }

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;
    if (state.open && !element.open) {
      setForm(formValues(get()));
      setFirst(state.first);
      element.showModal();
    } else if (!state.open && element.open) {
      element.close();
    }
  }, [state.open, state.first]);

  useEffect(() => {
    const profile = get();
    if (profile && (profile.name || profile.skipped)) return undefined;
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
    saveProfile(applyForm(form, stored || {}));
  }

  function cancel() {
    if (first) markSkipped();
    closeDialog();
  }

  return (
    <dialog
      ref={dialogRef}
      class="pf-dialog"
      aria-label="Astronaut profile"
      onClose={() => { if (dialog.value.open) closeDialog(); }}
      onClick={(event) => { if (event.target === dialogRef.current) closeDialog(); }}
    >
      <div class="env-pop-card pf-card">
        <h3>{first ? "Welcome, astronaut" : "Astronaut profile"}</h3>
        <p class="pf-sub">Saved on this device only. Your name shows in the app and the PDF report. The mission day goes up by itself every day.</p>
        <form class="pf-grid" onSubmit={submit}>
          <Field label="Name" id="pf-name" className="pf-f pf-wide">
            <input id="pf-name" name="name" type="text" maxLength={40} required placeholder="e.g. Solange Quijano" value={form.name} onInput={update("name")} />
          </Field>
          <Field label="Today is mission day" id="pf-day" className="pf-f">
            <input id="pf-day" name="day" type="number" min="1" max="2000" step="1" required value={form.day} onInput={update("day")} />
          </Field>
          <Field label="Mission length (days)" id="pf-total" className="pf-f">
            <input id="pf-total" name="total" type="number" min="1" max="3000" step="1" required value={form.total} onInput={update("total")} />
          </Field>
          <Field label="Mission type" id="pf-mission" className="pf-f pf-wide">
            <select id="pf-mission" name="missionType" value={form.missionType} onChange={update("missionType")}>
              {MISSION_TYPES.map((mission) => <option key={mission.id} value={mission.id}>{mission.label}</option>)}
            </select>
          </Field>
          <Field label="Destination" id="pf-destination" className="pf-f">
            <input id="pf-destination" name="destination" type="text" maxLength={40} list="pf-destinations" placeholder="e.g. Mars" value={form.destination} onInput={update("destination")} />
          </Field>
          <Field label="Age (years)" id="pf-age" className="pf-f">
            <input id="pf-age" name="age" type="number" min="18" max="80" step="1" value={form.age} onInput={update("age")} />
          </Field>
          <Field label="Sex used for energy calculation" id="pf-sex" className="pf-f">
            <select id="pf-sex" name="sex" value={form.sex} onChange={update("sex")}>
              <option value="f">Female</option>
              <option value="m">Male</option>
              <option value="x">Prefer not to say</option>
            </select>
          </Field>
          <Field label="Menopause (women)" id="pf-meno" className="pf-f">
            <select id="pf-meno" name="meno" value={form.meno} onChange={update("meno")}>
              <option value="">Not set</option>
              <option value="pre">Not yet</option>
              <option value="post">Yes, after</option>
            </select>
          </Field>
          <Field label="Weight (kg)" id="pf-weight" className="pf-f">
            <input id="pf-weight" name="weight" type="number" min="30" max="200" step="0.1" value={form.weight} onInput={update("weight")} />
          </Field>
          <Field label="Height (cm)" id="pf-height" className="pf-f">
            <input id="pf-height" name="height" type="number" min="100" max="230" step="0.5" value={form.height} onInput={update("height")} />
          </Field>
          <datalist id="pf-destinations">
            {DESTINATIONS.map((name) => <option key={name} value={name} />)}
          </datalist>
          <p class="pf-note pf-wide">Age, sex used for energy calculation, weight and height are optional. Nutrition uses them to set your food goals.</p>
          <div class="pf-actions pf-wide">
            <Button type="submit">Save profile</Button>
            <Button variant="soft" onClick={cancel}>{first ? "Later" : "Cancel"}</Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
