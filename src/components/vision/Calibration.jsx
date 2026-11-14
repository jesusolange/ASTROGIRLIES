import { useState } from "preact/hooks";

const CARD_MM = 85.6;

export default function Calibration({ calibration, onCalibrate }) {
  const [editing, setEditing] = useState(false);
  const [width, setWidth] = useState(() => calibration ? Math.round(calibration.ppmm * CARD_MM) : 300);
  const showForm = !calibration || editing;

  if (!showForm) {
    const when = calibration.calibratedAt
      ? ` on ${new Date(calibration.calibratedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
      : "";
    return (
      <div class="am-panel vs-cal-done">
        <p><b>Screen calibrated.</b> {calibration.ppmm.toFixed(2)} px per mm{when}. The grid and optotypes use this scale.</p>
        <button
          type="button"
          class="am-btn am-btn-soft"
          onClick={() => {
            setWidth(Math.min(620, Math.max(180, Math.round(calibration.ppmm * CARD_MM))));
            setEditing(true);
          }}
        >Recalibrate screen</button>
      </div>
    );
  }

  return (
    <div class="am-panel vs-cal">
      <h3>Calibrate this screen once</h3>
      <p>
        Hold a bank card (ID-1, 85.6 mm long edge; ISO/IEC 7810) against the bar and move the slider until the
        bar matches the card's long edge.
      </p>
      <div class="vs-cal-bar" style={{ width: `${width}px` }}></div>
      <input
        type="range"
        min="180"
        max="620"
        step="1"
        value={width}
        aria-label="Calibration bar width in pixels"
        onInput={(e) => setWidth(Number(e.currentTarget.value))}
      />
      <p class="vs-cal-read">{width} px · {(width / CARD_MM).toFixed(2)} px/mm</p>
      <button type="button" class="am-btn" onClick={() => { onCalibrate(width / CARD_MM); setEditing(false); }}>Save calibration</button>
      {calibration && (
        <button type="button" class="am-btn am-btn-soft" onClick={() => setEditing(false)}>Keep current calibration</button>
      )}
    </div>
  );
}
