/* Mission context for wording: crew size and the link to Earth.
   The profile record is the source of both; the destination in the profile decides the delay. */

import { crewFor, KEY as PROFILE_KEY } from "./profile.js";
import { MISSION_TYPES } from "./risks.js";

export { PROFILE_KEY };

const store = () => (typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store) || null;

export function profileRecord() {
  const api = store();
  return api ? api.get(PROFILE_KEY, null) : null;
}

export function crewSize(profile = profileRecord()) {
  return crewFor(profile);
}

export function hasCrew(profile = profileRecord()) {
  return crewSize(profile) > 1;
}

const PLACE_BY_DRM = { leo: "iss", lunarOrbit: "moon", lunarSurface: "moon", mars: "mars" };

// ISS / Moon: general knowledge (about 1.3 s Moon one way). Mars: NASA NTRS 20220013418
// (about 3 to 22 min one way; solar conjunction blackout).
export const COMM = {
  iss: { t: "Almost live", one: "< 1 s", rt: "about 1 s", bar: 6, tip: "You can talk with the ground team in real time. Short pauses can happen when a relay satellite changes." },
  rover: { t: "Depends on the planet", one: "Local radio: instant", rt: "To Earth: same as the Moon or Mars", bar: 40, tip: "Talk to your crewmates is live. The delay to Earth is the one of the planet you drive on." },
  moon: { t: "A short pause", one: "about 1.3 s", rt: "about 2.6 s", bar: 22, tip: "Conversation works, with a small pause after each sentence. Say “over” when you finish." },
  mars: { t: "Long wait", one: "3 to 22 min", rt: "6 to 44 min", bar: 100, tip: "No live talk. Send complete messages (what, when, what you need), keep a list of questions, and decide routine things yourself. About every 2 years the Sun blocks the signal for around 2 weeks (solar conjunction)." },
  transit: { t: "Long wait", one: "3 to 22 min", rt: "6 to 44 min", bar: 100, tip: "No live talk during the cruise. Send complete messages (what, when, what you need), keep a list of questions, and decide routine things yourself." }
};

export function commFor(place) {
  return place && COMM[place] ? { place, ...COMM[place] } : null;
}

// The delay to Earth for the destination in the profile, or null while no mission is set.
export function comm(profile = profileRecord()) {
  const mission = profile && MISSION_TYPES.find((m) => m.id === profile.missionType);
  return commFor(mission && PLACE_BY_DRM[mission.drm]);
}

export function readComm(profile = profileRecord()) {
  return comm(profile);
}

const LINK = {
  iss: { kind: "live", oneWay: "< 1 s", roundTrip: "about 1 s" },
  moon: { kind: "delayed", oneWay: "about 1.3 s", roundTrip: "about 2.6 s" },
  mars: { kind: "delayed", oneWay: "3 to 22 min", roundTrip: "6 to 44 min" },
  transit: { kind: "delayed", oneWay: "3 to 22 min", roundTrip: "6 to 44 min" },
  rover: { kind: "delayed", oneWay: "Local radio: instant", roundTrip: "Same as the planet you drive on" }
};

// `comm` is the object from comm(); `profile` supplies the place when comm is empty.
export function link(value = readComm(), profile = profileRecord()) {
  const place = value && value.place;
  if (place && LINK[place]) return { ...LINK[place] };
  if (!profile) return { kind: "none", oneWay: null, roundTrip: null };
  const mission = MISSION_TYPES.find((m) => m.id === profile.missionType);
  const derived = mission && PLACE_BY_DRM[mission.drm];
  return derived ? { ...LINK[derived] } : { kind: "none", oneWay: null, roundTrip: null };
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
