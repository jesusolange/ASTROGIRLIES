import { useEffect, useState } from "preact/hooks";
// Importing the storage module guarantees window.AstroMedStore exists before any island reads it.
import "../scripts/storage.js";

const store = () => window.AstroMedStore.store;

// A stored record as component state: [value, save]. Re-reads when any part of the app writes to the store.
export function useStored(key, fallback) {
  const [value, setValue] = useState(() => store().get(key, fallback));
  useEffect(() => store().subscribe(() => setValue(store().get(key, fallback))), [key]);
  const save = (next) => {
    store().set(key, next);
    setValue(next);
  };
  return [value, save];
}
