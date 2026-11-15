import { useEffect, useRef } from "preact/hooks";
import {
  CategoryScale, Chart, LineController, LineElement, LinearScale, PointElement, Tooltip
} from "chart.js";
import { theme } from "../../scripts/theme.js";
import { dateLabel, formatValue, missionLabel } from "../../scripts/progress.js";
import "./progress.css";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function MeasureChart({ measure, series, projection = null, profile = null }) {
  const canvas = useRef(null);
  const chart = useRef(null);
  const palette = theme.value;

  useEffect(() => {
    if (!canvas.current) return undefined;
    const colour = {
      accent: token("--am-accent"), grid: token("--am-chart-grid"), text: token("--am-text-muted"),
      surface: token("--am-surface"), ok: token("--am-ok"), info: token("--am-info")
    };
    const numeric = series.values.filter((value) => Number.isFinite(value));
    let lo = Math.min(...numeric, ...(measure.band ? [measure.band[0]] : []), projection == null ? Infinity : projection);
    let hi = Math.max(...numeric, ...(measure.band ? [measure.band[1]] : []), projection == null ? -Infinity : projection);
    if (!Number.isFinite(lo)) lo = 0;
    if (!Number.isFinite(hi)) hi = 1;
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.12 || 1;
    lo = Math.max(0, lo - pad);
    hi += pad;

    const band = {
      id: "progress-band",
      beforeDatasetsDraw(current) {
        if (!measure.band) return;
        const y = current.scales.y;
        const top = y.getPixelForValue(measure.band[1]);
        const bottom = y.getPixelForValue(measure.band[0]);
        const { left, right } = current.chartArea;
        const ctx = current.ctx;
        ctx.save();
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = colour.ok;
        ctx.fillRect(left, top, right - left, bottom - top);
        ctx.restore();
      }
    };
    const projectionLine = {
      id: "progress-projection",
      afterDatasetsDraw(current) {
        if (projection == null || !Number.isFinite(projection)) return;
        const y = current.scales.y.getPixelForValue(projection);
        const { left, right } = current.chartArea;
        const ctx = current.ctx;
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = colour.info;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colour.info;
        ctx.font = '600 10px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = "right";
        ctx.fillText("Projected mission dose", right - 4, y - 6);
        ctx.restore();
      }
    };

    chart.current = new Chart(canvas.current, {
      type: "line",
      data: {
        labels: series.labels,
        datasets: [{
          label: measure.label,
          data: series.values,
          borderColor: colour.accent,
          backgroundColor: colour.accent,
          pointBackgroundColor: colour.accent,
          pointBorderColor: colour.surface,
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
          tension: 0.25,
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: reducedMotion() ? false : { duration: 520, easing: "easeOutQuart" },
        animations: reducedMotion() ? {} : { x: { duration: 420, easing: "easeOutQuart" }, y: { duration: 520, easing: "easeOutQuart" } },
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colour.surface,
            borderColor: colour.grid,
            borderWidth: 1,
            titleColor: token("--am-text"),
            bodyColor: token("--am-text"),
            displayColors: false,
            callbacks: {
              title: (items) => {
                const index = items[0] && items[0].dataIndex;
                if (index == null) return "";
                const day = missionLabel(series.dates[index], profile);
                return day ? `${dateLabel(series.dates[index])} · ${day}` : dateLabel(series.dates[index]);
              },
              label: (item) => `${measure.label}: ${formatValue(measure, item.parsed.y)}${measure.unit ? ` ${measure.unit}` : ""}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: colour.grid },
            ticks: { color: colour.text, maxTicksLimit: 7, maxRotation: 0, font: { size: 10 } }
          },
          y: {
            min: lo,
            max: hi,
            grid: { color: colour.grid, drawTicks: false },
            border: { display: false },
            ticks: {
              color: colour.text,
              maxTicksLimit: 6,
              font: { size: 10 },
              callback: (value) => formatValue(measure, value)
            }
          }
        }
      },
      plugins: [band, projectionLine]
    });
    return () => {
      if (chart.current) chart.current.destroy();
      chart.current = null;
    };
  }, [measure, series, projection, profile, palette]);

  return (
    <div class="pg-chart-canvas">
      <canvas ref={canvas} role="img" aria-label={`${measure.label} over the mission days`} />
    </div>
  );
}
