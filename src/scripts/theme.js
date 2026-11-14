const THEME_KEY = "astromed-theme";
const root = document.documentElement;
const store = window.AstroMedStore && window.AstroMedStore.store;
const prefersLight = window.matchMedia("(prefers-color-scheme: light)");
let current = "dark";

function stored() {
  try {
    const value = store ? store.get(THEME_KEY, null) : null;
    return value === "light" || value === "dark" ? value : null;
  } catch (error) {
    return null;
  }
}

function initial() {
  return stored() || (prefersLight.matches ? "light" : "dark");
}

function paint(next) {
  current = next === "light" ? "light" : "dark";
  root.dataset.theme = current;
  root.style.colorScheme = current;
  const toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    const nextName = current === "light" ? "dark" : "light";
    toggle.setAttribute("aria-pressed", String(current === "light"));
    toggle.setAttribute("aria-label", "Switch to " + nextName + " theme");
    const label = toggle.querySelector("[data-theme-label]");
    if (label) label.textContent = current === "light" ? "Light" : "Dark";
  }
}

function setTheme(next, remember) {
  paint(next);
  if (remember && store) store.set(THEME_KEY, current);
}

function profileName() {
  const profile = window.AstroMedProfile;
  return profile && typeof profile.name === "function" ? profile.name() : "";
}

function renderProfile() {
  const sync = window.AstroMedSync;
  const session = sync && typeof sync.session === "function" ? sync.session() : null;
  const online = navigator.onLine !== false;
  const nameEl = document.querySelector("[data-profile-name]");
  const stateEl = document.querySelector("[data-profile-state]");
  const dot = document.querySelector("[data-profile-state-dot]");
  const name = profileName();

  let title = "Guest";
  let state = "Not signed in · saved here";
  let dotState = "guest";

  if (session && session.email) {
    title = session.email;
    state = online ? "Signed in · sync on" : "Signed in · offline";
    dotState = online ? "signed-in" : "offline";
  } else if (!online) {
    title = name || "Guest";
    state = "Not signed in · offline";
    dotState = "offline";
  } else if (name) {
    title = name;
  }

  if (nameEl) nameEl.textContent = title;
  if (stateEl) stateEl.textContent = state;
  if (dot) dot.dataset.state = dotState;

  const chip = document.querySelector("[data-profile-open]");
  if (chip) chip.setAttribute("aria-label", title + " · " + state + " · open account settings");
}

function openAccount() {
  const settings = document.querySelector('.nav button[data-action="settings"]');
  if (settings) settings.click();
  renderProfile();
  window.setTimeout(() => {
    const body = document.getElementById("modalBody");
    const box = body && body.lastElementChild;
    if (box && typeof box.scrollIntoView === "function") box.scrollIntoView({ block: "nearest" });
  }, 90);
}

function bind() {
  paint(initial());
  const toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", () => setTheme(current === "light" ? "dark" : "light", true));
  }
  const chip = document.querySelector("[data-profile-open]");
  if (chip) chip.addEventListener("click", openAccount);

  renderProfile();
  if (store && typeof store.subscribe === "function") store.subscribe(renderProfile);
  window.addEventListener("online", renderProfile);
  window.addEventListener("offline", renderProfile);
  window.addEventListener("focus", renderProfile);
  document.addEventListener("astromed-profile-changed", renderProfile);
  const close = document.getElementById("modalClose");
  if (close) close.addEventListener("click", () => window.setTimeout(renderProfile, 0));

  const onChange = (event) => {
    if (!stored()) paint(event.matches ? "light" : "dark");
  };
  if (typeof prefersLight.addEventListener === "function") prefersLight.addEventListener("change", onChange);
}

paint(initial());

document.addEventListener("DOMContentLoaded", bind);

window.AstroMedTheme = { get: () => current, set: (next) => setTheme(next, true) };
