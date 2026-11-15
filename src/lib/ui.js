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

export function toast(message) {
  const id = ++counter;
  toasts.value = [...toasts.value, { id, message }];
  setTimeout(() => {
    toasts.value = toasts.value.filter((item) => item.id !== id);
  }, 3100);
}

if (typeof window !== "undefined") {
  window.AstroMedToast = toast;
  window.AstroMedOpenSettings = openSettings;
  window.AstroMedUI = { openModal, closeModal, openSettings, toast };
}
