// Progress: charts over time for every indicator, with manual readings and demo data.
import "../../scripts/storage.js";
import { useEffect, useRef, useState } from "preact/hooks";
import { currentSection } from "../../lib/nav.js";
import {
  allIds, arrow, demoEntries, entriesFor, fmtNum, labelFor, levelOf,
  loadHistory, saveHistory, statsFor, syncHistory, uid, unitFor,
} from "../../scripts/progress.js";
import ProgressChart from "./ProgressChart.jsx";
import ProgressExtras from "./ProgressExtras.jsx";
import "./progress.css";

const metaOf = () => (window.AstroMedData && window.AstroMedData.SYSTEM_META) || {};

export default function ProgressView() {
  const [history, setHistory] = useState(loadHistory);
  const [selected, setSelected] = useState("");
  const [days, setDays] = useState(7);
  const [confirming, setConfirming] = useState("");
  const valueInput = useRef(null);
  const whenInput = useRef(null);
  const section = currentSection.value;

  useEffect(() => {
    const api = window.AstroMedStore && window.AstroMedStore.store;
    if (!api) return;
    const run = () => {
      const { history: next, changed } = syncHistory(loadHistory(), api.get("astrotwin-gui-v2-records", []), api.get("astromed-env-log", []));
      if (changed) saveHistory(next);
      setHistory(next);
    };
    run();
    return api.subscribe(run);
  }, []);

  useEffect(() => {
    if (section === "progress") setHistory(loadHistory());
  }, [section]);

  const meta = metaOf();
  const ids = allIds(meta);
  const withData = ids.filter((id) => entriesFor(history, id).length);
  const current = selected && ids.includes(selected) ? selected : (withData[0] || "heart.hr");
  const list = entriesFor(history, current);
  const stats = statsFor(list);
  const change = arrow(stats.cur, stats.prev);
  const recent = list.slice(-8).reverse();

  function commit(next) {
    saveHistory(next);
    setHistory(next);
  }

  function addReading(event) {
    event.preventDefault();
    const value = Number(valueInput.current.value);
    if (!Number.isFinite(value)) return;
    const [part, key] = current.split(".");
    const when = whenInput.current.value ? new Date(whenInput.current.value) : new Date();
    const next = { ...history, entries: [...history.entries, { id: uid(), part, key, value, time: when.toISOString(), src: "manual" }] };
    valueInput.current.value = "";
    commit(next);
  }

  return (
    <div>
      <div class="am-heading">
        <h2>Progress</h2>
        <p>Watch how your indicators change day by day. Every Daily Checkup you save appears here automatically.</p>
      </div>

      <section class="am-panel">
        <div class="pg-controls">
          <label class="pg-field"><span>Indicator</span>
            <select value={current} onChange={(event) => setSelected(event.target.value)}>
              {Object.entries(meta).map(([part, system]) => (
                <optgroup key={part} label={system.title}>
                  {Object.keys(system.f).map((key) => (
                    <option key={key} value={`${part}.${key}`}>
                      {`${system.f[key][0]} (${entriesFor(history, `${part}.${key}`).length})`}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div class="pg-seg" role="group" aria-label="Time range">
            {[7, 14, 30].map((value) => (
              <button type="button" key={value} class={value === days ? "on" : ""} onClick={() => setDays(value)}>
                {value === 7 ? "Week" : `${value} days`}
              </button>
            ))}
          </div>
        </div>
        <h3 class="pg-title">{labelFor(meta, current)} <small>{unitFor(meta, current)}</small></h3>
        <ProgressChart id={current} list={list} days={days} meta={meta} />
        <div class="pg-stats">
          <div><small>This week</small><b>{stats.cur == null ? "—" : fmtNum(stats.cur)}</b></div>
          <div><small>Last week</small><b>{stats.prev == null ? "—" : fmtNum(stats.prev)}</b></div>
          <div><small>Change</small><b class={`pg-${change.cls}`}>{change.txt}</b></div>
          <div><small>Readings (7 days)</small><b>{stats.n}</b></div>
        </div>
      </section>

      <section class="am-panel">
        <h3>Add a reading</h3>
        <form class="pg-add" onSubmit={addReading}>
          <label class="pg-field"><span>{labelFor(meta, current)} ({unitFor(meta, current)})</span><input ref={valueInput} type="number" step="any" required /></label>
          <label class="pg-field"><span>Date and time</span><input ref={whenInput} type="datetime-local" /></label>
          <button type="submit" class="am-btn">Save reading</button>
        </form>
        <ul class="am-saved pg-list">
          {recent.length ? recent.map((entry) => (
            <li key={entry.id}>
              <span>{new Date(entry.time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}{entry.src === "demo" ? " · demo" : ""}</span>
              <b>{fmtNum(entry.value)} {unitFor(meta, current)}</b>
              <button type="button" class="am-btn am-btn-soft" onClick={() => commit({ ...history, entries: history.entries.filter((item) => item.id !== entry.id) })}>Delete</button>
            </li>
          )) : <li><span>No readings yet for this indicator.</span></li>}
        </ul>
      </section>

      <ProgressExtras />

      <section class="am-panel">
        <h3>All indicators — this week vs last week</h3>
        {withData.length ? (
          <div class="pg-grid">
            {withData.map((id) => {
              const rows = entriesFor(history, id);
              const stat = statsFor(rows);
              const trend = arrow(stat.cur, stat.prev);
              const level = stat.cur == null ? "info" : levelOf(id, stat.cur);
              return (
                <button type="button" class="pg-card" key={id} onClick={() => { setSelected(id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  <i class={`pg-stripe pg-stripe-${level}`}></i>
                  <span>{labelFor(meta, id)}</span>
                  <b>{stat.cur == null ? "—" : fmtNum(stat.cur)} <small>{unitFor(meta, id)}</small></b>
                  <em class={`pg-${trend.cls}`}>{trend.txt}</em>
                </button>
              );
            })}
          </div>
        ) : <p>No data yet. Save a Daily Checkup, add a reading above, or load demo data to preview the charts.</p>}
        <div class="am-actions">
          <button type="button" class="am-btn am-btn-soft" onClick={() => commit({ ...history, entries: [...history.entries.filter((entry) => entry.src !== "demo"), ...demoEntries(meta)] })}>Load 14 days of demo data</button>
          <button type="button" class="am-btn am-btn-soft" onClick={() => commit({ ...history, entries: history.entries.filter((entry) => entry.src !== "demo") })}>Delete demo data</button>
          <button
            type="button"
            class="am-btn am-btn-soft"
            onClick={() => {
              if (confirming !== "all") { setConfirming("all"); return; }
              setConfirming("");
              commit({ ...history, entries: [] });
            }}
          >
            {confirming === "all" ? "Click again to confirm" : "Delete all history"}
          </button>
        </div>
        <p class="am-small">Deleting here only removes entries from these charts. Demo data is simulated and clearly marked.</p>
      </section>
    </div>
  );
}
