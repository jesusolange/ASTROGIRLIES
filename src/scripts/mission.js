/* Mission context for wording: crew size and the link to Earth.
   The profile record is the source of both; the link to Earth comes from comm() and falls
   back to the mission type while an environment place is not set. */

import { crewFor, KEY as PROFILE_KEY } from "./profile.js";
import { missionType } from "./risks.js";

export { PROFILE_KEY };

const store = () => (typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store) || null;

export function profileRecord() {
  const api = store();
  return api ? api.get(PROFILE_KEY, null) : null;
}

export function readComm() {
  return typeof window !== "undefined" && window.AstroMedEnv && typeof window.AstroMedEnv.comm === "function"
    ? window.AstroMedEnv.comm()
    : null;
}

export function crewSize(profile = profileRecord()) {
  return crewFor(profile);
}

export function hasCrew(profile = profileRecord()) {
  return crewSize(profile) > 1;
}

const PLACE_BY_DRM = { leo: "iss", lunarOrbit: "moon", lunarSurface: "moon", mars: "mars" };

const COMM = {
  iss: { kind: "live", oneWay: "< 1 s", roundTrip: "about 1 s" },
  moon: { kind: "delayed", oneWay: "about 1.3 s", roundTrip: "about 2.6 s" },
  mars: { kind: "delayed", oneWay: "3 to 22 min", roundTrip: "6 to 44 min" },
  transit: { kind: "delayed", oneWay: "3 to 22 min", roundTrip: "6 to 44 min" },
  rover: { kind: "delayed", oneWay: "Local radio: instant", roundTrip: "Same as the planet you drive on" }
};

// `comm` is the object from AstroMedEnv.comm(); `profile` supplies the place when comm is empty.
export function link(comm = readComm(), profile = profileRecord()) {
  const place = comm && comm.place;
  if (place && COMM[place]) return { ...COMM[place] };
  if (!profile) return { kind: "none", oneWay: null, roundTrip: null };
  const mission = missionType(profile.missionType);
  const derived = mission && PLACE_BY_DRM[mission.drm];
  return derived ? { ...COMM[derived] } : { kind: "none", oneWay: null, roundTrip: null };
}

const DURATION = /^(about\s*)?[\d.]/i;

function humanDelay(text) {
  const cleaned = String(text)
    .replace(/\bmin\b/gi, "minutes")
    .replace(/\bs\b/gi, "seconds")
    .replace(/\b1 seconds\b/gi, "1 second")
    .replace(/\s+/g, " ")
    .trim();
  return /^about\b/i.test(cleaned) ? cleaned : `about ${cleaned}`;
}

// One sentence for the second step, or an empty string when the mission cannot reach Earth.
export function alsoTell(who = "the flight surgeon", value = link()) {
  if (!value || value.kind === "none") return "";
  if (value.kind === "live") return `Also tell ${who}; the link is live.`;
  if (value.roundTrip && DURATION.test(value.roundTrip)) {
    return `Also tell ${who}; a reply takes ${humanDelay(value.roundTrip)}.`;
  }
  return `Also tell ${who}; the reply time depends on the planet.`;
}
