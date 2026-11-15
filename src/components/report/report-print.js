/* Renders the report content model as a standalone print document: black text on white,
   thin rules, no colour, no images, no icons. The stylesheet is inlined so it works offline. */

const PRINT_CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; color: #000; }
body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; }
.rpt-head { border-bottom: 1pt solid #000; padding-bottom: 4mm; margin-bottom: 4mm; }
.rpt-brand { margin: 0 0 2mm; font-size: 9pt; letter-spacing: 0.12em; text-transform: uppercase; }
h1 { margin: 0 0 4mm; font-size: 20pt; font-weight: 700; letter-spacing: -0.01em; }
.rpt-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2mm 8mm; margin: 0; }
.rpt-meta div { display: grid; grid-template-columns: 34mm minmax(0, 1fr); gap: 2mm; }
.rpt-meta dt { margin: 0; font-size: 9pt; }
.rpt-meta dd { margin: 0; font-weight: 600; overflow-wrap: anywhere; }
.rpt-notice { margin: 0 0 3mm; padding: 3mm 0; border-bottom: 0.5pt solid #000; font-size: 10pt; font-style: italic; }
.rpt-about { margin: 0 0 7mm; }
main { display: block; }
.rpt-section { margin: 0 0 8mm; }
h2 { margin: 0 0 3mm; padding-bottom: 1.5mm; border-bottom: 0.8pt solid #000; font-size: 13.5pt; }
h3 { margin: 4mm 0 2mm; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.06em; }
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
thead { display: table-header-group; }
th, td { padding: 1.6mm 1.5mm; border-bottom: 0.4pt solid #000; text-align: left; vertical-align: top; }
thead th { border-bottom: 0.8pt solid #000; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.05em; }
th:nth-child(1), td:nth-child(1) { width: 18%; white-space: nowrap; }
th:nth-child(3), td:nth-child(3) { width: 20%; }
th:nth-child(4), td:nth-child(4) { width: 22%; }
th:nth-child(5), td:nth-child(5) { width: 11%; }
tr { break-inside: avoid; }
.rpt-note, .rpt-none { margin: 2mm 0 0; font-size: 8.5pt; }
.rpt-finding { margin: 0 0 3.5mm; padding-left: 3mm; border-left: 0.8pt solid #000; break-inside: avoid; }
.rpt-finding h4 { margin: 0 0 1mm; font-size: 10pt; }
.rpt-finding p { margin: 0 0 1mm; font-size: 9.5pt; }
.rpt-level { font-weight: 400; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.05em; }
.rpt-sources { margin-top: 6mm; padding-top: 4mm; border-top: 0.8pt solid #000; break-before: page; }
.rpt-sources ol { margin: 0; padding-left: 6mm; font-size: 9pt; }
.rpt-sources li { margin-bottom: 2mm; break-inside: avoid; }
.rpt-url { overflow-wrap: anywhere; }
.rpt-closing { margin-top: 6mm; padding-top: 3mm; border-top: 0.5pt solid #000; font-size: 10pt; }
.rpt-closing p { margin: 0; }
h2, h3, h4 { break-after: avoid; }
@page { size: A4; margin: 18mm 16mm 20mm; }
@page { @bottom-center { content: "Page " counter(page) " of " counter(pages); font-family: system-ui, Arial, sans-serif; font-size: 8.5pt; } }
@media print {
  html, body { background: #fff; color: #000; }
  a { color: #000; text-decoration: none; }
}
`;

export function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

const cell = (value) => escapeHtml(value);

function headerHtml(report) {
  const h = report.header;
  const day = h.missionDay == null ? "Not set" : `${h.missionDay} of ${h.totalDays}`;
  const fields = [
    ["Name", h.name],
    ["Mission", h.mission],
    ["Crew size", String(h.crew)],
    ["Mission day", day],
    ["Generated", h.generated]
  ];
  return `<header class="rpt-head">
  <p class="rpt-brand">AstroMed</p>
  <h1>${escapeHtml(report.title)}</h1>
  <dl class="rpt-meta">
${fields.map(([label, value]) => `    <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("\n")}
  </dl>
</header>
<p class="rpt-notice">${escapeHtml(report.notice)}</p>
<p class="rpt-note rpt-about">${escapeHtml(report.referenceNote)}</p>`;
}

function tableHtml(section) {
  const rows = section.rows.map((row) => `        <tr><td>${cell(row.date)}</td><td>${cell(row.measure)}</td><td>${cell(row.value)}</td><td>${cell(row.reference)}</td><td>${cell(row.level)}</td></tr>`).join("\n");
  return `<table>
      <thead><tr><th scope="col">Date</th><th scope="col">Measure</th><th scope="col">Value</th><th scope="col">Reference</th><th scope="col">Level</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>`;
}

function findingsHtml(section) {
  if (!section.findings.length) {
    return `<h3>Findings</h3>
    <p class="rpt-none">No finding recorded from the latest values.</p>`;
  }
  const items = section.findings.map((finding) => {
    const action = finding.todo ? `\n      <p><strong>Action:</strong> ${escapeHtml(finding.todo)}</p>` : "";
    return `    <article class="rpt-finding">
      <h4>${escapeHtml(finding.title)} <span class="rpt-level">${escapeHtml(finding.level)}</span></h4>
      <p>${escapeHtml(finding.saw)}</p>${action}
    </article>`;
  }).join("\n");
  return `<h3>Findings</h3>
${items}`;
}

function sectionHtml(report, section) {
  return `<section class="rpt-section">
    <h2>${escapeHtml(section.label)}</h2>
    ${tableHtml(section)}
    ${findingsHtml(section)}
  </section>`;
}

function sourcesHtml(report) {
  const items = report.sources.map((source) => {
    const url = source.url ? ` <span class="rpt-url">${escapeHtml(source.url)}</span>` : "";
    return `      <li><strong>${escapeHtml(source.title)}</strong>. ${escapeHtml(source.author)}. ${escapeHtml(source.licence)}.${url}</li>`;
  }).join("\n");
  return `<section class="rpt-sources">
    <h2>Sources</h2>
    <ol>
${items}
    </ol>
  </section>`;
}

export function renderReportHtml(report) {
  const sections = report.sections.map((section) => sectionHtml(report, section)).join("\n");
  const closing = report.closing ? `\n<footer class="rpt-closing"><p>${escapeHtml(report.closing)}</p></footer>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(report.title)} · ${escapeHtml(report.header.name)}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
${headerHtml(report)}
<main>
${sections}
</main>
${sourcesHtml(report)}${closing}
</body>
</html>`;
}
