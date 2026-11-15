/* The people who share this device. The list lives under one key outside any
   person's data; each person's records live under their own storage prefix.
   PINs are stored as a salted PBKDF2 hash made with Web Crypto, never as digits. */
import { signal } from "@preact/signals";
import { PEOPLE_KEY } from "./storage.js";
import { KEY as PROFILE_KEY } from "./profile.js";

export { PEOPLE_KEY };
export const PIN_MIN = 4;
export const PIN_MAX = 8;
export const IDLE_MS = 10 * 60 * 1000;
const ITERATIONS = 120000;

export const peopleSignal = signal([]);
export const activeSignal = signal(null);

const store = () => (typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store) || null;

export function isValidPin(pin) {
  return typeof pin === "string" && new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin);
}

export function personById(list, id) {
  return (list || []).find((person) => person.id === id) || null;
}

export function activePerson(list, activeId) {
  return activeId ? personById(list, activeId) : null;
}

function cleanName(name) {
  return String(name || "").trim().slice(0, 40);
}

export function addToList(list, person) {
  const name = cleanName(person && person.name);
  const id = person && person.id;
  if (!id) throw new Error("A person needs an identifier.");
  if (!name) throw new Error("A person needs a name.");
  if (personById(list, id)) throw new Error("That person is already on this device.");
  return [...(list || []), { id, name, pinSalt: person.pinSalt || null, pinHash: person.pinHash || null }];
}

export function removeFromList(list, id) {
  return (list || []).filter((person) => person.id !== id);
}

