import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { gcsScore } from "../../scripts/emergencies.js";
import { alsoTell } from "../../scripts/mission.js";
import RichText from "./RichText.jsx";

const INITIAL = "Tap one box in each column. Score: 3 to 15.";

function resultText(result) {
  if (!result.total) return result.message;
  const sentence = result.tell ? alsoTell("the flight surgeon") : "";
  return sentence ? `${result.message} ${sentence}` : result.message;
}

export default function GcsPicker({ table }) {
  const [picks, setPicks] = useState([0, 0, 0]);
  const [touched, setTouched] = useState(false);
  const result = gcsScore(picks);
  const pick = (column, value) => {
    setTouched(true);
    setPicks((old) => old.map((v, i) => (i === column ? value : v)));
  };
  return (
    <>
      <div class="emg-gcsT">
        <div class="emg-gh"></div>
        {table.head.map((head) => <div class="emg-gh" key={head}>{head}</div>)}
        {table.rows.map((row) => (
          <Fragment key={row}>
            <div class="emg-gn">{row}</div>
            {table.cells.map((column, ci) => {
              const cell = column[row];
              return cell ? (
                <button
                  type="button"
                  class={`emg-gc ${cell[0]}${picks[ci] === row ? " sel" : ""}`}
                  data-gcs-col={ci}
                  data-gcs-value={row}
                  onClick={() => pick(ci, row)}
                >{cell[1]}</button>
              ) : <div class="emg-gc x"></div>;
            })}
          </Fragment>
        ))}
      </div>
      <div class={`emg-gres${touched && result.total ? ` emg-${result.level}` : ""}`}>
        {!touched || !result.total
          ? <RichText text={touched ? result.message : INITIAL} />
          : <><b>{result.total}</b> / 15 <span><RichText text={resultText(result)} /></span></>}
      </div>
    </>
  );
}
