/* ==============================================
   ASTROMED — COVER PAGE (shown on every start)
   Load BEFORE astromed-profile.js
============================================== */
(function () {
  "use strict";
  const css = `
  .amc{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px;
    background:radial-gradient(ellipse at 50% 120%,#12356a 0%,#07142b 45%,#02060f 100%);color:#e9f2ff;font-family:inherit;transition:opacity .6s,transform .6s}
  .amc.out{opacity:0;transform:scale(1.04);pointer-events:none}
  .amc-stars,.amc-stars:before,.amc-stars:after{content:"";position:absolute;inset:0;background-repeat:repeat;pointer-events:none}
  .amc-stars{background-image:radial-gradient(1.5px 1.5px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 90px 120px,#bfe6ff,transparent),radial-gradient(1.5px 1.5px at 160px 60px,#fff,transparent),radial-gradient(1px 1px at 230px 180px,#fff,transparent);background-size:260px 220px;animation:amcDrift 90s linear infinite;opacity:.8}
  .amc-stars:before{background-image:radial-gradient(2px 2px at 60px 90px,#8fd3ff,transparent),radial-gradient(1px 1px at 200px 40px,#fff,transparent),radial-gradient(1.5px 1.5px at 130px 200px,#fff,transparent);background-size:340px 300px;animation:amcDrift 150s linear infinite reverse;opacity:.6}
  @keyframes amcDrift{to{background-position:-520px 440px}}
  .amc-in{position:relative;max-width:980px;width:100%;text-align:center;margin:auto}
  .amc-orbit{width:120px;height:120px;margin:0 auto 10px;position:relative}
  .amc-orbit i{position:absolute;inset:0;border:1.5px solid rgba(111,227,255,.5);border-radius:50%;transform:rotateX(70deg)}
  .amc-orbit i:nth-child(2){transform:rotateX(70deg) rotateZ(60deg);border-color:rgba(53,212,154,.5)}
  .amc-orbit b{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#8fd3ff,#1b5fb5 70%);box-shadow:0 0 28px #6fe3ff88;animation:amcPulse 3s ease-in-out infinite}
  @keyframes amcPulse{50%{box-shadow:0 0 46px #6fe3ffcc;transform:scale(1.08)}}
  .amc h1{font-size:clamp(2.4rem,7vw,4.4rem);margin:0;letter-spacing:.04em;background:linear-gradient(90deg,#8fd3ff,#6fe3ff,#35d49a);-webkit-background-clip:text;background-clip:text;color:transparent}
  .amc-sub{font-size:clamp(1rem,2.4vw,1.35rem);color:#cfe3ff;margin:8px auto 26px;max-width:640px;line-height:1.45}
  .amc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin:0 auto 28px}
  .amc-c{padding:18px 16px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(111,227,255,.25);backdrop-filter:blur(6px);text-align:left;animation:amcUp .7s both}
  .amc-c:nth-child(2){animation-delay:.1s}.amc-c:nth-child(3){animation-delay:.2s}.amc-c:nth-child(4){animation-delay:.3s}
  @keyframes amcUp{from{opacity:0;transform:translateY(18px)}}
  .amc-c span{font-size:2rem;display:block;margin-bottom:6px}
  .amc-c b{display:block;color:#8fd3ff;font-size:1.05rem;margin-bottom:4px}
  .amc-c p{margin:0;color:#b9cfee;font-size:.92rem;line-height:1.4}
  .amc-go{font:inherit;font-size:1.2rem;font-weight:700;padding:15px 44px;border-radius:999px;border:0;cursor:pointer;color:#03101f;background:linear-gradient(90deg,#6fe3ff,#35d49a);box-shadow:0 0 30px #6fe3ff66;animation:amcPulse2 2.4s ease-in-out infinite}
  @keyframes amcPulse2{50%{box-shadow:0 0 52px #6fe3ffaa}}
  .amc-note{margin:16px 0 0;color:#8aa6cc;font-size:.82rem}
  .amc-team{margin:6px 0 0;color:#6f8cb5;font-size:.78rem}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const el = document.createElement("div");
  el.className = "amc"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Welcome to AstroMed");
  el.innerHTML = `<div class="amc-stars"></div><div class="amc-in">
    <div class="amc-orbit" aria-hidden="true"><i></i><i></i><b></b></div>
    <h1>AstroMed</h1>
    <p class="amc-sub">Your health partner in space. See your body, track your day, and get simple advice when the ground team is far away.</p>
    <div class="amc-grid">
      <div class="amc-c"><span>🧑‍🚀</span><b>Daily checkup</b><p>Tap each body part in 3D. Green is good, red needs care.</p></div>
      <div class="amc-c"><span>🛰️</span><b>Place &amp; radiation</b><p>ISS, Moon or Mars: air, radiation and message delay.</p></div>
      <div class="amc-c"><span>🍽️</span><b>Food &amp; exercise</b><p>Scan a barcode, log training, keep your streak.</p></div>
      <div class="amc-c"><span>📄</span><b>Ready score &amp; report</b><p>One score for the day and a PDF for your doctor.</p></div>
    </div>
    <button type="button" class="amc-go" id="amcGo">Enter AstroMed</button>
    <p class="amc-note">Click anywhere or press Enter. Your data stays on this device.</p>
    <p class="amc-team">Team AstroGirlies · NASA Space Apps 2026</p>
  </div>`;
  window.__amCoverOpen = true;
  document.body.appendChild(el);

  function close() {
    if (!window.__amCoverOpen) return;
    window.__amCoverOpen = false;
    el.classList.add("out");
    document.removeEventListener("keydown", key);
    setTimeout(() => el.remove(), 700);
    document.dispatchEvent(new CustomEvent("astromed-cover-closed"));
  }
  function key(e) { if (e.key === "Enter" || e.key === " " || e.key === "Escape") { e.preventDefault(); close(); } }
  el.addEventListener("click", close);
  document.addEventListener("keydown", key);
  setTimeout(() => el.querySelector("#amcGo").focus(), 50);
})();
