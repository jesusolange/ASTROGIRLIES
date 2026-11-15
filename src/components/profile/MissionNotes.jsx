import { MISSION_TYPES } from "../../scripts/risks.js";
import { PLACES } from "../../scripts/environment.js";
import { link } from "../../scripts/mission.js";
import { openSources } from "../sources/open.js";

const PLACE_BY_DRM = { leo: "iss", lunarOrbit: "moon", lunarSurface: "moon", mars: "mars" };

export function placeFor(missionType) {
  const mission = MISSION_TYPES.find((item) => item.id === missionType);
  return (mission && PLACE_BY_DRM[mission.drm]) || "mars";
}

export function delaySentence(value) {
  if (!value || value.kind === "none") return "This mission has no link to Earth.";
  if (value.kind === "live") return `The link to Earth is live. A reply takes ${value.roundTrip}.`;
  return `A message takes ${value.oneWay} one way, and a reply takes ${value.roundTrip}.`;
}

export default function MissionNotes({ missionType }) {
  const place = placeFor(missionType);
  const info = PLACES[place];
  if (!info) return null;
  const value = link(null, { missionType });

  return (
    <div class="pf-notes">
      <div class="pf-notes-copy">
        <h4>Keep in mind at {info.name}</h4>
        <ul>
          {info.facts.map((fact) => <li key={fact}>{fact}</li>)}
        </ul>
        <p class="pf-delay">{delaySentence(value)}</p>
      </div>
      <figure class="pf-place">
        <img src={`/${info.img}`} alt={`${info.name} destination`} loading="lazy" decoding="async" />
        <figcaption>
          {info.name} · AstroGirlies team ·{" "}
          <button type="button" class="pf-source-link" onClick={() => openSources(`place-${place}`)}>Sources</button>
        </figcaption>
      </figure>
    </div>
  );
}
