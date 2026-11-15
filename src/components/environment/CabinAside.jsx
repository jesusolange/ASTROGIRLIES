// The destination picture beside the Cabin conditions card.
import { PLACES, profilePlace } from "../../scripts/environment.js";

export default function CabinAside() {
  const info = PLACES[profilePlace()];
  if (!info || !info.img) return null;
  return (
    <div class="env-aside">
      <img src={`/${info.img}`} alt="" loading="lazy" decoding="async" />
      <p class="env-aside-name">{info.name}</p>
    </div>
  );
}
