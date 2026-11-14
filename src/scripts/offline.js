// Offline support: register the service worker in production builds and show the offline and
// update notices. The service worker itself is public/sw.js, filled in after each build.
import { render } from "preact";
import OfflineIndicator from "../components/offline/OfflineIndicator.jsx";
import UpdateNotice from "../components/offline/UpdateNotice.jsx";

function mountOfflineIndicator() {
  const foot = document.querySelector(".nav-foot");
  if (!foot) return;

  const host = document.createElement("div");
  foot.append(host);
  const draw = () => render(<OfflineIndicator online={navigator.onLine !== false} />, host);
  draw();
  window.addEventListener("online", draw);
  window.addEventListener("offline", draw);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const host = document.createElement("div");
  document.body.append(host);
  let waiting = null;
  let reloadRequested = false;

  function applyUpdate() {
    if (!waiting) {
      location.reload();
      return;
    }
    reloadRequested = true;
    waiting.postMessage({ type: "SKIP_WAITING" });
  }

  function offerUpdate(worker) {
    waiting = worker;
    render(<UpdateNotice onReload={applyUpdate} />, host);
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadRequested) location.reload();
  });

  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      if (registration.waiting && navigator.serviceWorker.controller) offerUpdate(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) offerUpdate(installing);
        });
      });
    })
    .catch((error) => console.error("Service worker registration failed:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  mountOfflineIndicator();
  if (import.meta.env.PROD) registerServiceWorker();
});
