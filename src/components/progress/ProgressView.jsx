import "../../scripts/storage.js";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { toast } from "../../lib/ui.js";
import Chips from "../ui/Chips.jsx";
import Panel from "../ui/Panel.jsx";
import Button from "../ui/Button.jsx";
import ChartCard from "./ChartCard.jsx";
import WeeklyTable from "./WeeklyTable.jsx";
import HistoryTable from "./HistoryTable.jsx";
import ProgressExtras from "./ProgressExtras.jsx";
import {
  FILTERS, deleteRow, fromDayFor, measuresOf, readProgress, seriesFor
} from "../../scripts/progress.js";
import "./progress.css";

const RANGES = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "mission", label: "Mission" }
];
const RANGE_DAYS = { week: 7, month: 30, mission: 0 };
const REPORT_MODULES = import.meta.glob("../../scripts/report.js");

async function openReport() {
  const load = REPORT_MODULES["../../scripts/report.js"];
  if (load) {
    try {
      const module = await load();
      if (module && typeof module.openReport === "function") {
        module.openReport();
        return;
      }
    } catch (error) {
      console.error("report", error);
    }
  }
  toast("The report is not available yet.");
}

export default function ProgressView() {
  const [profile] = useStored("astromed-profile", null);
  const [revision, setRevision] = useState(0);
  const [filter, setFilter] = useState("all");
  const [range, setRange] = useState("week");

  useEffect(() => {
    const api = window.AstroMedStore && window.AstroMedStore.store;
    if (!api) return undefined;
    return api.subscribe(() => setRevision((value) => value + 1));
  }, []);

  const store = window.AstroMedStore && window.AstroMedStore.store;
  const progress = useMemo(() => readProgress(store, profile), [store, profile, revision]);
  const fromDay = useMemo(() => fromDayFor(RANGE_DAYS[range]), [range]);

  const visibleRows = useMemo(
    () => progress.rows.filter((row) => filter === "all" || row.filter === filter),
    [progress, filter]
  );
  const charts = useMemo(() => {
    const measures = measuresOf(visibleRows);
    return measures.map((measure) => ({ measure, series: seriesFor(visibleRows, measure, fromDay) }));
  }, [visibleRows, fromDay]);
  const historyRows = useMemo(() => visibleRows.filter((row) => row.history), [visibleRows]);

  const groups = useMemo(
    () => FILTERS.filter((item) => item.id !== "all")
      .map((item) => ({ ...item, charts: charts.filter((chart) => chart.measure.filter === item.id) }))
      .filter((group) => group.charts.length),
    [charts]
  );

  function remove(row) {
    const undo = deleteRow(store, row);
    if (!undo) return;
    setRevision((value) => value + 1);
    toast({
      text: `Deleted ${row.check}.`,
      undo: () => {
        undo();
        setRevision((value) => value + 1);
      }
    });
  }

  const empty = progress.rows.length === 0;

  return (
    <div class="pg">
      <div class="pg-intro">
        <p>Every check you record, in one place. Charts follow the mission days; the table holds the full history.</p>
      </div>

      <Panel className="pg-toolbar-panel">
        <div class="pg-toolbar">
          <Chips
            options={FILTERS}
            value={filter}
            onChange={(id) => setFilter(id)}
            label="Filter records"
            idBase="pg-filter"
            className="pg-filter"
          />
          <div class="pg-range">
            <Chips
              options={RANGES}
              value={range}
              onChange={(id) => setRange(id)}
              label="Chart time range"
              idBase="pg-range"
            />
            <Button className="pg-report" onClick={openReport}>Report</Button>
          </div>
        </div>
      </Panel>

      {empty ? (
        <Panel title="No records yet">
          <p>Record a check and it will appear here with its chart and its place in the history.</p>
        </Panel>
      ) : (
        <Panel title="Charts">
          {charts.length ? (
            <div class="pg-groups">
              {groups.map((group) => (
                <section class="pg-group" key={group.id}>
                  {filter === "all" ? <h4 class="pg-group-title">{group.label}</h4> : null}
                  <div class="pg-charts">
                    {group.charts.map(({ measure, series }) => (
                      <ChartCard
                        key={`${filter}-${range}-${measure.id}`}
                        measure={measure}
                        series={series}
                        projection={measure.id === "radiation.cumulative" ? progress.projection : null}
                        profile={profile}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : <p class="pg-empty-note">No records yet for this filter.</p>}
        </Panel>
      )}

      {empty ? null : (
        <>
          <Panel title="This week against last week">
            <WeeklyTable rows={visibleRows} />
          </Panel>

          <ProgressExtras />

          <Panel title="Full history">
            <HistoryTable rows={historyRows} profile={profile} onDelete={remove} resetKey={filter} />
          </Panel>
        </>
      )}
    </div>
  );
}
