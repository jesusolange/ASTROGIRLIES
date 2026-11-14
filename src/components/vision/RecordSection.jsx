import { useMemo, useState } from "preact/hooks";
import {
  EYES, EYE_LABEL, VIEW, calibrationOf, historyFrom, makeResult
} from "../../scripts/vision.js";
import Calibration from "./Calibration.jsx";
import GridTest from "./GridTest.jsx";
import NearTest from "./NearTest.jsx";
import SymptomList from "./SymptomList.jsx";
import ResultCard from "./ResultCard.jsx";
import LatestResults from "./LatestResults.jsx";

const blank = () => ({ gridAnswer: null, marks: [], near: null, symptoms: [] });

export default function RecordSection({ data, save }) {
  const [eye, setEye] = useState("right");
  const [drafts, setDrafts] = useState(() => ({ right: blank(), left: blank() }));
  const [lastId, setLastId] = useState(null);
  const [message, setMessage] = useState("");
  const calibration = calibrationOf(data);
  const draft = drafts[eye];
  const rows = useMemo(() => historyFrom(data), [data]);
  const lastRow = rows.find((row) => row.id === lastId) || null;

  const update = (patch) => setDrafts((prev) => ({ ...prev, [eye]: { ...prev[eye], ...patch } }));

  const calibrate = (ppmm) => save({ ...data, ppmm, calibratedAt: new Date().toISOString() });

  const toggleSymptom = (id) => update({
    symptoms: draft.symptoms.includes(id)
      ? draft.symptoms.filter((x) => x !== id)
      : [...draft.symptoms, id]
  });

  const saveEye = () => {
    if (!calibration) { setMessage("Calibrate the screen first so the sizes are meaningful."); return; }
    if (!draft.gridAnswer) { setMessage("Choose whether the grid looked even or changed."); return; }
    if (draft.near === null) { setMessage("Choose the smallest line you read, or 'could not read the largest line'."); return; }
    const entry = makeResult({
      eye,
      grid: { distortion: draft.gridAnswer === "changed", marks: draft.marks },
      near: { line: draft.near },
      symptoms: draft.symptoms
    });
    save({ ...data, results: [...(Array.isArray(data.results) ? data.results : []), entry] });
    setDrafts((prev) => ({ ...prev, [eye]: blank() }));
    setLastId(entry.id);
    if (eye === "right") setEye("left");
    setMessage(`${EYE_LABEL[eye]} result saved.${eye === "right" ? " Now cover the other eye and record the left eye." : ""}`);
  };

  return (
    <>
      <div class="am-panel">
        <h3>Record a result</h3>
        <div class="vs-eyes" role="group" aria-label="Eye being tested">
          {EYES.map((e) => (
            <button
              key={e.id}
              type="button"
              class={`vs-eye${eye === e.id ? " on" : ""}`}
              aria-pressed={eye === e.id}
              onClick={() => { setEye(e.id); setMessage(""); }}
            >{e.label}</button>
          ))}
        </div>
        <ol class="vs-steps">
          <li>1. <b>Grid distortion (Amsler grid).</b> Cover your other eye, hold the screen {VIEW.gridDistanceCm} cm away and look at the centre dot.</li>
          <li>2. <b>Near vision.</b> Keep the screen {VIEW.nearDistanceCm} cm away and pick the smallest line whose openings you can read.</li>
          <li>3. <b>Symptoms.</b> Tick anything you noticed today.</li>
        </ol>

        <Calibration calibration={calibration} onCalibrate={calibrate} />
        <GridTest ppmm={calibration ? calibration.ppmm : null} eye={eye} draft={draft} onChange={update} />
        <NearTest ppmm={calibration ? calibration.ppmm : null} draft={draft} onChange={update} />
        <SymptomList selected={draft.symptoms} onToggle={toggleSymptom} />

        <div class="vs-save">
          <p class="vs-inst">You are recording the <b>{EYE_LABEL[eye]}</b>.</p>
          <button type="button" class="am-btn" onClick={saveEye} disabled={!calibration}>
            Save {EYE_LABEL[eye].toLowerCase()} result
          </button>
          <p class="vs-msg" role="status" aria-live="polite">
            {message || (!calibration ? "Calibrate the screen first so the sizes are meaningful." : "")}
          </p>
        </div>
        {lastRow && <ResultCard row={lastRow} />}
      </div>
      <LatestResults rows={rows} />
    </>
  );
}
