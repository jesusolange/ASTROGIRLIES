/* ==============================================
   ASTROMED — STORAGE
   One place for reading, writing, exporting and importing saved data.
   Load BEFORE the other astromed-* scripts.
   Migrations: migrations[n](data) upgrades data from version n-1 to n.
============================================== */
(function (root) {
  "use strict";
  const VERSION = 1;
  const APP = "astromed";
  const isAppKey = (k) => /^(astromed|astrotwin)-/.test(k);

  function create(storage, opts = {}) {
    const migrations = opts.migrations || {};

    const get = (k, fb = null) => {
      try { const v = JSON.parse(storage.getItem(k)); return v ?? fb; } catch { return fb; }
    };
    const set = (k, v) => {
      try { storage.setItem(k, JSON.stringify(v)); return true; } catch (e) { console.error(e); return false; }
    };
    const appKeys = () => {
      const keys = [];
      for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (k && isAppKey(k)) keys.push(k); }
      return keys;
    };

    function exportAll() {
      const data = {};
      appKeys().forEach((k) => { data[k] = get(k); });
      return { app: APP, version: VERSION, exportedAt: new Date().toISOString(), data };
    }

    function importAll(text) {
      let doc;
      try { doc = JSON.parse(text); } catch { throw new Error("This file is not valid JSON."); }
      if (!doc || doc.app !== APP || typeof doc.data !== "object" || doc.data === null) {
        throw new Error("This is not an AstroMed export file.");
      }
      const ver = Number(doc.version);
      if (!Number.isInteger(ver) || ver < 0) throw new Error("This file has no valid version.");
      if (ver > VERSION) throw new Error("This file is from a newer version of AstroMed.");
      let data = doc.data;
      for (let v = ver + 1; v <= VERSION; v++) if (migrations[v]) data = migrations[v](data);
      const keys = Object.keys(data);
      const bad = keys.find((k) => !isAppKey(k));
      if (bad) throw new Error(`Unexpected key "${bad}" in the file.`);
      const backup = {};
      appKeys().forEach((k) => { backup[k] = storage.getItem(k); });
      appKeys().forEach((k) => storage.removeItem(k));
      if (!keys.every((k) => set(k, data[k]))) {
        appKeys().forEach((k) => storage.removeItem(k));
        Object.keys(backup).forEach((k) => { try { storage.setItem(k, backup[k]); } catch (e) { console.error(e); } });
        throw new Error("Could not save the imported data (browser storage is full). Your previous data was kept.");
      }
      return keys.length;
    }

    return { get, set, appKeys, exportAll, importAll };
  }

  function memoryStorage() {
    const m = new Map();
    return {
      get length() { return m.size; },
      key: (i) => [...m.keys()][i] ?? null,
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => { m.set(k, String(v)); },
      removeItem: (k) => { m.delete(k); },
    };
  }

  const api = { VERSION, create, memoryStorage };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    let backend;
    try { backend = root.localStorage; backend.getItem("astromed-probe"); } catch { backend = memoryStorage(); }
    api.store = create(backend, { migrations: {} });
    root.AstroMedStore = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
