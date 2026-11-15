// The plate: a Chart.js doughnut sized by the grams actually eaten. Each food icon is placed at the
// middle angle and half way along the radius of its slice, read from the chart's own arc geometry.
import { useEffect, useRef, useState } from "preact/hooks";
import Chart from "chart.js/auto";
import { Beef, Carrot, Wheat } from "lucide-preact";
import { theme } from "../../scripts/theme.js";
import { plateShares } from "../../scripts/nutrition.js";

const GLYPHS = { carb: Wheat, prot: Beef, veg: Carrot };
const COLOUR = { carb: "--am-accent", prot: "--am-warn", veg: "--am-ok" };

function readToken(name) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function PlateChart({ totals }) {
  const canvasRef = useRef(null);
  const lastLayout = useRef("");
  const [points, setPoints] = useState([]);
  const rows = plateShares(totals);
  const empty = rows.every((row) => row.grams <= 0);
  const summary = rows.map((row) => `${row.label} ${Math.round(row.grams)} g, ${Math.round(row.share * 100)}%`).join(". ");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const plugin = {
      id: "nutritionPlateIcons",
      afterDraw(chart) {
        const canvas = chart.canvas;
        const sx = chart.width ? canvas.clientWidth / chart.width : 1;
        const sy = chart.height ? canvas.clientHeight / chart.height : 1;
        const arcs = (chart.getDatasetMeta(0).data || []);
        const next = arcs
          .map((arc, index) => {
            if (!rows[index] || rows[index].grams <= 0) return null;
            const halfAngle = (arc.startAngle + arc.endAngle) / 2;
            const radius = (arc.innerRadius + arc.outerRadius) / 2;
            const centre = typeof arc.getCenterPoint === "function"
              ? arc.getCenterPoint()
              : { x: arc.x + Math.cos(halfAngle) * radius, y: arc.y + Math.sin(halfAngle) * radius };
            return { key: rows[index].key, x: centre.x * sx, y: centre.y * sy };
          })
          .filter(Boolean);
        const layout = JSON.stringify(next);
        if (layout !== lastLayout.current) {
          lastLayout.current = layout;
          setPoints(next);
        }
      }
    };

    const data = empty ? [1] : rows.map((row) => row.grams);
    const colours = empty ? [readToken("--am-track")] : rows.map((row) => readToken(COLOUR[row.key]));
    const chart = new Chart(canvas, {
      type: "doughnut",
      data: { labels: empty ? ["No food"] : rows.map((row) => row.label), datasets: [{ data, backgroundColor: colours, borderWidth: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        animation: false,
        cutout: "56%",
        events: [],
        layout: { padding: 0 },
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      },
      plugins: [plugin]
    });

    return () => { chart.destroy(); setPoints([]); lastLayout.current = ""; };
  }, [rows.map((row) => row.grams).join(","), theme.value]);

  return (
    <div class="ntr-plate-chart" role="img" aria-label={empty ? "No food logged yet" : `Plate shares: ${summary}.`}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {points.map((point) => {
        const Glyph = GLYPHS[point.key];
        return (
          <span key={point.key} class="ntr-plate-icon" style={{ left: `${point.x}px`, top: `${point.y}px` }}>
            <Glyph size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}
