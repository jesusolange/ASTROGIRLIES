// Measurements saved by the Daily Checkup, as a CSV file for the astronaut to keep.
export const RECORDS_KEY = "astrotwin-gui-v2-records";

const QUOTE = /"/g;

function cell(value) {
  return `"${String(value == null ? "" : value).replace(QUOTE, '""')}"`;
}

const HEADINGS = ["Timestamp", "Body system", "Measurement", "Value", "Unit", "Source"];

export function measurementsCsv(records, meta) {
  const rows = [HEADINGS];
  (Array.isArray(records) ? records : []).forEach((record) => {
    if (!record || !record.part) return;
    const system = (meta && meta[record.part]) || null;
    const fields = (system && system.f) || {};
    Object.entries(record.values || {}).forEach(([key, value]) => {
      const field = fields[key] || [key, ""];
      rows.push([
        record.time,
        (system && system.title) || record.part,
        field[0],
        value,
        field[1],
        record.source || "manual",
      ]);
    });
  });
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

export function downloadText(text, filename, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
