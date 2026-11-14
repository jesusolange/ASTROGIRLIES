import { NEAR_LINES, VIEW } from "../../scripts/vision.js";
import Optotype from "./Optotype.jsx";

const PREVIEW_PPMM = 3.78;

function chosenText(value) {
  if (value === -1) return "You selected: could not read the largest line.";
  if (value === null) return "Choose one line below.";
  return `You selected: ${NEAR_LINES[value].snellen}.`;
}

export default function NearTest({ ppmm, draft, onChange }) {
  const scale = ppmm || PREVIEW_PPMM;
  return (
    <div>
      <p class="vs-inst">
        Near-vision chart at {VIEW.nearDistanceCm} cm. These are tumbling E optotypes; read the openings, not the
        letters. Pick the smallest line you read correctly in full.
      </p>
      <div class="vs-chart">
        {NEAR_LINES.map((line, i) => {
          const px = Math.max(1.5, line.mm * scale);
          const on = draft.near === i;
          return (
            <button
              key={line.snellen}
              type="button"
              class={`vs-line${on ? " on" : ""}`}
              aria-pressed={on}
              onClick={() => onChange({ near: i })}
              style={{ "--vs-opt": `${px}px` }}
            >
              <span class="vs-line-opts">
                {[0, 1, 2, 3, 4].map((k) => <Optotype key={k} rotation={((i + k) % 4) * 90} />)}
              </span>
              <span class="vs-line-lab">{line.snellen}<small>{line.mm.toFixed(2)} mm</small></span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        class={`vs-line vs-cannot${draft.near === -1 ? " on" : ""}`}
        aria-pressed={draft.near === -1}
        onClick={() => onChange({ near: -1 })}
      >
        <span class="vs-line-lab">I could not read the largest line</span>
      </button>
      <p class="vs-chosen" aria-live="polite">{chosenText(draft.near)}</p>
      {!ppmm && <p class="vs-note">Not calibrated yet: the sizes are a preview. Calibrate the screen before you save.</p>}
    </div>
  );
}
