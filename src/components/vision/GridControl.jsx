import { useState } from "preact/hooks";
import { VIEW, EYE_LABEL, gridMetrics } from "../../scripts/vision.js";

export default function GridControl({ ppmm, eye, marks, onChange }) {
  const { cell, size, enlarged } = gridMetrics(ppmm);
  const [cursor, setCursor] = useState({ row: 10, col: 10 });
  const marked = new Set(marks.map((m) => `${m.row}-${m.col}`));
  const cells = [];
  for (let r = 0; r < VIEW.gridCells; r++) {
    for (let c = 0; c < VIEW.gridCells; c++) cells.push([r, c]);
  }

  const toggle = (row, col) => {
    const on = marked.has(`${row}-${col}`);
    onChange(on ? marks.filter((m) => !(m.row === row && m.col === col)) : [...marks, { row, col }]);
  };

  const move = (dr, dc) => setCursor((prev) => ({
    row: Math.min(VIEW.gridCells - 1, Math.max(0, prev.row + dr)),
    col: Math.min(VIEW.gridCells - 1, Math.max(0, prev.col + dc))
  }));

  const onKeyDown = (event) => {
    const key = event.key;
    if (key === "ArrowUp") { event.preventDefault(); move(-1, 0); }
    else if (key === "ArrowDown") { event.preventDefault(); move(1, 0); }
    else if (key === "ArrowLeft") { event.preventDefault(); move(0, -1); }
    else if (key === "ArrowRight") { event.preventDefault(); move(0, 1); }
    else if (key === " " || key === "Spacebar" || key === "Enter") {
      event.preventDefault();
      toggle(cursor.row, cursor.col);
    }
  };

  const at = marked.has(`${cursor.row}-${cursor.col}`);

  return (
    <div class="vs-grid-block">
      <div class="vs-grid-wrap">
        <div
          class="vs-grid"
          role="application"
          tabIndex={0}
          aria-label={`Amsler grid for the ${EYE_LABEL[eye].toLowerCase()}. Use the arrow keys to move and Space to mark a square.`}
          onKeyDown={onKeyDown}
          style={{ "--vs-cell": `${cell}px`, "--vs-size": `${size}px` }}
        >
          <div class="vs-grid-cells">
            {cells.map(([r, c]) => {
              const isMarked = marked.has(`${r}-${c}`);
              const isCursor = cursor.row === r && cursor.col === c;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  tabIndex={-1}
                  class={`vs-cell${isMarked ? " marked" : ""}${isCursor ? " is-cursor" : ""}`}
                  aria-pressed={isMarked}
                  aria-label={`Row ${r + 1}, column ${c + 1}${isMarked ? ", marked" : ""}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => { setCursor({ row: r, col: c }); toggle(r, c); }}
                />
              );
            })}
          </div>
          <span class="vs-dot" aria-hidden="true" />
        </div>
      </div>
      <p class="vs-hint">
        Tap a square, or use the arrow keys and press Space, to mark it. Leave the squares clear where the grid looks even.
      </p>
      <p class="vs-hint" aria-live="polite">
        Row {cursor.row + 1}, column {cursor.col + 1}: {at ? "marked" : "not marked"}. {marks.length} {marks.length === 1 ? "area" : "areas"} marked.
      </p>
      {enlarged ? (
        <p class="vs-note">
          This screen cannot show 5 mm squares large enough to tap, so the grid is drawn at {VIEW.minCellPx} px per square.
        </p>
      ) : null}
    </div>
  );
}
