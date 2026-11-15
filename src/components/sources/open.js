import { signal } from "@preact/signals";

export const sourcesDialog = signal({ open: false, id: null });

export function openSources(id = null) {
  sourcesDialog.value = { open: true, id: id || null };
}

export function closeSources() {
  sourcesDialog.value = { open: false, id: null };
}
