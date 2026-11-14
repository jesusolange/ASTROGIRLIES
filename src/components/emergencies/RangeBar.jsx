const pct = (value, min, max) => ((value - min) / (max - min)) * 100;

export default function RangeBar({ bar }) {
  const left = pct(bar.lo, bar.min, bar.max);
  const width = pct(bar.hi, bar.min, bar.max) - left;
  return (
    <div class="emg-rb">
      <div class="emg-rl"><b>{bar.label}</b><span>normal {bar.lo}–{bar.hi} {bar.unit}</span></div>
      <div class="emg-rt"><i style={`left:${left}%;width:${width}%`}></i></div>
      <div class="emg-ra"><span>{bar.min}</span><span>{bar.max}</span></div>
    </div>
  );
}
