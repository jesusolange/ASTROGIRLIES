import { useEffect, useState } from "preact/hooks";
import { ChevronDown } from "lucide-preact";
import HistoryTableView from "./HistoryTableView.jsx";
import ProgressDialog from "./ProgressDialog.jsx";

export default function HistoryTable({ rows, profile, onDelete, resetKey }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [resetKey]);

  if (!rows.length) {
    return <p class="pg-empty-note">No records yet.</p>;
  }

  return (
    <div class="pg-history">
      <div class="pg-table-crop">
        <HistoryTableView rows={rows} profile={profile} onDelete={onDelete} />
      </div>
      <div class="pg-more">
        <small>{`${rows.length} records`}</small>
        <button type="button" class="pg-more-btn" onClick={() => setOpen(true)}>
          <ChevronDown size={16} aria-hidden="true" />
          <span>Show the full table</span>
        </button>
      </div>
      <ProgressDialog open={open} onClose={() => setOpen(false)} title="Full history">
        <HistoryTableView rows={rows} profile={profile} onDelete={onDelete} />
      </ProgressDialog>
    </div>
  );
}
