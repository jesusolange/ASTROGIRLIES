import { VIEW } from "../../scripts/vision.js";

const PREVIEW_PPMM = 3.78;

export default function GridTest({ ppmm, eye, draft, onChange }) {
  const scale = ppmm || PREVIEW_PPMM;
  const cell = Math.max(8, Math.min(40, VIEW.gridCellMm * scale));
  const size = cell * VIEW.gridCells;
  const marked = new Set(draft.marks.map((m) => `${m.row}-${m.col}`));
  const cells = [];
  for (let r = 0; r < VIEW.gridCells; r++) {
    for (let c = 0; c < VIEW.gridCells; c++) cells.push([r, c]);
  }

  const toggle = (row, col) => {
    const on = marked.has(`${row}-${col}`);
    const marks = on
      ? draft.marks.filter((m) => !(m.row === row && m.col === col))
      : [...draft.marks, { row, col }];
    onChange({ marks, gridAnswer: marks.length ? "changed" : draft.gridAnswer });
  };

  return (
    <div>
      <p class="vs-inst">
        Amsler grid at {VIEW.gridDistanceCm} cm. Cover your {eye === "right" ? "left" : "right"} eye and keep
        looking at the centre dot.
      </p>
      <div class="vs-grid-wrap">
        <div
          class="vs-grid"
          role="img"
          aria-label="Amsler grid with a centre dot"
          style={{ "--vs-cell": `${cell}px`, "--vs-size": `${size}px` }}
        >
          <div class="vs-grid-cells">
            {cells.map(([r, c]) => {
              const on = marked.has(`${r}-${c}`);
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  class={`vs-cell${on ? " marked" : ""}`}
                  tabIndex={-1}
                  aria-pressed={on}
                  aria-label={`Mark row ${r + 1}, column ${c + 1}`}
                  onClick={() => toggle(r, c)}
                />
              );
            })}
          </div>
          <span class="vs-dot" aria-hidden="true" />
        </div>
      </div>
      <p class="vs-hint">Tap the squares where any lines look wavy, blurred or missing. Leave them unmarked if the grid looks even.</p>
      <div class="vs-choices">
        <label class="vs-choice">
          <input type="radio" name="vsGrid" checked={draft.gridAnswer === "normal"} onChange={() => onChange({ gridAnswer: "normal" })} />
          <span>All lines look straight and even</span>
        </label>
        <label class="vs-choice">
          <input type="radio" name="vsGrid" checked={draft.gridAnswer === "changed"} onChange={() => onChange({ gridAnswer: "changed" })} />
          <span>Some lines look wavy, blurred or missing</span>
        </label>
      </div>
      {!ppmm && <p class="vs-note">Not calibrated yet: the grid is a preview. Calibrate the screen before you save.</p>}
    </div>
  );
}
