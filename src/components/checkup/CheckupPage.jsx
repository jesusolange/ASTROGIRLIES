import { useEffect, useRef } from "preact/hooks";
import CheckupPanel from "./CheckupPanel.jsx";
import { attachCheckup3d } from "../../scripts/astronaut3d/checkup-bridge.js";

export default function CheckupPage() {
  const scene = useRef(null);
  useEffect(() => attachCheckup3d(scene.current), []);
  return (
    <div id="checkupPage" class="content-grid">
      <section class="twin-card">
        <div class="twin-header">
          <div>
            <h2 class="daily-checkup-title">Daily Checkup</h2>
            <small id="modeText">Suit view · Click to open</small>
          </div>
        </div>

        <div class="figure-scene" ref={scene}>
          <div class="glow"></div>
        </div>
      </section>

      <section class="checkup-panel" aria-label="Daily checkup record">
        <CheckupPanel />
      </section>
    </div>
  );
}
