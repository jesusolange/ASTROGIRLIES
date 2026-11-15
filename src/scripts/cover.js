// The cover: destination planet, mission facts and the sign-in for everyone who shares the device.
import "../styles/cover.css";
import { h, render } from "preact";
import { effect } from "@preact/signals";
import Cover from "../components/cover/Cover.jsx";
import { route } from "../lib/nav.js";
import { isoDay } from "./profile.js";
import { IDLE_MS, activeSignal, loadPeople, lock, peopleSignal } from "./people.js";

export const COVER_DAY_KEY = "astromed-cover-day";

const store = () => (typeof window !== "undefined" && window.AstroMedStore && window.AstroMedStore.store) || null;

let host = null;
let idleTimer = null;
let hiddenAt = 0;

function signInNeeded() {
  const people = peopleSignal.value;
  return people.length !== 1 || Boolean(people[0].pinHash);
}

function openCover() {
  if (host) return;
  host = document.createElement("div");
  host.id = "am-cover";
  document.body.appendChild(host);
  window.__amCoverOpen = true;
  render(h(Cover, { onClosed: closeCover }), host);
}

function closeCover() {
  if (!host) return;
  window.__amCoverOpen = false;
  render(null, host);
  host.remove();
  host = null;
  document.dispatchEvent(new CustomEvent("astromed-cover-closed"));
  // Escape must not leave a locked device on an empty screen.
  if (!activeSignal.value && route.value.area !== "emergency") setTimeout(openCover, 60);
}

function armIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (activeSignal.value) lock(); }, IDLE_MS);
}

function start() {
  loadPeople();
  const api = store();
  if (!api) return;
  if (signInNeeded()) {
    openCover();
    return;
  }
  const today = isoDay(new Date());
  if (api.get(COVER_DAY_KEY, null) === today) return;
  api.set(COVER_DAY_KEY, today);
  openCover();
}

if (typeof document !== "undefined") {
  start();

  effect(() => {
    const { area } = route.value;
    if (!activeSignal.value && area !== "emergency") openCover();
  });

  document.addEventListener("astromed-lock", openCover);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt && Date.now() - hiddenAt >= IDLE_MS) lock();
    hiddenAt = 0;
    armIdle();
  });
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((name) => {
    window.addEventListener(name, armIdle, { capture: true, passive: true });
  });
  armIdle();
}
