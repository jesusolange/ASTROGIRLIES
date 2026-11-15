// The cover: destination planet, mission facts and one way in. Shown once per calendar day.
import "../styles/cover.css";
import { h, render } from "preact";
import Cover from "../components/cover/Cover.jsx";
import { isoDay } from "./profile.js";

export const COVER_DAY_KEY = "astromed-cover-day";

function mountCover() {
  const store = window.AstroMedStore && window.AstroMedStore.store;
  if (!store) return;
  const today = isoDay(new Date());
  if (store.get(COVER_DAY_KEY, null) === today) return;
  store.set(COVER_DAY_KEY, today);

  const host = document.createElement("div");
  host.id = "am-cover";
  document.body.appendChild(host);
  window.__amCoverOpen = true;

  function done() {
    window.__amCoverOpen = false;
    render(null, host);
    host.remove();
    document.dispatchEvent(new CustomEvent("astromed-cover-closed"));
  }

  render(h(Cover, { onClosed: done }), host);
}

if (typeof document !== "undefined") mountCover();
