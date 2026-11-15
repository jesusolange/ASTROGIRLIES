// Moves the vertices of a vertical tube forward (+z), in the model file's own units, before the model is placed.
// The tube is the part within `radius` of x = `x`; the shift fades in from y = `from` to y = `to` and fades out
// sideways over `fade`, so the tube stays joined to what it branches into.
export function bendForward(positions, { x, radius, fade, from, to, forward }) {
  const ramp = (value, lo, hi) => Math.min(Math.max((value - lo) / (hi - lo), 0), 1);
  for (let i = 0; i < positions.count; i++) {
    const across = 1 - ramp(Math.abs(positions.getX(i) - x), radius, radius + fade);
    const along = ramp(positions.getY(i), from, to);
    const shift = forward * across * along;
    if (shift) positions.setZ(i, positions.getZ(i) + shift);
  }
  positions.needsUpdate = true;
}
