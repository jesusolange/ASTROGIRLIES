import { useEffect, useRef, useState } from "preact/hooks";
import { currentMission, rankedRisks } from "../../scripts/risks.js";
import { get, missionDayFor, totalFor } from "../../scripts/profile.js";
import { openEmergency } from "../../lib/nav.js";

const PLANET = {
  leo: { file: "earth.svg", label: "Earth" },
  lunarOrbit: { file: "moon.svg", label: "Moon" },
  lunarSurface: { file: "moon.svg", label: "Moon" },
  mars: { file: "mars.svg", label: "Mars" }
};

export function planetFor(mission) {
  return PLANET[mission && mission.drm] || PLANET.mars;
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
  const [closing, setClosing] = useState(false);
  const startRef = useRef(null);
  const profile = get();
  const mission = currentMission();
  const planet = planetFor(mission);
  const facts = factsFor(profile, mission);

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

  function close(event) {
    if (event) event.preventDefault();
    setClosing(true);
  }

  function emergency(event) {
    event.stopPropagation();
    setClosing(true);
    setTimeout(() => openEmergency(), 120);
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

        <div class="amc-actions">
          <button type="button" class="amc-go" ref={startRef} onClick={close}>Start today's check</button>
          <button type="button" class="amc-emergency" onClick={emergency}>Emergency</button>
        </div>
        <p class="amc-note">Your records stay on this device unless you choose to sign in.</p>
        <p class="amc-place">{planet.label}</p>
      </div>
    </div>
  );
}
