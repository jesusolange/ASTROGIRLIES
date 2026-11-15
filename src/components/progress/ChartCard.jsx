import { useState } from "preact/hooks";
import { Maximize2 } from "lucide-preact";
import MeasureChart from "./MeasureChart.jsx";
import ProgressDialog from "./ProgressDialog.jsx";

export default function ChartCard({ measure, series, projection = null, profile = null }) {
  const [open, setOpen] = useState(false);
  const empty = !series.values.length;

  return (
    <article class="pg-chart">
      <header>
        <h5>{measure.label}</h5>
        <div class="pg-chart-head">
          {measure.unit ? <span>{measure.unit}</span> : null}
          {empty ? null : (
            <button
              type="button"
              class="pg-expand"
              aria-label={`Expand the ${measure.label} chart`}
              onClick={() => setOpen(true)}
            >
              <Maximize2 size={14} aria-hidden="true" />
              <span>Expand</span>
            </button>
          )}
        </div>
      </header>
      {empty ? (
        <div class="pg-chart-empty">No records yet</div>
      ) : (
        <MeasureChart measure={measure} series={series} projection={projection} profile={profile} />
      )}
      {empty ? null : (
        <ProgressDialog open={open} onClose={() => setOpen(false)} title={measure.label}>
          {open ? (
            <div class="pg-chart-canvas pg-chart-canvas-lg">
              <MeasureChart measure={measure} series={series} projection={projection} profile={profile} />
            </div>
          ) : null}
        </ProgressDialog>
      )}
    </article>
  );
}
