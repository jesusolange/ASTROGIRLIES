import CheckupPanel from "./CheckupPanel.jsx";

export default function CheckupPage() {
  return (
    <div id="checkupPage" class="content-grid">
      <section class="twin-card">
        <div class="twin-header">
          <div>
            <h2 class="daily-checkup-title">Daily Checkup</h2>
            <small id="modeText">Suit view · Click to open</small>
          </div>
        </div>

        <div class="figure-scene">
          <div class="glow"></div>
        </div>

        <div class="figure-helper">
          Click astronaut to open · Select a body system
        </div>
      </section>

      <section class="checkup-panel" aria-label="Daily checkup record">
        <CheckupPanel />
      </section>
    </div>
  );
}
