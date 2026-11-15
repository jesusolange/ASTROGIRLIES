// The one source of truth for which section is open.
// Sections are listed here as data; components read `currentSection`, and pages are shown or hidden
// from it. Older modules still call the thin `window.AstroMedNav` wrappers below.
import { signal } from "@preact/signals";

export const SECTIONS = [
  { id: "today", label: "Today", icon: "ic-overview", page: "todayPage" },
  { id: "emergencies", label: "Emergencies", icon: "ic-report", page: "emergenciesPage" },
  { id: "environment", label: "Environment", icon: "ic-env", page: "environmentPage" },
  { id: "riskmap", label: "Mission risks", icon: "ic-report", page: "riskmapPage" },
  { id: "immune", label: "Immune watch", icon: "ic-mental", page: "immunePage" },
  { id: "radiation", label: "Radiation", icon: "ic-rad", page: "radiationPage" },
  { id: "overview", label: "Daily Checkup", icon: "ic-overview", page: "checkupPage" },
  { id: "vision", label: "Vision", icon: "ic-report", page: "visionPage" },
  { id: "twin", label: "Exercise & Recovery", icon: "ic-twin", page: "exercisePage" },
  { id: "nutrition", label: "Nutrition", icon: "ic-food", page: "nutritionPage" },
  { id: "mental", label: "Mental Health", icon: "ic-mental", page: "mentalPage" },
  { id: "progress", label: "Progress", icon: "ic-sim", page: "progressPage" },
  { id: "protocols", label: "Protocols", icon: "ic-report", page: "protocolsPage" },
  { id: "settings", label: "Settings", icon: "ic-setting", page: null },
];

const DEFAULT_SECTION = "today";
const byId = (id) => SECTIONS.find((section) => section.id === id) || null;

const hashId = () => {
  if (typeof location === "undefined") return null;
  const id = location.hash.replace(/^#/, "");
  const section = byId(id);
  return section && section.page ? id : null;
};

export const currentSection = signal(hashId() || DEFAULT_SECTION);

export const has = (id) => Boolean(byId(id));

export const current = () => currentSection.value;

export const pageFor = (id) => {
  const section = byId(id);
  return section ? section.page : null;
};

// Show the current section and hide every other page. Reads only `currentSection`, so state stays in
// one place; call it after the page elements change (start-up, hash change, a section added later).
export function apply() {
  const page = pageFor(currentSection.value);
  document.querySelectorAll(".am-page, #checkupPage, #exercisePage").forEach((element) => {
    element.hidden = element.id !== page;
  });
}

function announce() {
  document.dispatchEvent(new CustomEvent("astromed-nav-changed"));
  document.dispatchEvent(new CustomEvent("astromed-section", { detail: { id: currentSection.value } }));
}

export function show(id) {
  if (!has(id)) return;
  if (id === "settings") {
    if (window.AstroMedOpenSettings) window.AstroMedOpenSettings();
    return;
  }
  if (currentSection.value !== id) currentSection.value = id;
  if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
  apply();
  announce();
  window.scrollTo({ top: 0 });
}

// Kept for modules that still register while they are being converted. Section order and labels
// come from SECTIONS above, so this changes nothing on the sidebar.
export function register() {}

// Hash routes: #/home, #/check, #/check/<id>, #/progress, #/emergency, #/emergency/<id>.
const AREAS = ["home", "check", "progress", "emergency"];
const OLD_SECTION = { home: "today", check: "overview", progress: "progress", emergency: "emergencies" };

export function parseRoute(hash) {
  const [area, id] = String(hash || "").replace(/^#\/?/, "").split("/");
  return AREAS.includes(area) ? { area, id: id || null } : { area: "home", id: null };
}

export const route = signal(typeof location === "undefined" ? parseRoute("") : parseRoute(location.hash));

export function go(path) {
  route.value = parseRoute(path);
  if (typeof location !== "undefined" && location.hash !== path) history.pushState(null, "", path);
  const { area, id } = route.value;
  show(area === "check" && id && has(id) ? id : OLD_SECTION[area]);
}

export const openCard = (id) => go(id ? `#/check/${id}` : "#/check");
export const openEmergency = (id) => go(id ? `#/emergency/${id}` : "#/emergency");

if (typeof window !== "undefined") {
  window.AstroMedNav = { show, has, current, register, apply };
  window.addEventListener("hashchange", () => {
    const id = hashId();
    if (!id) return;
    currentSection.value = id;
    apply();
    announce();
  });
  document.addEventListener("DOMContentLoaded", () => {
    apply();
    announce();
  });
}
