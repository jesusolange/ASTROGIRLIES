/* ==============================================
   ASTROMED — STORAGE
   One place for reading, writing, exporting and importing saved data.
   Every app key lives under the active person; callers use the logical key.
   Migrations: migrations[n](data) upgrades data from version n-1 to n.
============================================= */
const storage = (function (root) {
  const VERSION = 1;
  const APP = "astromed";
  const PREFIX = "astromed-p:";
  const PEOPLE_KEY = "astromed-people";
  const ACTIVE_KEY = "astromed-active-person";
  const RESERVED = new Set([PEOPLE_KEY, ACTIVE_KEY]);
  const isAppKey = (k) => /^(astromed|astrotwin)-/.test(k);
  const isLogicalKey = (k) => isAppKey(k) && !RESERVED.has(k) && !k.startsWith(PREFIX);

  function create(storage, opts = {}) {
    const migrations = opts.migrations || {};
    const now = opts.now || Date.now;
    const STAMP = "am-local-modified"; // not an app key, so it is never exported
    const listeners = [];
    let activeId = null;
    const stampKey = () => (activeId ? `${STAMP}:${activeId}` : STAMP);
    const physical = (k) => (activeId ? `${PREFIX}${activeId}:${k}` : k);
    const touch = (t) => { try { storage.setItem(stampKey(), String(t)); } catch (e) { console.error(e); } };
    const notify = () => listeners.slice().forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });

    const parse = (raw) => {
      try { const v = JSON.parse(raw); return v ?? null; } catch { return null; }
    };
    const get = (k, fb = null) => {
      const v = parse(storage.getItem(physical(k)));
      return v ?? fb;
    };
    const getFor = (personId, k, fb = null) => {
      if (!personId) return fb;
      const v = parse(storage.getItem(`${PREFIX}${personId}:${k}`));
      return v ?? fb;
    };
    const write = (k, v) => {
      try { storage.setItem(k, JSON.stringify(v)); return true; } catch (e) { console.error(e); return false; }
    };
    const writeLogical = (k, v) => write(physical(k), v);
    const set = (k, v) => {
      const ok = writeLogical(k, v);
      if (ok) { touch(now()); notify(); }
      return ok;
    };
    const getModified = () => Number(storage.getItem(stampKey())) || 0;
    const setModified = (t) => touch(t);
    const subscribe = (fn) => { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; };

    const rawKeys = () => {
      const keys = [];
      for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (k) keys.push(k); }
      return keys;
    };

    const appKeys = () => {
      const keys = [];
      rawKeys().forEach((k) => {
        if (RESERVED.has(k) || !isAppKey(k)) return;
        if (k.startsWith(PREFIX)) {
          const own = activeId ? `${PREFIX}${activeId}:` : null;
          if (own && k.startsWith(own)) keys.push(k.slice(own.length));
        } else if (!activeId) {
          keys.push(k);
        }
      });
      return keys;
    };

    const hasLegacyData = () => rawKeys().some((k) => isLogicalKey(k));

    // Move the unscoped keys an older version left behind under one person.
    function migrateLegacy(personId) {
      if (!personId) return 0;
      let moved = 0;
      rawKeys().forEach((k) => {
        if (!isLogicalKey(k)) return;
        const raw = storage.getItem(k);
        try { storage.setItem(`${PREFIX}${personId}:${k}`, raw); storage.removeItem(k); moved++; } catch (e) { console.error(e); }
      });
      return moved;
    }

    function removePerson(personId) {
      if (!personId) return 0;
      const own = `${PREFIX}${personId}:`;
      let removed = 0;
      rawKeys().forEach((k) => { if (k.startsWith(own)) { storage.removeItem(k); removed++; } });
      if (activeId === personId) activeId = null;
      return removed;
    }

    const setActive = (personId) => { activeId = personId || null; notify(); };
    const active = () => activeId;

    const registry = {
      get: (k, fb = null) => {
        const v = parse(storage.getItem(k));
        return v ?? fb;
      },
      set: (k, v) => write(k, v),
      remove: (k) => { try { storage.removeItem(k); } catch (e) { console.error(e); } },
      keys: rawKeys,
    };

    function exportAll() {
      const data = {};
      appKeys().forEach((k) => { data[k] = get(k); });
      return { app: APP, version: VERSION, exportedAt: new Date().toISOString(), data };
    }

    function importAll(text, o = {}) {
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
      const bad = keys.find((k) => !isLogicalKey(k));
      if (bad) throw new Error(`Unexpected key "${bad}" in the file.`);
      const backup = {};
      const owned = appKeys().map(physical);
      owned.forEach((k) => { backup[k] = storage.getItem(k); });
      owned.forEach((k) => storage.removeItem(k));
      if (!keys.every((k) => writeLogical(k, data[k]))) {
        owned.forEach((k) => storage.removeItem(k));
        Object.keys(backup).forEach((k) => { try { storage.setItem(k, backup[k]); } catch (e) { console.error(e); } });
        throw new Error("Could not save the imported data (browser storage is full). Your previous data was kept.");
      }
      touch(o.modifiedAt ?? now());
      notify();
      return keys.length;
    }

    return {
      get, getFor, set, setActive, active, appKeys, exportAll, importAll, getModified, setModified,
      subscribe, hasLegacyData, migrateLegacy, removePerson, registry
    };
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

  const api = { VERSION, create, memoryStorage, PREFIX, PEOPLE_KEY, ACTIVE_KEY };
  if (typeof window !== "undefined") {
    let backend;
    try { backend = root.localStorage; backend.getItem("astromed-probe"); } catch { backend = memoryStorage(); }
    api.store = create(backend, { migrations: {} });
    root.AstroMedStore = api;
  }
  return api;
})(typeof window !== "undefined" ? window : globalThis);

export const { VERSION, create, memoryStorage, PREFIX, PEOPLE_KEY, ACTIVE_KEY } = storage;
