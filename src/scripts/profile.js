/* ==============================================
   ASTROMED — ASTRONAUT PROFILE (name, mission day, body data)
   Stored in this browser only (localStorage "astromed-profile").
   Load BEFORE astromed-sections.js
============================================== */

(function () {
  "use strict";

  const KEY = "astromed-profile";
  const DAY = 86400000;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const read = () => window.AstroMedStore.store.get(KEY, null) || null;
  const write = (v) => window.AstroMedStore.store.set(KEY, v);

  // Local calendar day number (avoids DST problems)
  const dayNum = (d) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

  function get() { return read(); }

  // Mission day for a given date (default: today). Day 1 = start date.
  function missionDay(date) {
    const p = read();
    if (!p || !p.startDate) return null;
    return dayNum(date || new Date()) - dayNum(parseIso(p.startDate)) + 1;
  }
  function dayOf(iso) { return missionDay(new Date(iso)); }
  function total() { const p = read(); return (p && p.totalDays) || 365; }
  function name() { const p = read(); return (p && p.name) || ""; }
  function dayLabel() { const d = missionDay(); return d == null ? "Mission day not set" : `Mission Day ${d} / ${total()}`; }

  /* ---------- apply to the page ---------- */
  function apply() {
    const p = read();
    const lines = document.querySelectorAll(".astronaut-mission-line");
    if (lines[0]) lines[0].lastElementChild.textContent = dayLabel();
    if (lines[1]) lines[1].lastElementChild.textContent = p && p.name ? p.name : "Tap to set your name";
    document.querySelectorAll("[data-pf-name]").forEach((n) => { n.textContent = name() || "Astronaut"; });
    document.querySelectorAll("[data-pf-day]").forEach((n) => { n.textContent = dayLabel(); });
  }

  /* ---------- editor ---------- */
  function close() { document.querySelector(".pf-wrap")?.remove(); }

  function open(first) {
    close();
    const p = read() || {};
    const today = missionDay();
    const wrap = document.createElement("div");
    wrap.className = "env-pop pf-wrap";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "Astronaut profile");
    wrap.innerHTML = `<div class="env-pop-card pf-card">
      <h3>${first ? "Welcome, astronaut" : "Astronaut profile"}</h3>
      <p class="pf-sub">Saved on this device only. Your name shows in the app and the PDF report. The mission day goes up by itself every day.</p>
      <form id="pfForm" class="pf-grid">
        <label class="pf-f pf-wide"><span>Name</span><input name="name" type="text" maxlength="40" required placeholder="e.g. Solange Quijano" value="${esc(p.name || "")}"></label>
        <label class="pf-f"><span>Today is mission day</span><input name="day" type="number" min="1" max="2000" step="1" required value="${today || 1}"></label>
        <label class="pf-f"><span>Mission length (days)</span><input name="total" type="number" min="1" max="3000" step="1" required value="${total()}"></label>
        <label class="pf-f"><span>Age (years)</span><input name="age" type="number" min="18" max="80" step="1" value="${p.age ?? ""}"></label>
        <label class="pf-f"><span>Sex</span><select name="sex"><option value="">Select</option><option value="f" ${p.sex === "f" ? "selected" : ""}>Female</option><option value="m" ${p.sex === "m" ? "selected" : ""}>Male</option></select></label>
        <label class="pf-f"><span>Weight (kg)</span><input name="weight" type="number" min="30" max="200" step="0.1" value="${p.weightKg ?? ""}"></label>
        <label class="pf-f"><span>Height (cm)</span><input name="height" type="number" min="120" max="230" step="0.5" value="${p.heightCm ?? ""}"></label>
        <p class="pf-note pf-wide">Age, sex, weight and height are optional. Nutrition uses them to set your food goals.</p>
        <div class="pf-actions pf-wide">
          <button type="submit" class="am-btn">Save profile</button>
          <button type="button" class="am-btn am-btn-soft" id="pfCancel">${first ? "Later" : "Cancel"}</button>
        </div>
      </form>
    </div>`;
    document.body.appendChild(wrap);
    const f = wrap.querySelector("#pfForm");
    f.querySelector("[name=name]").focus();
    wrap.querySelector("#pfCancel").addEventListener("click", () => {
      if (first) write({ ...(read() || {}), skipped: true });
      close();
    });
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(f));
      const d = Math.max(1, parseInt(v.day, 10) || 1);
      const start = new Date(); start.setDate(start.getDate() - (d - 1));
      const num = (x) => (x === "" || x == null ? null : Number(x));
      write({
        name: v.name.trim(),
        startDate: isoDay(start),
        totalDays: Math.max(1, parseInt(v.total, 10) || 365),
        age: num(v.age), sex: v.sex || null, weightKg: num(v.weight), heightCm: num(v.height)
      });
      close();
      apply();
      document.dispatchEvent(new CustomEvent("astromed-profile-changed"));
    });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  /* ---------- hooks ---------- */
  function init() {
    apply();
    const badge = document.querySelector(".astronaut-mission-info");
    if (badge) {
      badge.style.cursor = "pointer";
      badge.style.pointerEvents = "auto";
      badge.setAttribute("title", "Edit astronaut profile");
      badge.setAttribute("role", "button");
      badge.setAttribute("tabindex", "0");
      badge.addEventListener("click", () => open(false));
      badge.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(false); } });
    }
    // Add a "Profile" button inside the Settings window
    const body = document.getElementById("modalBody");
    if (body) {
      new MutationObserver(() => {
        const title = document.getElementById("modalTitle");
        if (!title || title.textContent !== "Prototype settings" || body.querySelector(".pf-open")) return;
        const b = document.createElement("button");
        b.type = "button"; b.className = "am-btn pf-open"; b.style.marginBottom = "14px";
        b.textContent = "Edit astronaut profile (name, mission day)";
        b.addEventListener("click", () => { document.getElementById("modalClose")?.click(); open(false); });
        body.insertBefore(b, body.firstChild);
      }).observe(body, { childList: true });
    }
    // First visit: ask once
    const p = read();
    if (!p || (!p.name && !p.skipped)) {
      if (window.__amCoverOpen) document.addEventListener("astromed-cover-closed", () => setTimeout(() => open(true), 500), { once: true });
      else setTimeout(() => open(true), 600);
    }
    // keep the day fresh if the app stays open past midnight
    setInterval(apply, 60000);
  }

  window.AstroMedProfile = { get, missionDay, dayOf, total, name, dayLabel, open: () => open(false), apply };

  document.addEventListener("DOMContentLoaded", init);
})();
