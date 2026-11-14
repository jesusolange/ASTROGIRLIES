// Mission risk model: NASA's ratings per mission type, and which part of the app covers each risk.
// The ratings are NASA's (Human Research Roadmap). The ranking score and the area weights are our formula.
import data from "../data/hrr-risks.js";
import coverage from "../data/risk-coverage.js";

export const MISSION_TYPES = [
  { id: "leo-short", drm: "leo", duration: "short", label: "Low Earth orbit, under 30 days" },
  { id: "leo-long", drm: "leo", duration: "long", label: "Low Earth orbit, 30 days to 1 year" },
  { id: "lunarOrbit-short", drm: "lunarOrbit", duration: "short", label: "Lunar orbit, under 30 days" },
  { id: "lunarOrbit-long", drm: "lunarOrbit", duration: "long", label: "Lunar orbit, 30 days to 1 year" },
  { id: "lunarSurface-short", drm: "lunarSurface", duration: "short", label: "Lunar orbit and surface, under 30 days" },
  { id: "lunarSurface-long", drm: "lunarSurface", duration: "long", label: "Lunar orbit and surface, 30 days to 1 year" },
  { id: "mars-preparatory", drm: "mars", duration: "preparatory", label: "Mars preparatory, under 1 year" },
  { id: "mars-planetary", drm: "mars", duration: "planetary", label: "Mars planetary, 730 to 1224 days" },
];
export const DEFAULT_MISSION = "mars-planetary";
export const PROFILE_KEY = "astromed-profile";

export const missionType = (id) => MISSION_TYPES.find((m) => m.id === id) || MISSION_TYPES.find((m) => m.id === DEFAULT_MISSION);

// The mission chosen in the profile (field `missionType`), or the default.
export function currentMission(store = globalThis.AstroMedStore && globalThis.AstroMedStore.store) {
  const profile = store ? store.get(PROFILE_KEY, null) : null;
  return missionType(profile && profile.missionType);
}

const side = (x) => (x && x.l && x.c ? { l: x.l, c: x.c, score: x.l * x.c, colour: x.colour, disposition: x.disposition } : null);

// One risk as seen from one mission type. `score` is likelihood x consequence for in-mission operations (1 to 25),
// or 0 when NASA gives no operations rating for that mission.
export function ratingFor(risk, missionId) {
  const m = missionType(missionId);
  const cell = (risk.ratings[m.drm] || {})[m.duration] || {};
  const ops = side(cell.ops);
  const cover = coverage[risk.id] || null;
  return {
    id: risk.id, title: risk.title, short: risk.short, url: risk.url, published: risk.published,
    ops, lth: side(cell.lth),
    opsDisposition: cell.ops ? cell.ops.disposition : null,
    score: ops ? ops.score : 0,
    monitored: Boolean(cover), section: cover ? cover.section : null, part: cover ? cover.part || null : null,
    area: cover ? cover.area : null,
  };
}

// All 22 risks for a mission, highest in-mission rating first; ties keep the higher consequence first.
export function rankedRisks(missionId) {
  return data.risks
    .map((r) => ratingFor(r, missionId))
    .sort((a, b) => b.score - a.score || (b.ops ? b.ops.c : 0) - (a.ops ? a.ops.c : 0) || a.id - b.id);
}

// Weight per app area for a mission: each monitored area takes the highest score among its risks,
// and the weights are scaled to sum to 1. Areas are keyed "section" or "section:part".
export function areaWeights(missionId) {
  const top = {};
  for (const r of rankedRisks(missionId)) {
    if (!r.monitored) continue;
    const key = r.part ? `${r.section}:${r.part}` : r.section;
    if (!top[key] || r.score > top[key].score) top[key] = { key, section: r.section, part: r.part, area: r.area, score: r.score, riskId: r.id };
  }
  const total = Object.values(top).reduce((s, a) => s + a.score, 0) || 1;
  return Object.values(top).map((a) => ({ ...a, weight: a.score / total })).sort((a, b) => b.weight - a.weight);
}

export const SOURCE = data.source;

if (typeof window !== "undefined") {
  window.AstroMedRisks = { MISSION_TYPES, DEFAULT_MISSION, missionType, currentMission, ratingFor, rankedRisks, areaWeights, SOURCE };
}
