// Shared shell state: the modal dialog, toasts, the keyboard shortcuts and the Settings opener.
// Older modules that build sections from strings can call window.AstroMedToast.
import { signal } from "@preact/signals";
import { go, route } from "./nav.js";

export const modal = signal(null);
export const toasts = signal([]);

let counter = 0;

export const SHORTCUTS = [
  { keys: "E", action: "Open Emergency" },
  { keys: "H", action: "Go to Home" },
  { keys: "C", action: "Go to Check" },
  { keys: "P", action: "Go to Progress" },
  { keys: "/", action: "Focus the search on Emergency" },
  { keys: "Esc", action: "Close a dialog or leave a card" }
];

export function openModal(next) {
  modal.value = next;
}

export function closeModal() {
  modal.value = null;
}

export function openSettings() {
  modal.value = { type: "settings", title: "Settings" };
}

// Show a short message at the bottom of the screen. `undo`, when given, adds an Undo button and
// keeps the toast for eight seconds; `undoLabel` names that button. A plain string is accepted for
// older callers.
export function toast(input) {
  const next = typeof input === "string" ? { text: input } : (input || {});
  const text = String(next.text || "");
  if (!text) return;
  const id = ++counter;
  const undo = typeof next.undo === "function" ? next.undo : null;
  const undoLabel = undo ? String(next.undoLabel || "Undo") : null;
  const ttl = undo ? 8000 : 3200;
  toasts.value = [...toasts.value, { id, text, message: text, undo, undoLabel }];
  setTimeout(() => dismissToast(id), ttl);
}

export function dismissToast(id) {
  toasts.value = toasts.value.filter((item) => item.id !== id);
}

function isTyping(target) {
  const tag = target && target.tagName;
  return Boolean(target && (target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"));
}

function hasOpenLayer() {
  if (typeof document === "undefined") return true;
  if (document.querySelector("dialog[open]")) return true;
  try {
    return Boolean(document.querySelector(":popover-open"));
  } catch {
    return false;
  }
}

function leaveCard() {
  const { area, id } = route.value;
  if (!id) return false;
  if (area === "check") {
    go("#/check");
    return true;
  }
  if (area === "emergency") {
    go("#/emergency");
    return true;
  }
  return false;
}

function focusEmergencySearch() {
  const focus = () => {
    const input = document.querySelector(".ui-search-input");
    if (input && typeof input.focus === "function") input.focus();
  };
  if (route.value.area === "emergency" && !route.value.id) {
    focus();
    return;
  }
  go("#/emergency");
  setTimeout(focus, 80);
}

const NAV_KEYS = { e: "emergency", h: "home", c: "check", p: "progress" };

function installShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    const key = String(event.key).toLowerCase();
    if (event.key === "Escape") {
      if (window.__amCoverOpen || isTyping(event.target) || hasOpenLayer()) return;
      if (leaveCard()) event.preventDefault();
      return;
    }
    if (key !== "/" && !NAV_KEYS[key]) return;
    // A shortcut never fires in a field or under a dialog. Leave the key alone there: preventing its
    // default would stop the letter from being typed.
    if (window.__amCoverOpen || isTyping(event.target) || hasOpenLayer()) return;
    event.preventDefault();
    if (key === "/") focusEmergencySearch();
    else go(NAV_KEYS[key]);
  });
}

if (typeof window !== "undefined") {
  installShortcuts();
  window.AstroMedToast = toast;
  window.AstroMedOpenSettings = openSettings;
  window.AstroMedUI = { openModal, closeModal, openSettings, toast, dismissToast };
}
