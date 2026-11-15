import { rangeMarks, valuePercent } from "../../scripts/emergencies.js";

export default function RangeBar({ bar, value }) {
  const left = valuePercent(bar, bar.lo);
  const width = valuePercent(bar, bar.hi) - left;
  const current = valuePercent(bar, value);
  return (
    <div class="emg-rb">
      <div class="emg-rl"><b>{bar.label}</b><span>normal {bar.lo}–{bar.hi} {bar.unit}</span></div>
      <div class="emg-rline">
        <div class="emg-rt"><i style={`left:${left}%;width:${width}%`}></i></div>
        {rangeMarks(bar).map((mark) => (
          <span
            key={mark.key}
            class={`emg-rnum emg-rnum-${mark.anchor}`}
            style={`left:${mark.percent}%`}
            aria-hidden="true"
          >{mark.value}</span>
        ))}
        {current != null ? (
          <span class="emg-rnow" style={`left:${current}%`}>
            <i aria-hidden="true"></i>
            <b>{value}</b>
          </span>
        ) : null}
      </div>
    </div>
  );
}