export function newId(list = []) {
  const used = new Set(list.map((person) => person.id));
  let id = "";
  do {
    id = `p${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
  } while (used.has(id));
  return id;
}

const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const bytesOf = (text) => new TextEncoder().encode(text);

function randomSalt() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return hex(bytes);
}

export async function hashPin(pin, saltHex) {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) throw new Error("This browser cannot set a PIN.");
  const salt = new Uint8Array((saltHex.match(/.{2}/g) || []).map((pair) => parseInt(pair, 16)));
  const key = await subtle.importKey("raw", bytesOf(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return hex(new Uint8Array(bits));
}

export async function makePin(pin) {
  if (!isValidPin(pin)) throw new Error(`Use ${PIN_MIN} to ${PIN_MAX} digits.`);
  const pinSalt = randomSalt();
  return { pinSalt, pinHash: await hashPin(pin, pinSalt) };
}

export async function verifyPin(person, pin) {
  if (!person || !person.pinHash) return true;
  if (!isValidPin(pin)) return false;
  return (await hashPin(pin, person.pinSalt)) === person.pinHash;
}

function registryOf(api) {
  return api && api.registry ? api.registry : null;
}

function listFrom(api) {
  const registry = registryOf(api);
  const raw = registry ? registry.get(PEOPLE_KEY, []) : [];
  if (!Array.isArray(raw)) return [];
  return raw.filter((person) => person && person.id && cleanName(person.name));
}

function writeList(api, list) {
  const registry = registryOf(api);
  if (registry) registry.set(PEOPLE_KEY, list);
  publish(list);
}

function publish(list = peopleList()) {
  peopleSignal.value = list;
  const api = store();
  activeSignal.value = activePerson(list, api ? api.active() : null);
}

export function peopleList() {
  const api = store();
  return api ? listFrom(api) : peopleSignal.value;
}

export function personCount() {
  return peopleList().length;
}

export function currentPerson() {
  const api = store();
  return api ? activePerson(listFrom(api), api.active()) : null;
}

// Turn the data an older version saved into the first person. Returns the new list.
export function prepareDevice(api) {
  let list = listFrom(api);
  if (!list.length && api.hasLegacyData()) {
    list = [personForLegacy(api, list)];
    const registry = registryOf(api);
    if (registry) registry.set(PEOPLE_KEY, list);
  }
  return list;
}

function personForLegacy(api, list) {
  const profile = api.get(PROFILE_KEY, null);
  const person = {
    id: newId(list),
    name: cleanName(profile && profile.name) || "Astronaut",
    pinSalt: null,
    pinHash: null
  };
  api.migrateLegacy(person.id);
  return person;
}

function applyStartRule(api, list) {
  if (list.length === 1 && !list[0].pinHash) api.setActive(list[0].id);
  else if (!api.active()) api.setActive(null);
}

let watching = false;
let promoting = false;
let loaded = false;

function promoteProfile(api, profile) {
  const list = listFrom(api);
  const person = personForLegacy(api, list);
  person.name = cleanName(profile && profile.name) || person.name;
  const next = [...list, person];
  promoting = true;
  try {
    writeList(api, next);
    api.setActive(person.id);
  } finally {
    promoting = false;
  }
}

function syncProfileName(api, list, activeId) {
  const person = personById(list, activeId);
  const profile = api.get(PROFILE_KEY, null);
  const name = cleanName(profile && profile.name);
  if (!person || !name || person.name === name) return;
  writeList(api, list.map((item) => (item.id === activeId ? { ...item, name } : item)));
}

function watch(api) {
  if (watching) return;
  watching = true;
  api.subscribe(() => {
    if (promoting) return;
    const list = listFrom(api);
    const activeId = api.active();
    if (!activeId) {
      const profile = api.get(PROFILE_KEY, null);
      if (profile && cleanName(profile.name)) promoteProfile(api, profile);
    } else {
      syncProfileName(api, list, activeId);
    }
    publish();
  });
}

export function loadPeople() {
  const api = store();
  if (!api) return [];
  if (loaded) return listFrom(api);
  loaded = true;
  const list = prepareDevice(api);
  applyStartRule(api, list);
  publish(list);
  watch(api);
  return list;
}

export async function signIn(id, pin) {
  const api = store();
  const person = personById(listFrom(api || {}), id);
  if (!api || !person) return { ok: false, error: "Choose your name first." };
  if (await verifyPin(person, pin)) {
    api.setActive(person.id);
    publish();
    return { ok: true, person };
  }
  return { ok: false, error: "Wrong PIN. Try again." };
}

export function enter(id) {
  const api = store();
  const person = personById(listFrom(api || {}), id);
  if (!api || !person) return { ok: false, error: "Choose your name first." };
  if (person.pinHash) return { ok: false, error: "Enter your PIN." };
  api.setActive(person.id);
  publish();
  return { ok: true, person };
}

export function pinEntryErrors(pin, repeat) {
  const errors = {};
  if (!isValidPin(pin)) errors.pin = `Use ${PIN_MIN} to ${PIN_MAX} digits.`;
  if (pin !== repeat) errors.repeat = "The new PINs do not match.";
  return errors;
}

export async function savePinFor(id, pin, repeat, currentPin) {
  const api = store();
  const person = personById(listFrom(api || {}), id);
  if (!api || !person) return { ok: false, errors: { pin: "Choose your name first." } };
  if (person.pinHash && !(await verifyPin(person, currentPin || ""))) {
    return { ok: false, errors: { current: "Wrong current PIN. Try again." } };
  }
  const errors = pinEntryErrors(pin, repeat);
  if (Object.keys(errors).length) return { ok: false, errors };
  const code = await makePin(pin);
  writeList(api, listFrom(api).map((item) => (item.id === id ? { ...item, ...code } : item)));
  return { ok: true };
}

export async function clearPinFor(id, currentPin) {
  const api = store();
  const person = personById(listFrom(api || {}), id);
  if (!api || !person) return { ok: false, errors: { current: "Choose your name first." } };
  if (person.pinHash && !(await verifyPin(person, currentPin || ""))) {
    return { ok: false, errors: { current: "Wrong current PIN. Try again." } };
  }
  writeList(api, listFrom(api).map((item) => (item.id === id ? { ...item, pinSalt: null, pinHash: null } : item)));
  return { ok: true };
}

export function removePerson(id) {
  const api = store();
  if (!api) return;
  const wasActive = api.active() === id;
  api.removePerson(id);
  const list = removeFromList(listFrom(api), id);
  writeList(api, list);
  if (wasActive) api.setActive(null);
  if (typeof document !== "undefined") document.dispatchEvent(new CustomEvent("astromed-lock"));
}

export function lock() {
  const api = store();
  if (!api || !api.active()) return;
  api.setActive(null);
  publish();
  if (typeof document !== "undefined") document.dispatchEvent(new CustomEvent("astromed-lock"));
}

if (typeof window !== "undefined") loadPeople();
