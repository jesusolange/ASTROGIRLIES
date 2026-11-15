// The destination picture beside the Cabin conditions card.
import { PLACES, profilePlace } from "../../scripts/environment.js";
import AiImage from "../ui/AiImage.jsx";

export default function CabinAside() {
  const info = PLACES[profilePlace()];
  if (!info || !info.img) return null;
  return (
    <div class="env-aside">
      <AiImage src={`/${info.img}`} alt={`${info.name} destination`} ai />
      <p class="env-aside-name">{info.name}</p>
    </div>
  );
}
