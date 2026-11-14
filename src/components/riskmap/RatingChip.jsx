// One NASA rating as a chip. The number pair is always shown, so the colour is extra.
// Props: side ({ l, c, colour } or null) and missing (text for a risk NASA does not rate).
export default function RatingChip({ side, missing }) {
  if (!side) return <b class="rk-chip none">{missing}</b>;
  return <b class={`rk-chip ${side.colour || "none"}`}>{side.l} × {side.c}</b>;
}
