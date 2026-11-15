import { useState } from "preact/hooks";
import { useStored } from "../../lib/use-stored.js";
import { ntxStatus } from "../../scripts/emergencies.js";
import RichText from "./RichText.jsx";

const MAX = 130;
const pct = (value) => (value / MAX) * 100;

export default function NtxCheck({ ranges }) {
  const [profile] = useStored("astromed-profile", null);
  const [value, setValue] = useState("");
  const status = value === "" ? null : ntxStatus(Number(value), profile || {});
  return (
    <>
      <div class="emg-ntx">
        {ranges.map((range) => (
          <div class="emg-rb" key={range.label}>
            <div class="emg-rl"><b>{range.label}</b><span>{range.min}–{range.max} nmol/mmol creatinine</span></div>
            <div class="emg-rt"><i style={`left:${pct(range.min)}%;width:${pct(range.max) - pct(range.min)}%`}></i></div>
          </div>
        ))}
        <div class="emg-ra"><span>0</span><span>{MAX}</span></div>
      </div>
      <div class="emg-vf">
        <label>
          <span><RichText text="Your N-telopeptide (urine)" /></span>
          <input type="number" inputmode="decimal" data-ntx value={value} onInput={(event) => setValue(event.currentTarget.value)} />
        </label>
      </div>
      <div class="emg-chips">
        {status && <span class={`emg-chip ${status.tone}`}>{status.text}</span>}
        {status && status.needSex && <small class="emg-note">Set your sex in the profile for the right range.</small>}
      </div>
    </>
  );
}
