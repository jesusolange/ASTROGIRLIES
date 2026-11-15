import { useEffect, useRef, useState } from "preact/hooks";
import { missionType, rankedRisks } from "../../scripts/risks.js";
import { KEY as PROFILE_KEY, missionDayFor, open as openProfile, totalFor } from "../../scripts/profile.js";
import { openEmergency } from "../../lib/nav.js";
import { activeSignal, enter, lock, peopleSignal, signIn } from "../../scripts/people.js";
import SignIn from "../crew/SignIn.jsx";
import "../crew/crew.css";

const PLANET = {
  leo: { file: "earth.svg", label: "Earth" },
  lunarOrbit: { file: "moon.svg", label: "Moon" },
  lunarSurface: { file: "moon.svg", label: "Moon" },
  mars: { file: "mars.svg", label: "Mars" }
};

export function planetFor(mission) {
  return PLANET[mission && mission.drm] || PLANET.mars;
}

const store = () => (typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store) || null;

function profileFor(personId) {
  const api = store();
  return api && personId ? api.getFor(personId, PROFILE_KEY, null) : null;
}

function factsFor(profile, mission) {
  const rows = [{ key: "Mission", text: mission.label }];
  const day = missionDayFor(profile);
  if (day != null) rows.push({ key: "Day", text: `Day ${day} / ${totalFor(profile)}` });
  const first = rankedRisks(mission.id).find((risk) => risk.monitored && risk.ops);
  if (first) {
    rows.push({
      key: "Watch first",
      text: `${first.area}: NASA rates this risk ${first.ops.l} x ${first.ops.c} for your mission.`,
      href: first.url
    });
  }
  return rows;
}

export default function Cover({ onClosed }) {
  const people = peopleSignal.value;
  const [selectedId, setSelectedId] = useState(() => (people.length === 1 && !people[0].pinHash ? people[0].id : null));
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);
  const startRef = useRef(null);
  const initialActive = useRef(activeSignal.value);

  const selected = people.find((person) => person.id === selectedId) || null;
  const profile = profileFor(selected ? selected.id : null);
  const mission = missionType(profile && profile.missionType);
  const planet = planetFor(mission);
  const facts = profile ? factsFor(profile, mission) : [];

  useEffect(() => {
    if (startRef.current) startRef.current.focus();
  }, []);

  useEffect(() => {
    function onKey(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!closing) return undefined;
    const timer = setTimeout(onClosed, 450);
    return () => clearTimeout(timer);
  }, [closing]);

  useEffect(() => {
    if (activeSignal.value && !initialActive.current) setClosing(true);
  }, [activeSignal.value]);

  function close(event) {
    if (event) event.preventDefault();
    setClosing(true);
  }

  function pick(person) {
    setSelectedId(person.id);
    setPin("");
    setError("");
  }

  async function start(event) {
    event.preventDefault();
    if (!selected || busy) return;
    setError("");
    if (!selected.pinHash) {
      enter(selected.id);
      close();
      return;
    }
    setBusy(true);
    const result = await signIn(selected.id, pin);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    close();
  }

  function emergency(event) {
    event.stopPropagation();
    setClosing(true);
    setTimeout(() => openEmergency(), 120);
  }

  function addMember() {
    lock();
    openProfile(true, "you");
  }

  function removed() {
    setSelectedId(null);
    setPin("");
    setError("");
  }

  return (
    <div
      class={`amc${closing ? " amc-out" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="amc-title"
      onClick={() => close()}
    >
      <img class="amc-planet" src={`/assets/cover/${planet.file}`} alt="" aria-hidden="true" />
      <div class="amc-scrim" aria-hidden="true" />
      <div class="amc-in" onClick={(event) => event.stopPropagation()}>
        <p class="amc-kicker">NASA Space Apps 2026</p>
        <h1 id="amc-title">AstroMed</h1>
        <p class="amc-purpose">Check your own health each day, and know what to do next, when Earth cannot answer in time.</p>

        <form class="amc-signin" onSubmit={start}>
          <SignIn
            people={people}
            selected={selected}
            pin={pin}
            error={error}
            busy={busy}
            onPick={pick}
            onPin={(next) => { setPin(next); setError(""); }}
            onAdd={addMember}
            onRemoved={removed}
          />

          {facts.length ? (
            <dl class="amc-facts">
              {facts.map((row) => (
                <div class="amc-fact" key={row.key}>
                  <dt>{row.key}</dt>
                  <dd>
                    {row.text}
                    {row.href ? <> <a href={row.href} target="_blank" rel="noopener noreferrer">Source</a></> : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div class="amc-actions">
            <button type="submit" class="amc-go" ref={startRef} disabled={!selected || busy}>
              {busy ? "Checking PIN..." : "Start today's check"}
            </button>
            <button type="button" class="amc-emergency" onClick={emergency}>Emergency</button>
          </div>
        </form>

        <p class="amc-note">Your records stay on this device unless you choose to sign in.</p>
        <p class="amc-place">{planet.label}</p>
      </div>

    </div>
  );
}
