// The theme: one stored choice, the document attribute every stylesheet reads, and the signal the bar toggles.
import { signal } from "@preact/signals";

const KEY = "astromed-theme";
const root = typeof document !== "undefined" ? document.documentElement : null;

function stored() {
  try {
    const api = typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store;
    const value = api ? api.get(KEY, null) : null;
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function preferred() {
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

function starting() {
  if (stored()) return stored();
  const painted = root && root.dataset.theme;
  return painted === "light" || painted === "dark" ? painted : preferred();
}

export const theme = signal(starting());

function paint() {
  if (!root) return;
  root.dataset.theme = theme.value;
  root.style.colorScheme = theme.value;
}

export function setTheme(next, remember = true) {
  theme.value = next === "light" ? "light" : "dark";
  paint();
  if (remember) {
    const api = typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store;
    if (api) api.set(KEY, theme.value);
  }
}

export function toggleTheme() {
  setTheme(theme.value === "light" ? "dark" : "light");
}

paint();

if (typeof window !== "undefined" && window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (event) => {
    if (!stored()) setTheme(event.matches ? "light" : "dark", false);
  });
}
