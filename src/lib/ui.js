// Shared shell state: the modal dialog, toasts, and the Settings opener.
// Older modules that build sections from strings can call window.AstroMedToast.
import { signal } from "@preact/signals";

export const modal = signal(null);
export const toasts = signal([]);

let counter = 0;

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
// keeps the toast for eight seconds. A plain string is accepted for older callers.
export function toast(input) {
  const next = typeof input === "string" ? { text: input } : (input || {});
  const text = String(next.text || "");
  if (!text) return;
  const id = ++counter;
  const undo = typeof next.undo === "function" ? next.undo : null;
  const ttl = undo ? 8000 : 3200;
  toasts.value = [...toasts.value, { id, text, message: text, undo }];
  setTimeout(() => dismissToast(id), ttl);
}

export function dismissToast(id) {
  toasts.value = toasts.value.filter((item) => item.id !== id);
}

if (typeof window !== "undefined") {
  window.AstroMedToast = toast;
  window.AstroMedOpenSettings = openSettings;
  window.AstroMedUI = { openModal, closeModal, openSettings, toast, dismissToast };
}
