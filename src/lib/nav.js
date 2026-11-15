// Hash routes: the one source of truth for the open area.
// #/home, #/check, #/check/<id>, #/progress, #/emergency, #/emergency/<id>.
import { computed, signal } from "@preact/signals";

export const AREAS = ["home", "check", "progress", "emergency"];

export const CHECK_IDS = ["checkup", "vision", "exercise", "nutrition", "mental", "immune", "radiation"];

// Section ids the older modules still ask about while their pages are converted.
const LEGACY_IDS = new Set([
  "today", "overview", "checkup", "twin", "nutrition", "mental", "environment",
  "immune", "radiation", "vision", "emergencies", "progress",
]);

export function parseRoute(hash) {
  const [area, ...rest] = String(hash == null ? "" : hash).replace(/^#\/?/, "").split("/");
  if (!AREAS.includes(area)) return { area: "home", id: null };
  const id = rest.join("/") || null;
  return { area, id };
}

export const route = signal(typeof location === "undefined" ? parseRoute("") : parseRoute(location.hash));

// Older sections read this while they are converted; it follows the route.
const LEGACY_AREA = { home: "today", progress: "progress", emergency: "emergencies" };

export const currentSection = computed(() => {
  const { area, id } = route.value;
  return area === "check" ? id || "overview" : LEGACY_AREA[area];
});

export const has = (id) => LEGACY_IDS.has(id) || AREAS.includes(id);

export function pathFor(path) {
  const { area, id } = parseRoute(path);
  return id ? `#/${area}/${id}` : `#/${area}`;
}

export function go(path) {
  route.value = parseRoute(path);
  if (typeof location === "undefined" || typeof window === "undefined") return;
  const hash = pathFor(path);
  if (location.hash !== hash) window.location.hash = hash;
  window.scrollTo({ top: 0 });
}

export const openCard = (id) => go(id ? `#/check/${id}` : "#/check");
export const openEmergency = (id) => go(id ? `#/emergency/${id}` : "#/emergency");

// Temporary bridge for modules that still call window.AstroMedNav; removed as batch 3 converts them.
const LEGACY_PATH = { today: "#/home", emergencies: "#/emergency", progress: "#/progress" };
export function showLegacy(id) {
  go(LEGACY_PATH[id] || (id === "overview" ? "#/check/checkup" : `#/check/${id}`));
}

if (typeof window !== "undefined") {
  window.AstroMedNav = { show: showLegacy, has };
  const canonical = () => pathFor(window.location.hash);
  if (window.location.hash !== canonical()) window.history.replaceState(null, "", canonical());
  window.addEventListener("hashchange", () => {
    if (window.location.hash !== canonical()) window.history.replaceState(null, "", canonical());
    route.value = parseRoute(window.location.hash);
  });
}
